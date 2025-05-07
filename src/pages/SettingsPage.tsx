import { useState, useEffect } from 'react';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoSave: boolean;
  telemetry: boolean;
}

interface UserData {
  name: string;
  email: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({
    theme: 'system',
    language: 'fr',
    autoSave: true,
    telemetry: true,
  });
  
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    // Charger les paramètres
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        
        // Vérifier si electronAPI est disponible
        if (typeof window.electronAPI === 'undefined') {
          console.warn('electronAPI not available - running in browser mode');
          setIsLoading(false);
          return;
        }
        
        // Récupérer les paramètres
        const storedSettings = await window.electronAPI.getStoreValue('settings');
        if (storedSettings) {
          setSettings(storedSettings);
        }
        
        // Récupérer les données utilisateur
        const storedUserData = await window.electronAPI.getStoreValue('user');
        if (storedUserData) {
          setUserData(storedUserData);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Gérer les changements de paramètres
  const handleSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Gérer les changements des données utilisateur
  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Sauvegarder les paramètres
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Vérifier si electronAPI est disponible
      if (typeof window.electronAPI === 'undefined') {
        console.warn('electronAPI not available - cannot save settings');
        setSavedMessage('Erreur: Impossible de sauvegarder les paramètres');
        setIsSaving(false);
        return;
      }
      
      // Sauvegarder les paramètres
      await window.electronAPI.setStoreValue('settings', settings);
      
      // Sauvegarder les données utilisateur
      await window.electronAPI.setStoreValue('user', userData);
      
      // Afficher un message de succès
      setSavedMessage('Paramètres sauvegardés avec succès');
      
      // Appliquer le thème
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (settings.theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      // Effacer le message après 3 secondes
      setTimeout(() => {
        setSavedMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSavedMessage('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  // Liste des langues disponibles
  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
        <p className="text-secondary-600 dark:text-secondary-300">
          Personnalisez votre expérience ContentForge.
        </p>
      </div>

      {/* Profil */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Profil</h2>
        
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
              onChange={handleUserDataChange}
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
              onChange={handleUserDataChange}
              className="input"
              placeholder="votre.email@exemple.com"
            />
          </div>
        </div>
      </div>

      {/* Apparence */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Apparence</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Thème
            </label>
            <select
              id="theme"
              name="theme"
              value={settings.theme}
              onChange={handleSettingChange}
              className="input"
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
              <option value="system">Système</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
              Langue
            </label>
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleSettingChange}
              className="input"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Préférences */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">Préférences</h2>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="autoSave"
                name="autoSave"
                type="checkbox"
                checked={settings.autoSave}
                onChange={handleSettingChange}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-secondary-600 dark:bg-secondary-700"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="autoSave" className="font-medium">
                Sauvegarde automatique
              </label>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Sauvegarder automatiquement les modifications apportées aux projets.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="telemetry"
                name="telemetry"
                type="checkbox"
                checked={settings.telemetry}
                onChange={handleSettingChange}
                className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-secondary-600 dark:bg-secondary-700"
              />
            </div>
            <div className="ml-3">
              <label htmlFor="telemetry" className="font-medium">
                Partage des données d'utilisation
              </label>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                Nous aider à améliorer ContentForge en partageant des données d'utilisation anonymes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* À propos */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold mb-4">À propos</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-secondary-500 dark:text-secondary-400">Version</span>
            <span>1.0.0</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-secondary-500 dark:text-secondary-400">ContentForge CLI</span>
            <span>1.0.0</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-secondary-500 dark:text-secondary-400">Electron</span>
            <span>28.3.3</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div>
          {savedMessage && (
            <div className="text-sm text-green-600 dark:text-green-400">{savedMessage}</div>
          )}
        </div>
        
        <button
          onClick={saveSettings}
          className={`btn btn-primary ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
          disabled={isSaving}
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage; 