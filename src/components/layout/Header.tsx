import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [user, setUser] = useState<{ name: string }>({ name: '' });
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  
  // Detect scrolling for visual effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Load user preferences
    const loadUserPreferences = async () => {
      try {
        // Check if electronAPI is available
        if (typeof window.electronAPI === 'undefined') {
          console.log('electronAPI not available in Header - using default settings');
          setUser({ name: 'Utilisateur Test' });
          
          // Apply default system theme
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
          }
          return;
        }
        
        const userData = await window.electronAPI?.getStoreValue('user');
        const settings = await window.electronAPI?.getStoreValue('settings');
        
        if (userData) {
          setUser(userData);
        }
        
        // Set theme
        if (settings?.theme === 'dark' || 
           (settings?.theme === 'system' && 
            window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
        } else {
          setDarkMode(false);
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = async () => {
      // Check if electronAPI is available
      if (typeof window.electronAPI === 'undefined') {
        setDarkMode(mediaQuery.matches);
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return;
      }
      
      const settings = await window.electronAPI?.getStoreValue('settings');
      if (settings?.theme === 'system') {
        setDarkMode(mediaQuery.matches);
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle theme
  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Check if electronAPI is available
    if (typeof window.electronAPI === 'undefined') {
      console.log('electronAPI not available in Header - cannot save theme preference');
      return;
    }
    
    // Save preference
    const settings = await window.electronAPI?.getStoreValue('settings') || {};
    await window.electronAPI?.setStoreValue('settings', {
      ...settings,
      theme: newDarkMode ? 'dark' : 'light',
    });
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-200 ${isScrolled ? 'backdrop-blur-md bg-white/90 dark:bg-secondary-800/90 shadow-md' : 'bg-white dark:bg-secondary-800'} border-b border-secondary-200 dark:border-secondary-700`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link 
              to="/new-project" 
              className="btn btn-primary animate-slide-in"
              data-tour="header-new-project"
            >
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 bg-white rounded-full opacity-90"></span>
                <span>Nouveau projet</span>
              </span>
            </Link>
            <div className="ml-4 hidden md:block">
              <div className="badge badge-accent">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-600"></span>
                </span>
                <span>1.0.0</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors relative">
              <div className="w-5 h-5 bg-secondary-400 dark:bg-secondary-500 mask mask-bell"></div>
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-danger-500"></span>
            </button>
            
            {/* Theme toggle */}
            <button
              onClick={toggleDarkMode}
              className="dark-mode-toggle relative inline-flex items-center transition-colors"
              data-tour="header-theme-toggle"
              aria-label={darkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}
            >
              <span className={`absolute inset-0 rounded-full ${darkMode ? 'bg-secondary-700' : 'bg-secondary-200'} transition-colors duration-300`}></span>
              <span className={`z-10 flex h-5 w-5 translate-x-0.5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-6' : ''}`}>
                {darkMode ? (
                  <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
                ) : (
                  <div className="w-3 h-3 bg-secondary-500 rounded-full"></div>
                )}
              </span>
            </button>
            
            {/* User profile */}
            <div className="relative group">
              <div 
                className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors" 
                data-tour="header-user-profile"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-accent-500 dark:from-primary-500 dark:to-accent-600 rounded-full flex items-center justify-center text-white shadow-sm overflow-hidden ring-2 ring-white dark:ring-secondary-700">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200 hidden sm:block">
                  {user.name || 'Utilisateur'}
                </span>
                <span className="hidden sm:block">
                  <svg className="w-4 h-4 text-secondary-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 origin-top-right transform opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
                <div className="card p-2 divide-y divide-secondary-200 dark:divide-secondary-700 shadow-dropdown">
                  <div className="px-2 py-2 mb-1">
                    <p className="text-sm text-secondary-900 dark:text-secondary-100 font-medium">{user.name || 'Utilisateur'}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">Compte personnel</p>
                  </div>
                  <div>
                    <Link to="/settings" className="block px-2 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-md transition-colors">
                      Paramètres
                    </Link>
                    <Link to="/subscription" className="block px-2 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700 rounded-md transition-colors">
                      Abonnement
                    </Link>
                    <button className="w-full text-left px-2 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 rounded-md transition-colors">
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 