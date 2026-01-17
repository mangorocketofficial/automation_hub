'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { CategorySelector } from '@/components/analysis/shared';
import {
  MasterSwitches,
  LeverSliders,
  WeightBlending,
  DailyLimits,
  SafetyStatus,
} from '@/components/analysis/governance';
import {
  getGovernance,
  updateGovernance,
  checkSafety,
  getGuardrailLimits,
} from '@/lib/analysisApi';
import type {
  Category,
  GovernanceConfig,
  GuardrailLimits,
  SafetyStatus as SafetyStatusType,
} from '@/types/analysis';

export default function GovernancePage() {
  const [category, setCategory] = useState<Category>('psychology');
  const [config, setConfig] = useState<GovernanceConfig | null>(null);
  const [limits, setLimits] = useState<GuardrailLimits | null>(null);
  const [safetyStatus, setSafetyStatus] = useState<SafetyStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Store original config for comparison
  const originalConfig = useRef<GovernanceConfig | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [configRes, limitsRes, safetyRes] = await Promise.all([
        getGovernance(category),
        getGuardrailLimits(),
        checkSafety(category),
      ]);

      if (configRes.data) {
        setConfig(configRes.data);
        originalConfig.current = { ...configRes.data };
      }
      if (limitsRes.data) setLimits(limitsRes.data);
      if (safetyRes.data) setSafetyStatus(safetyRes.data);

      setHasChanges(false);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
    setIsLoading(false);
  }, [category]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConfigChange = <K extends keyof GovernanceConfig>(
    key: K,
    value: GovernanceConfig[K]
  ) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const newConfig = { ...prev, [key]: value };
      // Check if there are changes compared to original
      setHasChanges(
        JSON.stringify(newConfig) !== JSON.stringify(originalConfig.current)
      );
      return newConfig;
    });
  };

  const handleSave = async () => {
    if (!config || !hasChanges) return;

    setIsSaving(true);
    try {
      const res = await updateGovernance(category, config);
      if (res.data) {
        setConfig(res.data);
        originalConfig.current = { ...res.data };
        setHasChanges(false);
      }
    } catch (error) {
      console.error('저장 실패:', error);
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    if (originalConfig.current) {
      setConfig({ ...originalConfig.current });
      setHasChanges(false);
    }
  };

  const handleRefreshSafety = async () => {
    try {
      const res = await checkSafety(category);
      if (res.data) setSafetyStatus(res.data);
    } catch (error) {
      console.error('안전 상태 새로고침 실패:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-400">
          <Link href="/analysis" className="hover:text-zinc-200 transition-colors">
            ← 분석
          </Link>
          <span>/</span>
          <span className="text-zinc-100">운영자 설정</span>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Button variant="ghost" onClick={handleReset} disabled={isSaving}>
              초기화
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            disabled={!hasChanges}
          >
            저장
          </Button>
        </div>
      </div>

      {/* 카테고리 선택 */}
      <CategorySelector selected={category} onChange={setCategory} />

      {/* 변경 사항 알림 */}
      {hasChanges && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 text-sm text-yellow-400">
          ⚠️ 저장되지 않은 변경 사항이 있습니다
        </div>
      )}

      {/* 설정 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 마스터 스위치 */}
        <MasterSwitches
          config={config}
          isLoading={isLoading}
          onChange={(key, value) => handleConfigChange(key, value)}
        />

        {/* 탐색/활용 레버 */}
        <LeverSliders
          config={config}
          limits={limits}
          isLoading={isLoading}
          onChange={(key, value) => handleConfigChange(key, value)}
        />

        {/* 가중치 블렌딩 */}
        <WeightBlending
          config={config}
          isLoading={isLoading}
          onChange={(key, value) => handleConfigChange(key, value)}
        />

        {/* 일일 한도 */}
        <DailyLimits
          config={config}
          isLoading={isLoading}
          onChange={(key, value) => handleConfigChange(key, value)}
        />
      </div>

      {/* 안전 규칙 상태 */}
      <SafetyStatus
        status={safetyStatus}
        isLoading={isLoading}
        onRefresh={handleRefreshSafety}
      />
    </div>
  );
}
