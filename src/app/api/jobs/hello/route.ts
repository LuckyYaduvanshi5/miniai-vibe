import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client";

export async function POST() {
  try {
    // Send an event that triggers the existing `helloWorld` function
    await inngest.send({
      name: "test/hello.world",
      data: { email: "user@example.com" },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to queue job:", err);
    return NextResponse.json({ ok: false, error: "Failed to queue job" }, { status: 500 });
  }
}
