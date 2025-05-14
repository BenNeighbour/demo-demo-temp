"use client";

import { GraphChart } from "@/components/graph-chart";
import { useChartData } from "@/hooks/use-chart-data";
import { useIsMobile } from "@/hooks/use-mobile";
import * as React from "react";

export const description = "An interactive area chart";

export function SalesLedger() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  // Initialize time range based on device
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Fetch chart data using the hook
  const { data, isLoading } = useChartData(timeRange);

  return (
    <GraphChart
      title="Sales Ledger"
      data={data}
      isLoading={isLoading}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
    />
  );
}
