'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  getPipelineRunDetail,
  getPipelineRunVideos,
  getPipelineRunTrends,
} from '@/lib/analysisApi';
import type {
  PipelineRunDetail,
  CollectedVideo,
  TrendData,
} from '@/types/analysis';
import {
  PIPELINE_MODE_LABELS,
  PIPELINE_STATUS_LABELS,
  PIPELINE_STAGE_LABELS,
  HOOK_TYPE_LABELS,
  HookType,
} from '@/types/analysis';

function formatDuration(seconds: number | null): string {
  if (!seconds) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return minutes > 0 ? `${minutes}분 ${secs}초` : `${secs}초`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export default function PipelineRunDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const runId = params.runId as string;
  const category = searchParams.get('category') || 'psychology';

  const [runDetail, setRunDetail] = useState<PipelineRunDetail | null>(null);
  const [videos, setVideos] = useState<CollectedVideo[]>([]);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'trends'>('overview');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailRes, videosRes, trendsRes] = await Promise.all([
        getPipelineRunDetail(category, runId),
        getPipelineRunVideos(category, runId),
        getPipelineRunTrends(category, runId),
      ]);

      if (detailRes.data) setRunDetail(detailRes.data);
      if (videosRes.data) setVideos(videosRes.data);
      if (trendsRes.data) setTrends(trendsRes.data);
    } catch (error) {
      console.error('실행 상세 로드 실패:', error);
    }
    setIsLoading(false);
  }, [category, runId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statusStyles: Record<string, { bg: string; text: string }> = {
    completed: { bg: 'bg-green-500/20', text: 'text-green-400' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400' },
    running: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    stopped: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    idle: { bg: 'bg-zinc-500/20', text: 'text-zinc-400' },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
        <div className="h-64 bg-zinc-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!runDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">실행 정보를 찾을 수 없습니다</p>
        <Link
          href="/analysis"
          className="text-purple-400 hover:text-purple-300 mt-4 inline-block"
        >
          분석 대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  const style = statusStyles[runDetail.status] || statusStyles.idle;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ← 뒤로
          </button>
          <div>
            <h2 className="text-2xl font-bold text-zinc-100">
              파이프라인 실행 상세
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              {runDetail.run_id}
            </p>
          </div>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-sm', style.bg, style.text)}>
          {PIPELINE_STATUS_LABELS[runDetail.status]}
        </span>
      </div>

      {/* 요약 정보 */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs text-zinc-500 mb-1">카테고리</div>
            <div className="text-zinc-200 font-medium">{category}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">실행 모드</div>
            <div className="text-zinc-200 font-medium">
              {PIPELINE_MODE_LABELS[runDetail.mode]}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">시작 시간</div>
            <div className="text-zinc-200 font-medium">
              {formatDate(runDetail.started_at)}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 mb-1">소요 시간</div>
            <div className="text-zinc-200 font-medium">
              {formatDuration(runDetail.duration_seconds)}
            </div>
          </div>
        </div>
      </Card>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-zinc-700 pb-2">
        {(['overview', 'videos', 'trends'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm rounded-t-lg transition-colors',
              activeTab === tab
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {tab === 'overview' && '개요'}
            {tab === 'videos' && `수집된 비디오 (${videos.length})`}
            {tab === 'trends' && '트렌드'}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 분석 결과 */}
          <Card>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">분석 결과</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">수집된 비디오</span>
                <span className="text-zinc-200 font-medium">
                  {runDetail.videos_collected}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">바이럴 후보</span>
                <span className="text-zinc-200 font-medium">
                  {runDetail.viral_candidates}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">처리된 자막</span>
                <span className="text-zinc-200 font-medium">
                  {runDetail.transcripts_processed}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">추출된 패턴</span>
                <span className="text-zinc-200 font-medium">
                  {runDetail.patterns_extracted}개
                </span>
              </div>
            </div>
          </Card>

          {/* 생성 결과 */}
          <Card>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">생성 결과</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">생성된 콘텐츠</span>
                <span className="text-zinc-200 font-medium">
                  {runDetail.candidates_generated}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">생성된 이미지</span>
                <span className="text-zinc-200 font-medium">
                  {runDetail.images_generated}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">생성된 오디오</span>
                <span className="text-zinc-200 font-medium">
                  {runDetail.audios_generated}개
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">렌더링된 비디오</span>
                <span className="text-zinc-200 font-medium">
                  {runDetail.videos_rendered}개
                </span>
              </div>
            </div>
          </Card>

          {/* 로그 */}
          <Card className="md:col-span-2">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">실행 로그</h3>
            <div className="h-64 overflow-y-auto bg-zinc-950 rounded-lg p-3 font-mono text-xs space-y-1">
              {runDetail.logs && runDetail.logs.length > 0 ? (
                runDetail.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-start gap-2 py-1 px-2 rounded',
                      log.level === 'error' && 'bg-red-500/10'
                    )}
                  >
                    <span className="text-zinc-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
                    </span>
                    <span className="text-zinc-500 shrink-0">
                      [{PIPELINE_STAGE_LABELS[log.stage]}]
                    </span>
                    <span
                      className={cn(
                        'flex-1',
                        log.level === 'error' && 'text-red-400',
                        log.level === 'warning' && 'text-yellow-400',
                        log.level === 'success' && 'text-green-400',
                        log.level === 'info' && 'text-blue-400'
                      )}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 text-center py-8">로그가 없습니다</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-4">
          {videos.length === 0 ? (
            <Card>
              <div className="text-center text-zinc-500 py-8">
                수집된 비디오가 없습니다
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card key={video.video_id} className="overflow-hidden">
                  <div className="aspect-video bg-zinc-800 relative">
                    {video.thumbnail_url && (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs text-zinc-200">
                      바이럴: {video.viral_score.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-medium text-zinc-100 line-clamp-2">
                      {video.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 text-xs text-zinc-400">
                      <span>{video.channel_title}</span>
                      <span>{formatNumber(video.view_count)} 조회</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 훅 타입 분포 */}
          <Card>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">훅 타입 분포</h3>
            {trends?.hook_types && Object.keys(trends.hook_types).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(trends.hook_types)
                  .sort(([, a], [, b]) => b - a)
                  .map(([hook, count]) => {
                    const total = Object.values(trends.hook_types).reduce((a, b) => a + b, 0);
                    const pct = (count / total) * 100;
                    return (
                      <div key={hook}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-zinc-300">
                            {HOOK_TYPE_LABELS[hook as HookType] || hook}
                          </span>
                          <span className="text-sm text-zinc-400">{count}개 ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-4">
                데이터가 없습니다
              </div>
            )}
          </Card>

          {/* 구조 분포 */}
          <Card>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">구조 분포</h3>
            {trends?.structures && Object.keys(trends.structures).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(trends.structures)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([structure, count]) => {
                    const total = Object.values(trends.structures).reduce((a, b) => a + b, 0);
                    const pct = (count / total) * 100;
                    return (
                      <div key={structure}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-zinc-300 truncate">{structure}</span>
                          <span className="text-sm text-zinc-400 shrink-0 ml-2">
                            {count}개 ({pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center text-zinc-500 py-4">
                데이터가 없습니다
              </div>
            )}
          </Card>

          {/* 상위 퍼포먼스 비디오 */}
          {trends?.top_performers && trends.top_performers.length > 0 && (
            <Card className="md:col-span-2">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4">Top 퍼포머</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-zinc-500 border-b border-zinc-700">
                      <th className="pb-2 pr-4">제목</th>
                      <th className="pb-2 pr-4">채널</th>
                      <th className="pb-2 pr-4 text-right">바이럴 스코어</th>
                      <th className="pb-2 text-right">조회수</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trends.top_performers.map((video) => (
                      <tr key={video.video_id} className="border-b border-zinc-800">
                        <td className="py-2 pr-4 text-zinc-200 max-w-xs truncate">
                          {video.title}
                        </td>
                        <td className="py-2 pr-4 text-zinc-400">{video.channel_title}</td>
                        <td className="py-2 pr-4 text-right text-purple-400">
                          {video.viral_score.toFixed(1)}
                        </td>
                        <td className="py-2 text-right text-zinc-400">
                          {formatNumber(video.view_count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
