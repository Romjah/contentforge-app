import { useEffect } from 'react';
import { useRouteError, Link, isRouteErrorResponse } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();
  
  let errorMessage = 'Une erreur inattendue est survenue.';
  let errorCode = '500';
  
  // Extraction des détails de l'erreur
  if (isRouteErrorResponse(error)) {
    errorCode = String(error.status);
    errorMessage = error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  useEffect(() => {
    // Log l'erreur
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-secondary-50 dark:bg-secondary-900">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary-600 dark:text-primary-400">{errorCode}</div>
          <h1 className="text-3xl font-bold mt-4 mb-2 text-secondary-900 dark:text-secondary-50">Oups!</h1>
          <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-md mx-auto">
            {errorMessage}
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-secondary-500 dark:text-secondary-400">
            Nous rencontrons un problème. Vous pouvez essayer de :
          </p>
          
          <ul className="space-y-2 text-secondary-600 dark:text-secondary-300">
            <li>Rafraîchir la page</li>
            <li>Retourner à la page précédente</li>
            <li>Vérifier votre connexion internet</li>
          </ul>
          
          <div className="pt-4">
            <Link
              to="/"
              className="btn btn-primary inline-block"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Si le problème persiste, veuillez contacter le support technique.
        </p>
      </div>
    </div>
  );
};

export default ErrorPage; 