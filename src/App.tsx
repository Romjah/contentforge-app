import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import TourProvider from './components/onboarding/TourProvider';

// Declare the electronAPI interface
declare global {
  interface Window {
    electronAPI?: {
      getStoreValue: (key: string) => Promise<any>;
      setStoreValue: (key: string, value: any) => Promise<void>;
      onFirstRun: (callback: (firstRun: boolean) => void) => () => void;
      getUserSubscription: () => Promise<{ level: string }>;
      getAppPath: () => Promise<string>;
      runCliCommand: (command: string, args: string[]) => Promise<{ success: boolean; data?: string; error?: string }>;
    };
  }
}

const App = () => {
  const [isFirstRun, setIsFirstRun] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Helper function to check if we're in Electron
  const isElectronAvailable = (): boolean => {
    return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined';
  };

  useEffect(() => {
    // Verify if this is the first app execution
    const checkFirstRun = async () => {
      try {
        // Check if electronAPI is available (browser vs electron environment)
        if (!isElectronAvailable()) {
          console.log('Running in browser mode - electronAPI not available');
          setIsLoading(false);
          return;
        }
        
        const firstRun = await window.electronAPI?.getStoreValue('firstRun');
        setIsFirstRun(firstRun);

        // Redirect to onboarding if it's the first execution
        if (firstRun) {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Error checking first run status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to Electron events only if available
    let unsubscribe = () => {};
    if (isElectronAvailable() && window.electronAPI) {
      unsubscribe = window.electronAPI.onFirstRun((firstRun) => {
        setIsFirstRun(firstRun);
        if (firstRun) {
          navigate('/onboarding');
        }
      });
    }

    checkFirstRun();

    // Clean up subscription
    return () => {
      unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If it's the first execution, only display content without layout
  if (isFirstRun) {
    return <Outlet />;
  }

  return (
    <TourProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto p-6 bg-secondary-50 dark:bg-secondary-900">
            <Outlet />
          </main>
        </div>
      </div>
    </TourProvider>
  );
};

export default App;