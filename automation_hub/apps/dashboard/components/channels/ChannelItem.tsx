'use client';

import type { Channel } from '@/types';
import StatusBadge from '@/components/dashboard/StatusBadge';

interface ChannelItemProps {
  channel: Channel;
  onEdit: (channel: Channel) => void;
  onDelete: (channel: Channel) => void;
  onToggleActive: (channel: Channel) => void;
}

export default function ChannelItem({ channel, onEdit, onDelete, onToggleActive }: ChannelItemProps) {
  const isActive = channel.status === 'active';

  return (
    <div className="flex items-center justify-between p-3 bg-zinc-750 hover:bg-zinc-700/50 rounded-lg transition-colors group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            isActive ? 'bg-emerald-500' : channel.status === 'error' ? 'bg-red-500' : 'bg-zinc-500'
          }`}
        />
        <div className="min-w-0 flex-1">
          <span className="text-zinc-100 font-medium truncate">{channel.name}</span>
        </div>
        <StatusBadge status={channel.status} />
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <button
          onClick={() => onToggleActive(channel)}
          className={`p-1.5 rounded-md transition-colors ${
            isActive
              ? 'text-amber-400 hover:bg-amber-400/10'
              : 'text-emerald-400 hover:bg-emerald-400/10'
          }`}
          title={isActive ? '일시정지' : '재시작'}
        >
          {isActive ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
        <button
          onClick={() => onEdit(channel)}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-600 rounded-md transition-colors"
          title="편집"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(channel)}
          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
          title="삭제"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
