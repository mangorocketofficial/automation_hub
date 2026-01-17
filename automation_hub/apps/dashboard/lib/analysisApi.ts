// YouTube AI Factory - Analysis API Client

import type {
  KpiData,
  HealthData,
  DiversityMetrics,
  FailureMonitoringData,
  SelectorDiagnostics,
  DashboardData,
  ReviewQueueItem,
  Content,
  RejectionReason,
  ReviewAnalytics,
  GovernanceConfig,
  GuardrailLimits,
  SafetyRules,
  SafetyStatus,
  FrozenPattern,
  EntityType,
  PipelineMode,
  PipelineExecuteResponse,
  PipelineStatusResponse,
  PipelineHistoryItem,
  PipelineRunDetail,
  CollectedVideo,
  TrendData,
  ContentMedia,
} from '@/types/analysis';
import type { ApiResponse } from '@/types';

// Analysis API Base URL
const ANALYSIS_API_URL = process.env.NEXT_PUBLIC_ANALYSIS_API_URL || 'http://141.164.58.92:8000/api/v1';

// 공통 fetch 래퍼
async function fetchAnalysisApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${ANALYSIS_API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    // 204 No Content 응답 처리
    if (response.status === 204) {
      return { data: null as T };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Analysis API Error:', error);
    return {
      data: null as T,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

// ============ Dashboard API ============

/**
 * 전체 대시보드 데이터 조회
 */
export async function getDashboard(category: string): Promise<ApiResponse<DashboardData>> {
  return fetchAnalysisApi<DashboardData>(`/dashboard/${category}`);
}

/**
 * KPI 데이터 조회
 */
export async function getKpi(category: string): Promise<ApiResponse<KpiData>> {
  return fetchAnalysisApi<KpiData>(`/dashboard/${category}/kpi`);
}

/**
 * 엔티티 건강도 조회
 */
export async function getHealth(category: string): Promise<ApiResponse<HealthData>> {
  return fetchAnalysisApi<HealthData>(`/dashboard/${category}/health`);
}

/**
 * 다양성 지표 조회
 */
export async function getDiversity(category: string): Promise<ApiResponse<DiversityMetrics>> {
  return fetchAnalysisApi<DiversityMetrics>(`/dashboard/${category}/diversity`);
}

/**
 * 실패 이벤트 조회
 */
export async function getFailures(category: string): Promise<ApiResponse<FailureMonitoringData>> {
  return fetchAnalysisApi<FailureMonitoringData>(`/dashboard/${category}/failures`);
}

/**
 * 자율 선택기 진단 조회
 */
export async function getSelectorDiagnostics(
  category: string
): Promise<ApiResponse<SelectorDiagnostics>> {
  return fetchAnalysisApi<SelectorDiagnostics>(`/dashboard/${category}/selector`);
}

// ============ Review API ============

export interface ReviewQueueParams {
  status?: string;
  category?: string;
  structure?: string;
  hook?: string;
  min_score?: number;
  failure_risk?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 리뷰 큐 조회
 */
export async function getReviewQueue(
  params?: ReviewQueueParams
): Promise<ApiResponse<ReviewQueueItem[]>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
  }
  const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return fetchAnalysisApi<ReviewQueueItem[]>(`/review/queue${query}`);
}

/**
 * 콘텐츠 상세 조회
 */
export async function getContentDetail(contentId: number): Promise<ApiResponse<Content>> {
  return fetchAnalysisApi<Content>(`/review/content/${contentId}`);
}

/**
 * 콘텐츠 승인
 */
export async function approveContent(
  contentId: number,
  reviewerId?: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAnalysisApi<{ message: string }>(`/review/content/${contentId}/approve`, {
    method: 'POST',
    headers: reviewerId ? { 'x-reviewer-id': reviewerId } : undefined,
  });
}

/**
 * 콘텐츠 거절
 */
export async function rejectContent(
  contentId: number,
  reason: string,
  notes?: string,
  reviewerId?: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAnalysisApi<{ message: string }>(`/review/content/${contentId}/reject`, {
    method: 'POST',
    headers: reviewerId ? { 'x-reviewer-id': reviewerId } : undefined,
    body: JSON.stringify({ reason, notes }),
  });
}

/**
 * 콘텐츠 수정
 */
export async function editContent(
  contentId: number,
  fields: Partial<Content>,
  reviewerId?: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAnalysisApi<{ message: string }>(`/review/content/${contentId}/edit`, {
    method: 'POST',
    headers: reviewerId ? { 'x-reviewer-id': reviewerId } : undefined,
    body: JSON.stringify(fields),
  });
}

/**
 * 리뷰 분석 조회
 */
export async function getReviewAnalytics(category: string): Promise<ApiResponse<ReviewAnalytics>> {
  return fetchAnalysisApi<ReviewAnalytics>(`/review/analytics/${category}`);
}

/**
 * 거절 사유 목록 조회
 */
export async function getRejectionReasons(): Promise<ApiResponse<RejectionReason[]>> {
  return fetchAnalysisApi<RejectionReason[]>('/review/rejection-reasons');
}

/**
 * 콘텐츠 상태 목록 조회
 */
export async function getContentStatuses(): Promise<ApiResponse<string[]>> {
  return fetchAnalysisApi<string[]>('/review/content-statuses');
}

// ============ Governance API ============

/**
 * Governance 설정 조회
 */
export async function getGovernance(category: string): Promise<ApiResponse<GovernanceConfig>> {
  return fetchAnalysisApi<GovernanceConfig>(`/governance/${category}`);
}

/**
 * Governance 설정 업데이트
 */
export async function updateGovernance(
  category: string,
  config: Partial<GovernanceConfig>
): Promise<ApiResponse<GovernanceConfig>> {
  return fetchAnalysisApi<GovernanceConfig>(`/governance/${category}`, {
    method: 'PATCH',
    body: JSON.stringify(config),
  });
}

/**
 * 안전 상태 체크
 */
export async function checkSafety(category: string): Promise<ApiResponse<SafetyStatus>> {
  return fetchAnalysisApi<SafetyStatus>(`/governance/${category}/safety`);
}

/**
 * 자율 모드 토글
 */
export async function toggleAutonomous(
  category: string,
  enabled: boolean
): Promise<ApiResponse<{ message: string; enabled: boolean }>> {
  return fetchAnalysisApi<{ message: string; enabled: boolean }>(
    `/governance/${category}/autonomous`,
    {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    }
  );
}

/**
 * 동결 패턴 목록 조회
 */
export async function getFrozenPatterns(category: string): Promise<ApiResponse<FrozenPattern[]>> {
  return fetchAnalysisApi<FrozenPattern[]>(`/governance/${category}/frozen-patterns`);
}

/**
 * 패턴 동결
 */
export async function freezePattern(
  category: string,
  entityType: EntityType,
  entityKey: string,
  reason?: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAnalysisApi<{ message: string }>(`/governance/${category}/freeze`, {
    method: 'POST',
    body: JSON.stringify({
      entity_type: entityType,
      entity_key: entityKey,
      reason,
    }),
  });
}

/**
 * 패턴 동결 해제
 */
export async function unfreezePattern(
  category: string,
  entityType: EntityType,
  entityKey: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAnalysisApi<{ message: string }>(`/governance/${category}/unfreeze`, {
    method: 'POST',
    body: JSON.stringify({
      entity_type: entityType,
      entity_key: entityKey,
    }),
  });
}

/**
 * 가드레일 제한 조회
 */
export async function getGuardrailLimits(): Promise<ApiResponse<GuardrailLimits>> {
  return fetchAnalysisApi<GuardrailLimits>('/governance/guardrail-limits');
}

/**
 * 안전 규칙 조회
 */
export async function getSafetyRules(): Promise<ApiResponse<SafetyRules>> {
  return fetchAnalysisApi<SafetyRules>('/governance/safety-rules');
}

// ============ Pipeline API ============

/**
 * 파이프라인 실행 (전체)
 */
export async function executePipelineFull(
  category: string,
  dryRun?: boolean
): Promise<ApiResponse<PipelineExecuteResponse>> {
  return fetchAnalysisApi<PipelineExecuteResponse>(`/pipeline/${category}/full`, {
    method: 'POST',
    body: JSON.stringify({ dry_run: dryRun }),
  });
}

/**
 * 파이프라인 실행 (분석만)
 */
export async function executePipelineAnalysis(
  category: string,
  dryRun?: boolean
): Promise<ApiResponse<PipelineExecuteResponse>> {
  return fetchAnalysisApi<PipelineExecuteResponse>(`/pipeline/${category}/analysis`, {
    method: 'POST',
    body: JSON.stringify({ dry_run: dryRun }),
  });
}

/**
 * 파이프라인 실행 (생성만)
 */
export async function executePipelineGeneration(
  category: string,
  dryRun?: boolean
): Promise<ApiResponse<PipelineExecuteResponse>> {
  return fetchAnalysisApi<PipelineExecuteResponse>(`/pipeline/${category}/generation`, {
    method: 'POST',
    body: JSON.stringify({ dry_run: dryRun }),
  });
}

/**
 * 파이프라인 실행 (모드 선택)
 */
export async function executePipeline(
  category: string,
  mode: PipelineMode,
  dryRun?: boolean
): Promise<ApiResponse<PipelineExecuteResponse>> {
  switch (mode) {
    case 'full':
      return executePipelineFull(category, dryRun);
    case 'analysis':
      return executePipelineAnalysis(category, dryRun);
    case 'generation':
      return executePipelineGeneration(category, dryRun);
  }
}

/**
 * 파이프라인 상태 조회
 */
export async function getPipelineStatus(
  category: string
): Promise<ApiResponse<PipelineStatusResponse>> {
  return fetchAnalysisApi<PipelineStatusResponse>(`/pipeline/${category}/status`);
}

/**
 * 파이프라인 중지
 */
export async function stopPipeline(
  category: string
): Promise<ApiResponse<{ message: string }>> {
  return fetchAnalysisApi<{ message: string }>(`/pipeline/${category}/stop`, {
    method: 'POST',
  });
}

  /**
   * 파이프라인 이력 조회
   */
export async function getPipelineHistory(
    category: string,
    limit?: number
  ): Promise<ApiResponse<PipelineHistoryItem[]>> {
    const query = limit ? `?limit=${limit}` : '';
    const response = await fetchAnalysisApi<{ runs: PipelineHistoryItem[] }>(`/pipeline/${category}/history${query}`);

    // API returns { runs: [...] }, extract the array
    if (response.data && 'runs' in response.data) {
      return { data: response.data.runs, error: response.error };
    }
    return { data: [], error: response.error };
  }
 
/**
 * 파이프라인 실행 상세 조회
 */
export async function getPipelineRunDetail(
  category: string,
  runId: string
): Promise<ApiResponse<PipelineRunDetail>> {
  return fetchAnalysisApi<PipelineRunDetail>(`/pipeline/${category}/runs/${runId}`);
}

/**
 * 파이프라인 실행에서 수집된 비디오 조회
 */
export async function getPipelineRunVideos(
  category: string,
  runId: string
): Promise<ApiResponse<CollectedVideo[]>> {
  return fetchAnalysisApi<CollectedVideo[]>(`/pipeline/${category}/runs/${runId}/videos`);
}

/**
 * 파이프라인 실행에서 추출된 트렌드 조회
 */
export async function getPipelineRunTrends(
  category: string,
  runId: string
): Promise<ApiResponse<TrendData>> {
  return fetchAnalysisApi<TrendData>(`/pipeline/${category}/runs/${runId}/trends`);
}

// ============ Media API ============

/**
 * 콘텐츠 미디어 조회
 */
export async function getContentMedia(
  contentId: number
): Promise<ApiResponse<ContentMedia>> {
  return fetchAnalysisApi<ContentMedia>(`/review/content/${contentId}/media`);
}
