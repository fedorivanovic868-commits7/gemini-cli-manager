'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { SessionsTab } from '@/components/sessions-tab';
import { TranslationsTab } from '@/components/translations-tab';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'sessions' | 'translations'>('sessions');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'sessions' && <SessionsTab />}
      {activeTab === 'translations' && <TranslationsTab />}
    </DashboardLayout>
  );
}
