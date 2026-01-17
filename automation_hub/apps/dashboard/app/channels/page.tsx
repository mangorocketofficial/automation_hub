'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import GroupSection from '@/components/channels/GroupSection';
import GroupModal from '@/components/channels/GroupModal';
import ChannelModal from '@/components/channels/ChannelModal';
import DeleteConfirmModal from '@/components/channels/DeleteConfirmModal';
import type { Group, Channel } from '@/types';
import {
  getGroups,
  getChannels,
  createGroup,
  updateGroup,
  deleteGroup,
  createChannel,
  updateChannel,
  deleteChannel,
} from '@/lib/api';

export default function ChannelsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit states
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [preselectedGroupId, setPreselectedGroupId] = useState<string | null>(null);

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'group' | 'channel';
    item: Group | Channel;
  } | null>(null);

  // 데이터 로드
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [groupsRes, channelsRes] = await Promise.all([
        getGroups(),
        getChannels(),
      ]);

      if (groupsRes.data) setGroups(groupsRes.data);
      if (channelsRes.data) setChannels(channelsRes.data);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 그룹별 채널 필터링
  const getChannelsByGroup = (groupId: string) => {
    return channels.filter((c) => c.group_id === groupId);
  };

  // Group handlers
  const handleOpenGroupModal = (group?: Group) => {
    setEditingGroup(group || null);
    setIsGroupModalOpen(true);
  };

  const handleSaveGroup = async (data: Partial<Group>) => {
    if (editingGroup) {
      const result = await updateGroup(editingGroup.id, data);
      if (result.error) throw new Error(result.error);
    } else {
      const result = await createGroup(data);
      if (result.error) throw new Error(result.error);
    }
    await loadData();
  };

  const handleDeleteGroup = (group: Group) => {
    setDeleteTarget({ type: 'group', item: group });
    setIsDeleteModalOpen(true);
  };

  // Channel handlers
  const handleOpenChannelModal = (channel?: Channel, groupId?: string) => {
    setEditingChannel(channel || null);
    setPreselectedGroupId(groupId || null);
    setIsChannelModalOpen(true);
  };

  const handleSaveChannel = async (data: Partial<Channel>) => {
    if (editingChannel) {
      const result = await updateChannel(editingChannel.id, data);
      if (result.error) throw new Error(result.error);
    } else {
      const result = await createChannel(data);
      if (result.error) throw new Error(result.error);
    }
    await loadData();
  };

  const handleDeleteChannel = (channel: Channel) => {
    setDeleteTarget({ type: 'channel', item: channel });
    setIsDeleteModalOpen(true);
  };

  const handleToggleChannelActive = async (channel: Channel) => {
    const newStatus = channel.status === 'active' ? 'paused' : 'active';
    await updateChannel(channel.id, { status: newStatus });
    await loadData();
  };

  // Delete confirm handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'group') {
      const result = await deleteGroup(deleteTarget.item.id);
      if (result.error) throw new Error(result.error);
    } else {
      const result = await deleteChannel(deleteTarget.item.id);
      if (result.error) throw new Error(result.error);
    }
    await loadData();
  };

  // Close modal handlers
  const handleCloseGroupModal = () => {
    setIsGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleCloseChannelModal = () => {
    setIsChannelModalOpen(false);
    setEditingChannel(null);
    setPreselectedGroupId(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // Get groups with preselected group first for channel modal
  const getSortedGroups = () => {
    if (!preselectedGroupId) return groups;
    return [
      ...groups.filter((g) => g.id === preselectedGroupId),
      ...groups.filter((g) => g.id !== preselectedGroupId),
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">채널관리</h2>
          <p className="text-zinc-500 mt-1">
            그룹 {groups.length}개 · 채널 {channels.length}개
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => handleOpenGroupModal()}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            그룹 추가
          </Button>
          <Button onClick={() => handleOpenChannelModal()}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            채널 추가
          </Button>
        </div>
      </div>

      {/* 그룹별 채널 목록 */}
      {groups.length === 0 ? (
        <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-zinc-700 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-100 mb-2">
            등록된 그룹이 없습니다
          </h3>
          <p className="text-zinc-500 mb-6">
            그룹을 만들어 채널을 관리하세요
          </p>
          <Button onClick={() => handleOpenGroupModal()}>
            첫 번째 그룹 만들기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <GroupSection
              key={group.id}
              group={group}
              channels={getChannelsByGroup(group.id)}
              onEditGroup={() => handleOpenGroupModal(group)}
              onDeleteGroup={() => handleDeleteGroup(group)}
              onAddChannel={() => handleOpenChannelModal(undefined, group.id)}
              onEditChannel={(channel) => handleOpenChannelModal(channel)}
              onDeleteChannel={handleDeleteChannel}
              onToggleChannelActive={handleToggleChannelActive}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={handleCloseGroupModal}
        group={editingGroup}
        onSave={handleSaveGroup}
      />

      <ChannelModal
        isOpen={isChannelModalOpen}
        onClose={handleCloseChannelModal}
        channel={editingChannel}
        groups={getSortedGroups()}
        onSave={handleSaveChannel}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        title={deleteTarget?.type === 'group' ? '그룹 삭제' : '채널 삭제'}
        message={
          deleteTarget?.type === 'group'
            ? '이 그룹과 모든 하위 채널이 삭제됩니다.'
            : '이 채널을 삭제하시겠습니까?'
        }
        itemName={deleteTarget?.item.name || ''}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
