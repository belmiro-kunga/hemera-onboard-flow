// Application startup provider component

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, type StartupResult } from '@/lib/app-startup';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface AppStartupContextType {
  startupResult: StartupResult | null;
  isLoading: boolean;
  isReady: boolean;
  errors: string[];
  warnings: string[];
}

const AppStartupContext = createContext<AppStartupContextType | undefined>(undefined);

export const useAppStartup = () => {
  const context = useContext(AppStartupContext);
  if (context === undefined) {
    throw new Error('useAppStartup must be used within an AppStartupProvider');
  }
  return context;
};

interface AppStartupProviderProps {
  children: React.ReactNode;
}

export const AppStartupProvider: React.FC<AppStartupProviderProps> = ({ children }) => {
  const [startupResult, setStartupResult] = useState<StartupResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performStartup = async () => {
      try {
        const result = await initializeApp();
        setStartupResult(result);
      } catch (error) {
        console.error('Startup failed:', error);
        setStartupResult({
          success: false,
          errors: [`Startup failed: ${error}`],
          warnings: [],
          databaseConnected: false,
          configValid: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    performStartup();
  }, []);

  const contextValue: AppStartupContextType = {
    startupResult,
    isLoading,
    isReady: startupResult?.success === true,
    errors: startupResult?.errors || [],
    warnings: startupResult?.warnings || [],
  };

  // Show loading screen during startup
  if (isLoading) {
    return <StartupLoadingScreen />;
  }

  // Show error screen if startup failed
  if (startupResult && !startupResult.success) {
    return <StartupErrorScreen result={startupResult} />;
  }

  // Show warnings if any (but allow app to continue)
  const hasWarnings = startupResult?.warnings && startupResult.warnings.length > 0;

  return (
    <AppStartupContext.Provider value={contextValue}>
      {hasWarnings && <StartupWarnings warnings={startupResult.warnings} />}
      {children}
    </AppStartupContext.Provider>
  );
};

const StartupLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Initializing Application</h2>
          <p className="text-muted-foreground">
            Validating configuration and database connection...
          </p>
        </div>
      </div>
    </div>
  );
};

interface StartupErrorScreenProps {
  result: StartupResult;
}

const StartupErrorScreen: React.FC<StartupErrorScreenProps> = ({ result }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-destructive">Startup Failed</h2>
          <p className="text-muted-foreground">
            The application failed to initialize properly.
          </p>
        </div>

        <div className="space-y-3">
          {result.errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ))}

          {result.warnings.map((warning, index) => (
            <Alert key={index}>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Suggestion</AlertTitle>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          ))}
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Common solutions:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Check if PostgreSQL is running: <code>npm run db:start</code></li>
            <li>• Verify database configuration in <code>.env</code> file</li>
            <li>• Run database setup: <code>npm run db:setup</code></li>
            <li>• Check the console for detailed error messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

interface StartupWarningsProps {
  warnings: string[];
}

const StartupWarnings: React.FC<StartupWarningsProps> = ({ warnings }) => {
  const [showWarnings, setShowWarnings] = useState(true);

  if (!showWarnings) {
    return null;
  }

  return (
    <div className="border-b bg-yellow-50 dark:bg-yellow-950/20">
      <div className="container mx-auto p-4">
        <Alert className="border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Startup Warnings
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            <ul className="list-disc list-inside space-y-1 mt-2">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            <button
              onClick={() => setShowWarnings(false)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Dismiss warnings
            </button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};