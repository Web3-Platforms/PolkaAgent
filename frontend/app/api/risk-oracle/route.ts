import { NextResponse } from "next/server";

const parachains: Record<string, number> = {
  acala: 2000,
  astar: 2001,
  moonbeam: 2004,
  parallel: 2012,
  heiko: 2085,
  picasso: 2087,
  bifrost: 2092,
};

export async function POST(request: Request) {
  const { intent } = await request.json();
  const normalizedIntent = String(intent ?? "").toLowerCase();

  const matchedParachain =
    Object.entries(parachains).find(([name]) => normalizedIntent.includes(name)) ??
    ["acala", 2000];

  const looksHighRisk =
    normalizedIntent.includes("leverage") ||
    normalizedIntent.includes("unsafe") ||
    normalizedIntent.includes("degen") ||
    normalizedIntent.includes("100x");

  const riskScore = looksHighRisk ? 88 : 42;

  return NextResponse.json({
    parachainId: matchedParachain[1],
    riskScore,
    safeToRoute: riskScore < 75,
  });
}
