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

const HealthcareSecurityDashboard: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authStep, setAuthStep] = useState<'login' | 'verification' | 'complete'>('login');
    const [showDemo, setShowDemo] = useState(true);
    const [rbacService] = useState(new RoleBasedAccessService());
    const [blockchainService] = useState(new EnhancedBlockchainService());
    const [isLoading, setIsLoading] = useState(false);

    const authSteps: AuthStep[] = [
        { id: 'login', name: 'Login Credentials', completed: authStep !== 'login', current: authStep === 'login' },
        { id: 'verification', name: 'Biometric & 2FA Verification', completed: authStep === 'complete', current: authStep === 'verification' },
        { id: 'complete', name: 'Access Granted', completed: authStep === 'complete', current: authStep === 'complete' }
    ];

    const demoUsers: User[] = [
        {
            id: 'admin-demo',
            name: 'Dr. Sarah Administrator',
            email: 'admin@securehealthdemo.com',
            role: 'admin',
            isActive: true,
            lastLogin: new Date().toISOString(),
            permissions: rbacService.getRolePermissions('admin')
        },
        {
            id: 'doctor-demo',
            name: 'Dr. Michael Johnson',
            email: 'doctor@securehealthdemo.com',
            role: 'doctor',
            isActive: true,
            lastLogin: new Date().toISOString(),
            permissions: rbacService.getRolePermissions('doctor')
        },
        {
            id: 'patient-demo',
            name: 'Emily Patient',
            email: 'patient@securehealthdemo.com',
            role: 'patient',
            isActive: true,
            lastLogin: new Date().toISOString(),
            permissions: rbacService.getRolePermissions('patient')
        }
    ];

    useEffect(() => {
        // Initialize services
        rbacService.initializeDemoUsers();
    }, [rbacService]);

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);

        // Simulate authentication delay
        setTimeout(() => {
            const user = demoUsers.find(u => u.email === email);
            if (user && password === 'demo123') {
                setCurrentUser(user);
                rbacService.setCurrentUser(user);
                setAuthStep('verification');
            } else {
                alert('Invalid credentials. Use: admin@securehealthdemo.com, doctor@securehealthdemo.com, or patient@securehealthdemo.com with password: demo123');
            }
            setIsLoading(false);
        }, 1500);
    };

    const handleVerificationComplete = () => {
        setAuthStep('complete');
        setIsAuthenticated(true);
        // Connect to blockchain
        blockchainService.connectWallet();
    };

    const handleVerificationFailure = (error: string) => {
        console.error('Verification failed:', error);
        alert(`Verification failed: ${error}`);
        // Reset to login step on verification failure
        setAuthStep('login');
        setCurrentUser(null);
        rbacService.logout();
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setAuthStep('login');
        rbacService.logout();
        blockchainService.disconnect();
    };

    const handleDemoUserLogin = (user: User) => {
        setCurrentUser(user);
        rbacService.setCurrentUser(user);
        setIsAuthenticated(true);
        setAuthStep('complete');
        setShowDemo(false);
        blockchainService.connectWallet();
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
                return <div>Unknown user role</div>;
        }
    };

    if (isAuthenticated && currentUser) {
        return renderDashboard();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Demo Banner */}
            {showDemo && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">🚀</span>
                                <div>
                                    <h2 className="text-lg font-bold">Healthcare Security System Demo</h2>
                                    <p className="text-sm opacity-90">Experience advanced blockchain, AI, and security features</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDemo(false)}
                                className="text-white hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Quick Demo Logins */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {demoUsers.map((user) => (
                                <button
                                    key={user.id}
                                    onClick={() => handleDemoUserLogin(user)}
                                    className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg p-3 text-left hover:bg-opacity-20 transition-all"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-red-500' :
                                            user.role === 'doctor' ? 'bg-blue-500' : 'bg-green-500'
                                            }`}>
                                            <span className="text-white text-lg">
                                                {user.role === 'admin' ? '🛡️' : user.role === 'doctor' ? '🩺' : '👤'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-sm opacity-75">{user.role.toUpperCase()}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Container */}
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl">🏥</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">SecureHealth</h1>
                            <p className="text-gray-600">Advanced Healthcare Security Platform</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-4 mb-6">
                        <Badge variant="success" size="lg">🔒 End-to-End Encrypted</Badge>
                        <Badge variant="primary" size="lg">🧱 Blockchain Verified</Badge>
                        <Badge variant="secondary" size="lg">🤖 AI-Powered</Badge>
                    </div>

                    <div className="max-w-3xl mx-auto text-gray-600 text-lg">
                        <p className="mb-4">
                            Experience the future of healthcare data management with our comprehensive security platform featuring:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                                <span className="text-green-600">✅</span>
                                <span>Role-Based Access Control (RBAC)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-600">✅</span>
                                <span>NFT-Based Health Records</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-600">✅</span>
                                <span>Smart Contract Integration</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-600">✅</span>
                                <span>IPFS File Storage</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-600">✅</span>
                                <span>AI Health Assistant</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="text-green-600">✅</span>
                                <span>Firebase Real-time Sync</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Authentication Steps */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        {authSteps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed
                                        ? 'bg-green-500 text-white'
                                        : step.current
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-400'
                                        }`}>
                                        {step.completed ? '✓' : index + 1}
                                    </div>
                                    <p className={`text-sm mt-2 ${step.current ? 'text-blue-600 font-medium' : 'text-gray-500'
                                        }`}>
                                        {step.name}
                                    </p>
                                </div>
                                {index < authSteps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 ${step.completed ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Authentication Forms */}
                <div className="max-w-md mx-auto">
                    {authStep === 'login' && (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Login</h2>
                                <p className="text-gray-600">Enter your secure credentials</p>
                            </div>
                            <SimpleLoginForm onLogin={handleLogin} isLoading={isLoading} />

                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
                                <div className="space-y-1 text-xs text-blue-700">
                                    <p>• Admin: admin@securehealthdemo.com</p>
                                    <p>• Doctor: doctor@securehealthdemo.com</p>
                                    <p>• Patient: patient@securehealthdemo.com</p>
                                    <p>• Password: demo123</p>
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

                {/* Features Grid */}
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔐</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Multi-Factor Security</h3>
                        <p className="text-gray-600 text-sm">Advanced authentication with biometrics, 2FA, and role-based access control.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🧱</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Blockchain Integration</h3>
                        <p className="text-gray-600 text-sm">Immutable health records with NFT ownership and smart contract automation.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🤖</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">AI Health Assistant</h3>
                        <p className="text-gray-600 text-sm">Intelligent chatbot providing personalized health insights and recommendations.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">☁️</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Sync</h3>
                        <p className="text-gray-600 text-sm">Firebase integration for instant data synchronization across all devices.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📊</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Advanced Analytics</h3>
                        <p className="text-gray-600 text-sm">Comprehensive dashboards with health metrics and security monitoring.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">HIPAA Compliance</h3>
                        <p className="text-gray-600 text-sm">Full HIPAA compliance with end-to-end encryption and audit trails.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealthcareSecurityDashboard;
