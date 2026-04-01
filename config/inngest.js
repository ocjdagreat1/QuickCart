import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";

export const inngest = new Inngest({ id: "quickcart-next" });


  //USER CREATED
 
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    retries: 3, 
  },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    console.log("User creation triggered");

    const user = await step.run("extract-user-data", async () => {
      const { data } = event;

      const id = data?.id;
      const email = data?.email_addresses?.[0]?.email_address;
      const firstName = data?.first_name || "";
      const lastName = data?.last_name || "";

      if (!id) throw new Error("Missing user ID");
      if (!email) throw new Error(`Missing email for user ${id}`);

      return {
        clerkId: id,
        email,
        name: `${firstName} ${lastName}`.trim() || "User",
        imageUrl: data?.image_url || "",
        cartItems: {},
      };
    });

    await step.run("save-to-db", async () => {
      await connectDB();

      //prevent duplicates
      const existing = await User.findOne({ clerkId: user.clerkId });

      if (existing) {
        console.log("User already exists, skipping create");
        return existing;
      }

      const newUser = await User.create(user);

      console.log(" User created:", newUser);
      return newUser;
    });

    return { success: true };
  }
);

//USER UPDATED
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    retries: 2,
  },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    console.log("User update triggered");

    const { data } = event;

    if (!data?.id) {
      console.log("Missing user ID");
      return { skipped: true };
    }

    const email = data?.email_addresses?.[0]?.email_address;
    const name =
      [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";

    await step.run("update-db", async () => {
      await connectDB();

      const updatedUser = await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          email,
          name,
          imageUrl: data.image_url || "",
        },
        { new: true, upsert: true }
      );

      console.log("User updated:", updatedUser);
      return updatedUser;
    });

    return { success: true };
  }
);

//USER DELETED
 
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    retries: 2,
  },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    console.log("User deletion triggered");

    const userId = event.data?.id;

    if (!userId) {
      console.log(" Missing ID, skipping");
      return { skipped: true };
    }

    await step.run("delete-from-db", async () => {
      await connectDB();

      const deletedUser = await User.findOneAndDelete({
        clerkId: userId,
      });

      console.log("User deleted:", deletedUser);
      return deletedUser;
    });

    return { success: true };
  }
);


//inngest function to create user's order in database

export const createUserOrder = inngest.createFunction({
  id:'create-user-order',
  batchEvents:{
    maxSize:5,
    timeout: '5s'
  }
},
  {event:'order/created'},
  async({events}) =>{
    const orders = events.map((event)=>{
      return{
        userId:event.data.userId,
        items:event.data.items,
        amount: event.data.amount,
        address:event.data.address,
        date:event.data.date
      }
    })

    await connectDB()
    await Order.insertMany(orders)

    return ({success:true, processed:orders.length});

  }
)