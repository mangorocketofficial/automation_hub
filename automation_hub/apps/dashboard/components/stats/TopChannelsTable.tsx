'use client';

import { formatCompactNumber } from '@/lib/utils';
import type { ChannelRanking } from '@/lib/api';

interface TopChannelsTableProps {
  data: ChannelRanking[];
  isLoading: boolean;
  onViewAll?: () => void;
}

export default function TopChannelsTable({ data, isLoading, onViewAll }: TopChannelsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
        <div className="h-6 bg-zinc-700 rounded w-40 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-zinc-700/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <span className="text-xl">🏆</span>
          채널별 TOP 10
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            전체보기
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-zinc-500">데이터가 없습니다</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400 w-16">순위</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">채널명</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">그룹</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">조회수</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">구독자</th>
              </tr>
            </thead>
            <tbody>
              {data.map((channel) => (
                <tr
                  key={channel.channel_id}
                  className="border-b border-zinc-700/50 hover:bg-zinc-700/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${
                        channel.rank === 1
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : channel.rank === 2
                          ? 'bg-zinc-400/20 text-zinc-300'
                          : channel.rank === 3
                          ? 'bg-amber-600/20 text-amber-500'
                          : 'bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {channel.rank}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-zinc-100 font-medium">{channel.channel_name}</td>
                  <td className="py-3 px-4 text-zinc-400">{channel.group_name}</td>
                  <td className="py-3 px-4 text-right text-blue-400">
                    +{formatCompactNumber(channel.views)}
                  </td>
                  <td className="py-3 px-4 text-right text-green-400">
                    +{formatCompactNumber(channel.subscribers)}
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
