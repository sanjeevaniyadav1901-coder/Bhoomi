import { useState, useEffect } from 'react';
import { IndexPage } from './components/IndexPage';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { Sidebar, SidebarPage } from './components/Sidebar';
import { AboutUsPage } from './components/AboutUsPage';
import { ProfileSetupPage } from './components/ProfileSetupPage';
import { FarmerProfilePage } from './components/FarmerProfilePage';
import { CropHealthPage } from './components/CropHealthPage';
import { SoilDataEntryPage } from './components/SoilDataEntryPage';
import { FertilizerAdvisoryPage } from './components/FertilizerAdvisoryPage';
import { AlertsPage } from './components/AlertsPage';
import { AddCropPage } from './components/AddCropPage';
import { HistoryReportsPage } from './components/HistoryReportsPage';
import { getFarmerProfile, getUserFarms } from './services/storageService';

type AppState = 'index' | 'login' | 'profile-setup' | 'main';

export default function App() {
  const [appState, setAppState] = useState<AppState>('index');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [currentPage, setCurrentPage] = useState<SidebarPage>('dashboard');
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  // Check if user has a profile when they log in
  useEffect(() => {
    if (userEmail && appState === 'main') {
      const profile = getFarmerProfile(userEmail);
      const farms = getUserFarms(userEmail);
      
      if (!profile) {
        // No profile exists, show setup page
        setAppState('profile-setup');
      } else if (farms.length > 0 && !selectedFarmId) {
        // Auto-select first farm
        setSelectedFarmId(farms[0].id);
      }
    }
  }, [userEmail, appState]);

  const handleGetStarted = () => {
    setAppState('login');
  };

  const handleBackToHome = () => {
    setAppState('index');
  };

  const handleLogin = (email: string, name: string) => {
    setUserEmail(email);
    setUserName(name);
    setAppState('main');
  };

  const handleProfileComplete = () => {
    setAppState('main');
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    // Clear user session from localStorage
    localStorage.removeItem('bhoomi_current_user');
    setUserEmail('');
    setUserName('');
    setSelectedFarmId(null);
    setCurrentPage('dashboard');
    setAppState('index');
  };

  const handleNavigate = (page: SidebarPage) => {
    setCurrentPage(page);
  };

  if (appState === 'index') {
    return <IndexPage onGetStarted={handleGetStarted} />;
  }

  if (appState === 'login') {
    return <LoginPage onLogin={handleLogin} onBackToHome={handleBackToHome} />;
  }

  if (appState === 'profile-setup') {
    return (
      <ProfileSetupPage
        userEmail={userEmail}
        userName={userName}
        onProfileComplete={handleProfileComplete}
      />
    );
  }

  // Show sidebar for main app pages
  return (
    <div className="flex">
      <Sidebar 
        userName={userName}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <div className="flex-1 lg:ml-64">
        {currentPage === 'dashboard' && (
          <Dashboard 
            userEmail={userEmail} 
            onLogout={handleLogout}
            onFarmSelect={setSelectedFarmId}
          />
        )}
        {currentPage === 'crop-health' && (
          <CropHealthPage userEmail={userEmail} selectedFarmId={selectedFarmId} />
        )}
        {currentPage === 'soil-data' && (
          <SoilDataEntryPage userEmail={userEmail} selectedFarmId={selectedFarmId} />
        )}
        {currentPage === 'fertilizer' && (
          <FertilizerAdvisoryPage userEmail={userEmail} selectedFarmId={selectedFarmId} />
        )}
        {currentPage === 'alerts' && (
          <AlertsPage userEmail={userEmail} selectedFarmId={selectedFarmId} />
        )}
        {currentPage === 'add-crop' && (
          <AddCropPage userEmail={userEmail} selectedFarmId={selectedFarmId} />
        )}
        {currentPage === 'history' && (
          <HistoryReportsPage userEmail={userEmail} selectedFarmId={selectedFarmId} />
        )}
        {currentPage === 'profile' && (
          <FarmerProfilePage userEmail={userEmail} userName={userName} />
        )}
        {currentPage === 'about' && <AboutUsPage />}
      </div>
    </div>
  );
}