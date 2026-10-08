import React from 'react';
import { AppLauncherGrid } from '../components/dashboard/AppLauncherGrid';
import { StatusBar } from '../components/dashboard/StatusBar';

export const DashboardPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-between overflow-hidden relative bg-gradient-to-b from-[#0f172a] via-[#111e38] to-[#1e3a5f]">
      {/* Background ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />

      {/* Main App Grid Centered */}
      <main className="flex-1 flex items-center justify-center relative z-10">
        <AppLauncherGrid />
      </main>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
};
