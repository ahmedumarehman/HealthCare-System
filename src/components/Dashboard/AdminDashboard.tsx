import React, { useState, useEffect } from 'react';
import Badge from '../UI/Badge';
import Timer from '../UI/Timer';
import { User, Transaction, SecurityAlert, SystemMetrics } from '../../types';
import { RoleBasedAccessService } from '../../services/rbacService';

interface AdminDashboardProps {
    user: User;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [sessionTimeLeft] = useState(1800);
    const [rbacService] = useState(new RoleBasedAccessService());
    const [systemMetrics] = useState<SystemMetrics>({
        totalUsers: 1245,
        activeUsers: 342,
        totalRecords: 98765,
        securityAlerts: 7,
        blockchainTransactions: 23456,
        systemUptime: '99.98%',
        dataIntegrity: '100%',
        encryptionStatus: 'Active'
    });

    const [recentSecurityAlerts] = useState<SecurityAlert[]>([
        {
            id: '1',
            type: 'suspicious_login',
            severity: 'high',
            message: 'Multiple failed login attempts from IP 192.168.1.100',
            timestamp: '2025-07-04T10:30:00Z',
            isResolved: false
        },
        {
            id: '2',
            type: 'unauthorized_access',
            severity: 'medium',
            message: 'Unauthorized access attempt to patient records',
            timestamp: '2025-07-04T09:15:00Z',
            isResolved: false
        },
        {
            id: '3',
            type: 'unauthorized_access',
            severity: 'low',
            message: 'Unusual network traffic pattern detected',
            timestamp: '2025-07-04T08:45:00Z',
            isResolved: true
        }
    ]);

    const [recentTransactions] = useState<Transaction[]>([
        {
            id: '1',
            hash: '0xabc123def456789...',
            type: 'record_upload',
            timestamp: '2025-07-04T11:00:00Z',
            status: 'confirmed',
            gasUsed: '21000',
            blockNumber: 12345678
        },
        {
            id: '2',
            hash: '0xdef456abc123789...',
            type: 'access_grant',
            timestamp: '2025-07-04T10:45:00Z',
            status: 'confirmed',
            gasUsed: '18500',
            blockNumber: 12345677
        }
    ]);

    const [allUsers] = useState<User[]>([
        {
            id: 'admin-1',
            name: 'John Admin',
            email: 'admin@hospital.com',
            role: 'admin',
            isActive: true,
            lastLogin: '2025-07-04T11:30:00Z',
            permissions: []
        },
        {
            id: 'doctor-1',
            name: 'Dr. Sarah Smith',
            email: 'sarah.smith@hospital.com',
            role: 'doctor',
            isActive: true,
            lastLogin: '2025-07-04T10:15:00Z',
            permissions: []
        },
        {
            id: 'patient-1',
            name: 'Michael Johnson',
            email: 'mjohnson@email.com',
            role: 'patient',
            isActive: true,
            lastLogin: '2025-07-04T09:30:00Z',
            permissions: []
        }
    ]);

    useEffect(() => {
        rbacService.setCurrentUser(user);
    }, [user, rbacService]);

    const handleSessionExpire = () => {
        window.confirm('Session expired for security. Please login again.') && onLogout();
    };

    const handleResolveAlert = (alertId: string) => {
        // In a real app, this would call an API
        console.log(`Resolving alert: ${alertId}`);
    };

    const handleUserAction = (userId: string, action: string) => {
        switch (action) {
            case 'edit':
                alert(`Opening user editor for user ID: ${userId}\n\nThis would typically open a modal or redirect to an edit form where you can modify user details, permissions, and settings.`);
                break;
            case 'activate':
                alert(`User ${userId} has been activated successfully!\n\nThe user can now access the system and perform their assigned role functions.`);
                break;
            case 'deactivate':
                alert(`User ${userId} has been deactivated.\n\nThe user's access has been suspended and they cannot log into the system until reactivated.`);
                break;
            default:
                console.log(`Admin action: ${action} on user ${userId}`);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold text-gray-900">🏥 Admin Dashboard</h1>
                            </div>
                            <div className="ml-4">
                                <Badge variant="success" size="sm">🔒 System Secure</Badge>
                                <Badge variant="primary" size="sm" className="ml-2">🛡️ Admin Access</Badge>
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
                                    src={`https://ui-avatars.com/api/?name=${user.name}&background=dc2626&color=fff`}
                                    alt={user.name}
                                />
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-red-600 font-semibold">{user.role.toUpperCase()}</div>
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
                {/* System Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalUsers}</p>
                                <p className="text-sm text-green-600">{systemMetrics.activeUsers} active</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <span className="text-2xl">📁</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Medical Records</p>
                                <p className="text-2xl font-bold text-gray-900">{systemMetrics.totalRecords}</p>
                                <p className="text-sm text-green-600">All encrypted</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Security Alerts</p>
                                <p className="text-2xl font-bold text-gray-900">{systemMetrics.securityAlerts}</p>
                                <p className="text-sm text-yellow-600">Needs attention</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <span className="text-2xl">🧱</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Blockchain Txns</p>
                                <p className="text-2xl font-bold text-gray-900">{systemMetrics.blockchainTransactions}</p>
                                <p className="text-sm text-green-600">All verified</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Security Alerts */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">🚨 Security Alerts</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentSecurityAlerts.map((alert) => (
                                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                                                    {alert.severity.toUpperCase()}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(alert.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-900">{alert.message}</p>
                                        </div>
                                        {!alert.isResolved && (
                                            <button
                                                onClick={() => handleResolveAlert(alert.id)}
                                                className="ml-4 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* User Management */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">👥 User Management</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {allUsers.map((u) => (
                                    <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={`https://ui-avatars.com/api/?name=${u.name}&background=random`}
                                                alt={u.name}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                                <p className="text-sm text-gray-500">{u.email}</p>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant={u.role === 'admin' ? 'error' : u.role === 'doctor' ? 'primary' : 'secondary'} size="sm">
                                                        {u.role}
                                                    </Badge>
                                                    <Badge variant={u.isActive ? 'success' : 'secondary'} size="sm">
                                                        {u.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleUserAction(u.id, 'edit')}
                                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleUserAction(u.id, u.isActive ? 'deactivate' : 'activate')}
                                                className={`px-2 py-1 rounded text-xs ${u.isActive
                                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Blockchain Transactions */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">🧱 Recent Blockchain Activity</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {recentTransactions.map((tx) => (
                                    <div key={tx.id} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {tx.type.replace('_', ' ').toUpperCase()}
                                                </p>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {tx.hash}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Block: {tx.blockNumber} | Gas: {tx.gasUsed}
                                                </p>
                                            </div>
                                            <Badge variant="success" size="sm">
                                                {tx.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* System Health */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">💚 System Health</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">System Uptime</span>
                                    <Badge variant="success" size="sm">{systemMetrics.systemUptime}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Data Integrity</span>
                                    <Badge variant="success" size="sm">{systemMetrics.dataIntegrity}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Encryption Status</span>
                                    <Badge variant="success" size="sm">{systemMetrics.encryptionStatus}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Blockchain Sync</span>
                                    <Badge variant="success" size="sm">Synchronized</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">IPFS Status</span>
                                    <Badge variant="success" size="sm">Connected</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Logs and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* System Logs */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">📋 System Logs</h3>
                            <p className="text-sm text-gray-500 mt-1">Recent system activity and audit trails</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {[
                                    { time: '14:32:15', action: 'User Login', user: 'Dr. Sarah Smith', status: 'success', details: 'Two-factor authentication successful' },
                                    { time: '14:30:42', action: 'Record Access', user: 'Michael Johnson', status: 'success', details: 'Accessed medical record MR-001' },
                                    { time: '14:28:19', action: 'Encryption Event', user: 'System', status: 'success', details: 'Encrypted 3 medical records' },
                                    { time: '14:25:37', action: 'Blockchain Sync', user: 'System', status: 'success', details: 'Synchronized 5 transactions' },
                                    { time: '14:22:14', action: 'Access Request', user: 'Dr. John Doe', status: 'pending', details: 'Requesting access to patient records' },
                                    { time: '14:19:58', action: 'NFT Mint', user: 'Dr. Sarah Smith', status: 'success', details: 'Minted health record NFT #HRN-045' },
                                    { time: '14:17:33', action: 'Insurance Claim', user: 'Michael Johnson', status: 'success', details: 'Submitted claim #CLM-2025-089' },
                                    { time: '14:15:22', action: 'Security Alert', user: 'System', status: 'warning', details: 'Suspicious login attempt detected' }
                                ].map((log, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                                        <div className="text-xs text-gray-500 w-16 flex-shrink-0">{log.time}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2">
                                                <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                                <Badge variant={log.status === 'success' ? 'success' : log.status === 'warning' ? 'warning' : 'secondary'} size="sm">
                                                    {log.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-600">{log.user} - {log.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Analytics */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">📊 System Analytics</h3>
                            <p className="text-sm text-gray-500 mt-1">Real-time system performance metrics</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {/* Activity Metrics */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">📈 Activity Trends (Last 24h)</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">User Logins</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                                                </div>
                                                <span className="text-sm font-medium">156</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Records Created</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                                                </div>
                                                <span className="text-sm font-medium">42</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Blockchain Txns</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                                                </div>
                                                <span className="text-sm font-medium">123</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">NFTs Minted</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '34%' }}></div>
                                                </div>
                                                <span className="text-sm font-medium">18</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Metrics */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">🔒 Security Status</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-center p-3 bg-green-50 rounded-lg">
                                            <div className="text-lg font-bold text-green-600">99.9%</div>
                                            <div className="text-xs text-green-600">Security Score</div>
                                        </div>
                                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                                            <div className="text-lg font-bold text-blue-600">0</div>
                                            <div className="text-xs text-blue-600">Active Threats</div>
                                        </div>
                                        <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                            <div className="text-lg font-bold text-yellow-600">3</div>
                                            <div className="text-xs text-yellow-600">Pending Reviews</div>
                                        </div>
                                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                                            <div className="text-lg font-bold text-purple-600">100%</div>
                                            <div className="text-xs text-purple-600">Data Encrypted</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Indicators */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">⚡ Performance</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Response Time</span>
                                            <span className="font-medium text-green-600">45ms</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Database Load</span>
                                            <span className="font-medium text-blue-600">23%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">IPFS Sync</span>
                                            <span className="font-medium text-green-600">Active</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Memory Usage</span>
                                            <span className="font-medium text-yellow-600">67%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
