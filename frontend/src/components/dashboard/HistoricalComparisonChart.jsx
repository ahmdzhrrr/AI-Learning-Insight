import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Calendar, ArrowUpRight } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-4 shadow-xl border border-white/30">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
          <span className="text-sm text-gray-600">
            Score: <span className="font-semibold text-violet-600">{payload[0].value}%</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const HistoricalComparisonChart = ({ data }) => {
  const defaultData = [
    { month: "Jan", score: 0 },
    { month: "Feb", score: 0 },
    { month: "Mar", score: 0 },
    { month: "Apr", score: 0 },
    { month: "May", score: 0 },
    { month: "Jun", score: 0 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  
  // Calculate trend
  const scores = chartData.map(d => d.score).filter(s => s > 0);
  const avgScore = scores.length > 0 
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) 
    : 0;
  
  // Calculate growth
  const firstScore = scores[0] || 0;
  const lastScore = scores[scores.length - 1] || 0;
  const growth = firstScore > 0 
    ? (((lastScore - firstScore) / firstScore) * 100).toFixed(0) 
    : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500">
      {/* Header Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500" />
      
      {/* Background Decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-violet-500/5 to-purple-500/5 rounded-full blur-2xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-purple-500/5 to-violet-500/5 rounded-full blur-2xl" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/20">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Historical Performance
              </h3>
              <p className="text-xs text-gray-500">Monthly score trends</p>
            </div>
          </div>
          
          {/* Stats Badges */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100">
              <TrendingUp className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-600">
                Avg: {avgScore}%
              </span>
            </div>
            {growth > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-600">
                  +{growth}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chart */}
        {chartData.some(d => d.score > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <filter id="areaShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.15"/>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                vertical={false}
              />
              <XAxis 
                dataKey="month" 
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
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="url(#strokeGradient)"
                strokeWidth={3}
                fill="url(#scoreGradient)"
                filter="url(#areaShadow)"
                dot={{ 
                  fill: '#8b5cf6', 
                  strokeWidth: 3, 
                  stroke: '#fff', 
                  r: 5,
                }}
                activeDot={{ 
                  r: 8, 
                  fill: '#8b5cf6', 
                  stroke: '#fff', 
                  strokeWidth: 3,
                  filter: 'drop-shadow(0 4px 6px rgba(139, 92, 246, 0.4))'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium">No historical data available</p>
            <p className="text-xs text-gray-400 mt-1">Complete courses to build your history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalComparisonChart;
