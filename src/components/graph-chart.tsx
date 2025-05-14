"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartDataPoint } from "@/hooks/use-chart-data";
import { useIsMobile } from "@/hooks/use-mobile";

// Chart configuration
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

interface GraphChartProps {
  title: string;
  description?: string;
  data?: ChartDataPoint[];
  isLoading?: boolean;
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
}

export function GraphChart({
  title,
  description,
  data,
  isLoading,
  timeRange,
  onTimeRangeChange,
}: GraphChartProps) {
  const isMobile = useIsMobile();

  // Default description based on time range
  const timeRangeDescription = React.useMemo(() => {
    switch (timeRange) {
      case "1h":
        return "Last hour";
      case "1d":
        return "Last 24 hours";
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 3 months";
      default:
        return "Last 3 months";
    }
  }, [timeRange]);

  // Format date based on time range
  const formatDate = React.useCallback(
    (value: string) => {
      const date = new Date(value);
      if (timeRange === "1h") {
        return date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
        });
      }
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    },
    [timeRange]
  );

  // Memoize the tooltip formatter to prevent re-renders
  const labelFormatter = React.useCallback(
    (value: any) => {
      return formatDate(value as string);
    },
    [formatDate]
  );

  // Memoize card title content
  const cardTitleContent = React.useMemo(
    () => (
      <>
        <span className="hidden @[540px]/card:block">
          {description || `Total for the ${timeRangeDescription}`}
        </span>
        <span className="@[540px]/card:hidden">{timeRangeDescription}</span>
      </>
    ),
    [description, timeRangeDescription]
  );

  // Memoize the chart component
  const chartComponent = React.useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex h-[250px] w-full items-center justify-center">
          Loading...
        </div>
      );
    }

    return (
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-[250px] w-full"
      >
        <AreaChart data={data}>
          <defs>
            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-desktop)"
                stopOpacity={1.0}
              />
              <stop
                offset="95%"
                stopColor="var(--color-desktop)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-mobile)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-mobile)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={formatDate}
          />
          <ChartTooltip
            cursor={false}
            defaultIndex={isMobile ? -1 : 10}
            content={
              <ChartTooltipContent
                labelFormatter={labelFormatter}
                indicator="dot"
              />
            }
          />
          <Area
            dataKey="mobile"
            type="natural"
            fill="url(#fillMobile)"
            stroke="var(--color-mobile)"
            stackId="a"
          />
          <Area
            dataKey="desktop"
            type="natural"
            fill="url(#fillDesktop)"
            stroke="var(--color-desktop)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    );
  }, [data, isLoading, formatDate, labelFormatter, isMobile]);

  // Memoize the time range controls
  const timeRangeControls = React.useMemo(
    () => (
      <CardAction>
        <ToggleGroup
          type="single"
          value={timeRange}
          onValueChange={onTimeRangeChange}
          variant="outline"
          className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
        >
          <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
          <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
          <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          <ToggleGroupItem value="1d">Last 24 hours</ToggleGroupItem>
          <ToggleGroupItem value="1h">Last hour</ToggleGroupItem>
        </ToggleGroup>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger
            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
            size="sm"
            aria-label="Select a time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="1d" className="rounded-lg">
              Last 24 hours
            </SelectItem>
            <SelectItem value="1h" className="rounded-lg">
              Last hour
            </SelectItem>
          </SelectContent>
        </Select>
      </CardAction>
    ),
    [timeRange, onTimeRangeChange]
  );

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{cardTitleContent}</CardDescription>
        {timeRangeControls}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartComponent}
      </CardContent>
    </Card>
  );
}
