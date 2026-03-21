import { inngest } from "@/config/inngest";

export async function POST(req) {
  const body = await req.json();

  console.log("Clerk webhook received:", body);

  const eventType = body.type;

  // Map Clerk → Inngest
  await inngest.send({
    name: `clerk/${eventType}`, // VERY IMPORTANT
    data: body.data,
  });

  return new Response("OK", { status: 200 });
}