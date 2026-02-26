"use client";

import { Button } from "@/components/ui/button";
import type { TimeRange } from "./types";

const PRESETS: { label: string; value: TimeRange }[] = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "1y", value: "1y" },
  { label: "All", value: "all" },
  { label: "Custom", value: "custom" },
];

interface TimeRangeFilterProps {
  value: TimeRange;
  customFrom: string;
  customTo: string;
  onChange: (range: TimeRange, from: string, to: string) => void;
}

function getDateRange(range: TimeRange): { from: string; to: string } {
  const to = new Date();
  const from = new Date();

  switch (range) {
    case "7d":
      from.setDate(from.getDate() - 7);
      break;
    case "30d":
      from.setDate(from.getDate() - 30);
      break;
    case "90d":
      from.setDate(from.getDate() - 90);
      break;
    case "1y":
      from.setFullYear(from.getFullYear() - 1);
      break;
    case "all":
      from.setFullYear(2020, 0, 1);
      break;
    default:
      break;
  }

  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

export default function TimeRangeFilter({
  value,
  customFrom,
  customTo,
  onChange,
}: TimeRangeFilterProps) {
  const handlePresetClick = (range: TimeRange) => {
    if (range === "custom") {
      onChange("custom", customFrom, customTo);
    } else {
      const { from, to } = getDateRange(range);
      onChange(range, from, to);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((preset) => (
        <Button
          key={preset.value}
          variant={value === preset.value ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset.value)}
        >
          {preset.label}
        </Button>
      ))}
      {value === "custom" && (
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onChange("custom", e.target.value, customTo)}
            className="px-3 py-1.5 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
          />
          <span className="text-muted-foreground text-sm">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onChange("custom", customFrom, e.target.value)}
            className="px-3 py-1.5 bg-background border border-input rounded-ui focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
          />
        </div>
      )}
    </div>
  );
}
