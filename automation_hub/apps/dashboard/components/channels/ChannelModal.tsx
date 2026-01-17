'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { Channel, Group } from '@/types';

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel?: Channel | null;
  groups: Group[];
  onSave: (data: Partial<Channel>) => Promise<void>;
}

export default function ChannelModal({ isOpen, onClose, channel, groups, onSave }: ChannelModalProps) {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [configJson, setConfigJson] = useState('{}');
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [jsonError, setJsonError] = useState('');

  const isEdit = !!channel;

  useEffect(() => {
    if (channel) {
      setName(channel.name);
      setGroupId(channel.group_id);
      setConfigJson(JSON.stringify(channel.config || {}, null, 2));
      setStatus(channel.status === 'error' ? 'paused' : channel.status);
    } else {
      setName('');
      setGroupId(groups[0]?.id || '');
      setConfigJson('{}');
      setStatus('active');
    }
    setError('');
    setJsonError('');
  }, [channel, groups, isOpen]);

  const validateJson = (value: string): boolean => {
    try {
      JSON.parse(value);
      setJsonError('');
      return true;
    } catch {
      setJsonError('올바른 JSON 형식이 아닙니다');
      return false;
    }
  };

  const handleConfigChange = (value: string) => {
    setConfigJson(value);
    validateJson(value);
  };

  const selectedGroup = groups.find(g => g.id === groupId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('채널명을 입력해주세요');
      return;
    }

    if (!groupId) {
      setError('그룹을 선택해주세요');
      return;
    }

    if (!validateJson(configJson)) {
      return;
    }

    setIsSaving(true);
    try {
      const data: Partial<Channel> = {
        name: name.trim(),
        config: JSON.parse(configJson),
      };

      if (isEdit) {
        // 수정 시에는 status만 추가
        data.status = status;
      } else {
        // 생성 시에는 group_id와 type 추가
        data.group_id = groupId;
        data.type = selectedGroup?.type;
      }

      await onSave(data);
      onClose();
    } catch (err) {
      setError('저장 중 오류가 발생했습니다');
    }
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '채널 편집' : '새 채널 만들기'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            그룹 <span className="text-red-400">*</span>
          </label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={isEdit}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.type})
              </option>
            ))}
          </select>
          {isEdit && (
            <p className="mt-1 text-xs text-zinc-500">그룹은 변경할 수 없습니다</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            채널명 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="예: 심리채널_1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            설정 (JSON)
          </label>
          <textarea
            value={configJson}
            onChange={(e) => handleConfigChange(e.target.value)}
            rows={6}
            className={`w-full px-3 py-2 bg-zinc-700 border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none font-mono text-sm ${
              jsonError ? 'border-red-500' : 'border-zinc-600'
            }`}
            placeholder="{}"
          />
          {jsonError && (
            <p className="mt-1 text-xs text-red-400">{jsonError}</p>
          )}
          <p className="mt-1 text-xs text-zinc-500">
            채널별 세부 설정 (키워드, 프롬프트 등)
          </p>
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              상태
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'paused')}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="active">활성</option>
              <option value="paused">일시정지</option>
            </select>
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
