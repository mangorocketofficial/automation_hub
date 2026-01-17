'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { CategorySelector } from '@/components/analysis/shared';
import { ReviewQueue, ContentDetailModal } from '@/components/analysis/review';
import {
  getReviewQueue,
  getContentDetail,
  getRejectionReasons,
  approveContent,
  rejectContent,
  editContent,
} from '@/lib/analysisApi';
import type {
  Category,
  ReviewQueueItem,
  Content,
  RejectionReason,
  ContentStatus,
} from '@/types/analysis';

const STATUS_FILTERS: { value: ContentStatus | ''; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'draft', label: '초안' },
  { value: 'ready_for_review', label: '리뷰 대기' },
  { value: 'approved', label: '승인됨' },
  { value: 'rejected', label: '거절됨' },
];

export default function ReviewPage() {
  const [category, setCategory] = useState<Category>('psychology');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([]);

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getReviewQueue({
        category,
        status: statusFilter || undefined,
        limit: 50,
      });
      if (res.data) setItems(res.data);
    } catch (error) {
      console.error('리뷰 큐 로드 실패:', error);
    }
    setIsLoading(false);
  }, [category, statusFilter]);

  const loadRejectionReasons = useCallback(async () => {
    try {
      const res = await getRejectionReasons();
      if (res.data) setRejectionReasons(res.data);
    } catch (error) {
      console.error('거절 사유 로드 실패:', error);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    // 10초마다 자동 새로고침
    const interval = setInterval(loadQueue, 10000);
    return () => clearInterval(interval);
  }, [loadQueue]);

  useEffect(() => {
    loadRejectionReasons();
  }, [loadRejectionReasons]);

  const handleSelectItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((item) => item.id));
    }
  };

  const handleItemClick = async (id: number) => {
    setIsModalOpen(true);
    setIsModalLoading(true);
    try {
      const res = await getContentDetail(id);
      if (res.data) setSelectedContent(res.data);
    } catch (error) {
      console.error('콘텐츠 상세 로드 실패:', error);
    }
    setIsModalLoading(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  const handleApprove = async () => {
    if (!selectedContent) return;
    await approveContent(selectedContent.id);
    await loadQueue();
  };

  const handleReject = async (reason: string, notes?: string) => {
    if (!selectedContent) return;
    await rejectContent(selectedContent.id, reason, notes);
    await loadQueue();
  };

  const handleEdit = async (fields: Partial<Content>) => {
    if (!selectedContent) return;
    await editContent(selectedContent.id, fields);
    // Reload content detail
    const res = await getContentDetail(selectedContent.id);
    if (res.data) setSelectedContent(res.data);
    await loadQueue();
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => approveContent(id)));
      setSelectedIds([]);
      await loadQueue();
    } catch (error) {
      console.error('일괄 승인 실패:', error);
    }
    setIsLoading(false);
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    // For bulk reject, use a default reason
    const reason = 'bulk_reject';
    setIsLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => rejectContent(id, reason)));
      setSelectedIds([]);
      await loadQueue();
    } catch (error) {
      console.error('일괄 거절 실패:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-2 text-zinc-400">
        <Link href="/analysis" className="hover:text-zinc-200 transition-colors">
          ← 분석
        </Link>
        <span>/</span>
        <span className="text-zinc-100">콘텐츠 리뷰</span>
      </div>

      {/* 필터 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">상태:</span>
          <div className="flex gap-1">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <CategorySelector selected={category} onChange={setCategory} />
      </div>

      {/* 리뷰 큐 */}
      <ReviewQueue
        items={items}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectItem={handleSelectItem}
        onSelectAll={handleSelectAll}
        onItemClick={handleItemClick}
      />

      {/* 선택된 항목 액션 */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl px-6 py-4 flex items-center gap-4">
          <span className="text-sm text-zinc-300">선택된 항목: {selectedIds.length}개</span>
          <Button variant="primary" size="sm" onClick={handleBulkApprove}>
            일괄 승인
          </Button>
          <Button variant="danger" size="sm" onClick={handleBulkReject}>
            일괄 거절
          </Button>
        </div>
      )}

      {/* 콘텐츠 상세 모달 */}
      <ContentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        content={selectedContent}
        rejectionReasons={rejectionReasons}
        isLoading={isModalLoading}
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={handleEdit}
      />
    </div>
  );
}
