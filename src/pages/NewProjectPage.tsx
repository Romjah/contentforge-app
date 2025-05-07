import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Types pour les templates
interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  isPremium: boolean;
}

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    path: '',
    template: '',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<{ level: string }>({ level: 'free' });
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 'blog',
      name: 'Blog',
      description: 'Modèle de blog simple et élégant',
      preview: '',
      isPremium: false,
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Présentez vos projets et compétences',
      preview: '',
      isPremium: false,
    },
    {
      id: 'documentation',
      name: 'Documentation',
      description: 'Documentation technique pour votre projet',
      preview: '',
      isPremium: false,
    },
    {
      id: 'ecommerce',
      name: 'E-Commerce',
      description: 'Boutique en ligne complète',
      preview: '',
      isPremium: true,
    },
    {
      id: 'landing',
      name: 'Landing Page',
      description: 'Page d\'atterrissage pour promotions',
      preview: '',
      isPremium: true,
    },
  ]);

  // Gérer les changements dans les champs de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  // Sélectionner un template
  const selectTemplate = (templateId: string) => {
    setProjectData((prev) => ({ ...prev, template: templateId }));
  };

  // Passer à l'étape suivante
  const goToNextStep = () => {
    setError('');
    
    // Validation pour l'étape 1
    if (step === 1) {
      if (!projectData.name.trim()) {
        setError('Veuillez entrer un nom de projet.');
        return;
      }
      if (!projectData.path.trim()) {
        setError('Veuillez sélectionner un emplacement pour votre projet.');
        return;
      }
    }
    
    // Validation pour l'étape 2
    if (step === 2) {
      if (!projectData.template) {
        setError('Veuillez sélectionner un template.');
        return;
      }
      
      // Vérifier si l'utilisateur a accès au template premium
      const selectedTemplate = templates.find(t => t.id === projectData.template);
      if (selectedTemplate?.isPremium && subscription.level === 'free') {
        setError('Ce template nécessite un abonnement Pro ou Entreprise.');
        return;
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
    }
  };

  // Revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Sélectionner le chemin du projet
  const selectProjectPath = async () => {
    // Simulons la sélection d'un dossier
    // Dans une implémentation réelle, ça utiliserait l'API Electron
    setProjectData((prev) => ({ ...prev, path: `/Users/user/Projects/${prev.name}` }));
  };

  // Créer le projet
  const createProject = async () => {
    setError('');
    setIsCreating(true);
    
    try {
      // Exécuter la commande ContentForge CLI pour créer un nouveau projet
      const result = await window.electronAPI.runCliCommand('create', [
        '--name', projectData.name,
        '--path', projectData.path,
        '--template', projectData.template,
        '--description', projectData.description || 'Projet créé avec ContentForge',
      ]);
      
      if (result.success) {
        // Ajouter le projet aux projets récents
        const recentProjects = await window.electronAPI.getStoreValue('recentProjects') || [];
        await window.electronAPI.setStoreValue('recentProjects', [
          {
            name: projectData.name,
            path: projectData.path,
            lastOpened: new Date().toISOString(),
          },
          ...recentProjects.filter((p: any) => p.path !== projectData.path).slice(0, 9),
        ]);
        
        // Rediriger vers les projets
        navigate('/projects');
      } else {
        setError(`Erreur lors de la création du projet: ${result.error}`);
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la création du projet.');
      console.error('Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Rendu des étapes
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Informations du projet</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Nom du projet*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={projectData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Mon projet"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={projectData.description}
                  onChange={handleChange}
                  className="input h-24 resize-none"
                  placeholder="Description de votre projet"
                />
              </div>
              
              <div>
                <label htmlFor="path" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Emplacement*
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="path"
                    name="path"
                    value={projectData.path}
                    onChange={handleChange}
                    className="input rounded-r-none flex-1"
                    placeholder="/chemin/vers/projet"
                    readOnly
                  />
                  <button
                    onClick={selectProjectPath}
                    className="px-4 bg-secondary-200 text-secondary-800 hover:bg-secondary-300 rounded-r-md border border-secondary-300 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600 dark:border-secondary-600"
                  >
                    Parcourir
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Sélectionnez un template</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`card cursor-pointer transition-all ${
                    projectData.template === template.id
                      ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-secondary-900'
                      : 'hover:shadow-lg'
                  } ${
                    template.isPremium && subscription.level === 'free'
                      ? 'opacity-70'
                      : ''
                  }`}
                  onClick={() => selectTemplate(template.id)}
                >
                  {template.isPremium && (
                    <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                      Premium
                    </div>
                  )}
                  <div className="h-32 bg-secondary-200 dark:bg-secondary-700 rounded-md mb-4 flex items-center justify-center">
                    <span className="text-secondary-400">Aperçu</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 3:
        const selectedTemplate = templates.find(t => t.id === projectData.template);
        
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Résumé du projet</h2>
            
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Détails du projet</h3>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Nom:</span>
                  <span className="font-medium">{projectData.name}</span>
                </div>
                
                {projectData.description && (
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Description:</span>
                    <span className="font-medium">{projectData.description}</span>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Emplacement:</span>
                  <span className="font-medium truncate max-w-md">{projectData.path}</span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Template:</span>
                  <span className="font-medium">{selectedTemplate?.name}</span>
                </div>
              </div>
            </div>
            
            <div className="card bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center text-secondary-600 dark:text-secondary-300">
                  <div className="w-4 h-4 bg-secondary-600 dark:bg-secondary-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-1">Prêt à créer votre projet</h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400">
                    Cliquez sur "Créer" pour générer votre projet avec ContentForge CLI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nouveau projet</h1>
        <p className="text-secondary-600 dark:text-secondary-300">
          Créez un nouveau projet avec ContentForge CLI en quelques étapes simples.
        </p>
      </div>

      {/* Progression */}
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  i < step
                    ? 'bg-primary-600 text-white'
                    : i === step
                    ? 'bg-primary-100 border-2 border-primary-600 text-primary-800 dark:bg-primary-900 dark:border-primary-500 dark:text-primary-200'
                    : 'bg-secondary-200 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-400'
                }`}
              >
                {i}
              </div>
              <span className="ml-2 text-sm font-medium hidden sm:block">
                {i === 1 ? 'Information' : i === 2 ? 'Template' : 'Création'}
              </span>
              {i < 3 && (
                <div
                  className={`w-full h-1 mx-4 ${
                    i < step ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contenu de l'étape */}
      <div className="card mb-8">
        {renderStepContent()}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={goToPreviousStep}
          className={`btn btn-secondary ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={step === 1}
        >
          Précédent
        </button>
        
        {step < 3 ? (
          <button onClick={goToNextStep} className="btn btn-primary">
            Suivant
          </button>
        ) : (
          <button
            onClick={createProject}
            className={`btn btn-primary ${isCreating ? 'opacity-70 cursor-wait' : ''}`}
            disabled={isCreating}
          >
            {isCreating ? 'Création en cours...' : 'Créer le projet'}
          </button>
        )}
      </div>
    </div>
  );
};

export default NewProjectPage; 