import { NextRequest, NextResponse } from "next/server";

// Helper function to generate mock data
function generateMockData(timeRange: string) {
  const now = new Date();
  const data = [];

  let dataPoints = 90;
  if (timeRange === "30d") dataPoints = 30;
  else if (timeRange === "7d") dataPoints = 7;
  else if (timeRange === "1d") dataPoints = 24; // 24 hours
  else if (timeRange === "1h") dataPoints = 60; // 60 minutes

  // Set a realistic base and range for money values
  const baseValue = 80000; // e.g., $80,000
  const amplitude = 20000; // e.g., +/- $20,000

  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(now);

    if (timeRange === "1h") {
      date.setMinutes(date.getMinutes() - i);
    } else if (timeRange === "1d") {
      date.setHours(date.getHours() - i);
    } else {
      date.setDate(date.getDate() - i);
    }

    // Generate a realistic trend with some randomness
    const trend = Math.sin((i / dataPoints) * Math.PI * 2) * amplitude * 0.5; // Sine wave for smoothness
    const noise = (Math.random() - 0.5) * amplitude * 0.15; // Small random noise
    const balance = Math.max(40000, baseValue + trend + noise); // Never below $40,000

    data.push({
      date: date.toISOString(),
      balance: Number(balance.toFixed(2)), // Always 2dp
    });
  }

  return data;
}

export async function GET(request: NextRequest) {
  // Get the timeRange from the URL search params
  const searchParams = request.nextUrl.searchParams;
  const timeRange = searchParams.get("timeRange") || "3m";

  // Add artificial delay to simulate real API latency
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Generate mock data based on the time range
  const mockData = generateMockData(timeRange);

  // Return the data in the expected format
  return NextResponse.json({
    data: mockData,
  });
}
