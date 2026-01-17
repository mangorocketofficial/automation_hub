import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Automation Hub - 자동화 중앙 통제 센터',
  description: '블로그와 유튜브 채널을 중앙에서 관리하는 자동화 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-zinc-900">
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
