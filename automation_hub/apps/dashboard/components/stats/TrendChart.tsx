'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatShortDate, formatCompactNumber } from '@/lib/utils';
import type { DailyStats } from '@/lib/api';

interface TrendChartProps {
  data: DailyStats[];
  isLoading: boolean;
}

type MetricType = 'views' | 'subscribers' | 'posts';

const metricConfig: Record<MetricType, { label: string; color: string }> = {
  views: { label: '조회수', color: '#3b82f6' },
  subscribers: { label: '구독자', color: '#22c55e' },
  posts: { label: '발행수', color: '#a855f7' },
};

export default function TrendChart({ data, isLoading }: TrendChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('views');

  const chartData = data.map((item) => ({
    ...item,
    displayDate: formatShortDate(item.date),
  }));

  if (isLoading) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
        <div className="h-6 bg-zinc-700 rounded w-32 mb-4 animate-pulse" />
        <div className="h-[300px] bg-zinc-700/50 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100">추이 그래프</h3>
        <div className="flex gap-2">
          {(Object.keys(metricConfig) as MetricType[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeMetric === metric
                  ? 'text-white'
                  : 'bg-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
              style={{
                backgroundColor:
                  activeMetric === metric ? metricConfig[metric].color : undefined,
              }}
            >
              {metricConfig[metric].label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-zinc-500">
          데이터가 없습니다
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: '8px',
                color: '#fafafa',
              }}
              labelStyle={{ color: '#a1a1aa' }}
              formatter={(value) => [formatCompactNumber(typeof value === 'number' ? value : 0), metricConfig[activeMetric].label]}
            />
            <Line
              type="monotone"
              dataKey={activeMetric}
              stroke={metricConfig[activeMetric].color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
