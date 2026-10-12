import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import AuthPage from './components/auth/AuthPage.jsx';
import Navbar from './components/common/Navbar.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import SettingsModal from './components/common/SettingsModal.jsx';
import AccountModal from './components/common/AccountModal.jsx';
import OnboardingTour from './components/common/OnboardingTour.jsx';

import ContentGenerator from './components/generator/ContentGenerator.jsx';
import CampaignManager from './components/campaigns/CampaignManager.jsx';
import CustomerSegmentation from './components/segmentation/CustomerSegmentation.jsx';
import MarketingAutomations from './components/automations/MarketingAutomations.jsx';
import CampaignOptimizer from './components/optimizer/CampaignOptimizer.jsx';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard.jsx';

import { apiGetCampaigns, apiGetSegments, apiGetAutomations } from './services/api.js';

function MainApp() {
  const { isAuthenticated, user } = useAuth();

  const [activeTab, setActiveTab] = useState('generator');
  const [targetSegmentPreset, setTargetSegmentPreset] = useState('');
  const [counts, setCounts] = useState({ campaigns: 0, customers: 0, automations: 0 });

  // UI state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Auto-launch tour on first load if enabled
  useEffect(() => {
    if (isAuthenticated && user?.settings?.showTourOnStartup !== false) {
      // Check if user has already seen it in this local session
      const seen = sessionStorage.getItem(`dmaut_tour_seen_${user?.id}`);
      if (!seen) {
        setIsTourOpen(true);
        sessionStorage.setItem(`dmaut_tour_seen_${user?.id}`, 'true');
      }
    }
  }, [isAuthenticated, user]);

  // Adjust active tab if user is Personal and a business module was active
  useEffect(() => {
    if (user?.accountType === 'personal') {
      if (activeTab === 'segmentation' || activeTab === 'automations' || activeTab === 'optimizer') {
        setActiveTab('generator');
      }
    }
  }, [user?.accountType, activeTab]);

  // Load badge counts for current authenticated user session
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadCounts() {
      try {
        const [cRes, sRes, aRes] = await Promise.allSettled([
          apiGetCampaigns(),
          apiGetSegments(),
          apiGetAutomations()
        ]);

        setCounts({
          campaigns: cRes.status === 'fulfilled' ? cRes.value.campaigns?.length || 0 : 0,
          customers: sRes.status === 'fulfilled' ? sRes.value.summary?.total || 0 : 0,
          automations: aRes.status === 'fulfilled' ? aRes.value.automations?.length || 0 : 0
        });
      } catch (err) {
        console.warn('Could not load user badge counts:', err);
      }
    }
    loadCounts();
  }, [isAuthenticated, activeTab]);

  // If user is not authenticated, show the Auth Wall (Login / Register)
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleTargetInCampaign = (segmentName) => {
    setTargetSegmentPreset(segmentName);
    setActiveTab('campaigns');
  };

  const handleNavigateToCampaigns = () => {
    setTargetSegmentPreset('');
    setActiveTab('campaigns');
  };

  const handleNavigateToFeature = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className="app-container">
      {/* Collapsible Sidebar with Personal vs Business filtering and bottom Settings/Account */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setTargetSegmentPreset('');
          setActiveTab(tab);
        }}
        counts={counts}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLaunchTour={() => setIsTourOpen(true)}
        />

        <main style={{ flex: 1 }}>
          {activeTab === 'generator' && (
            <ContentGenerator onNavigateToCampaigns={handleNavigateToCampaigns} />
          )}

          {activeTab === 'campaigns' && (
            <CampaignManager targetSegmentPreset={targetSegmentPreset} />
          )}

          {activeTab === 'segmentation' && (
            <CustomerSegmentation onTargetInCampaign={handleTargetInCampaign} />
          )}

          {activeTab === 'automations' && (
            <MarketingAutomations />
          )}

          {activeTab === 'optimizer' && (
            <CampaignOptimizer onNavigateToCampaigns={handleNavigateToCampaigns} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard onNavigateToFeature={handleNavigateToFeature} />
          )}
        </main>
      </div>

      {/* Settings Modal (Theme, AI Keys, Preferences) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLaunchTour={() => setIsTourOpen(true)}
      />

      {/* Account Modal (Edit Username, Email, Password, Tier, Delete) */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
      />

      {/* Onboarding Tour Walkthrough */}
      <OnboardingTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
