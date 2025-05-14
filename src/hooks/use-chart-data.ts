import { useQuery } from "@tanstack/react-query";

// Define the chart data type
export interface ChartDataPoint {
  date: string;
  balance: number;
}

// Function to fetch data from the endpoint
async function fetchChartData(timeRange: string): Promise<ChartDataPoint[]> {
  const response = await fetch(`/api/metrics?timeRange=${timeRange}`);

  if (!response.ok) {
    throw new Error("Failed to fetch chart data");
  }

  const result = await response.json();
  return result.data;
}

// Custom hook that uses React Query to fetch and cache the data
export function useChartData(timeRange: string) {
  return useQuery({
    queryKey: ["chartData", timeRange],
    queryFn: () => fetchChartData(timeRange),
    refetchInterval: 1000, // Poll every second
    // Use structural sharing to prevent unnecessary re-renders
    // when the data hasn't actually changed
    structuralSharing: true,
    // Return mock data if the API call fails (for development)
    placeholderData: getMockChartData(timeRange),
    // Only consider background updates as stale after 2 seconds
    // This prevents constant re-renders during rapid polling
    staleTime: 500,
    // Prevent loading states during background updates
    refetchOnWindowFocus: false,
    notifyOnChangeProps: ["data", "error"],
  });
}

// Function to generate mock data based on the timeRange
function getMockChartData(timeRange: string): ChartDataPoint[] {
  const now = new Date();
  const data: ChartDataPoint[] = [];

  let daysToGenerate = 90;
  if (timeRange === "30d") daysToGenerate = 30;
  else if (timeRange === "7d") daysToGenerate = 7;
  else if (timeRange === "1d") daysToGenerate = 1;
  else if (timeRange === "1h") {
    // For hourly data, generate entries for the past hour
    for (let i = 0; i < 60; i++) {
      const date = new Date(now);
      date.setMinutes(now.getMinutes() - i);

      data.push({
        date: date.toISOString(),
        balance: Math.floor(Math.random() * 100000) + 50000, // Random balance between 50k and 150k
      });
    }
    return data;
  }

  // For daily data
  for (let i = 0; i < daysToGenerate; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split("T")[0],
      balance: Math.floor(Math.random() * 100000) + 50000, // Random balance between 50k and 150k
    });
  }

  return data;
}
