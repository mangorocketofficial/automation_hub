'use client';

import { useState } from 'react';
import type { Group, Channel } from '@/types';
import ChannelItem from './ChannelItem';
import { cronToKorean } from '@/lib/utils';

interface GroupSectionProps {
  group: Group;
  channels: Channel[];
  onEditGroup: (group: Group) => void;
  onDeleteGroup: (group: Group) => void;
  onAddChannel: (groupId: string) => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channel: Channel) => void;
  onToggleChannelActive: (channel: Channel) => void;
}

const TYPE_LABELS: Record<string, string> = {
  youtube_shorts: 'YouTube Shorts',
  naver_blog: '네이버 블로그',
  nextjs_blog: 'Next.js 블로그',
};

const TYPE_COLORS: Record<string, string> = {
  youtube_shorts: 'bg-red-500/10 text-red-400 border-red-500/30',
  naver_blog: 'bg-green-500/10 text-green-400 border-green-500/30',
  nextjs_blog: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
};

export default function GroupSection({
  group,
  channels,
  onEditGroup,
  onDeleteGroup,
  onAddChannel,
  onEditChannel,
  onDeleteChannel,
  onToggleChannelActive,
}: GroupSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeChannels = channels.filter((c) => c.is_active).length;
  const totalChannels = channels.length;

  return (
    <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
      {/* Group Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-750 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <button
            className="text-zinc-400 hover:text-zinc-100 transition-colors"
            aria-label={isExpanded ? '접기' : '펼치기'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-zinc-100">{group.name}</h3>
              <span
                className={`px-2 py-0.5 text-xs rounded-full border ${
                  TYPE_COLORS[group.type] || 'bg-zinc-600 text-zinc-300 border-zinc-500'
                }`}
              >
                {TYPE_LABELS[group.type] || group.type}
              </span>
              {!group.is_active && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-600 text-zinc-400 border border-zinc-500">
                  비활성
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
              <span>채널 {activeChannels}/{totalChannels}</span>
              <span>•</span>
              <span>{cronToKorean(group.schedule_cron)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onAddChannel(group.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">채널 추가</span>
          </button>
          <button
            onClick={() => onEditGroup(group)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-lg transition-colors"
            title="그룹 편집"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => onDeleteGroup(group)}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            title="그룹 삭제"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Channels List */}
      {isExpanded && (
        <div className="border-t border-zinc-700">
          {channels.length === 0 ? (
            <div className="p-6 text-center text-zinc-500">
              <p>채널이 없습니다</p>
              <button
                onClick={() => onAddChannel(group.id)}
                className="mt-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                + 첫 번째 채널 추가
              </button>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {channels.map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  onEdit={onEditChannel}
                  onDelete={onDeleteChannel}
                  onToggleActive={onToggleChannelActive}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
