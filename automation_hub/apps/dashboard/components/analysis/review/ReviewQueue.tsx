'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  HOOK_TYPE_LABELS,
  CONTENT_STATUS_LABELS,
  type ReviewQueueItem,
  type ContentStatus,
} from '@/types/analysis';

interface ReviewQueueProps {
  items: ReviewQueueItem[];
  isLoading: boolean;
  selectedIds: number[];
  onSelectItem: (id: number) => void;
  onSelectAll: () => void;
  onItemClick: (id: number) => void;
}

interface QueueRowProps {
  item: ReviewQueueItem;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}

function StatusBadge({ status }: { status: ContentStatus }) {
  const statusColors: Record<ContentStatus, string> = {
    draft: 'bg-zinc-500/20 text-zinc-400',
    approved: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
    ready_for_review: 'bg-yellow-500/20 text-yellow-400',
    queued: 'bg-blue-500/20 text-blue-400',
    uploaded: 'bg-emerald-500/20 text-emerald-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', statusColors[status])}>
      {CONTENT_STATUS_LABELS[status]}
    </span>
  );
}

function QueueRow({ item, isSelected, onSelect, onClick }: QueueRowProps) {
  const createdTime = new Date(item.created_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <tr
      className={cn(
        'border-b border-zinc-700/50 last:border-0 hover:bg-zinc-700/30 cursor-pointer transition-colors',
        isSelected && 'bg-emerald-600/10'
      )}
      onClick={onClick}
    >
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-800"
        />
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-zinc-200 font-medium truncate max-w-[300px]">
          {item.title}
        </div>
        <div className="text-xs text-zinc-500 mt-0.5">
          {HOOK_TYPE_LABELS[item.hook_type]} · {item.structure_template}
        </div>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-3 px-4 text-sm text-zinc-400">{createdTime}</td>
      <td className="py-3 px-4">
        <div className="flex gap-1">
          {item.has_image && <span className="text-xs" title="이미지 생성됨">🖼️</span>}
          {item.has_audio && <span className="text-xs" title="오디오 생성됨">🔊</span>}
          {item.has_video && <span className="text-xs" title="비디오 생성됨">🎬</span>}
        </div>
      </td>
    </tr>
  );
}

function QueueRowSkeleton() {
  return (
    <tr className="border-b border-zinc-700/50 animate-pulse">
      <td className="py-3 px-4"><div className="h-4 w-4 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4">
        <div className="h-4 w-48 bg-zinc-600 rounded mb-1" />
        <div className="h-3 w-32 bg-zinc-600 rounded" />
      </td>
      <td className="py-3 px-4"><div className="h-5 w-16 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-12 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-16 bg-zinc-600 rounded" /></td>
    </tr>
  );
}

export default function ReviewQueue({
  items,
  isLoading,
  selectedIds,
  onSelectItem,
  onSelectAll,
  onItemClick,
}: ReviewQueueProps) {
  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h3 className="text-lg font-semibold text-zinc-100">리뷰 대기열</h3>
          <span className="text-sm text-zinc-500">({items.length}개)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-700">
              <th className="py-2 px-4 font-medium w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-800"
                />
              </th>
              <th className="py-2 px-4 font-medium">제목</th>
              <th className="py-2 px-4 font-medium">상태</th>
              <th className="py-2 px-4 font-medium">생성일</th>
              <th className="py-2 px-4 font-medium">미디어</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <QueueRowSkeleton />
                <QueueRowSkeleton />
                <QueueRowSkeleton />
                <QueueRowSkeleton />
                <QueueRowSkeleton />
              </>
            ) : items.length > 0 ? (
              items.map((item) => (
                <QueueRow
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.includes(item.id)}
                  onSelect={() => onSelectItem(item.id)}
                  onClick={() => onItemClick(item.id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500">
                  리뷰 대기 중인 콘텐츠가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
