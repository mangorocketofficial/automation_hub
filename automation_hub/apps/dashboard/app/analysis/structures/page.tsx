'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CategorySelector } from '@/components/analysis/shared';
import { EntityScoreTable, PenaltyTable } from '@/components/analysis/structures';
import { getHealth, getFrozenPatterns, freezePattern, unfreezePattern } from '@/lib/analysisApi';
import type { Category, EntityScore, EntityType, PenaltyScore } from '@/types/analysis';

type TabType = 'structures' | 'hooks' | 'titles' | 'penalties';

const TABS: { value: TabType; label: string }[] = [
  { value: 'structures', label: 'Structures' },
  { value: 'hooks', label: 'Hooks' },
  { value: 'titles', label: 'Title Patterns' },
  { value: 'penalties', label: '패널티' },
];

function StructuresPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = (searchParams.get('category') as Category) || 'psychology';
  const initialTab = (searchParams.get('tab') as TabType) || 'structures';

  const [category, setCategory] = useState<Category>(initialCategory);
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [structures, setStructures] = useState<EntityScore[]>([]);
  const [hooks, setHooks] = useState<EntityScore[]>([]);
  const [titles, setTitles] = useState<EntityScore[]>([]);
  const [penalties, setPenalties] = useState<PenaltyScore[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [healthRes, frozenRes] = await Promise.all([
        getHealth(category),
        getFrozenPatterns(category),
      ]);

      if (healthRes.data) {
        const frozenKeys = new Set(
          frozenRes.data?.map((p) => `${p.entity_type}-${p.entity_key}`) || []
        );

        // Apply frozen status
        const applyFrozen = (entities: EntityScore[], type: EntityType) =>
          entities.map((e) => ({
            ...e,
            is_frozen: frozenKeys.has(`${type}-${e.entity_key}`),
          }));

        setStructures(applyFrozen(healthRes.data.structures || [], 'structure'));
        setHooks(applyFrozen(healthRes.data.hooks || [], 'hook'));
        setTitles(applyFrozen(healthRes.data.titles || [], 'title'));
      }

      // TODO: Load penalties from a separate endpoint when available
      // For now, we'll use mock data
      setPenalties([]);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
    setIsLoading(false);
  }, [category]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFreeze = async (entityType: EntityType, entityKey: string) => {
    try {
      await freezePattern(category, entityType, entityKey);
      await loadData();
    } catch (error) {
      console.error('동결 실패:', error);
    }
  };

  const handleUnfreeze = async (entityType: EntityType, entityKey: string) => {
    try {
      await unfreezePattern(category, entityType, entityKey);
      await loadData();
    } catch (error) {
      console.error('동결 해제 실패:', error);
    }
  };

  const getEntityTypeFromTab = (tab: TabType): EntityType => {
    switch (tab) {
      case 'structures':
        return 'structure';
      case 'hooks':
        return 'hook';
      case 'titles':
        return 'title';
      default:
        return 'structure';
    }
  };

  const getCurrentEntities = () => {
    switch (activeTab) {
      case 'structures':
        return structures;
      case 'hooks':
        return hooks;
      case 'titles':
        return titles;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-2 text-zinc-400">
        <Link href="/analysis" className="hover:text-zinc-200 transition-colors">
          ← 분석
        </Link>
        <span>/</span>
        <span className="text-zinc-100">엔티티 관리</span>
      </div>

      {/* 탭 & 카테고리 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <CategorySelector selected={category} onChange={setCategory} />
      </div>

      {/* 콘텐츠 영역 */}
      {activeTab === 'penalties' ? (
        <PenaltyTable penalties={penalties} isLoading={isLoading} />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <EntityScoreTable
            title={TABS.find((t) => t.value === activeTab)?.label || ''}
            entityType={getEntityTypeFromTab(activeTab)}
            entities={getCurrentEntities()}
            isLoading={isLoading}
            onFreeze={(entityKey) => handleFreeze(getEntityTypeFromTab(activeTab), entityKey)}
            onUnfreeze={(entityKey) => handleUnfreeze(getEntityTypeFromTab(activeTab), entityKey)}
            onSelect={setSelectedEntity}
            selectedKey={selectedEntity?.entity_key}
          />

          {/* 선택된 엔티티 상세 (추후 차트 추가 가능) */}
          {selectedEntity && (
            <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">
                📈 {selectedEntity.entity_key} 상세
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">현재 점수</div>
                  <div className="text-xl font-bold text-zinc-100">
                    {selectedEntity.score.toFixed(1)}
                  </div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">EMA 점수</div>
                  <div className="text-xl font-bold text-zinc-100">
                    {selectedEntity.ema_score.toFixed(1)}
                  </div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">신뢰도</div>
                  <div className="text-xl font-bold text-zinc-100">
                    {(selectedEntity.confidence * 100).toFixed(0)}%
                  </div>
                </div>
                <div className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">샘플 수</div>
                  <div className="text-xl font-bold text-zinc-100">
                    {selectedEntity.sample_count}
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-4">
                * 점수 추이 차트는 추후 업데이트 예정입니다
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="h-6 bg-zinc-700 rounded w-32 animate-pulse" />
      <div className="h-10 bg-zinc-700 rounded w-full animate-pulse" />
      <div className="h-64 bg-zinc-700 rounded w-full animate-pulse" />
    </div>
  );
}

export default function StructuresPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StructuresPageContent />
    </Suspense>
  );
}
