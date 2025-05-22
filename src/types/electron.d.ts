import { Profile, ApiResponse } from './profile';
import { BrokerAccount, BrokerType } from './broker';

declare global {
  interface Window {
    electronAPI: {
      appName: string;
      appVersion: string;
      
      profiles: {
        getAll: () => Promise<ApiResponse<Profile[]>>;
        getById: (id: number) => Promise<ApiResponse<Profile | null>>;
        create: (name: string) => Promise<ApiResponse<Profile>>;
        update: (id: number, name: string) => Promise<ApiResponse<Profile>>;
        delete: (id: number) => Promise<ApiResponse<Profile>>;
      };

      brokerAccounts: {
        getByProfile: (profileId: number) => Promise<ApiResponse<BrokerAccount[]>>;
        create: (data: {
          profileId: number;
          brokerName: BrokerType;
          displayName: string;
          accountId: string;
          apiKey: string;
          apiSecret: string;
        }) => Promise<ApiResponse<BrokerAccount>>;
        update: (id: number, updates: {
          displayName?: string;
          accountId?: string;
          apiKey?: string;
          apiSecret?: string;
          isActive?: boolean;
        }) => Promise<ApiResponse<BrokerAccount>>;
        delete: (id: number) => Promise<ApiResponse<BrokerAccount>>;
        setDataSource: (profileId: number, brokerAccountId: number) => Promise<ApiResponse<BrokerAccount>>;
        getCurrentDataSource: (profileId: number) => Promise<ApiResponse<BrokerAccount | null>>;
      };
    };
  }
}

export {};