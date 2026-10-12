import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import Navbar from './components/common/Navbar.jsx';
import Sidebar from './components/common/Sidebar.jsx';
import AuthModal from './components/common/AuthModal.jsx';

import ContentGenerator from './components/generator/ContentGenerator.jsx';
import CampaignManager from './components/campaigns/CampaignManager.jsx';
import CustomerSegmentation from './components/segmentation/CustomerSegmentation.jsx';
import MarketingAutomations from './components/automations/MarketingAutomations.jsx';
import CampaignOptimizer from './components/optimizer/CampaignOptimizer.jsx';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard.jsx';

import { apiGetCampaigns, apiGetSegments, apiGetAutomations } from './services/api.js';

function DashboardApp() {
  const [activeTab, setActiveTab] = useState('generator');
  const [targetSegmentPreset, setTargetSegmentPreset] = useState('');
  const [counts, setCounts] = useState({ campaigns: 5, customers: 20, automations: 4 });

  useEffect(() => {
    async function loadCounts() {
      try {
        const [cRes, sRes, aRes] = await Promise.allSettled([
          apiGetCampaigns(),
          apiGetSegments(),
          apiGetAutomations()
        ]);

        setCounts({
          campaigns: cRes.status === 'fulfilled' ? cRes.value.campaigns?.length || 5 : 5,
          customers: sRes.status === 'fulfilled' ? sRes.value.summary?.total || 20 : 20,
          automations: aRes.status === 'fulfilled' ? aRes.value.automations?.length || 4 : 4
        });
      } catch (err) {
        console.warn('Could not load live badge counts:', err);
      }
    }
    loadCounts();
  }, [activeTab]);

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
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setTargetSegmentPreset('');
          setActiveTab(tab);
        }}
        counts={counts}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar />

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

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <DashboardApp />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
