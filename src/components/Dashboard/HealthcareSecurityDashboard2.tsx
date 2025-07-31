import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { RoleBasedAccessService } from '../../services/rbacService';
import EnhancedBlockchainService from '../../services/enhancedBlockchain';

// Auth Components
import SimpleLoginForm from '../Auth/SimpleLoginForm';
import VerificationFlow from '../Auth/VerificationFlow';

// Dashboard Components
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import PatientDashboard from './PatientDashboard';

// UI Components
import Badge from '../UI/Badge';

interface AuthStep {
    id: string;
    name: string;
    completed: boolean;
    current: boolean;
}

/**
 * Enhanced Healthcare Security Dashboard Version 2
 * Features improved UX, streamlined authentication flow, and enhanced security monitoring
 */
const HealthcareSecurityDashboard2: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authStep, setAuthStep] = useState<'login' | 'verification' | 'complete'>('login');
    const [showDemo, setShowDemo] = useState(true);
    const [rbacService] = useState(new RoleBasedAccessService());
    const [blockchainService] = useState(new EnhancedBlockchainService());
    const [isLoading, setIsLoading] = useState(false);
    const [securityMetrics, setSecurityMetrics] = useState({
        successfulLogins: 0,
        failedAttempts: 0,
        activeUsers: 0,
        securityAlerts: 0
    });

    const authSteps: AuthStep[] = [
        { id: 'login', name: 'Secure Login', completed: authStep !== 'login', current: authStep === 'login' },
        { id: 'verification', name: 'Enhanced Verification', completed: authStep === 'complete', current: authStep === 'verification' },
        { id: 'complete', name: 'Dashboard Access', completed: authStep === 'complete', current: authStep === 'complete' }
    ];

    const demoUsers: User[] = [
        {
            id: 'admin-v2',
            name: 'Dr. Sarah Security Admin',
            email: 'admin@healthsecure.v2.com',
            role: 'admin',
            isActive: true,
            lastLogin: new Date().toISOString(),
            permissions: rbacService.getRolePermissions('admin')
        },
        {
            id: 'doctor-v2',
            name: 'Dr. Michael Healthcare',
            email: 'doctor@healthsecure.v2.com',
            role: 'doctor',
            isActive: true,
            lastLogin: new Date().toISOString(),
            permissions: rbacService.getRolePermissions('doctor')
        },
        {
            id: 'patient-v2',
            name: 'Emma PatientUser',
            email: 'patient@healthsecure.v2.com',
            role: 'patient',
            isActive: true,
            lastLogin: new Date().toISOString(),
            permissions: rbacService.getRolePermissions('patient')
        }
    ];

    useEffect(() => {
        // Initialize services and security metrics
        rbacService.initializeDemoUsers();
        updateSecurityMetrics();
    }, [rbacService]);

    const updateSecurityMetrics = () => {
        setSecurityMetrics({
            successfulLogins: Math.floor(Math.random() * 100) + 50,
            failedAttempts: Math.floor(Math.random() * 10),
            activeUsers: Math.floor(Math.random() * 25) + 15,
            securityAlerts: Math.floor(Math.random() * 3)
        });
    };

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);

        // Simulate enhanced authentication delay
        setTimeout(() => {
            const user = demoUsers.find(u => u.email === email);
            if (user && password === 'secure123') {
                setCurrentUser(user);
                rbacService.setCurrentUser(user);
                setAuthStep('verification');
                updateSecurityMetrics();
            } else {
                alert('❌ Invalid credentials. Use: admin@healthsecure.v2.com, doctor@healthsecure.v2.com, or patient@healthsecure.v2.com with password: secure123');
                setSecurityMetrics(prev => ({ ...prev, failedAttempts: prev.failedAttempts + 1 }));
            }
            setIsLoading(false);
        }, 1500);
    };

    const handleVerificationComplete = () => {
        setAuthStep('complete');
        setIsAuthenticated(true);
        // Connect to enhanced blockchain
        blockchainService.connectWallet();
        setSecurityMetrics(prev => ({
            ...prev,
            successfulLogins: prev.successfulLogins + 1,
            activeUsers: prev.activeUsers + 1
        }));
    };

    const handleVerificationFailure = (error: string) => {
        console.error('Enhanced verification failed:', error);
        alert(`🔐 Enhanced Verification Failed: ${error}`);
        // Reset to login step on verification failure
        setAuthStep('login');
        setCurrentUser(null);
        rbacService.logout();
        setSecurityMetrics(prev => ({ ...prev, securityAlerts: prev.securityAlerts + 1 }));
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setAuthStep('login');
        rbacService.logout();
        blockchainService.disconnect();
        setSecurityMetrics(prev => ({ ...prev, activeUsers: Math.max(0, prev.activeUsers - 1) }));
    };

    const handleDemoUserLogin = (user: User) => {
        setCurrentUser(user);
        rbacService.setCurrentUser(user);
        setIsAuthenticated(true);
        setAuthStep('complete');
        setShowDemo(false);
        blockchainService.connectWallet();
        updateSecurityMetrics();
    };

    const renderDashboard = () => {
        if (!currentUser) return null;

        switch (currentUser.role) {
            case 'admin':
                return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
            case 'doctor':
                return <DoctorDashboard user={currentUser} onLogout={handleLogout} />;
            case 'patient':
                return <PatientDashboard user={currentUser} onLogout={handleLogout} />;
            default:
                return <div className="text-red-600">❌ Unknown user role: {currentUser.role}</div>;
        }
    };

    if (isAuthenticated && currentUser) {
        return renderDashboard();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Enhanced Header */}
            <header className="bg-white shadow-lg border-b-2 border-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    🏥 HealthSecure Dashboard v2.0
                                </h1>
                            </div>
                            <div className="flex space-x-2">
                                <Badge variant="success" size="sm">🔒 Enhanced Security</Badge>
                                <Badge variant="primary" size="sm">⚡ Real-time Sync</Badge>
                                <Badge variant="secondary" size="sm">🛡️ HIPAA+</Badge>
                            </div>
                        </div>

                        {/* Security Metrics Display */}
                        <div className="flex items-center space-x-6 text-sm">
                            <div className="text-center">
                                <div className="font-bold text-green-600">{securityMetrics.successfulLogins}</div>
                                <div className="text-gray-500">Successful</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-red-600">{securityMetrics.failedAttempts}</div>
                                <div className="text-gray-500">Failed</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-blue-600">{securityMetrics.activeUsers}</div>
                                <div className="text-gray-500">Active</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-yellow-600">{securityMetrics.securityAlerts}</div>
                                <div className="text-gray-500">Alerts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Enhanced Progress Steps */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <nav aria-label="Enhanced Authentication Progress">
                        <ol className="flex items-center justify-center space-x-8">
                            {authSteps.map((step, index) => (
                                <li key={step.id} className="flex items-center">
                                    <div className="flex items-center">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${step.completed
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : step.current
                                                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                                                    : 'border-gray-300 text-gray-500'
                                            }`}>
                                            {step.completed ? (
                                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <span className="text-sm font-bold">{index + 1}</span>
                                            )}
                                        </div>
                                        <span className={`ml-3 text-sm font-medium ${step.current ? 'text-indigo-600' : step.completed ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                            {step.name}
                                        </span>
                                    </div>
                                    {index < authSteps.length - 1 && (
                                        <svg className="ml-8 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Enhanced Demo Quick Access */}
                {showDemo && (
                    <div className="mb-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-8 border border-indigo-200">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-indigo-900 mb-2">🚀 Enhanced Demo Mode</h2>
                            <p className="text-indigo-700">Experience the next-generation healthcare security platform</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {demoUsers.map((user) => (
                                <div key={user.id} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-100">
                                    <div className="text-center">
                                        <div className="text-4xl mb-3">
                                            {user.role === 'admin' ? '👩‍💼' : user.role === 'doctor' ? '👨‍⚕️' : '👤'}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">{user.name}</h3>
                                        <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                                        <Badge variant={user.role === 'admin' ? 'error' : user.role === 'doctor' ? 'primary' : 'success'} size="sm" className="mb-4">
                                            {user.role.toUpperCase()}
                                        </Badge>
                                        <button
                                            onClick={() => handleDemoUserLogin(user)}
                                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                        >
                                            Quick Access
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Enhanced Authentication Forms */}
                <div className="max-w-md mx-auto">
                    {authStep === 'login' && (
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Login</h2>
                                <p className="text-gray-600">Access your secure healthcare dashboard</p>
                            </div>

                            <SimpleLoginForm onLogin={handleLogin} isLoading={isLoading} />

                            <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                                <p className="text-sm text-indigo-800 font-medium mb-3">🔐 Enhanced Demo Credentials:</p>
                                <div className="space-y-2 text-xs text-indigo-700">
                                    <p>• Admin: admin@healthsecure.v2.com</p>
                                    <p>• Doctor: doctor@healthsecure.v2.com</p>
                                    <p>• Patient: patient@healthsecure.v2.com</p>
                                    <p>• Password: <span className="font-mono font-bold">secure123</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {authStep === 'verification' && (
                        <VerificationFlow
                            isOpen={true}
                            onClose={() => setAuthStep('login')}
                            onComplete={handleVerificationComplete}
                            onFailure={handleVerificationFailure}
                        />
                    )}
                </div>

                {/* Enhanced Features Grid */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-blue-100 hover:shadow-xl transition-all duration-300">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🔐</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Enhanced Multi-Factor Security</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Advanced biometric authentication, real email 2FA, and adaptive security protocols with real-time threat detection.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-purple-100 hover:shadow-xl transition-all duration-300">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Analytics</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Live security metrics, user activity monitoring, and predictive threat analysis with ML-powered insights.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-green-100 hover:shadow-xl transition-all duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🛡️</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Enhanced HIPAA Compliance</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Advanced compliance monitoring, automated audit trails, and enhanced data protection with quantum-resistant encryption.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareSecurityDashboard2;
