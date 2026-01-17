'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ScoreBadge, StatusBadge } from '../shared/ScoreBadge';
import type { EntityScore, EntityType } from '@/types/analysis';

interface EntityScoreTableProps {
  title: string;
  entityType: EntityType;
  entities: EntityScore[];
  isLoading: boolean;
  onFreeze: (entityKey: string) => void;
  onUnfreeze: (entityKey: string) => void;
  onSelect: (entity: EntityScore) => void;
  selectedKey?: string;
}

interface ScoreRowProps {
  entity: EntityScore;
  onFreeze: () => void;
  onUnfreeze: () => void;
  onClick: () => void;
  isSelected: boolean;
}

function ScoreRow({ entity, onFreeze, onUnfreeze, onClick, isSelected }: ScoreRowProps) {
  const lastUpdated = new Date(entity.last_updated).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <tr
      className={`border-b border-zinc-700/50 last:border-0 hover:bg-zinc-700/30 cursor-pointer transition-colors ${
        isSelected ? 'bg-emerald-600/10' : ''
      }`}
      onClick={onClick}
    >
      <td className="py-3 px-4">
        <div className="font-medium text-zinc-200">{entity.entity_key}</div>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={entity.status} isFrozen={entity.is_frozen} />
      </td>
      <td className="py-3 px-4">
        <ScoreBadge score={entity.score} />
      </td>
      <td className="py-3 px-4 text-sm text-zinc-400">{entity.ema_score.toFixed(1)}</td>
      <td className="py-3 px-4 text-sm text-zinc-400">{entity.sample_count}</td>
      <td className="py-3 px-4 text-sm text-zinc-500">{lastUpdated}</td>
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        {entity.is_frozen ? (
          <Button variant="ghost" size="sm" onClick={onUnfreeze}>
            해제
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={onFreeze}>
            동결
          </Button>
        )}
      </td>
    </tr>
  );
}

function ScoreRowSkeleton() {
  return (
    <tr className="border-b border-zinc-700/50 animate-pulse">
      <td className="py-3 px-4"><div className="h-4 w-20 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-5 w-16 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-12 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-10 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-10 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-4 w-14 bg-zinc-600 rounded" /></td>
      <td className="py-3 px-4"><div className="h-6 w-12 bg-zinc-600 rounded" /></td>
    </tr>
  );
}

export default function EntityScoreTable({
  title,
  entityType,
  entities,
  isLoading,
  onFreeze,
  onUnfreeze,
  onSelect,
  selectedKey,
}: EntityScoreTableProps) {
  // Sort by score descending
  const sortedEntities = [...entities].sort((a, b) => b.score - a.score);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="text-lg font-semibold text-zinc-100">{title} 점수 현황</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b border-zinc-700">
              <th className="py-2 px-4 font-medium">이름</th>
              <th className="py-2 px-4 font-medium">상태</th>
              <th className="py-2 px-4 font-medium">Score</th>
              <th className="py-2 px-4 font-medium">EMA</th>
              <th className="py-2 px-4 font-medium">샘플수</th>
              <th className="py-2 px-4 font-medium">업데이트</th>
              <th className="py-2 px-4 font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                <ScoreRowSkeleton />
                <ScoreRowSkeleton />
                <ScoreRowSkeleton />
                <ScoreRowSkeleton />
              </>
            ) : sortedEntities.length > 0 ? (
              sortedEntities.map((entity) => (
                <ScoreRow
                  key={entity.entity_key}
                  entity={entity}
                  onFreeze={() => onFreeze(entity.entity_key)}
                  onUnfreeze={() => onUnfreeze(entity.entity_key)}
                  onClick={() => onSelect(entity)}
                  isSelected={selectedKey === entity.entity_key}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500">
                  데이터가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
