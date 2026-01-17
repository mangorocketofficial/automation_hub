'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { runAll, stopAll } from '@/lib/api';

export default function Header() {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunAll = async () => {
    setIsRunning(true);
    const { error } = await runAll();
    if (error) {
      console.error('전체 실행 실패:', error);
    }
    setIsRunning(false);
  };

  const handleStopAll = async () => {
    const { error } = await stopAll();
    if (error) {
      console.error('전체 중지 실패:', error);
    }
  };

  return (
    <header className="bg-zinc-800 border-b border-zinc-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 로고 및 타이틀 */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-zinc-100">Automation Hub</h1>
        </Link>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-3">
          <Button variant="danger" size="sm" onClick={handleStopAll}>
            전체 중지
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleRunAll}
            isLoading={isRunning}
          >
            전체 실행
          </Button>
          <Link href="/settings">
            <button className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
