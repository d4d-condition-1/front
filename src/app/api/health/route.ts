import { NextResponse } from "next/server";

// Lightweight liveness endpoint used by the Docker healthcheck and load
// balancers. Kept static/uncached so it always reflects the running process.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok", uptime: process.uptime() });
}
