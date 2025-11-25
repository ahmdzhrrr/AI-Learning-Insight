import React from "react";
import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react";

const MetricsBreakdown = ({ metrics }) => {
  if (!metrics) return null;

  const breakdownItems = [
    {
      label: "Total Submissions",
      value: metrics.total_submissions || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Rejected Submissions",
      value: metrics.rejected_submissions || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      label: "Rejection Ratio",
      value: `${((metrics.rejection_ratio || 0) * 100).toFixed(1)}%`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Total Active Days",
      value: metrics.total_active_days || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Metrics Breakdown
      </h3>
      <div className="space-y-4">
        {breakdownItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${item.bgColor} mr-3`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-indigo-700 font-medium">
            Overall Performance
          </span>
          <div className="flex items-center">
            <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.avg_exam_score || 0}%` }}
              ></div>
            </div>
            <span className="text-indigo-700 font-bold">
              {(metrics.avg_exam_score || 0).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsBreakdown;
