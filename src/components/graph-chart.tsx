"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartDataPoint } from "@/hooks/use-chart-data";
import { format } from "date-fns";
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "./ui/skeleton";

interface GraphChartProps {
  data: ChartDataPoint[];
  isLoading: boolean;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  title: string;
  description?: string;
}

export function GraphChart({
  data,
  isLoading,
  timeRange,
  onTimeRangeChange,
  title,
  description,
}: GraphChartProps) {
  // Memoize the date formatter function
  const formatDate = React.useCallback(
    (date: string) => {
      const dateObj = new Date(date);
      if (timeRange === "1h") {
        return format(dateObj, "HH:mm");
      }
      return format(dateObj, "MMM dd");
    },
    [timeRange]
  );

  // Memoize the tooltip label formatter
  const labelFormatter = React.useCallback(
    (label: string) => {
      const date = new Date(label);
      if (timeRange === "1h") {
        return format(date, "HH:mm:ss");
      }
      return format(date, "MMM dd, yyyy");
    },
    [timeRange]
  );

  // Memoize the time range description
  const timeRangeDescription = React.useMemo(() => {
    switch (timeRange) {
      case "3m":
        return "Past 3 months";
      case "30d":
        return "Past 30 days";
      case "7d":
        return "Past 7 days";
      case "1d":
        return "Past day";
      case "1h":
        return "Past hour";
      default:
        return "Past 3 months";
    }
  }, [timeRange]);

  // Memoize the card title content
  const cardTitleContent = React.useMemo(
    () => (
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <CardDescription>{timeRangeDescription}</CardDescription>
      </CardHeader>
    ),
    [title, description, timeRangeDescription]
  );

  // Memoize the time range controls
  const timeRangeControls = React.useMemo(
    () => (
      <div className="space-x-2 mb-4">
        <Button
          variant={timeRange === "3m" ? "default" : "outline"}
          onClick={() => onTimeRangeChange("3m")}
        >
          3 months
        </Button>
        <Button
          variant={timeRange === "30d" ? "default" : "outline"}
          onClick={() => onTimeRangeChange("30d")}
        >
          30 days
        </Button>
        <Button
          variant={timeRange === "7d" ? "default" : "outline"}
          onClick={() => onTimeRangeChange("7d")}
        >
          7 days
        </Button>
        <Button
          variant={timeRange === "1d" ? "default" : "outline"}
          onClick={() => onTimeRangeChange("1d")}
        >
          Past day
        </Button>
        <Button
          variant={timeRange === "1h" ? "default" : "outline"}
          onClick={() => onTimeRangeChange("1h")}
        >
          Past hour
        </Button>
      </div>
    ),
    [timeRange, onTimeRangeChange]
  );

  // Memoize the chart component
  const chartComponent = React.useMemo(() => {
    if (isLoading) {
      return <Skeleton className="w-full h-[350px]" />;
    }

    // Calculate min/max for Y-axis with padding
    const balances = data.map((d) => d.balance);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const padding = (max - min) * 0.1 || 1000;
    const domain = [
      Math.floor((min - padding) / 1000) * 1000,
      Math.ceil((max + padding) / 1000) * 1000,
    ];

    return (
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "#888888" }}
          />
          <YAxis
            domain={domain}
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(value)
            }
            tick={{ fill: "#888888" }}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            labelFormatter={labelFormatter}
            formatter={(value: number) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(value)
            }
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#balance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }, [data, isLoading, formatDate, labelFormatter]);

  return (
    <Card>
      {cardTitleContent}
      <CardContent>
        {timeRangeControls}
        {chartComponent}
      </CardContent>
    </Card>
  );
}
