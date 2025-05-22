/**
 * Profile type definition
 */
export interface Profile {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Broker account type definition
 */
export interface BrokerAccount {
  id: number;
  brokerName: string;
  accountId: string;
  apiKey: string;
  apiSecret: string;
  isActive: boolean;
  profileId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Supported broker types
 */
export type BrokerType = 'zerodha' | 'fyers' | 'dhan' | 'shoonya' | 'mstock' | 'upstox';

/**
 * API Response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}