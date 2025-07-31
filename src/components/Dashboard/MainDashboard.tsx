import React, { useState } from 'react';
import Badge from '../UI/Badge';
import Timer from '../UI/Timer';
import DoctorEncryptionDashboard from './DoctorEncryptionDashboard';
import { User, MedicalRecord, Transaction, SecurityAlert } from '../../types';

interface MainDashboardProps {
  user: User;
  onLogout: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'encryption'>('dashboard');
  const [sessionTimeLeft, setSessionTimeLeft] = useState(1800); // 30 minutes
  const [recentRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      patientId: user.id,
      doctorId: 'dr-smith',
      title: 'Annual Checkup',
      description: 'Routine health examination',
      date: '2025-07-04',
      diagnosis: 'Healthy',
      prescription: 'Continue current lifestyle',
      isEncrypted: true,
      blockchainHash: '0xabc123...def456',
      isVerified: true,
      accessPermissions: [user.id, 'dr-smith']
    }
  ]);

  const [recentTransactions] = useState<Transaction[]>([
    {
      id: '1',
      hash: '0xabc123def456...',
      type: 'record_upload',
      timestamp: '2025-07-04T10:30:00Z',
      status: 'confirmed',
      gasUsed: '21000',
      blockNumber: 12345678
    }
  ]);

  const [securityAlerts] = useState<SecurityAlert[]>([
    {
      id: '1',
      type: 'suspicious_login',
      severity: 'medium',
      message: 'Login from new device detected',
      timestamp: '2025-07-04T09:15:00Z',
      isResolved: false
    }
  ]);

  const handleSessionExpire = () => {
    alert('Session expired for security. Please login again.');
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">SecureHealth</h1>
              </div>
              <div className="ml-4">
                <Badge variant="success" size="sm">🔒 Encrypted</Badge>
                <Badge variant="primary" size="sm" className="ml-2">🧱 On-Chain Verified</Badge>
              </div>

              {/* Navigation Tabs */}
              <div className="ml-8 flex space-x-4">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('encryption')}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${activeTab === 'encryption'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  🔒 File Encryption
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Timer
                duration={sessionTimeLeft}
                onExpire={handleSessionExpire}
                className="text-sm"
              />

              <div className="flex items-center space-x-2">
                <img
                  className="h-8 w-8 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                  alt={user.name}
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-gray-500">{user.role}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'encryption' ? (
          <DoctorEncryptionDashboard />
        ) : (
          <>
            {/* Security Alerts */}
            {securityAlerts.filter(alert => !alert.isResolved).length > 0 && (
              <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Security Alert</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      {securityAlerts.filter(alert => !alert.isResolved).map(alert => (
                        <div key={alert.id}>{alert.message}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Records</dt>
                        <dd className="text-lg font-medium text-gray-900">24</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Badge variant="success" size="sm">All Encrypted</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Blockchain Txns</dt>
                        <dd className="text-lg font-medium text-gray-900">156</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Badge variant="primary" size="sm">On-Chain Verified</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Security Score</dt>
                        <dd className="text-lg font-medium text-gray-900">98%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Badge variant="success" size="sm">Excellent</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Access Grants</dt>
                        <dd className="text-lg font-medium text-gray-900">12</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <Badge variant="info" size="sm">Active</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Medical Records */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Recent Medical Records
                  </h3>
                  <div className="space-y-4">
                    {recentRecords.map(record => (
                      <div key={record.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{record.title}</h4>
                          <div className="flex space-x-2">
                            {record.isEncrypted && <Badge variant="success" size="sm">🔒 Encrypted</Badge>}
                            {record.isVerified && <Badge variant="primary" size="sm">✅ Verified</Badge>}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>{record.date}</span>
                          {record.blockchainHash && (
                            <span className="font-mono">
                              Hash: {record.blockchainHash.substring(0, 10)}...
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Blockchain Transactions */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Blockchain Transactions
                  </h3>
                  <div className="space-y-4">
                    {recentTransactions.map(tx => (
                      <div key={tx.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {tx.type.replace('_', ' ').toUpperCase()}
                            </span>
                            {tx.status === 'confirmed' && <Badge variant="success" size="sm">✅ Confirmed</Badge>}
                            {tx.status === 'pending' && <Badge variant="warning" size="sm">⏳ Pending</Badge>}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                          {tx.hash.substring(0, 20)}...
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(tx.timestamp).toLocaleString()}</span>
                          <span>Block: {tx.blockNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MainDashboard;
