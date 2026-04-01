import { serve } from "inngest/next";
import { createUserOrder, inngest,syncUserCreation, syncUserDeletion, syncUserUpdation } from "@/config/inngest";

// Create an API
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
   
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    createUserOrder
  ],
});