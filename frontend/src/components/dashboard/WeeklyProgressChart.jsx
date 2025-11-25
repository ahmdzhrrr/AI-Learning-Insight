import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const WeeklyProgressChart = ({ metrics }) => {
  const data = [
    { week: "Week 1", completed: 3, target: 5 },
    { week: "Week 2", completed: 5, target: 5 },
    { week: "Week 3", completed: 4, target: 5 },
    { week: "Week 4", completed: 7, target: 5 },
    {
      week: "Current",
      completed: metrics?.total_journeys_completed || 6,
      target: 5,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Weekly Progress
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyProgressChart;
