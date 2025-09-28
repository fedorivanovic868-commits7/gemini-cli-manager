'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { LogOut, Server, BookOpen } from 'lucide-react';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  activeTab: 'sessions' | 'translations';
  onTabChange: (tab: 'sessions' | 'translations') => void;
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Вы успешно вышли из системы');
        router.push('/login');
        router.refresh();
      } else {
        toast.error('Ошибка при выходе из системы');
      }
    } catch (error) {
      toast.error('Произошла ошибка при выходе');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">Gemini CLI Manager</h1>
                <p className="text-sm text-muted-foreground">
                  Панель управления сессиями и переводами
                </p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-foreground">GCM</h1>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="shrink-0"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{isLoggingOut ? 'Выход...' : 'Выйти'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as 'sessions' | 'translations')}>
          <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md mx-auto">
            <TabsTrigger value="sessions" className="flex items-center gap-2 text-sm">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">Сессии</span>
              <span className="sm:hidden">Сесс.</span>
            </TabsTrigger>
            <TabsTrigger value="translations" className="flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Переводы</span>
              <span className="sm:hidden">Перев.</span>
            </TabsTrigger>
          </TabsList>
          {children}
        </Tabs>
      </main>
    </div>
  );
}