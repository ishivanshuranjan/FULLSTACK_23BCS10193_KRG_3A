import StatsCard from "../StatsCard";
import { Users } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="max-w-sm mx-auto p-6">
      <StatsCard
        title="Total Users"
        value={248}
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
    </div>
  );
}
