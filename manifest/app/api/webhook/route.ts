import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook endpoint for MiniKit notifications
 * This handles events from the Farcaster client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the webhook event for debugging
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    // Handle different event types
    const { event } = body;

    switch (event) {
      case "frame_added":
        // User added the mini app
        console.log("Mini app added by user");
        break;
      case "frame_removed":
        // User removed the mini app
        console.log("Mini app removed by user");
        break;
      case "notifications_enabled":
        // User enabled notifications
        console.log("Notifications enabled");
        break;
      case "notifications_disabled":
        // User disabled notifications
        console.log("Notifications disabled");
        break;
      default:
        console.log("Unknown event type:", event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

// Also handle GET for verification
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" });
}

