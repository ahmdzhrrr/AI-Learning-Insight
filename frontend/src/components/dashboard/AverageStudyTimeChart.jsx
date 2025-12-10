import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-4 shadow-xl border border-white/30">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary" />
          <span className="text-sm text-gray-600">
            Study Time: <span className="font-semibold text-primary">{payload[0].value} hours</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const AverageStudyTimeChart = ({ data }) => {
  const defaultData = [
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  const maxValue = Math.max(...chartData.map(d => d.hours));
  const minValue = Math.min(...chartData.map(d => d.hours));
  
  // Calculate dynamic Y axis domain with padding
  const yAxisMin = Math.max(0, Math.floor(minValue * 0.8));
  const yAxisMax = Math.ceil(maxValue * 1.2) || 10; // Default to 10 if all values are 0

  // Gradient colors based on value
  const getBarColor = (value) => {
    const intensity = maxValue > 0 ? value / maxValue : 0;
    if (intensity > 0.7) return "#004343";
    if (intensity > 0.4) return "#006666";
    return "#008080";
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500">
      {/* Header Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
      
      {/* Background Decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-2xl" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Average Study Time
              </h3>
              <p className="text-xs text-gray-500">Hours per day this week</p>
            </div>
          </div>
          
          {/* Stats Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {chartData.reduce((acc, d) => acc + d.hours, 0).toFixed(1)}h total
            </span>
          </div>
        </div>

        {/* Chart */}
        {chartData.some(d => d.hours > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#004343" stopOpacity={1} />
                  <stop offset="100%" stopColor="#008080" stopOpacity={0.8} />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#004343" floodOpacity="0.2"/>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                vertical={false}
              />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dx={-10}
                domain={[yAxisMin, yAxisMax]}
                allowDataOverflow={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 67, 67, 0.05)' }} />
              <Bar 
                dataKey="hours" 
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                filter="url(#shadow)"
                maxBarSize={50}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.hours)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium">No study time data available</p>
            <p className="text-xs text-gray-400 mt-1">Start learning to see your progress</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AverageStudyTimeChart;
