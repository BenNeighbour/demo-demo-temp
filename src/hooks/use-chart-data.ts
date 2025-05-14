import { useQuery } from "@tanstack/react-query";

// Define the chart data type
export interface ChartDataPoint {
  date: string;
  desktop: number;
  mobile: number;
}

// Function to fetch data from an endpoint
async function fetchChartData(timeRange: string): Promise<ChartDataPoint[]> {
  // Example URL - replace with your actual API endpoint
  const response = await fetch(
    `https://api.example.com/metrics?timeRange=${timeRange}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chart data");
  }

  return response.json();
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
        desktop: Math.floor(Math.random() * 400) + 100,
        mobile: Math.floor(Math.random() * 300) + 100,
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
      desktop: Math.floor(Math.random() * 400) + 100,
      mobile: Math.floor(Math.random() * 300) + 100,
    });
  }

  return data;
}
