export interface IElectronAPI {
  getStoreValue: (key: string) => Promise<any>;
  setStoreValue: (key: string, value: any) => Promise<boolean>;
  getUserSubscription: () => Promise<{
    level: 'free' | 'pro' | 'enterprise';
    expiresAt: string;
  }>;
  getAppPath: () => Promise<string>;
  onFirstRun: (callback: (isFirstRun: boolean) => void) => () => void;
  runCliCommand: (
    command: string,
    args: string[]
  ) => Promise<{
    success: boolean;
    data?: string;
    error?: string;
  }>;
}

declare global {
  interface Window {
    electronAPI?: IElectronAPI;
  }
} 