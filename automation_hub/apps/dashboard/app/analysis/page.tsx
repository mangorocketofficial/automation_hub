'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CategorySelector } from '@/components/analysis/shared';
import {
  KpiCards,
  EntityHealthGrid,
  DiversityMetrics,
  FailureEvents,
} from '@/components/analysis/dashboard';
import {
  PipelineControl,
  PipelineModal,
  PipelineProgress,
  PipelineLog,
  PipelineHistory,
} from '@/components/analysis/pipeline';
import {
  getKpi,
  getHealth,
  getDiversity,
  getFailures,
  getPipelineStatus,
  getPipelineHistory,
  executePipeline,
  stopPipeline,
} from '@/lib/analysisApi';
import type {
  Category,
  KpiData,
  HealthData,
  DiversityMetrics as DiversityMetricsType,
  FailureMonitoringData,
  PipelineMode,
  PipelineStatusResponse,
  PipelineHistoryItem,
} from '@/types/analysis';

export default function AnalysisPage() {
  const [category, setCategory] = useState<Category>('psychology');
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [diversityData, setDiversityData] = useState<DiversityMetricsType | null>(null);
  const [failureData, setFailureData] = useState<FailureMonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Pipeline state
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatusResponse | null>(null);
  const [pipelineHistory, setPipelineHistory] = useState<PipelineHistoryItem[]>([]);
  const [isPipelineLoading, setIsPipelineLoading] = useState(false);
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpiRes, healthRes, diversityRes, failureRes] = await Promise.all([
        getKpi(category),
        getHealth(category),
        getDiversity(category),
        getFailures(category),
      ]);

      if (kpiRes.data) setKpiData(kpiRes.data);
      if (healthRes.data) setHealthData(healthRes.data);
      if (diversityRes.data) setDiversityData(diversityRes.data);
      if (failureRes.data) setFailureData(failureRes.data);

      setLastUpdated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
    setIsLoading(false);
  }, [category]);

  const loadPipelineData = useCallback(async () => {
    try {
      const [statusRes, historyRes] = await Promise.all([
        getPipelineStatus(category),
        getPipelineHistory(category, 10),
      ]);

      if (statusRes.data) setPipelineStatus(statusRes.data);
      if (historyRes.data) setPipelineHistory(historyRes.data);
    } catch (error) {
      console.error('파이프라인 데이터 로드 실패:', error);
    }
  }, [category]);

  useEffect(() => {
    loadData();
    loadPipelineData();
    // 30초마다 자동 새로고침
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData, loadPipelineData]);

  // Poll pipeline status more frequently when running
  useEffect(() => {
    if (pipelineStatus?.status === 'running') {
      const pollInterval = setInterval(loadPipelineData, 5000);
      return () => clearInterval(pollInterval);
    }
  }, [pipelineStatus?.status, loadPipelineData]);

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory);
  };

  const handleExecutePipeline = async (mode: PipelineMode) => {
    setShowPipelineModal(false);
    setIsPipelineLoading(true);
    try {
      const res = await executePipeline(category, mode);
      if (res.data) {
        await loadPipelineData();
      }
    } catch (error) {
      console.error('파이프라인 실행 실패:', error);
    }
    setIsPipelineLoading(false);
  };

  const handleStopPipeline = async () => {
    setIsPipelineLoading(true);
    try {
      await stopPipeline(category);
      await loadPipelineData();
    } catch (error) {
      console.error('파이프라인 중지 실패:', error);
    }
    setIsPipelineLoading(false);
  };

  const handlePipelineModalConfirm = (mode: PipelineMode, _dryRun: boolean) => {
    handleExecutePipeline(mode);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">분석</h2>
          <p className="text-zinc-500 mt-1">YouTube AI Factory 분석 현황</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/analysis/review"
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded-lg text-sm transition-colors"
          >
            콘텐츠 리뷰
          </Link>
          <Link
            href="/analysis/governance"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm transition-colors"
          >
            운영자 설정
          </Link>
        </div>
      </div>

      {/* 카테고리 선택 */}
      <CategorySelector selected={category} onChange={handleCategoryChange} />

      {/* 파이프라인 제어 */}
      <PipelineControl
        category={category}
        status={pipelineStatus?.status ?? 'idle'}
        stage={pipelineStatus?.stage ?? 'idle'}
        progress={pipelineStatus?.progress ?? 0}
        isLoading={isPipelineLoading}
        onExecute={handleExecutePipeline}
        onStop={handleStopPipeline}
      />

      {/* 파이프라인 실행 중일 때 진행 상황 표시 */}
      {pipelineStatus?.status === 'running' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PipelineProgress
            status={pipelineStatus.status}
            stage={pipelineStatus.stage}
            progress={pipelineStatus.progress}
            startedAt={pipelineStatus.started_at}
            isLoading={isPipelineLoading}
          />
          <PipelineLog
            logs={pipelineStatus.logs ?? []}
            isLoading={isPipelineLoading}
          />
        </div>
      )}

      {/* 파이프라인 이력 */}
      <PipelineHistory
        history={pipelineHistory}
        isLoading={isPipelineLoading}
        onRefresh={loadPipelineData}
      />

      {/* KPI 요약 카드 */}
      <KpiCards data={kpiData} isLoading={isLoading} lastUpdated={lastUpdated} />

      {/* 엔티티 건강도 */}
      <EntityHealthGrid data={healthData} isLoading={isLoading} category={category} />

      {/* 다양성 지표 */}
      <DiversityMetrics data={diversityData} isLoading={isLoading} />

      {/* 최근 실패 이벤트 */}
      <FailureEvents data={failureData} isLoading={isLoading} category={category} />

      {/* 파이프라인 실행 확인 모달 */}
      <PipelineModal
        isOpen={showPipelineModal}
        onClose={() => setShowPipelineModal(false)}
        onConfirm={handlePipelineModalConfirm}
        category={category}
        isLoading={isPipelineLoading}
      />
    </div>
  );
}
