import { NextResponse } from "next/server";
import { fetchRealMatches } from "@/lib/football-data";
import { MOCK_MATCHES } from "@/lib/mock-data";

export async function GET() {
  const realMatches = await fetchRealMatches();
  const matches = realMatches && realMatches.length > 0 ? realMatches : MOCK_MATCHES;
  return NextResponse.json({ matches });
}
