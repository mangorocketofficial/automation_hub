'use client';

import Card from '@/components/ui/Card';
import { PenaltyBadge } from '../shared/ScoreBadge';
import { ENTITY_TYPE_LABELS, type PenaltyScore } from '@/types/analysis';

interface PenaltyTableProps {
  penalties: PenaltyScore[];
  isLoading: boolean;
}

interface PenaltyRowProps {
  penalty: PenaltyScore;
}

function PenaltyRow({ penalty }: PenaltyRowProps) {
  const failureTypes = Object.entries(penalty.failure_type_counts)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ');

  return (
    <tr className="border-b border-zinc-700/50 last:border-0">
      <td className="py-3 px-4 text-sm text-zinc-300">
        {ENTITY_TYPE_LABELS[penalty.entity_type] || penalty.entity_type}
      </td>
      <td className="py-3 px-4 font-medium text-zinc-200">{penalty.entity_key}</td>
      <td className="py-3 px-4">
        <PenaltyBadge penalty={penalty.penalty_score} />
      </td>
      <td className="py-3 px-4 text-sm text-zinc-400">
        {(penalty.ema_penalty * 100).toFixed(1)}%
      </td>
      <td className="py-3 px-4 text-sm text-zinc-500">{failureTypes || '-'}</td>
    </tr>
  );
}

function PenaltyRowSkeleton() {
  return (
    <tr className="border-b border-zinc-700/50 animate-pulse">
      <td className="py-3 px-4"><div className="h-4 w-12 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-20 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-5 w-14 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-12 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-32 bg-zinc-600 rounded" /></td>
    </tr>
  );
}

export default function PenaltyTable({ penalties, isLoading }: PenaltyTableProps) {
  // Sort by penalty score descending (worst first)
  const sortedPenalties = [...penalties].sort((a, b) => b.penalty_score - a.penalty_score);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚠️</span>
        <h3 className="text-lg font-semibold text-zinc-100">패널티 현황</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-700">
              <th className="py-2 px-4 font-medium">타입</th>
              <th className="py-2 px-4 font-medium">이름</th>
              <th className="py-2 px-4 font-medium">패널티</th>
              <th className="py-2 px-4 font-medium">EMA</th>
              <th className="py-2 px-4 font-medium">실패 유형</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <PenaltyRowSkeleton />
                <PenaltyRowSkeleton />
                <PenaltyRowSkeleton />
              </>
            ) : sortedPenalties.length > 0 ? (
              sortedPenalties.map((penalty) => (
                <PenaltyRow key={`${penalty.entity_type}-${penalty.entity_key}`} penalty={penalty} />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">
                  패널티 데이터가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
