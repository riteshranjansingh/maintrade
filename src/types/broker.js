"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BROKER_CONFIGS = void 0;
/**
 * Available broker configurations
 */
exports.BROKER_CONFIGS = {
    zerodha: {
        type: 'zerodha',
        name: 'Zerodha (Kite)',
        description: 'India\'s largest retail stockbroker',
        website: 'https://kite.zerodha.com',
        apiDocsUrl: 'https://kite.trade',
        iconColor: '#387ed1'
    },
    fyers: {
        type: 'fyers',
        name: 'Fyers',
        description: 'Technology-driven stockbroker',
        website: 'https://fyers.in',
        apiDocsUrl: 'https://myapi.fyers.in/docsv3',
        iconColor: '#1976d2'
    },
    mstock: {
        type: 'mstock',
        name: 'Mirae Asset (mStock)',
        description: 'Full-service stockbroker',
        website: 'https://www.miraeassetcm.com',
        apiDocsUrl: 'https://www.miraeassetcm.com/api-documentation',
        iconColor: '#e91e63'
    },
    dhan: {
        type: 'dhan',
        name: 'Dhan',
        description: 'Modern trading platform',
        website: 'https://dhan.co',
        apiDocsUrl: 'https://dhanhq.co/docs',
        iconColor: '#4caf50'
    },
    shoonya: {
        type: 'shoonya',
        name: 'Shoonya (Finvasia)',
        description: 'Zero brokerage trading',
        website: 'https://shoonya.com',
        apiDocsUrl: 'https://shoonya.com/api-documentation',
        iconColor: '#ff9800'
    },
    upstox: {
        type: 'upstox',
        name: 'Upstox',
        description: 'Technology-first stockbroker',
        website: 'https://upstox.com',
        apiDocsUrl: 'https://upstox.com/developer/api-documentation',
        iconColor: '#6a1b9a'
    }
};
//# sourceMappingURL=broker.js.map