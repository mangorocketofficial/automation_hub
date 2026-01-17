import type {
  Platform,
  PlatformCreate,
  PlatformUpdate,
  Group,
  GroupCreate,
  Channel,
  RunLog,
  Stats,
  ApiResponse,
  DashboardSummary,
} from '@/types';

// VPS API 서버 베이스 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_VPS_API_URL || 'http://141.164.58.92:8000';

// 공통 fetch 래퍼
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // 204 No Content 응답 처리
    if (response.status === 204) {
      return { data: null as T };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return {
      data: null as T,
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
}

// ============ 플랫폼 API ============
// 데이터 계층 구조: platforms → groups → channels

export async function getPlatforms(activeOnly?: boolean): Promise<ApiResponse<Platform[]>> {
  const query = activeOnly ? '?active_only=true' : '';
  return fetchApi<Platform[]>(`/api/platforms${query}`);
}

export async function getPlatform(id: string): Promise<ApiResponse<Platform>> {
  return fetchApi<Platform>(`/api/platforms/${id}`);
}

export async function getPlatformByKey(key: string): Promise<ApiResponse<Platform>> {
  return fetchApi<Platform>(`/api/platforms/key/${key}`);
}

export async function createPlatform(platform: PlatformCreate): Promise<ApiResponse<Platform>> {
  return fetchApi<Platform>('/api/platforms', {
    method: 'POST',
    body: JSON.stringify(platform),
  });
}

export async function updatePlatform(id: string, platform: PlatformUpdate): Promise<ApiResponse<Platform>> {
  return fetchApi<Platform>(`/api/platforms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(platform),
  });
}

export async function deletePlatform(id: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/api/platforms/${id}`, {
    method: 'DELETE',
  });
}

// ============ 그룹 API ============

export async function getGroups(platformId?: string): Promise<ApiResponse<Group[]>> {
  const query = platformId ? `?platform_id=${platformId}` : '';
  return fetchApi<Group[]>(`/api/groups${query}`);
}

export async function getGroup(id: string): Promise<ApiResponse<Group>> {
  return fetchApi<Group>(`/api/groups/${id}`);
}

export async function createGroup(group: GroupCreate | Partial<Group>): Promise<ApiResponse<Group>> {
  return fetchApi<Group>('/api/groups', {
    method: 'POST',
    body: JSON.stringify(group),
  });
}

export async function updateGroup(id: string, group: Partial<Group>): Promise<ApiResponse<Group>> {
  return fetchApi<Group>(`/api/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(group),
  });
}

export async function deleteGroup(id: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/api/groups/${id}`, {
    method: 'DELETE',
  });
}

// ============ 채널 API ============

export async function getChannels(groupId?: string, platformId?: string): Promise<ApiResponse<Channel[]>> {
  const params = new URLSearchParams();
  if (groupId) params.append('group_id', groupId);
  if (platformId) params.append('platform_id', platformId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<Channel[]>(`/api/channels${query}`);
}

export async function getChannel(id: string): Promise<ApiResponse<Channel>> {
  return fetchApi<Channel>(`/api/channels/${id}`);
}

export async function createChannel(channel: Partial<Channel>): Promise<ApiResponse<Channel>> {
  return fetchApi<Channel>('/api/channels', {
    method: 'POST',
    body: JSON.stringify(channel),
  });
}

export async function updateChannel(id: string, channel: Partial<Channel>): Promise<ApiResponse<Channel>> {
  return fetchApi<Channel>(`/api/channels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(channel),
  });
}

export async function deleteChannel(id: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/api/channels/${id}`, {
    method: 'DELETE',
  });
}

// ============ 실행 API ============

export async function runAll(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>('/api/run/all', {
    method: 'POST',
  });
}

export async function runGroup(groupId: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/api/run/group/${groupId}`, {
    method: 'POST',
  });
}

export async function runChannel(channelId: string): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>(`/api/run/channel/${channelId}`, {
    method: 'POST',
  });
}

export async function stopAll(): Promise<ApiResponse<{ message: string }>> {
  return fetchApi<{ message: string }>('/api/stop/all', {
    method: 'POST',
  });
}

// ============ 통계 API ============

export async function getDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
  return fetchApi<DashboardSummary>('/api/stats/summary');
}

export async function getRunLogs(channelId?: string, limit?: number): Promise<ApiResponse<RunLog[]>> {
  const params = new URLSearchParams();
  if (channelId) params.append('channel_id', channelId);
  if (limit) params.append('limit', limit.toString());

  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchApi<RunLog[]>(`/api/stats/logs${query}`);
}

export async function getChannelStats(channelId: string, days?: number): Promise<ApiResponse<Stats[]>> {
  const query = days ? `?days=${days}` : '';
  return fetchApi<Stats[]>(`/api/stats/channel/${channelId}${query}`);
}

// ============ 스케줄 API ============

export interface Schedule {
  id: string;
  target_type: string;
  target_id: string;
  cron: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at: string;
  updated_at: string;
  target_name?: string;
}

export async function getSchedules(): Promise<ApiResponse<Schedule[]>> {
  return fetchApi<Schedule[]>('/api/schedules');
}

export async function getOverviewStats(): Promise<ApiResponse<{
  total_channels: number;
  channel_status: { active: number; paused: number; error: number };
  weekly_stats: { total_runs: number; successful_runs: number; failed_runs: number; success_rate: number };
}>> {
  return fetchApi('/api/stats/overview');
}

// ============ 통계 페이지 API ============

export interface StatsOverview {
  total_channels: number;
  channel_status: { active: number; paused: number; error: number };
  total_views: number;
  total_subscribers: number;
  total_posts: number;
  success_rate: number;
  views_change: number;
  subscribers_change: number;
  posts_change: number;
  success_rate_change: number;
}

export interface DailyStats {
  date: string;
  views: number;
  subscribers: number;
  posts: number;
  success: number;
  failed: number;
}

export interface GroupStats {
  group_id: string;
  group_name: string;
  group_type: string;
  total_views: number;
  total_subscribers: number;
  total_posts: number;
  success_rate: number;
}

export interface ChannelRanking {
  rank: number;
  channel_id: string;
  channel_name: string;
  group_id: string;
  group_name: string;
  views: number;
  subscribers: number;
  posts: number;
}

export async function getStatsOverview(startDate: string, endDate: string): Promise<ApiResponse<StatsOverview>> {
  return fetchApi<StatsOverview>(`/api/stats/overview?start_date=${startDate}&end_date=${endDate}`);
}

export async function getDailyStats(startDate: string, endDate: string): Promise<ApiResponse<DailyStats[]>> {
  return fetchApi<DailyStats[]>(`/api/stats/daily?start_date=${startDate}&end_date=${endDate}`);
}

export async function getGroupStats(startDate: string, endDate: string): Promise<ApiResponse<GroupStats[]>> {
  return fetchApi<GroupStats[]>(`/api/stats/groups?start_date=${startDate}&end_date=${endDate}`);
}

export async function getTopChannels(
  startDate: string,
  endDate: string,
  limit: number = 10,
  sortBy: string = 'views'
): Promise<ApiResponse<ChannelRanking[]>> {
  return fetchApi<ChannelRanking[]>(
    `/api/stats/top-channels?start_date=${startDate}&end_date=${endDate}&limit=${limit}&sort_by=${sortBy}`
  );
}
