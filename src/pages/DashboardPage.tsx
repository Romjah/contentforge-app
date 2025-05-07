import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Project {
  name: string;
  path: string;
  lastOpened: string;
}

interface Stat {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const DashboardPage = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ name: string }>({ name: '' });
  const [subscription, setSubscription] = useState<{ level: string }>({ level: 'free' });

  useEffect(() => {
    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Check if electronAPI is available
        if (typeof window.electronAPI === 'undefined') {
          console.log('electronAPI not available - running in browser mode');
          setIsLoading(false);
          return;
        }
        
        // Get projects from storage
        const projects = await window.electronAPI?.getStoreValue('recentProjects') || [];
        setRecentProjects(projects.slice(0, 3)); // Limit to 3 recent projects
        
        // Get user data
        const userData = await window.electronAPI?.getStoreValue('user');
        if (userData) {
          setUser(userData);
        }
        
        // Get subscription information
        const sub = await window.electronAPI?.getUserSubscription();
        if (sub) {
          setSubscription(sub);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date);
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Statistics
  const stats: Stat[] = [
    {
      icon: <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-400/20 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10h.01M8 14h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>,
      label: 'Projets',
      value: recentProjects.length.toString(),
      color: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300',
    },
    {
      icon: <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-success-400/20 text-success-600 dark:bg-success-500/20 dark:text-success-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>,
      label: 'Déploiements',
      value: '0',
      color: 'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-300',
    },
    {
      icon: <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent-400/20 text-accent-600 dark:bg-accent-500/20 dark:text-accent-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>,
      label: 'Templates',
      value: subscription.level === 'free' ? '3' : '15+',
      color: 'bg-accent-100 text-accent-800 dark:bg-accent-900/50 dark:text-accent-300',
    },
  ];

  return (
    <div>
      {/* Dashboard header with animation */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-500 dark:from-primary-400 dark:to-accent-400">
          {user.name ? `Bonjour, ${user.name}` : 'Bienvenue sur ContentForge'}
        </h1>
        <p className="text-secondary-600 dark:text-secondary-300">
          Voici un aperçu de vos projets et activités récentes.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="spinner w-12 h-12 border-4 text-primary-500"></div>
        </div>
      ) : (
        <>
          {/* Statistics with entry animation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="card-glass hover-3d animate-slide-in" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center">
                  {stat.icon}
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-secondary-500 dark:text-secondary-400">{stat.label}</h3>
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-secondary-900 to-secondary-600 dark:from-white dark:to-secondary-300">{stat.value}</p>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl ${stat.color.split(' ')[0]}`}></div>
              </div>
            ))}
          </div>

          {/* Recent projects */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <span className="mr-2">Projets récents</span>
                <span className="relative flex h-3 w-3">
                  <span className={`${recentProjects.length ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75`}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                </span>
              </h2>
              <Link to="/projects" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center group">
                <span>Voir tous les projets</span>
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            {recentProjects.length === 0 ? (
              <div className="card-neumorphic text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center">
                  <svg className="w-8 h-8 text-secondary-400 dark:text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Aucun projet récent</h3>
                <p className="text-secondary-500 dark:text-secondary-400 mb-4 max-w-sm mx-auto">
                  Vous n'avez pas encore créé de projet. Commencez par en créer un.
                </p>
                <Link to="/new-project" className="btn btn-primary inline-flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nouveau projet</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentProjects.map((project, index) => (
                  <Link
                    key={project.path}
                    to="/projects"
                    className="card glass-container group hover:scale-[1.02] transition-all duration-300"
                    style={{ animationDelay: `${(index + 3) * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 dark:from-primary-500/10 dark:to-accent-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <span className="w-3 h-3 bg-primary-500 rounded-full mr-2 group-hover:animate-pulse"></span>
                      {project.name}
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 truncate">
                      {project.path}
                    </p>
                    <div className="flex justify-between items-center text-xs text-secondary-500 dark:text-secondary-400 mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                      <span>Dernière ouverture:</span>
                      <span className="font-mono">{formatDate(project.lastOpened)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Subscription banner for free users */}
          {subscription.level === 'free' && (
            <div className="glass-container bg-gradient-to-r from-primary-600/90 to-accent-600/90 dark:from-primary-700/90 dark:to-accent-700/90 text-white animate-slide-up" style={{ animationDelay: '400ms' }}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-warning-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Passez à l'abonnement Pro</span>
                  </h3>
                  <p className="opacity-90">
                    Accédez à toutes les fonctionnalités premium et créez des projets illimités.
                  </p>
                </div>
                <Link
                  to="/subscription"
                  className="px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-colors flex items-center group"
                >
                  <span>Voir les offres</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage; 