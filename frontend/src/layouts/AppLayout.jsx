import { Outlet } from 'react-router-dom';
import BottomNav from '../components/layout/BottomNav';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] relative">
      <main className="pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}