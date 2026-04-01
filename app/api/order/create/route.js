import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose"; // <-- make sure to import mongoose

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" });
    }

    const { address, items } = await request.json();

    if (!address || !items || items.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid data" });
    }

    // Convert product IDs to ObjectId safely
    const cartItemsArray = items.map((item) => ({
      product: new mongoose.Types.ObjectId(
        typeof item.product === "object" ? item.product._id : item.product
      ),
      quantity: item.quantity,
    }));

    // Fetch all products at once
    const productIds = cartItemsArray.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    // Check for missing products
    const missingProducts = cartItemsArray.filter(
      (item) => !products.some((p) => p._id.equals(item.product))
    );

    if (missingProducts.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Products not found: ${missingProducts
          .map((p) => p.product.toString())
          .join(", ")}`,
      });
    }

    // Calculate total amount
    let amount = 0;
    for (const item of cartItemsArray) {
      const product = products.find((p) => p._id.equals(item.product));
      amount += product.offerPrice * item.quantity;
    }

    const totalAmount = amount + Math.floor(amount * 0.02); // 2% tax

    // Send order event to Inngest
    await inngest.send({
      name: "order/created",
      data: {
        userId,
        address,
        items: cartItemsArray,
        amount: totalAmount,
        date: Date.now(),
      },
    });

    // Clear user cart
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}