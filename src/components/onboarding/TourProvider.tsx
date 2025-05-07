import { ReactNode, useState, useEffect } from 'react';
import Tour from 'reactour';

// Définir les étapes du didacticiel
const tourSteps = [
  {
    selector: '[data-tour="sidebar-dashboard"]',
    content: 'Voici votre tableau de bord, où vous pouvez voir un aperçu de vos projets et activités récentes.',
  },
  {
    selector: '[data-tour="sidebar-projects"]',
    content: 'Accédez à tous vos projets ContentForge ici.',
  },
  {
    selector: '[data-tour="header-new-project"]',
    content: 'Créez un nouveau projet en un clic.',
  },
  {
    selector: '[data-tour="sidebar-subscription"]',
    content: 'Découvrez nos différentes formules d\'abonnement pour débloquer toutes les fonctionnalités de ContentForge.',
  },
  {
    selector: '[data-tour="sidebar-settings"]',
    content: 'Personnalisez votre expérience ContentForge selon vos préférences.',
  },
];

interface TourProviderProps {
  children: ReactNode;
}

const TourProvider = ({ children }: TourProviderProps) => {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà complété le didacticiel
    const checkTourCompletion = async () => {
      try {
        // Vérifier si electronAPI est disponible
        if (typeof window.electronAPI === 'undefined') {
          console.warn('electronAPI not available in TourProvider - skipping tour');
          setHasCompletedTour(true);
          return;
        }
        
        const completedTour = await window.electronAPI.getStoreValue('completedTour');
        setHasCompletedTour(!!completedTour);
        
        // Si l'utilisateur n'a pas encore complété le didacticiel, on l'ouvre
        if (!completedTour) {
          // Petit délai pour laisser l'interface se charger
          setTimeout(() => {
            setIsTourOpen(true);
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking tour completion:', error);
      }
    };
    
    checkTourCompletion();
  }, []);

  // Gérer la fin du didacticiel
  const handleCloseTour = async () => {
    setIsTourOpen(false);
    
    // Sauvegarder que l'utilisateur a complété le didacticiel
    if (!hasCompletedTour) {
      // Vérifier si electronAPI est disponible
      if (typeof window.electronAPI === 'undefined') {
        console.warn('electronAPI not available in TourProvider - cannot save tour completion');
        setHasCompletedTour(true);
        return;
      }
      
      await window.electronAPI.setStoreValue('completedTour', true);
      setHasCompletedTour(true);
    }
  };

  return (
    <>
      {children}
      <Tour
        steps={tourSteps}
        isOpen={isTourOpen}
        onRequestClose={handleCloseTour}
        rounded={8}
        accentColor="#4f46e5" // primary-600
        className="tour-helper"
      />
    </>
  );
};

export default TourProvider; 