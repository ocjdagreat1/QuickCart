import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";

// Inngest client
export const inngest = new Inngest({ id: "quickcart-next" });

// Helper: safely get first email
const getEmail = (emails) => {
  if (!emails || emails.length === 0) return null;
  return emails[0]?.email_address || null;
};

// --------------------
// 1️⃣ User Created
// --------------------
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, image_url } = event.data;

    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

    await connectDB();

    await User.findOneAndUpdate(
      { _id: id },
      {
        _id: id,
        email: `temp-${id}@placeholder.com`, // ✅ NEVER FAIL
        name,
        imageUrl: image_url || "",
        cartItems: {},
      },
      { upsert: true, new: true }
    );
  }
);
// --------------------
// 2️⃣ User Updated
// --------------------
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      console.log("Still no email, skipping...");
      return;
    }

    const name = [first_name, last_name].filter(Boolean).join(" ") || "User";

    await connectDB();

    await User.findOneAndUpdate(
      { _id: id },
      {
        email,
        name,
        imageUrl: image_url || "",
      },
      { new: true }
    );
  }
);
// --------------------
// 3️⃣ User Deleted
// --------------------
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    if (!id) {
      console.log("Skipped deletion: id missing", event.data);
      return;
    }

    await connectDB();

    await User.findByIdAndDelete(id);
  }
);