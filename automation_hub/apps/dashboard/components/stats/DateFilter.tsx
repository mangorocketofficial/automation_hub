'use client';

import { useState } from 'react';
import { subDays, format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DateFilterProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
}

type PresetKey = 'today' | 'week' | 'month' | 'custom';

const presets: { key: PresetKey; label: string; getDates: () => { start: Date; end: Date } }[] = [
  {
    key: 'today',
    label: '오늘',
    getDates: () => ({ start: new Date(), end: new Date() }),
  },
  {
    key: 'week',
    label: '이번주',
    getDates: () => ({ start: subDays(new Date(), 7), end: new Date() }),
  },
  {
    key: 'month',
    label: '이번달',
    getDates: () => ({ start: subDays(new Date(), 30), end: new Date() }),
  },
];

export default function DateFilter({ startDate, endDate, onChange }: DateFilterProps) {
  const [activePreset, setActivePreset] = useState<PresetKey>('week');
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(format(startDate, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(endDate, 'yyyy-MM-dd'));

  const handlePresetClick = (preset: typeof presets[0]) => {
    setActivePreset(preset.key);
    setShowCustom(false);
    const { start, end } = preset.getDates();
    onChange(start, end);
  };

  const handleCustomClick = () => {
    setActivePreset('custom');
    setShowCustom(!showCustom);
  };

  const handleCustomApply = () => {
    onChange(new Date(customStart), new Date(customEnd));
    setShowCustom(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-400">기간:</span>
        {presets.map((preset) => (
          <button
            key={preset.key}
            onClick={() => handlePresetClick(preset)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activePreset === preset.key
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
            }`}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={handleCustomClick}
          className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            activePreset === 'custom'
              ? 'bg-emerald-600 text-white'
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          커스텀
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* 커스텀 날짜 선택 팝업 */}
      {showCustom && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-50">
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">시작일</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-zinc-500 mt-5">~</span>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">종료일</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleCustomApply}
              className="mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
            >
              적용
            </button>
          </div>
        </div>
      )}

      {/* 현재 선택된 기간 표시 */}
      <div className="mt-2 text-sm text-zinc-500">
        {format(startDate, 'yyyy년 M월 d일', { locale: ko })} ~ {format(endDate, 'yyyy년 M월 d일', { locale: ko })}
      </div>
    </div>
  );
}
