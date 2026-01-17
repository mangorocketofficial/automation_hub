/**
 * 자동화 허브 타입 정의
 *
 * 데이터 계층 구조:
 *   platforms → groups → channels
 *   (플랫폼)    (그룹)    (채널)
 *
 * - Platform: 콘텐츠 플랫폼 정의 (YouTube Shorts, Naver Blog 등)
 * - Group: 플랫폼별 채널 그룹 (심리쇼츠, 골프블로그 등)
 * - Channel: 개별 채널 (그룹에 종속, 플랫폼은 그룹을 통해 간접 참조)
 */

// ============ 플랫폼 타입 ============

/**
 * 플랫폼 키 타입 (platforms.key와 동일)
 * 새 플랫폼 추가 시 이 타입에 추가
 */
export type PlatformKey =
  | 'youtube_shorts'
  | 'nextjs_blog'
  | 'naver_blog'
  | 'instagram';

/**
 * 플랫폼 인터페이스
 * 지원하는 콘텐츠 플랫폼 정의
 */
export interface Platform {
  id: string;
  key: PlatformKey;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 플랫폼 생성용 데이터
 */
export interface PlatformCreate {
  key: PlatformKey;
  name: string;
  description?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
}

/**
 * 플랫폼 수정용 데이터
 */
export interface PlatformUpdate {
  name?: string;
  description?: string;
  config?: Record<string, unknown>;
  is_active?: boolean;
}

// ============ 그룹 타입 ============

/**
 * [DEPRECATED] 채널 타입 - PlatformKey 사용 권장
 * 기존 호환성을 위해 유지. 향후 PlatformKey로 통합 예정.
 */
export type ChannelType = 'youtube_shorts' | 'naver_blog' | 'nextjs_blog';

/**
 * 그룹 인터페이스
 *
 * 그룹은 특정 플랫폼(platform_id)에 속하며, 여러 채널을 포함합니다.
 * type 필드는 deprecated이며, platform_id를 통해 플랫폼을 참조하세요.
 */
export interface Group {
  id: string;
  name: string;

  /** 플랫폼 ID (FK → platforms.id) */
  platform_id: string;

  /**
   * @deprecated platform_id 사용 권장
   * 기존 호환성을 위해 유지. platforms.key와 동일한 값.
   */
  type: ChannelType;

  description?: string;
  schedule_cron: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 플랫폼 정보를 포함한 그룹
 */
export interface GroupWithPlatform extends Group {
  platform?: Platform;
}

/**
 * 그룹 생성용 데이터
 */
export interface GroupCreate {
  name: string;

  /** 플랫폼 ID - 신규 생성 시 권장 */
  platform_id?: string;

  /**
   * @deprecated platform_id 사용 권장
   * platform_id가 없을 경우 fallback으로 사용
   */
  type?: ChannelType;

  description?: string;
  schedule_cron?: string;
  is_active?: boolean;
}

/**
 * 그룹 수정용 데이터
 */
export interface GroupUpdate {
  name?: string;
  description?: string;
  schedule_cron?: string;
  is_active?: boolean;
}

// ============ 채널 타입 ============

/**
 * 채널 인터페이스
 *
 * 채널은 그룹(group_id)에 종속되며, 플랫폼 정보는 그룹을 통해 간접 참조합니다.
 * type 필드는 deprecated이며, 그룹의 platform_id를 통해 플랫폼을 확인하세요.
 */
export interface Channel {
  id: string;
  group_id: string;
  name: string;

  /**
   * @deprecated 그룹의 platform_id 사용 권장
   * 채널의 type은 소속 그룹의 platform과 일치.
   * 향후 그룹의 platform_id를 통해 간접 참조로 변경 예정.
   */
  type: ChannelType;

  config: Record<string, unknown>;
  is_active: boolean;
  status: 'active' | 'paused' | 'error';
  last_run_at?: string;
  last_run_status?: 'success' | 'failed';
  created_at: string;
  updated_at: string;
}

/**
 * 채널 생성용 데이터
 */
export interface ChannelCreate {
  group_id: string;
  name: string;
  type: ChannelType;
  config?: Record<string, unknown>;
}

/**
 * 채널 수정용 데이터
 */
export interface ChannelUpdate {
  name?: string;
  config?: Record<string, unknown>;
  status?: Channel['status'];
}

// ============ 기타 타입 ============

export interface RunLog {
  id: string;
  channel_id: string;
  group_id?: string;
  status: 'running' | 'success' | 'failed';
  started_at: string;
  finished_at?: string;
  duration_seconds?: number;
  result: Record<string, unknown>;
  error_message?: string;
}

export interface Stats {
  id: string;
  channel_id: string;
  date: string;
  views: number;
  subscribers: number;
  likes: number;
  comments: number;
  posts_count: number;
}

export interface Schedule {
  id: string;
  target_type: 'group' | 'channel';
  target_id: string;
  cron: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
}

// ============ API 응답 타입 ============

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface DashboardSummary {
  scheduled: number;
  running: number;
  completed: number;
  failed: number;
}

// ============ 라벨/매핑 ============

/**
 * 플랫폼 키 → 표시 라벨 매핑
 */
export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  youtube_shorts: 'YouTube Shorts',
  naver_blog: '네이버 블로그',
  nextjs_blog: 'Next.js 블로그',
  instagram: 'Instagram',
};

/**
 * @deprecated PLATFORM_LABELS 사용 권장
 * 기존 호환성을 위해 유지
 */
export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  youtube_shorts: '유튜브 쇼츠',
  naver_blog: '네이버 블로그',
  nextjs_blog: 'Next.js 블로그',
};

/**
 * 채널 상태 라벨
 */
export const STATUS_LABELS: Record<Channel['status'], string> = {
  active: '활성',
  paused: '일시정지',
  error: '오류',
};

/**
 * 플랫폼 키 → 아이콘 매핑 (필요시 사용)
 */
export const PLATFORM_ICONS: Record<PlatformKey, string> = {
  youtube_shorts: '📹',
  naver_blog: '📝',
  nextjs_blog: '🌐',
  instagram: '📸',
};
