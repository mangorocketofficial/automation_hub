'use client';

import { useEffect, useState } from 'react';
import { subDays } from 'date-fns';
import {
  DateFilter,
  SummaryCards,
  TrendChart,
  GroupStatsTable,
  TopChannelsTable,
} from '@/components/stats';
import {
  getStatsOverview,
  getDailyStats,
  getGroupStats,
  getTopChannels,
  type StatsOverview,
  type DailyStats,
  type GroupStats,
  type ChannelRanking,
} from '@/lib/api';
import { formatApiDate } from '@/lib/utils';

export default function StatsPage() {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 7),
    end: new Date(),
  });
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [groupStats, setGroupStats] = useState<GroupStats[]>([]);
  const [topChannels, setTopChannels] = useState<ChannelRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    const startDate = formatApiDate(dateRange.start);
    const endDate = formatApiDate(dateRange.end);

    try {
      const [overviewRes, dailyRes, groupRes, topRes] = await Promise.all([
        getStatsOverview(startDate, endDate),
        getDailyStats(startDate, endDate),
        getGroupStats(startDate, endDate),
        getTopChannels(startDate, endDate, 10, 'views'),
      ]);

      if (overviewRes.data) setOverview(overviewRes.data);
      if (dailyRes.data) setDailyData(dailyRes.data);
      if (groupRes.data) setGroupStats(groupRes.data);
      if (topRes.data) setTopChannels(topRes.data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const handleDateChange = (start: Date, end: Date) => {
    setDateRange({ start, end });
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">통계</h2>
          <p className="text-zinc-500 mt-1">전체 채널의 성과를 한눈에 확인하세요</p>
        </div>
      </div>

      {/* 기간 필터 */}
      <DateFilter
        startDate={dateRange.start}
        endDate={dateRange.end}
        onChange={handleDateChange}
      />

      {/* 전체 요약 카드 */}
      <SummaryCards data={overview} isLoading={isLoading} />

      {/* 추이 그래프 */}
      <TrendChart data={dailyData} isLoading={isLoading} />

      {/* 그룹별 성과 & TOP 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupStatsTable data={groupStats} isLoading={isLoading} />
        <TopChannelsTable data={topChannels} isLoading={isLoading} />
      </div>
    </div>
  );
}
