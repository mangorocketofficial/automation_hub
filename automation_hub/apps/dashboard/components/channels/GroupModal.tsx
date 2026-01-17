'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Group } from '@/types';
import { cronToKorean } from '@/lib/utils';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: Group | null;
  onSave: (data: Partial<Group>) => Promise<void>;
}

const CRON_PRESETS = [
  { label: '매일 9시', value: '0 9 * * *' },
  { label: '매일 12시', value: '0 12 * * *' },
  { label: '6시간마다', value: '0 */6 * * *' },
  { label: '매시간', value: '0 * * * *' },
];

export default function GroupModal({ isOpen, onClose, group, onSave }: GroupModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'youtube_shorts' | 'naver_blog' | 'nextjs_blog'>('youtube_shorts');
  const [description, setDescription] = useState('');
  const [scheduleCron, setScheduleCron] = useState('0 9 * * *');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!group;

  useEffect(() => {
    if (group) {
      setName(group.name);
      setType(group.type);
      setDescription(group.description || '');
      setScheduleCron(group.schedule_cron);
      setIsActive(group.is_active);
    } else {
      setName('');
      setType('youtube_shorts');
      setDescription('');
      setScheduleCron('0 9 * * *');
      setIsActive(true);
    }
    setError('');
  }, [group, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('그룹명을 입력해주세요');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        schedule_cron: scheduleCron,
        is_active: isActive,
      });
      onClose();
    } catch (err) {
      setError('저장 중 오류가 발생했습니다');
    }
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '그룹 편집' : '새 그룹 만들기'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            그룹명 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="예: 심리쇼츠"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            타입 <span className="text-red-400">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            disabled={isEdit}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
          >
            <option value="youtube_shorts">YouTube Shorts</option>
            <option value="naver_blog">네이버 블로그</option>
            <option value="nextjs_blog">Next.js 블로그</option>
          </select>
          {isEdit && (
            <p className="mt-1 text-xs text-zinc-500">타입은 변경할 수 없습니다</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            placeholder="그룹에 대한 설명을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            스케줄 (Cron) <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={scheduleCron}
            onChange={(e) => setScheduleCron(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
            placeholder="0 9 * * *"
          />
          <p className="mt-1 text-sm text-emerald-400">{cronToKorean(scheduleCron)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CRON_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setScheduleCron(preset.value)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  scheduleCron === preset.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {isEdit && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isActive" className="text-sm text-zinc-300">
              그룹 활성화
            </label>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {isEdit ? '저장' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
