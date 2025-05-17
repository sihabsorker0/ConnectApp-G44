import { ReactNode, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useLocationService } from '@/lib/locationService';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  useLocationService();

  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} />

        <main className="flex-1 pt-16 overflow-y-auto min-h-screen">
          <div 
            className={`transition-all duration-300 ease-in-out ${
              isSidebarOpen ? 'md:ml-64' : 'ml-0'
            }`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}