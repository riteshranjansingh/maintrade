import React, { useState, useEffect } from 'react';
import { Profile } from '../../types/profile';
import type { BrokerAccount, BrokerType } from '../../types/broker';
import { BROKER_CONFIGS } from '../../types/broker';

interface BrokerManagementProps {
  profile: Profile;
  onClose: () => void;
}

const BrokerManagement: React.FC<BrokerManagementProps> = ({ profile, onClose }) => {
  const [brokerAccounts, setBrokerAccounts] = useState<BrokerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch broker accounts for this profile
  useEffect(() => {
    fetchBrokerAccounts();
  }, [profile.id]);

  const fetchBrokerAccounts = async () => {
    try {
      setLoading(true);
      const response = await window.electronAPI.brokerAccounts.getByProfile(profile.id);
      if (response.success) {
        setBrokerAccounts(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch broker accounts');
      }
    } catch (err) {
      setError('Failed to fetch broker accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBroker = async (brokerId: number) => {
    if (!window.confirm('Are you sure you want to delete this broker account?')) {
      return;
    }

    try {
      const response = await window.electronAPI.brokerAccounts.delete(brokerId);
      if (response.success) {
        // Refresh the list
        fetchBrokerAccounts();
      } else {
        setError(response.error || 'Failed to delete broker account');
      }
    } catch (err) {
      setError('Failed to delete broker account');
    }
  };

  const handleSetDataSource = async (brokerId: number) => {
    try {
      const response = await window.electronAPI.brokerAccounts.setDataSource(profile.id, brokerId);
      if (response.success) {
        // Refresh the list to update data source selection
        fetchBrokerAccounts();
      } else {
        setError(response.error || 'Failed to set data source');
      }
    } catch (err) {
      setError('Failed to set data source');
    }
  };

  // Get available brokers (not already added)
  const getAvailableBrokers = () => {
    const addedBrokers = brokerAccounts.map(account => account.brokerName);
    return Object.keys(BROKER_CONFIGS).filter(broker => !addedBrokers.includes(broker as BrokerType));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto m-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Manage Brokers - {profile.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading broker accounts...</div>
          ) : (
            <>
              {/* Add New Broker Button */}
              {getAvailableBrokers().length > 0 && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    {showAddForm ? 'Cancel' : 'Add Broker Account'}
                  </button>
                </div>
              )}

              {/* Add Broker Form */}
              {showAddForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-md">
                  <AddBrokerForm
                    profileId={profile.id}
                    availableBrokers={getAvailableBrokers()}
                    onSuccess={() => {
                      setShowAddForm(false);
                      fetchBrokerAccounts();
                    }}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              )}

              {/* Broker Accounts List */}
              {brokerAccounts.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No broker accounts found. Add your first broker account to get started.
                </div>
              ) : (
                <div className="space-y-4">
                  {brokerAccounts.map((account) => (
                    <BrokerAccountCard
                      key={account.id}
                      account={account}
                      onDelete={handleDeleteBroker}
                      onSetDataSource={handleSetDataSource}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Broker Form Component
interface AddBrokerFormProps {
  profileId: number;
  availableBrokers: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

const AddBrokerForm: React.FC<AddBrokerFormProps> = ({
  profileId,
  availableBrokers,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    brokerName: '' as BrokerType,
    displayName: '',
    accountId: '',
    apiKey: '',
    apiSecret: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brokerName || !formData.displayName || !formData.accountId || !formData.apiKey || !formData.apiSecret) {
      setError('All fields are required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await window.electronAPI.brokerAccounts.create({
        profileId,
        ...formData
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error || 'Failed to create broker account');
      }
    } catch (err) {
      setError('Failed to create broker account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-medium">Add New Broker Account</h3>
      
      {error && (
        <div className="p-3 text-red-700 bg-red-100 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Broker Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Broker
          </label>
          <select
            value={formData.brokerName}
            onChange={(e) => {
              const brokerName = e.target.value as BrokerType;
              setFormData({
                ...formData,
                brokerName,
                displayName: brokerName ? `My ${BROKER_CONFIGS[brokerName].name} Account` : ''
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Broker</option>
            {availableBrokers.map((broker) => (
              <option key={broker} value={broker}>
                {BROKER_CONFIGS[broker as BrokerType].name}
              </option>
            ))}
          </select>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="My Zerodha Account"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Account ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account ID
          </label>
          <input
            type="text"
            value={formData.accountId}
            onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
            placeholder="Your broker account ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            placeholder="Your API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* API Secret */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Secret
          </label>
          <input
            type="password"
            value={formData.apiSecret}
            onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
            placeholder="Your API secret"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add Broker'}
        </button>
      </div>
    </form>
  );
};

// Broker Account Card Component
interface BrokerAccountCardProps {
  account: BrokerAccount;
  onDelete: (id: number) => void;
  onSetDataSource: (id: number) => void;
}

const BrokerAccountCard: React.FC<BrokerAccountCardProps> = ({
  account,
  onDelete,
  onSetDataSource
}) => {
  const brokerConfig = BROKER_CONFIGS[account.brokerName];
  
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: brokerConfig.iconColor }}
          ></div>
          <div>
            <h4 className="font-medium">{account.displayName}</h4>
            <p className="text-sm text-gray-500">{brokerConfig.name}</p>
            <p className="text-xs text-gray-400">Account: {account.accountId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Data Source Badge */}
          {account.supportsData && (
            <div className="flex items-center space-x-2">
              {account.isSelectedForData ? (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  📊 Data Source
                </span>
              ) : (
                <button
                  onClick={() => onSetDataSource(account.id)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                >
                  Set as Data Source
                </button>
              )}
            </div>
          )}
          
          {/* Status */}
          <span className={`px-2 py-1 text-xs rounded ${
            account.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {account.isActive ? 'Active' : 'Inactive'}
          </span>
          
          {/* Actions */}
          <button
            onClick={() => onDelete(account.id)}
            className="px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* Capabilities */}
      <div className="mt-2 flex space-x-2">
        {account.supportsTrading && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
            📈 Trading
          </span>
        )}
        {account.supportsData && (
          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
            📊 Data
          </span>
        )}
      </div>
    </div>
  );
};

export default BrokerManagement;