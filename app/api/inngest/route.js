import { serve } from "inngest/next";
import { inngest,syncUserCreation, syncUserDeletion, syncUserUpdation } from "@/config/inngest";

// Create an API
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
   
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion
  ],
});