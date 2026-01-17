// YouTube AI Factory - Analysis System Types

// ============ 기본 타입 ============

// 카테고리
export type Category = 'psychology' | 'productivity' | 'fitness' | string;

// 콘텐츠 상태
export type ContentStatus =
  | 'draft'
  | 'approved'
  | 'rejected'
  | 'ready_for_review'
  | 'queued'
  | 'uploaded'
  | 'failed';

// 훅 타입
export type HookType =
  | 'prohibition'
  | 'promise'
  | 'curiosity'
  | 'shock'
  | 'authority'
  | 'question'
  | 'contrast';

// 엔티티 상태
export type EntityStatus = 'EXPERIMENT' | 'CANDIDATE' | 'STABLE';

// 엔티티 타입
export type EntityType = 'structure' | 'hook' | 'title';

// ============ Dashboard 타입 ============

// KPI 데이터
export interface KpiData {
  total_generated: number;
  pending_review: number;
  total_uploaded: number;
  total_failed: number;
  period_generated?: number;
  period_approved?: number;
  period_rejected?: number;
  last_updated?: string;
}

// 엔티티 점수
export interface EntityScore {
  entity_key: string;
  category: string;
  score: number;
  ema_score: number;
  confidence: number;
  sample_count: number;
  cumulative_credit: number;
  status: EntityStatus;
  is_frozen: boolean;
  last_updated: string;
}

// 건강도 데이터
export interface HealthData {
  structures: EntityScore[];
  hooks: EntityScore[];
  titles: EntityScore[];
}

// 패널티 점수
export interface PenaltyScore {
  entity_type: EntityType;
  entity_key: string;
  category: string;
  penalty_score: number;
  ema_penalty: number;
  failure_type_counts: Record<string, number>;
  last_updated: string;
}

// 다양성 지표
export interface DiversityMetrics {
  structure_distribution: Record<string, number>;
  hook_distribution: Record<string, number>;
  title_distribution: Record<string, number>;
  structure_dominance: number;
  hook_dominance: number;
  title_dominance: number;
  alerts: string[];
}

// 실패 이벤트
export interface FailureEvent {
  id: string;
  timestamp: string;
  entity_type: EntityType;
  entity_key: string;
  failure_type: string;
  failure_subtype?: string;
  severity: number;
  details?: string;
  candidate_content_id?: number;
}

// 실패 모니터링 데이터
export interface FailureMonitoringData {
  recent_failures: FailureEvent[];
  total_failures_24h: number;
  failure_rate: number;
  top_failure_types: Record<string, number>;
}

// 선택기 진단
export interface SelectorDiagnostics {
  recent_decisions: SelectorDecision[];
  weight_breakdown: Record<string, Record<string, number>>;
  exploration_rate: number;
  mode: string;
}

export interface SelectorDecision {
  id: string;
  timestamp: string;
  entity_type: EntityType;
  entity_key: string;
  viral_score: number;
  performance_score: number;
  penalty_score: number;
  final_weight: number;
  was_selected: boolean;
  selection_rank: number;
  guardrails_triggered: string[];
}

// 전체 대시보드 데이터
export interface DashboardData {
  kpi: KpiData;
  health: HealthData;
  diversity: DiversityMetrics;
  failures: FailureMonitoringData;
  selector: SelectorDiagnostics;
}

// ============ Review 타입 ============

// 콘텐츠
export interface Content {
  id: number;
  title: string;
  script: string;
  hook_type: HookType;
  hook_text: string;
  structure_template: string;
  category: string;
  topic?: string;
  status: ContentStatus;
  generation_score?: number;
  has_cta: boolean;
  section_count: number;
  created_at: string;
  updated_at: string;
  // Media generation info
  image_path?: string;
  audio_path?: string;
  video_path?: string;
}

// 리뷰 큐 아이템
export interface ReviewQueueItem {
  id: number;
  title: string;
  hook_type: HookType;
  structure_template: string;
  category: string;
  status: ContentStatus;
  generation_score?: number;
  created_at: string;
  has_image: boolean;
  has_audio: boolean;
  has_video: boolean;
}

// 거절 사유
export interface RejectionReason {
  code: string;
  label: string;
  description?: string;
}

// 리뷰 분석
export interface ReviewAnalytics {
  total_reviewed: number;
  approval_rate: number;
  rejection_rate: number;
  avg_review_time_seconds: number;
  rejection_reasons: Record<string, number>;
}

// ============ Governance 타입 ============

// Governance 설정
export interface GovernanceConfig {
  // Master switches
  enable_autonomous_selector: boolean;
  enable_performance_learning: boolean;
  enable_failure_feedback: boolean;
  enable_auto_upload: boolean;

  // Exploration/Exploitation
  exploration_rate: number;
  diversity_cap_pct: number;
  min_exposure_pct: number;
  penalty_impact_cap_pct: number;

  // Weight blending
  autonomous_viral_base_weight: number;
  autonomous_perf_blend_ratio: number;
  autonomous_penalty_blend_ratio: number;

  // Rate limits
  max_candidates_per_day: number;
  max_uploads_per_day: number;
  daily_cost_cap_usd: number;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// 가드레일 제한
export interface GuardrailLimits {
  exploration_rate: { min: number; max: number; default: number };
  diversity_cap_pct: { min: number; max: number; default: number };
  min_exposure_pct: { min: number; max: number; default: number };
  penalty_impact_cap_pct: { min: number; max: number; default: number };
}

// 안전 규칙
export interface SafetyRules {
  min_approved_videos_7d: number;
  max_error_rate: number;
  fallback_to_shadow: boolean;
}

// 안전 상태
export interface SafetyStatus {
  all_rules_passed: boolean;
  approved_videos_7d: number;
  current_error_rate: number;
  violations: string[];
  last_checked: string;
}

// 동결 패턴
export interface FrozenPattern {
  entity_type: EntityType;
  entity_key: string;
  category: string;
  frozen_at: string;
  frozen_by?: string;
  freeze_reason?: string;
}

// ============ 상수 ============

// 훅 타입 라벨 (한글)
export const HOOK_TYPE_LABELS: Record<HookType, string> = {
  prohibition: '금지형',
  promise: '약속형',
  curiosity: '호기심형',
  shock: '충격형',
  authority: '권위형',
  question: '질문형',
  contrast: '대조형',
};

// 콘텐츠 상태 라벨 (한글)
export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  draft: '초안',
  approved: '승인됨',
  rejected: '거절됨',
  ready_for_review: '리뷰 대기',
  queued: '업로드 대기',
  uploaded: '업로드 완료',
  failed: '실패',
};

// 엔티티 상태 라벨 (한글)
export const ENTITY_STATUS_LABELS: Record<EntityStatus, string> = {
  EXPERIMENT: '실험',
  CANDIDATE: '후보',
  STABLE: '안정',
};

// 엔티티 타입 라벨 (한글)
export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  structure: '구조',
  hook: '훅',
  title: '제목',
};

// 기본 카테고리 목록
export const DEFAULT_CATEGORIES: Category[] = [
  'psychology',
  'productivity',
  'fitness',
];

// 카테고리 라벨 (한글)
export const CATEGORY_LABELS: Record<string, string> = {
  psychology: '심리',
  productivity: '생산성',
  fitness: '피트니스',
};

// ============ Pipeline 타입 ============

// 파이프라인 모드
export type PipelineMode = 'full' | 'analysis' | 'generation';

// 파이프라인 상태
export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed' | 'stopped';

// 파이프라인 단계
export type PipelineStage =
  | 'idle'
  | 'collection'
  | 'scoring'
  | 'analysis'
  | 'script_generation'
  | 'media_generation'
  | 'completed'
  | 'failed';

// 파이프라인 실행 응답
export interface PipelineExecuteResponse {
  run_id: string;
  category: string;
  mode: PipelineMode;
  status: PipelineStatus;
  message: string;
  started_at: string;
}

// 파이프라인 상태 응답
export interface PipelineStatusResponse {
  run_id: string | null;
  category: string;
  mode: PipelineMode | null;
  status: PipelineStatus;
  stage: PipelineStage;
  progress: number;
  started_at: string | null;
  logs: PipelineLogEntry[];
}

// 파이프라인 로그 항목
export interface PipelineLogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  stage: PipelineStage;
  message: string;
  details?: Record<string, unknown>;
}

// 파이프라인 이력 항목
export interface PipelineHistoryItem {
  run_id: string;
  category: string;
  mode: PipelineMode;
  status: PipelineStatus;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  videos_collected: number;
  candidates_generated: number;
  error_message: string | null;
}

// 파이프라인 실행 상세
export interface PipelineRunDetail {
  run_id: string;
  category: string;
  mode: PipelineMode;
  status: PipelineStatus;
  stage: PipelineStage;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;

  // 분석 결과
  videos_collected: number;
  viral_candidates: number;
  transcripts_processed: number;
  patterns_extracted: number;

  // 생성 결과
  candidates_generated: number;
  images_generated: number;
  audios_generated: number;
  videos_rendered: number;

  // 로그
  logs: PipelineLogEntry[];
}

// 수집된 비디오
export interface CollectedVideo {
  video_id: string;
  title: string;
  channel_title: string;
  viral_score: number;
  view_count: number;
  published_at: string;
  thumbnail_url: string;
}

// 트렌드 데이터
export interface TrendData {
  hook_types: Record<string, number>;
  structures: Record<string, number>;
  avg_viral_score: number;
  top_performers: CollectedVideo[];
}

// ============ Media 타입 ============

// 오디오 정보
export interface AudioInfo {
  id: number;
  voice_id: string;
  voice_selection_reason: string | null;
  duration_seconds: number;
  file_path: string;
  file_size_bytes: number;
  tts_model: string;
  speed_rate: number;
  created_at: string;
}

// 이미지 정보
export interface ImageInfo {
  id: number;
  prompt: string;
  style_tags: Record<string, string> | null;
  file_path: string;
  file_size_bytes: number;
  model_settings: Record<string, unknown> | null;
  generation_time_seconds: number;
  created_at: string;
}

// 비디오 정보
export interface VideoInfo {
  id: number;
  duration_seconds: number;
  file_path: string;
  file_size_bytes: number;
  font_style: string;
  subtitle_position: string;
  subtitle_color_config: Record<string, unknown> | null;
  bgm_id: string | null;
  render_time_seconds: number;
  created_at: string;
}

// 콘텐츠 미디어
export interface ContentMedia {
  content_id: number;
  audio: AudioInfo | null;
  image: ImageInfo | null;
  video: VideoInfo | null;
}

// 파이프라인 모드 라벨
export const PIPELINE_MODE_LABELS: Record<PipelineMode, string> = {
  full: '전체 파이프라인',
  analysis: '분석만',
  generation: '생성만',
};

// 파이프라인 상태 라벨
export const PIPELINE_STATUS_LABELS: Record<PipelineStatus, string> = {
  idle: '대기',
  running: '실행 중',
  completed: '완료',
  failed: '실패',
  stopped: '중지됨',
};

// 파이프라인 단계 라벨
export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  idle: '대기',
  collection: '비디오 수집',
  scoring: '바이럴 스코어링',
  analysis: '스크립트 분석',
  script_generation: '스크립트 생성',
  media_generation: '미디어 생성',
  completed: '완료',
  failed: '실패',
};
