import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Lazy load pages for better performance
const LearnPage = React.lazy(() => import('../pages/Learn/LearnPage'));
const ProfilePage = React.lazy(() => import('../pages/Profile/ProfilePage'));
const OfflinePage = React.lazy(() => import('../pages/Offline/OfflinePage'));

// Placeholder components for future pages
const StoriesPage = React.lazy(() => import('../pages/Stories/StoriesPage'));
const LeaderboardPage = React.lazy(() => import('../pages/Leaderboard/LeaderboardPage'));
const ShopPage = React.lazy(() => import('../pages/Shop/ShopPage'));
const SettingsPage = React.lazy(() => import('../pages/Settings/SettingsPage'));

const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullScreen text="加载中..." />}>
        <Routes>
          {/* 默认路由直接跳转到学习页面 */}
          <Route path="/" element={<Navigate to="/learn" replace />} />
          
          {/* 公开路由 - 无需认证 */}
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/learn/:courseId" element={<LearnPage />} />
          <Route path="/lesson/:lessonId" element={<LearnPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/offline" element={<OfflinePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* 404页面 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

// Simple 404 component
const NotFoundPage: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: 'calc(100vh - 70px)',
    textAlign: 'center',
    padding: '2rem'
  }}>
    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🦉</div>
    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
      页面未找到
    </h1>
    <p style={{ color: '#777', fontSize: '1.1rem', marginBottom: '2rem' }}>
      您访问的页面不存在。
    </p>
    <a 
      href="/learn" 
      style={{ 
        padding: '0.75rem 1.5rem',
        background: '#58cc02',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '0.5rem',
        fontWeight: 700
      }}
    >
      开始学习
    </a>
  </div>
);

export default AppRoutes;