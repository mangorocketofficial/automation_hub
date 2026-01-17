'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  itemName: string;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  title,
  message,
  itemName,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setError('');
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError('삭제 중 오류가 발생했습니다');
    }
    setIsDeleting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="text-zinc-300">
          <p>{message}</p>
          <p className="mt-2 p-3 bg-zinc-700 rounded-lg font-medium text-zinc-100">
            {itemName}
          </p>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-400 text-sm">
            ⚠️ 이 작업은 되돌릴 수 없습니다
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            isLoading={isDeleting}
          >
            삭제
          </Button>
        </div>
      </div>
    </Modal>
  );
}
