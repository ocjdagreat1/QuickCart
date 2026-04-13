import connectDB from "@/config/db";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = 20;

    const products = await Product.find({})
      .select("name price offerPrice image") // only needed fields
      .limit(limit)
      .skip((page - 1) * limit)
      .lean(); // 🚀 faster

    return NextResponse.json({
      success: true,
      products,
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}