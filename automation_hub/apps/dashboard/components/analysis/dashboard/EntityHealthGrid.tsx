'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import { ScoreBadge, StatusBadge } from '../shared/ScoreBadge';
import type { HealthData, EntityScore } from '@/types/analysis';

interface EntityHealthGridProps {
  data: HealthData | null;
  isLoading: boolean;
  category: string;
}

interface EntityCardProps {
  entity: EntityScore;
}

function EntityCard({ entity }: EntityCardProps) {
  return (
    <div className="bg-zinc-700/30 rounded-lg p-3 min-w-[100px]">
      <div className="text-sm font-medium text-zinc-200 truncate mb-1">
        {entity.entity_key}
      </div>
      <div className="flex items-center justify-between">
        <ScoreBadge score={entity.score} size="md" />
      </div>
      <div className="mt-1">
        <StatusBadge status={entity.status} isFrozen={entity.is_frozen} size="sm" />
      </div>
    </div>
  );
}

function EntityCardSkeleton() {
  return (
    <div className="bg-zinc-700/30 rounded-lg p-3 min-w-[100px] animate-pulse">
      <div className="h-4 w-16 bg-zinc-600 rounded mb-2" />
      <div className="h-5 w-12 bg-zinc-600 rounded mb-1" />
      <div className="h-4 w-14 bg-zinc-600 rounded" />
    </div>
  );
}

interface EntitySectionProps {
  title: string;
  entities: EntityScore[];
  isLoading: boolean;
}

function EntitySection({ title, entities, isLoading }: EntitySectionProps) {
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-sm font-medium text-zinc-300 mb-2">{title}</h4>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {isLoading ? (
          <>
            <EntityCardSkeleton />
            <EntityCardSkeleton />
            <EntityCardSkeleton />
            <EntityCardSkeleton />
          </>
        ) : entities.length > 0 ? (
          entities.slice(0, 6).map((entity) => (
            <EntityCard key={entity.entity_key} entity={entity} />
          ))
        ) : (
          <div className="text-sm text-zinc-500">데이터 없음</div>
        )}
      </div>
    </div>
  );
}

export default function EntityHealthGrid({ data, isLoading, category }: EntityHealthGridProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏥</span>
          <h3 className="text-lg font-semibold text-zinc-100">엔티티 건강도</h3>
        </div>
        <Link
          href={`/analysis/structures?category=${category}`}
          className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          상세보기 →
        </Link>
      </div>

      <EntitySection
        title="Structures"
        entities={data?.structures || []}
        isLoading={isLoading}
      />
      <EntitySection
        title="Hooks"
        entities={data?.hooks || []}
        isLoading={isLoading}
      />
      <EntitySection
        title="Titles"
        entities={data?.titles || []}
        isLoading={isLoading}
      />
    </Card>
  );
}
