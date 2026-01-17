'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getContentMedia } from '@/lib/analysisApi';
import {
  HOOK_TYPE_LABELS,
  CONTENT_STATUS_LABELS,
  type Content,
  type RejectionReason,
  type ContentMedia,
} from '@/types/analysis';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  rejectionReasons: RejectionReason[];
  isLoading: boolean;
  onApprove: () => Promise<void>;
  onReject: (reason: string, notes?: string) => Promise<void>;
  onEdit: (fields: Partial<Content>) => Promise<void>;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  }
  return bytes + ' bytes';
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;
}

export default function ContentDetailModal({
  isOpen,
  onClose,
  content,
  rejectionReasons,
  isLoading,
  onApprove,
  onReject,
  onEdit,
}: ContentDetailModalProps) {
  const [mode, setMode] = useState<'view' | 'reject' | 'edit'>('view');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedScript, setEditedScript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'audio' | 'image' | 'video'>('content');
  const [media, setMedia] = useState<ContentMedia | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  // Load media when content changes
  useEffect(() => {
    if (content?.id && isOpen) {
      setIsLoadingMedia(true);
      getContentMedia(content.id)
        .then((res) => {
          if (res.data) setMedia(res.data);
        })
        .catch(console.error)
        .finally(() => setIsLoadingMedia(false));
    } else {
      setMedia(null);
    }
  }, [content?.id, isOpen]);

  // Reset tab when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('content');
      setMode('view');
    }
  }, [isOpen]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    setIsSubmitting(true);
    try {
      await onReject(rejectReason, rejectNotes);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    setIsSubmitting(true);
    try {
      const fields: Partial<Content> = {};
      if (editedTitle && editedTitle !== content?.title) fields.title = editedTitle;
      if (editedScript && editedScript !== content?.script) fields.script = editedScript;
      if (Object.keys(fields).length > 0) {
        await onEdit(fields);
      }
      setMode('view');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = () => {
    setEditedTitle(content?.title || '');
    setEditedScript(content?.script || '');
    setMode('edit');
  };

  const handleOpenReject = () => {
    setRejectReason('');
    setRejectNotes('');
    setMode('reject');
  };

  if (!content && !isLoading) return null;

  const hasMedia = media?.audio || media?.image || media?.video;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="text-zinc-900">
        <h2 className="text-xl font-bold mb-4">콘텐츠 상세</h2>

        {/* 탭 버튼 */}
        {content && (
          <div className="flex gap-1 border-b border-zinc-200 mb-4">
            <button
              onClick={() => setActiveTab('content')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                activeTab === 'content'
                  ? 'bg-zinc-100 text-zinc-900 border-b-2 border-emerald-500'
                  : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              📝 콘텐츠
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                activeTab === 'audio'
                  ? 'bg-zinc-100 text-zinc-900 border-b-2 border-emerald-500'
                  : 'text-zinc-500 hover:text-zinc-700',
                !media?.audio && 'opacity-50'
              )}
            >
              🔊 오디오 {media?.audio ? '✓' : ''}
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                activeTab === 'image'
                  ? 'bg-zinc-100 text-zinc-900 border-b-2 border-emerald-500'
                  : 'text-zinc-500 hover:text-zinc-700',
                !media?.image && 'opacity-50'
              )}
            >
              🖼️ 이미지 {media?.image ? '✓' : ''}
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                activeTab === 'video'
                  ? 'bg-zinc-100 text-zinc-900 border-b-2 border-emerald-500'
                  : 'text-zinc-500 hover:text-zinc-700',
                !media?.video && 'opacity-50'
              )}
            >
              🎬 비디오 {media?.video ? '✓' : ''}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-zinc-200 rounded" />
            <div className="h-20 bg-zinc-200 rounded" />
            <div className="h-32 bg-zinc-200 rounded" />
          </div>
        ) : content ? (
          <>
            {/* 콘텐츠 탭 */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">제목</label>
                  {mode === 'edit' ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="p-3 bg-zinc-100 rounded-lg text-zinc-800">{content.title}</div>
                  )}
                </div>

                {/* 훅 */}
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">훅 (첫 3초)</label>
                  <div className="p-3 bg-zinc-100 rounded-lg">
                    <div className="text-xs text-zinc-500 mb-1">
                      Type: {HOOK_TYPE_LABELS[content.hook_type]}
                    </div>
                    <div className="text-zinc-800">"{content.hook_text}"</div>
                  </div>
                </div>

                {/* 구조 */}
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">구조</label>
                  <div className="p-3 bg-zinc-100 rounded-lg">
                    <div className="text-zinc-800">
                      Template: {content.structure_template}
                    </div>
                    <div className="text-sm text-zinc-500 mt-1">
                      Score: {content.generation_score?.toFixed(1) || 'N/A'} |
                      상태: {CONTENT_STATUS_LABELS[content.status]}
                    </div>
                  </div>
                </div>

                {/* 스크립트 */}
                <div>
                  <label className="block text-sm font-medium text-zinc-600 mb-1">스크립트</label>
                  {mode === 'edit' ? (
                    <textarea
                      value={editedScript}
                      onChange={(e) => setEditedScript(e.target.value)}
                      rows={6}
                      className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  ) : (
                    <div className="p-3 bg-zinc-100 rounded-lg text-zinc-800 max-h-48 overflow-y-auto whitespace-pre-wrap text-sm">
                      {content.script}
                    </div>
                  )}
                </div>

                {/* 거절 사유 (거절 모드) */}
                {mode === 'reject' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-1">거절 사유</label>
                      <select
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">사유 선택...</option>
                        {rejectionReasons.map((reason) => (
                          <option key={reason.code} value={reason.code}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-600 mb-1">메모</label>
                      <textarea
                        value={rejectNotes}
                        onChange={(e) => setRejectNotes(e.target.value)}
                        rows={2}
                        placeholder="추가 메모 (선택사항)"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 오디오 탭 */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                {isLoadingMedia ? (
                  <div className="h-32 bg-zinc-100 rounded-lg animate-pulse" />
                ) : media?.audio ? (
                  <>
                    <div className="p-4 bg-zinc-100 rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">
                          🔊
                        </div>
                        <div>
                          <div className="text-lg font-medium text-zinc-800">TTS 오디오</div>
                          <div className="text-sm text-zinc-500">
                            Voice: {media.audio.voice_id} ({media.audio.tts_model})
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-500">길이:</span>{' '}
                          <span className="text-zinc-800">{formatDuration(media.audio.duration_seconds)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">속도:</span>{' '}
                          <span className="text-zinc-800">{media.audio.speed_rate}x</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">파일 크기:</span>{' '}
                          <span className="text-zinc-800">{formatFileSize(media.audio.file_size_bytes)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">생성 일시:</span>{' '}
                          <span className="text-zinc-800">{new Date(media.audio.created_at).toLocaleString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                    {media.audio.voice_selection_reason && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="text-sm font-medium text-blue-700 mb-1">음성 선택 이유</div>
                        <div className="text-sm text-blue-600">{media.audio.voice_selection_reason}</div>
                      </div>
                    )}
                    <div className="p-3 bg-zinc-100 rounded-lg">
                      <div className="text-sm text-zinc-500 mb-1">파일 경로</div>
                      <code className="text-xs text-zinc-700 break-all">{media.audio.file_path}</code>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    오디오가 생성되지 않았습니다
                  </div>
                )}
              </div>
            )}

            {/* 이미지 탭 */}
            {activeTab === 'image' && (
              <div className="space-y-4">
                {isLoadingMedia ? (
                  <div className="h-64 bg-zinc-100 rounded-lg animate-pulse" />
                ) : media?.image ? (
                  <>
                    <div className="p-4 bg-zinc-100 rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                          🖼️
                        </div>
                        <div>
                          <div className="text-lg font-medium text-zinc-800">배경 이미지</div>
                          <div className="text-sm text-zinc-500">
                            생성 시간: {media.image.generation_time_seconds.toFixed(1)}초
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-500">파일 크기:</span>{' '}
                          <span className="text-zinc-800">{formatFileSize(media.image.file_size_bytes)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">생성 일시:</span>{' '}
                          <span className="text-zinc-800">{new Date(media.image.created_at).toLocaleString('ko-KR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-sm font-medium text-purple-700 mb-1">이미지 프롬프트</div>
                      <div className="text-sm text-purple-600">{media.image.prompt}</div>
                    </div>
                    {media.image.style_tags && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(media.image.style_tags).map(([key, value]) => (
                          <span key={key} className="px-2 py-1 bg-zinc-200 rounded text-xs text-zinc-700">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="p-3 bg-zinc-100 rounded-lg">
                      <div className="text-sm text-zinc-500 mb-1">파일 경로</div>
                      <code className="text-xs text-zinc-700 break-all">{media.image.file_path}</code>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    이미지가 생성되지 않았습니다
                  </div>
                )}
              </div>
            )}

            {/* 비디오 탭 */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                {isLoadingMedia ? (
                  <div className="h-64 bg-zinc-100 rounded-lg animate-pulse" />
                ) : media?.video ? (
                  <>
                    <div className="p-4 bg-zinc-100 rounded-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center text-2xl">
                          🎬
                        </div>
                        <div>
                          <div className="text-lg font-medium text-zinc-800">렌더링된 비디오</div>
                          <div className="text-sm text-zinc-500">
                            렌더링 시간: {media.video.render_time_seconds.toFixed(1)}초
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-500">길이:</span>{' '}
                          <span className="text-zinc-800">{formatDuration(media.video.duration_seconds)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">파일 크기:</span>{' '}
                          <span className="text-zinc-800">{formatFileSize(media.video.file_size_bytes)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">폰트:</span>{' '}
                          <span className="text-zinc-800">{media.video.font_style}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">자막 위치:</span>{' '}
                          <span className="text-zinc-800">{media.video.subtitle_position}</span>
                        </div>
                      </div>
                    </div>
                    {media.video.bgm_id && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm font-medium text-yellow-700 mb-1">배경 음악</div>
                        <div className="text-sm text-yellow-600">BGM ID: {media.video.bgm_id}</div>
                      </div>
                    )}
                    <div className="p-3 bg-zinc-100 rounded-lg">
                      <div className="text-sm text-zinc-500 mb-1">파일 경로</div>
                      <code className="text-xs text-zinc-700 break-all">{media.video.file_path}</code>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    비디오가 렌더링되지 않았습니다
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-zinc-200">
          {mode === 'view' && (
            <>
              <Button variant="danger" onClick={handleOpenReject} disabled={isSubmitting}>
                거절
              </Button>
              <Button variant="secondary" onClick={handleOpenEdit} disabled={isSubmitting}>
                수정
              </Button>
              <Button variant="primary" onClick={handleApprove} isLoading={isSubmitting}>
                승인
              </Button>
            </>
          )}
          {mode === 'reject' && (
            <>
              <Button variant="secondary" onClick={() => setMode('view')} disabled={isSubmitting}>
                취소
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                isLoading={isSubmitting}
                disabled={!rejectReason}
              >
                거절 확인
              </Button>
            </>
          )}
          {mode === 'edit' && (
            <>
              <Button variant="secondary" onClick={() => setMode('view')} disabled={isSubmitting}>
                취소
              </Button>
              <Button variant="primary" onClick={handleEdit} isLoading={isSubmitting}>
                저장
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
