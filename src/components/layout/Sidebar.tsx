import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Composants d'icônes modernes avec animations
const DashboardIcon = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <div className="absolute inset-0 bg-current rounded-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
    <div className="absolute inset-1 bg-current rounded-sm opacity-0 group-hover:opacity-30 scale-75 group-hover:scale-100 transition-all"></div>
  </div>
);

const ProjectsIcon = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <div className="absolute inset-0 bg-current rounded-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
    <div className="absolute inset-1.5 bg-current rounded-full opacity-0 group-hover:opacity-30 scale-75 group-hover:scale-100 transition-all"></div>
  </div>
);

const SettingsIcon = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <div className="absolute inset-0 bg-current rounded-md opacity-70 group-hover:opacity-100 transition-opacity"></div>
    <div className="h-3 w-3 bg-current rounded-full opacity-0 group-hover:opacity-70 scale-75 group-hover:scale-100 transition-all animate-spin-slow"></div>
  </div>
);

const SubscriptionIcon = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <div className="absolute inset-0 bg-current rounded-lg opacity-70 group-hover:opacity-100 transition-opacity"></div>
    <div className="absolute inset-1 bg-transparent border-2 border-current rounded-lg opacity-0 group-hover:opacity-40 scale-75 group-hover:scale-110 transition-all"></div>
  </div>
);

const Sidebar = () => {
  const location = useLocation();
  const [subscription, setSubscription] = useState<{level: string}>({ level: 'free' });
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Get subscription information
    const fetchSubscription = async () => {
      try {
        // Check if electronAPI is available
        if (typeof window.electronAPI === 'undefined') {
          console.log('electronAPI not available in Sidebar - using default subscription');
          setSubscription({ level: 'free' });
          return;
        }
        
        const sub = await window.electronAPI?.getUserSubscription();
        if (sub) {
          setSubscription(sub);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    fetchSubscription();
  }, []);

  // Gérer le redimensionnement de la fenêtre pour le responsive
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 768);
    };
    
    handleResize(); // Initialiser
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Items de navigation
  const navigationItems = [
    { name: 'Tableau de bord', icon: <DashboardIcon />, path: '/', id: 'dashboard' },
    { name: 'Mes projets', icon: <ProjectsIcon />, path: '/projects', id: 'projects' },
    { name: 'Paramètres', icon: <SettingsIcon />, path: '/settings', id: 'settings' },
  ];

  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${collapsed && !hovered ? 'w-16' : 'w-64'} h-full bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-center border-b border-secondary-200 dark:border-secondary-700">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-lg shadow-md flex items-center justify-center animate-pulse-slow">
            <span className="text-white font-bold text-xl">CF</span>
          </div>
          <span className={`font-bold text-xl text-primary-600 dark:text-primary-400 transition-opacity ${collapsed && !hovered ? 'opacity-0 hidden' : 'opacity-100'}`}>
            ContentForge
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navigationItems.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`group flex items-center ${collapsed && !hovered ? 'justify-center' : 'justify-start space-x-3'} px-3 py-2 rounded-md transition-all ${
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 shadow-sm'
                : 'text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700'
            }`}
            data-tour={`sidebar-${item.id}`}
          >
            {item.icon}
            <span className={`transition-all ${collapsed && !hovered ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              {item.name}
            </span>
            
            {/* Indicateur actif */}
            {location.pathname === item.path && (
              <span className="absolute right-0 w-1 h-8 bg-primary-500 dark:bg-primary-400 rounded-l-md transform -translate-y-1/2 top-1/2"></span>
            )}
          </Link>
        ))}
      </nav>

      {/* Abonnement */}
      <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
        <Link
          to="/subscription"
          className={`group relative flex ${collapsed && !hovered ? 'justify-center' : 'justify-between items-center'} p-3 bg-gradient-to-r from-secondary-100 to-secondary-50 dark:from-secondary-700 dark:to-secondary-800 rounded-xl hover:from-primary-50 hover:to-accent-50 dark:hover:from-primary-900/20 dark:hover:to-accent-900/20 transition-all overflow-hidden`}
          data-tour="sidebar-subscription"
        >
          {/* Background animation effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-400/10 to-primary-400/0 dark:from-primary-400/0 dark:via-primary-400/5 dark:to-primary-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
          
          <div className={`flex items-center ${collapsed && !hovered ? '' : 'space-x-3'}`}>
            <SubscriptionIcon />
            <div className={`transition-opacity ${collapsed && !hovered ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200">Abonnement</span>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">{subscription.level}</p>
            </div>
          </div>
          
          {subscription.level === 'free' && !collapsed && (
            <span className="text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-2 py-1 rounded-full transition-transform group-hover:scale-110">
              Upgrade
            </span>
          )}
        </Link>
      </div>
      
      {/* Contrôle de collapse sur mobile */}
      <button 
        className="md:hidden absolute top-20 -right-3 bg-white dark:bg-secondary-700 rounded-full w-6 h-6 shadow-md flex items-center justify-center border border-secondary-200 dark:border-secondary-600"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className={`transform transition-transform ${collapsed ? 'rotate-0' : 'rotate-180'}`}>
          <svg className="w-4 h-4 text-secondary-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
    </div>
  );
};

export default Sidebar; 