import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

export const inngest = new Inngest({ id: "quickcart-next" });

// User Created
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    console.log("🚀 User creation function triggered!");
    console.log("Full event:", JSON.stringify(event, null, 2));
    
    try {
      const user = await step.run("extract-user-data", async () => {
        const { data } = event;
        
        console.log("Event data:", data);
        
        const id = data?.id;
        const email = data?.email_addresses?.[0]?.email_address;
        const firstName = data?.first_name || "";
        const lastName = data?.last_name || "";
        
        console.log("Extracted:", { id, email, firstName, lastName });

        if (!id) {
          throw new Error("Missing user ID");
        }

        if (!email) {
          throw new Error(`Missing email for user ${id}`);
        }

        return {
          clerkId: id,
          email,
          name: `${firstName} ${lastName}`.trim() || "User",
          imageUrl: data?.image_url || "",
          cartItems: {}
        };
      });

      await step.run("save-to-db", async () => {
        await connectDB();
        
        const savedUser = await User.findOneAndUpdate(
          { clerkId: user.clerkId },
          user,
          { upsert: true, new: true }
        );
        
        console.log("✅ User saved to DB:", savedUser);
        return savedUser;
      });

      return { success: true, user };
    } catch (error) {
      console.error("❌ Error in user creation:", error);
      throw error;
    }
  }
);

// User Updated
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    console.log("🔄 User update function triggered!");
    console.log("Update event:", JSON.stringify(event, null, 2));
    
    try {
      const { data } = event;
      await connectDB();

      const email = data?.email_addresses?.[0]?.email_address;
      if (!email || !data?.id) {
        console.log("Missing required data");
        return { skipped: true };
      }

      const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";

      const updatedUser = await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          email,
          name,
          imageUrl: data.image_url || "",
        },
        { new: true, upsert: true }
      );

      console.log("✅ User updated:", updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("❌ Error in user update:", error);
      throw error;
    }
  }
);

// User Deleted
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    console.log("🗑️ User deletion function triggered!");
    console.log("Delete event:", JSON.stringify(event, null, 2));
    
    if (!event.data?.id) {
      console.log("Skipped deletion: id missing");
      return { skipped: true };
    }

    try {
      await connectDB();
      const deletedUser = await User.findOneAndDelete({ clerkId: event.data.id });
      console.log("✅ User deleted:", deletedUser);
      return { success: true, deleted: !!deletedUser };
    } catch (error) {
      console.error("❌ Error in user deletion:", error);
      throw error;
    }
  }
);