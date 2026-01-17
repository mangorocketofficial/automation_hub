'use client';

import { formatCompactNumber } from '@/lib/utils';
import type { GroupStats } from '@/lib/api';

interface GroupStatsTableProps {
  data: GroupStats[];
  isLoading: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  youtube_shorts: 'YouTube',
  naver_blog: '네이버',
  nextjs_blog: 'Next.js',
};

const TYPE_COLORS: Record<string, string> = {
  youtube_shorts: 'bg-red-500/10 text-red-400',
  naver_blog: 'bg-green-500/10 text-green-400',
  nextjs_blog: 'bg-blue-500/10 text-blue-400',
};

export default function GroupStatsTable({ data, isLoading }: GroupStatsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
        <div className="h-6 bg-zinc-700 rounded w-32 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-zinc-700/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">그룹별 성과</h3>

      {data.length === 0 ? (
        <div className="py-8 text-center text-zinc-500">데이터가 없습니다</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">그룹명</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">조회수</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">구독자</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">발행</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">성공률</th>
              </tr>
            </thead>
            <tbody>
              {data.map((group) => (
                <tr
                  key={group.group_id}
                  className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-100 font-medium">{group.group_name}</span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          TYPE_COLORS[group.group_type] || 'bg-zinc-600 text-zinc-300'
                        }`}
                      >
                        {TYPE_LABELS[group.group_type] || group.group_type}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-100">
                    {formatCompactNumber(group.total_views)}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-100">
                    +{formatCompactNumber(group.total_subscribers)}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-100">{group.total_posts}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`${
                        group.success_rate >= 90
                          ? 'text-green-400'
                          : group.success_rate >= 70
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {group.success_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
