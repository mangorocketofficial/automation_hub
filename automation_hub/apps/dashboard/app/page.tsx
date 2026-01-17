'use client';

import { useEffect, useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import GroupCard from '@/components/dashboard/GroupCard';
import RecentLogs from '@/components/dashboard/RecentLogs';
import NextScheduleBanner from '@/components/dashboard/NextScheduleBanner';
import type { Group, Channel, DashboardSummary, RunLog } from '@/types';
import { getGroups, getChannels, getDashboardSummary, getRunLogs, getSchedules, type Schedule } from '@/lib/api';

export default function HomePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({
    scheduled: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [groupsRes, channelsRes, summaryRes, logsRes, schedulesRes] = await Promise.all([
        getGroups(),
        getChannels(),
        getDashboardSummary(),
        getRunLogs(undefined, 10),
        getSchedules(),
      ]);

      if (groupsRes.data) setGroups(groupsRes.data);
      if (channelsRes.data) setChannels(channelsRes.data);
      if (summaryRes.data) setSummary(summaryRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      if (schedulesRes.data) setSchedules(schedulesRes.data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getChannelsByGroup = (groupId: string) => {
    return channels.filter((c) => c.group_id === groupId);
  };

  const channelNames = channels.reduce((acc, c) => {
    acc[c.id] = c.name;
    return acc;
  }, {} as Record<string, string>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 다음 예정 배너 */}
      <NextScheduleBanner schedules={schedules} />

      {/* 오늘의 요약 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-sm text-zinc-500 mb-1">예정</p>
            <p className="text-3xl font-bold text-zinc-100">{summary.scheduled}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-sm text-zinc-500 mb-1">진행중</p>
            <p className="text-3xl font-bold text-yellow-400">{summary.running}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-sm text-zinc-500 mb-1">완료</p>
            <p className="text-3xl font-bold text-green-400">{summary.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-sm text-zinc-500 mb-1">실패</p>
            <p className="text-3xl font-bold text-red-400">{summary.failed}</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 컨텐츠 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 그룹별 현황 */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">그룹별 현황</h3>
          {groups.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-center text-zinc-500 py-8">
                  등록된 그룹이 없습니다. 채널관리 탭에서 그룹을 추가해주세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  channels={getChannelsByGroup(group.id)}
                  onRefresh={loadData}
                />
              ))}
            </div>
          )}
        </div>

        {/* 최근 로그 */}
        <div>
          <RecentLogs logs={logs} channelNames={channelNames} />
        </div>
      </div>
    </div>
  );
}
