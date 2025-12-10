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
  Area,
  ComposedChart,
} from "recharts";
import { Target, TrendingUp } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-4 shadow-xl border border-white/30">
        <p className="font-semibold text-gray-800 mb-3">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name}: <span className="font-semibold" style={{ color: entry.color }}>{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex justify-center space-x-6 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className={`w-3 h-3 rounded-full ${entry.value === 'target' ? 'border-2 border-dashed' : ''}`}
            style={{ 
              backgroundColor: entry.value === 'target' ? 'transparent' : entry.color,
              borderColor: entry.value === 'target' ? entry.color : 'transparent'
            }}
          />
          <span className="text-sm text-gray-600 capitalize">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const WeeklyProgressChart = ({ data }) => {
  const defaultData = [
    { week: "Week 1", completed: 0, target: 5 },
    { week: "Week 2", completed: 0, target: 5 },
    { week: "Week 3", completed: 0, target: 5 },
    { week: "Week 4", completed: 0, target: 5 },
    { week: "Current", completed: 0, target: 5 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  
  // Calculate completion rate
  const totalCompleted = chartData.reduce((acc, d) => acc + (d.completed || 0), 0);
  const totalTarget = chartData.reduce((acc, d) => acc + (d.target || 0), 0);
  const completionRate = totalTarget > 0 ? ((totalCompleted / totalTarget) * 100).toFixed(0) : 0;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-500">
      {/* Header Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
      
      {/* Background Decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full blur-2xl" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Weekly Progress
              </h3>
              <p className="text-xs text-gray-500">Completed vs Target</p>
            </div>
          </div>
          
          {/* Completion Rate Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">
              {completionRate}% achieved
            </span>
          </div>
        </div>

        {/* Chart */}
        {chartData.some(d => d.completed > 0 || d.target > 0) ? (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#10b981" floodOpacity="0.3"/>
                </filter>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                vertical={false}
              />
              <XAxis 
                dataKey="week" 
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              
              {/* Target Area (background) */}
              <Area
                type="monotone"
                dataKey="target"
                fill="url(#completedGradient)"
                stroke="transparent"
              />
              
              {/* Completed Line */}
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, stroke: '#fff', r: 5 }}
                activeDot={{ r: 7, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                filter="url(#lineShadow)"
              />
              
              {/* Target Line */}
              <Line
                type="monotone"
                dataKey="target"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ fill: '#f59e0b', strokeWidth: 2, stroke: '#fff', r: 4 }}
                activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium">No progress data available</p>
            <p className="text-xs text-gray-400 mt-1">Complete tasks to track your progress</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
