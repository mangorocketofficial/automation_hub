'use client';

import { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  // 설정 저장 핸들러
  const handleSave = async () => {
    setIsSaving(true);
    // TODO: 설정 저장 API 호출
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">설정</h2>
        <p className="text-gray-500 mt-1">시스템 설정을 관리하세요</p>
      </div>

      {/* API 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>API 연결 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                VPS API URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="http://your-vps-ip:8000"
                defaultValue=""
              />
              <p className="mt-1 text-sm text-gray-500">
                FastAPI 서버가 실행 중인 VPS의 주소
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supabase URL
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
                placeholder="https://your-project.supabase.co"
                disabled
              />
              <p className="mt-1 text-sm text-gray-500">
                환경변수에서 설정됨 (변경 불가)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* OpenAI 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>OpenAI 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="sk-..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기본 모델
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 유튜브 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>YouTube API 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="YouTube API Key"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OAuth Client ID
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Client ID"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 알림 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">작업 실패 알림</p>
                <p className="text-sm text-gray-500">작업 실패 시 알림 받기</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">일일 요약 리포트</p>
                <p className="text-sm text-gray-500">매일 실행 결과 요약 받기</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving}>
          설정 저장
        </Button>
      </div>
    </div>
  );
}
