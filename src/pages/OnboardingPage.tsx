import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Interface pour les étapes d'onboarding
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
  });
  
  // Définition des étapes d'onboarding
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bienvenue sur ContentForge',
      description: 'L\'outil de création et de gestion de contenu le plus intuitif pour les développeurs.',
    },
    {
      id: 'user-info',
      title: 'Dites-nous qui vous êtes',
      description: 'Ces informations nous aideront à personnaliser votre expérience.',
    },
    {
      id: 'features',
      title: 'Découvrez nos fonctionnalités',
      description: 'ContentForge offre tout ce dont vous avez besoin pour créer et gérer votre contenu efficacement.',
    },
    {
      id: 'subscription',
      title: 'Choisissez votre formule',
      description: 'Nous proposons différentes formules pour répondre à vos besoins spécifiques.',
    },
  ];

  // Gestion des changements dans les champs de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Avancer à l'étape suivante
  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Enregistrer les données utilisateur
      try {
        await window.electronAPI.setStoreValue('user', userData);
        await window.electronAPI.setStoreValue('firstRun', false);
        navigate('/');
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }
  };

  // Revenir à l'étape précédente
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Passer l'onboarding complètement
  const handleSkip = async () => {
    try {
      await window.electronAPI.setStoreValue('firstRun', false);
      navigate('/');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  // Rendu des différentes étapes
  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full mx-auto flex items-center justify-center">
              <div className="w-12 h-12 bg-primary-600 dark:bg-primary-400 rounded-md"></div>
            </div>
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50">{step.title}</h1>
            <p className="text-secondary-600 dark:text-secondary-300">{step.description}</p>
            <p className="text-secondary-500 dark:text-secondary-400 text-sm">
              Nous allons vous guider à travers quelques étapes pour configurer votre environnement et vous permettre de tirer le meilleur parti de ContentForge.
            </p>
          </div>
        );
      
      case 'user-info':
        return (
          <div className="max-w-md mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50">{step.title}</h1>
            <p className="text-secondary-600 dark:text-secondary-300">{step.description}</p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Votre nom"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="votre.email@exemple.com"
                />
              </div>
            </div>
          </div>
        );
      
      case 'features':
        return (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50 text-center">{step.title}</h1>
            <p className="text-secondary-600 dark:text-secondary-300 text-center mb-8">{step.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-primary-600 dark:bg-primary-400"></div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Générateur de sites statiques</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                  Créez des sites web rapides et sécurisés avec notre générateur de sites statiques intégré.
                </p>
              </div>
              
              <div className="card">
                <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-accent-600 dark:bg-accent-400"></div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Gestion de contenu</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                  Organisez et gérez votre contenu facilement avec notre interface intuitive.
                </p>
              </div>
              
              <div className="card">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-green-600 dark:bg-green-400"></div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Déploiement automatisé</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                  Déployez votre site en quelques clics avec notre pipeline CI/CD intégré.
                </p>
              </div>
              
              <div className="card">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 bg-yellow-600 dark:bg-yellow-400"></div>
                </div>
                <h3 className="text-lg font-semibold mb-2">Modèles personnalisables</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">
                  Choisissez parmi une variété de modèles ou créez le vôtre pour personnaliser votre site.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'subscription':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-50 text-center">{step.title}</h1>
            <p className="text-secondary-600 dark:text-secondary-300 text-center mb-8">{step.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card border border-secondary-200 dark:border-secondary-700">
                <h3 className="text-xl font-bold mb-4">Gratuit</h3>
                <p className="text-3xl font-bold mb-6">0€<span className="text-sm font-normal text-secondary-500">/mois</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>3 projets</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Modèles de base</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Déploiement basique</span>
                  </li>
                </ul>
                <button className="btn btn-secondary w-full" onClick={handleNext}>
                  Sélectionner
                </button>
              </div>
              
              <div className="card border-2 border-primary-500 dark:border-primary-400 relative">
                <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                  Populaire
                </div>
                <h3 className="text-xl font-bold mb-4">Pro</h3>
                <p className="text-3xl font-bold mb-6">9.99€<span className="text-sm font-normal text-secondary-500">/mois</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Projets illimités</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Tous les modèles</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Déploiement avancé</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Support prioritaire</span>
                  </li>
                </ul>
                <button className="btn btn-primary w-full" onClick={handleNext}>
                  Sélectionner
                </button>
              </div>
              
              <div className="card border border-secondary-200 dark:border-secondary-700">
                <h3 className="text-xl font-bold mb-4">Entreprise</h3>
                <p className="text-3xl font-bold mb-6">29.99€<span className="text-sm font-normal text-secondary-500">/mois</span></p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Tout dans Pro</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>API avancée</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Intégrations personnalisées</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                    <span>Support dédié</span>
                  </li>
                </ul>
                <button className="btn btn-secondary w-full" onClick={handleNext}>
                  Sélectionner
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary-50 dark:bg-secondary-900">
      {/* Header avec progression */}
      <header className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">ContentForge</div>
          
          <div className="hidden sm:flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index < currentStep
                      ? 'bg-primary-600 text-white'
                      : index === currentStep
                      ? 'bg-primary-100 border-2 border-primary-600 text-primary-800'
                      : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                  }`}
                >
                  {index < currentStep ? (
                    <div className="w-4 h-4 bg-white rounded-sm"></div>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-10 h-1 ${
                      index < currentStep
                        ? 'bg-primary-600'
                        : 'bg-secondary-200 dark:bg-secondary-700'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={handleSkip}
            className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
          >
            Passer
          </button>
        </div>
      </header>
      
      {/* Contenu principal */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-6xl">
          {renderStepContent()}
        </div>
      </div>
      
      {/* Footer avec navigation */}
      <footer className="p-4 border-t border-secondary-200 dark:border-secondary-700">
        <div className="max-w-6xl mx-auto flex justify-between">
          <button
            onClick={handleBack}
            className={`btn btn-secondary ${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={currentStep === 0}
          >
            Précédent
          </button>
          
          <button onClick={handleNext} className="btn btn-primary">
            {currentStep < steps.length - 1 ? 'Suivant' : 'Terminer'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingPage; 