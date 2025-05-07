import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Project {
  name: string;
  path: string;
  lastOpened: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<{ level: string }>({ level: 'free' });

  useEffect(() => {
    // Charger les projets récents
    const loadProjects = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les projets depuis le stockage
        const recentProjects = await window.electronAPI.getStoreValue('recentProjects') || [];
        setProjects(recentProjects);
        
        // Récupérer les informations d'abonnement
        const sub = await window.electronAPI.getUserSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Error loading projects:', error);
        setError('Une erreur est survenue lors du chargement des projets.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjects();
  }, []);

  // Formater la date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch (error) {
      return 'Date inconnue';
    }
  };

  // Ouvrir un projet
  const openProject = async (project: Project) => {
    try {
      // Exécuter la commande ContentForge CLI pour ouvrir le projet
      const result = await window.electronAPI.runCliCommand('open', [
        '--path', project.path,
      ]);
      
      if (result.success) {
        // Mettre à jour la date de dernière ouverture
        const updatedProjects = projects.map((p) =>
          p.path === project.path
            ? { ...p, lastOpened: new Date().toISOString() }
            : p
        );
        
        setProjects(updatedProjects);
        await window.electronAPI.setStoreValue('recentProjects', updatedProjects);
      } else {
        setError(`Erreur lors de l'ouverture du projet: ${result.error}`);
      }
    } catch (error) {
      console.error('Error opening project:', error);
      setError('Une erreur est survenue lors de l\'ouverture du projet.');
    }
  };

  // Supprimer un projet de la liste (pas le dossier)
  const removeProject = async (projectPath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const updatedProjects = projects.filter((p) => p.path !== projectPath);
      setProjects(updatedProjects);
      await window.electronAPI.setStoreValue('recentProjects', updatedProjects);
    } catch (error) {
      console.error('Error removing project:', error);
      setError('Une erreur est survenue lors de la suppression du projet.');
    }
  };

  // Calculer le nombre maximum de projets en fonction de l'abonnement
  const getMaxProjects = () => {
    switch (subscription.level) {
      case 'pro':
      case 'enterprise':
        return Infinity;
      case 'free':
      default:
        return 3;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mes projets</h1>
          <p className="text-secondary-600 dark:text-secondary-300">
            Gérez vos projets ContentForge ou créez-en un nouveau.
          </p>
        </div>
        
        <Link
          to="/new-project"
          className={`btn btn-primary ${
            projects.length >= getMaxProjects() && subscription.level === 'free'
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          onClick={(e) => {
            if (projects.length >= getMaxProjects() && subscription.level === 'free') {
              e.preventDefault();
            }
          }}
        >
          Nouveau projet
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <h3 className="text-xl font-semibold mb-4">Aucun projet créé</h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-8">
            Vous n'avez pas encore créé de projet. Créez-en un pour commencer.
          </p>
          <Link to="/new-project" className="btn btn-primary">
            Créer un projet
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.path}
                className="card cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openProject(project)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <button
                    onClick={(e) => removeProject(project.path, e)}
                    className="p-1 text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
                  >
                    <div className="w-5 h-5 bg-secondary-400 dark:bg-secondary-600 rounded-full"></div>
                  </button>
                </div>
                
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4 truncate">
                  {project.path}
                </p>
                
                <div className="flex justify-between items-center text-xs text-secondary-500 dark:text-secondary-400 mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
                  <span>Dernière ouverture:</span>
                  <span>{formatDate(project.lastOpened)}</span>
                </div>
              </div>
            ))}
          </div>
          
          {subscription.level === 'free' && projects.length >= getMaxProjects() && (
            <div className="card mt-8 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-300">
                  <div className="w-4 h-4 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium mb-1">Limite de projets atteinte</h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                    Vous avez atteint la limite de projets pour l'abonnement gratuit. Passez à l'abonnement Pro pour créer des projets illimités.
                  </p>
                  <Link to="/subscription" className="btn btn-primary">
                    Passer à Pro
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectsPage; 