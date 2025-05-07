import { useState, useEffect } from 'react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

interface FAQ {
  question: string;
  answer: string;
}

const SubscriptionPage = () => {
  const [currentSubscription, setCurrentSubscription] = useState<{ level: string }>({ level: 'free' });
  const [isLoading, setIsLoading] = useState(true);
  const [yearlyBilling, setYearlyBilling] = useState(false);

  useEffect(() => {
    // Récupérer les informations d'abonnement
    const fetchSubscription = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier si electronAPI est disponible
        if (typeof window.electronAPI === 'undefined') {
          console.warn('electronAPI not available - running in browser mode');
          setIsLoading(false);
          return;
        }
        
        const sub = await window.electronAPI.getUserSubscription();
        setCurrentSubscription(sub);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // Plans d'abonnement
  const subscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Gratuit',
      price: yearlyBilling ? '0€' : '0€',
      features: [
        "Jusqu'à 3 projets",
        "Modèles de base",
        "Déploiement basique",
        "Support communautaire",
      ],
      buttonText: currentSubscription.level === 'free' ? 'Plan actuel' : 'Choisir ce plan',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: yearlyBilling ? '99€/an' : '9.99€/mois',
      features: [
        'Projets illimités',
        'Tous les modèles',
        'Déploiement avancé',
        'Support prioritaire',
        'Synchronisation automatique',
        'Plugins premium',
      ],
      isPopular: true,
      buttonText: currentSubscription.level === 'pro' ? 'Plan actuel' : 'Choisir ce plan',
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: yearlyBilling ? '299€/an' : '29.99€/mois',
      features: [
        'Tout dans Pro',
        'API avancée',
        'Intégrations personnalisées',
        'Support dédié',
        'Formation personnalisée',
        'Déploiement multi-environnement',
      ],
      buttonText: currentSubscription.level === 'enterprise' ? 'Plan actuel' : 'Choisir ce plan',
    },
  ];

  // Questions fréquentes
  const faqs: FAQ[] = [
    {
      question: 'Puis-je changer de plan à tout moment ?',
      answer: 'Oui, vous pouvez passer à un plan supérieur à tout moment. Si vous souhaitez rétrograder, le changement prendra effet à la fin de votre période de facturation en cours.',
    },
    {
      question: 'Comment fonctionne la facturation annuelle ?',
      answer: "La facturation annuelle vous permet d'économiser 20% par rapport au tarif mensuel. Vous êtes facturé une fois par an et votre abonnement se renouvelle automatiquement à la date anniversaire.",
    },
    {
      question: 'Puis-je annuler mon abonnement à tout moment ?',
      answer: "Oui, vous pouvez annuler votre abonnement à tout moment. Vous continuerez à avoir accès à toutes les fonctionnalités jusqu'à la fin de votre période de facturation en cours.",
    },
    {
      question: 'Quelles sont les méthodes de paiement acceptées ?',
      answer: 'Nous acceptons les cartes de crédit (Visa, Mastercard, American Express) et PayPal.',
    },
  ];

  // Simuler un changement d'abonnement
  const handleSubscriptionChange = async (planId: string) => {
    if (planId === currentSubscription.level) return;
    
    try {
      // Vérifier si electronAPI est disponible
      if (typeof window.electronAPI === 'undefined') {
        console.warn('electronAPI not available - cannot change subscription');
        return;
      }
      
      // Dans une application réelle, ici on ouvrirait une page de paiement
      // Pour notre démo, on change simplement le niveau d'abonnement
      await window.electronAPI.setStoreValue('subscription', {
        level: planId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 jours
      });
      
      setCurrentSubscription({ level: planId });
    } catch (error) {
      console.error('Error changing subscription:', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Abonnements</h1>
        <p className="text-secondary-600 dark:text-secondary-300">
          Choisissez le plan qui correspond le mieux à vos besoins.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Sélecteur de facturation */}
          <div className="flex justify-center mb-8">
            <div className="bg-secondary-100 dark:bg-secondary-800 p-1 rounded-lg inline-flex">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  !yearlyBilling
                    ? 'bg-white dark:bg-secondary-700 shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-400'
                }`}
                onClick={() => setYearlyBilling(false)}
              >
                Mensuel
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  yearlyBilling
                    ? 'bg-white dark:bg-secondary-700 shadow-sm'
                    : 'text-secondary-600 dark:text-secondary-400'
                }`}
                onClick={() => setYearlyBilling(true)}
              >
                Annuel <span className="text-xs text-primary-600 dark:text-primary-400">-20%</span>
              </button>
            </div>
          </div>

          {/* Plans d'abonnement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`card relative ${
                  plan.isPopular
                    ? 'border-2 border-primary-500 dark:border-primary-400'
                    : 'border border-secondary-200 dark:border-secondary-700'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 right-0 bg-primary-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                    Populaire
                  </div>
                )}
                
                <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
                <p className="text-3xl font-bold mb-6">
                  {plan.price}
                  {plan.id !== 'free' && !yearlyBilling && (
                    <span className="text-sm font-normal text-secondary-500 dark:text-secondary-400">/mois</span>
                  )}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <span className="w-5 h-5 bg-green-500 rounded-full mr-2"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleSubscriptionChange(plan.id)}
                  className={`w-full ${
                    currentSubscription.level === plan.id
                      ? 'btn btn-secondary cursor-default'
                      : 'btn btn-primary'
                  }`}
                  disabled={currentSubscription.level === plan.id}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Questions fréquentes</h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="card">
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-secondary-600 dark:text-secondary-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Garantie */}
          <div className="card bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-300">
                <div className="w-6 h-6 bg-green-600 dark:bg-green-400 rounded-full"></div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Garantie satisfait ou remboursé</h3>
                <p className="text-secondary-600 dark:text-secondary-400">
                  Essayez ContentForge Pro ou Entreprise sans risque pendant 14 jours. Si vous n'êtes pas satisfait, nous vous remboursons intégralement.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionPage; 