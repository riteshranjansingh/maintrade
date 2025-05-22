/**
 * Supported broker types
 */
export type BrokerType = 'zerodha' | 'fyers' | 'mstock' | 'dhan' | 'shoonya' | 'upstox'

/**
 * Broker account interface
 */
export interface BrokerAccount {
  id: number
  profileId: number
  brokerName: BrokerType
  accountId: string
  displayName: string // User-friendly name like "My Zerodha Account"
  apiKey: string // This will be encrypted in database
  apiSecret: string // This will be encrypted in database
  supportsTrading: boolean
  supportsData: boolean
  isActive: boolean
  isSelectedForData: boolean
  dailyDataRequests: number
  monthlyDataRequests: number
  lastResetDate: string
  createdAt: string
  updatedAt: string
}

/**
 * Broker account creation data
 */
export interface CreateBrokerAccountData {
  profileId: number
  brokerName: BrokerType
  accountId: string
  displayName: string
  apiKey: string
  apiSecret: string
}

/**
 * Broker account update data
 */
export interface UpdateBrokerAccountData {
  displayName?: string
  accountId?: string
  apiKey?: string
  apiSecret?: string
  isActive?: boolean
}

/**
 * Broker configuration for UI
 */
export interface BrokerConfig {
  type: BrokerType
  name: string
  description: string
  website: string
  apiDocsUrl: string
  iconColor: string
}

/**
 * Available broker configurations
 */
export const BROKER_CONFIGS = {
  zerodha: {
    type: 'zerodha' as const,
    name: 'Zerodha (Kite)',
    description: 'India\'s largest retail stockbroker',
    website: 'https://kite.zerodha.com',
    apiDocsUrl: 'https://kite.trade',
    iconColor: '#387ed1'
  },
  fyers: {
    type: 'fyers' as const,
    name: 'Fyers',
    description: 'Technology-driven stockbroker',
    website: 'https://fyers.in',
    apiDocsUrl: 'https://myapi.fyers.in/docsv3',
    iconColor: '#1976d2'
  },
  mstock: {
    type: 'mstock' as const,
    name: 'Mirae Asset (mStock)',
    description: 'Full-service stockbroker',
    website: 'https://www.miraeassetcm.com',
    apiDocsUrl: 'https://www.miraeassetcm.com/api-documentation',
    iconColor: '#e91e63'
  },
  dhan: {
    type: 'dhan' as const,
    name: 'Dhan',
    description: 'Modern trading platform',
    website: 'https://dhan.co',
    apiDocsUrl: 'https://dhanhq.co/docs',
    iconColor: '#4caf50'
  },
  shoonya: {
    type: 'shoonya' as const,
    name: 'Shoonya (Finvasia)',
    description: 'Zero brokerage trading',
    website: 'https://shoonya.com',
    apiDocsUrl: 'https://shoonya.com/api-documentation',
    iconColor: '#ff9800'
  },
  upstox: {
    type: 'upstox' as const,
    name: 'Upstox',
    description: 'Technology-first stockbroker',
    website: 'https://upstox.com',
    apiDocsUrl: 'https://upstox.com/developer/api-documentation',
    iconColor: '#6a1b9a'
  }
} as const;