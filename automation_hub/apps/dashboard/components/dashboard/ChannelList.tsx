'use client';

import type { Channel } from '@/types';
import StatusBadge from './StatusBadge';
import Button from '@/components/ui/Button';
import { formatRelativeTime, CHANNEL_TYPE_LABELS } from '@/lib/utils';
import { runChannel } from '@/lib/api';
import { useState } from 'react';

interface ChannelListProps {
  channels: Channel[];
  onRefresh?: () => void;
}

export default function ChannelList({ channels, onRefresh }: ChannelListProps) {
  const [runningChannelId, setRunningChannelId] = useState<string | null>(null);

  // 개별 채널 실행 핸들러
  const handleRunChannel = async (channelId: string) => {
    setRunningChannelId(channelId);
    const { error } = await runChannel(channelId);
    if (error) {
      console.error('채널 실행 실패:', error);
      // TODO: 토스트 알림 표시
    }
    setRunningChannelId(null);
    onRefresh?.();
  };

  if (channels.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        등록된 채널이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              채널명
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              유형
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              상태
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              마지막 실행
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
              실행 결과
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
              액션
            </th>
          </tr>
        </thead>
        <tbody>
          {channels.map((channel) => (
            <tr
              key={channel.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="py-3 px-4">
                <span className="font-medium text-gray-900">{channel.name}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-600">
                  {CHANNEL_TYPE_LABELS[channel.type]}
                </span>
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={channel.status} size="sm" />
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-gray-500">
                  {channel.last_run_at
                    ? formatRelativeTime(channel.last_run_at)
                    : '-'}
                </span>
              </td>
              <td className="py-3 px-4">
                {channel.last_run_status && (
                  <StatusBadge status={channel.last_run_status} size="sm" />
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRunChannel(channel.id)}
                  isLoading={runningChannelId === channel.id}
                >
                  실행
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
