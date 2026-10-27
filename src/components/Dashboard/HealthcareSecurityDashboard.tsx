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

    useEffect(() => {
        // These demo users are intentionally limited to the demo-only UI. They are
        // not accounts and must never grant access to real medical records.
        rbacService.initializeDemoUsers();
    }, [rbacService]);

    const handleLogin = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // This frontend-only demo must not be mistaken for production
            // authentication. Never accept a hard-coded password as identity.
            // A real deployment should authenticate with Firebase Auth or a
            // trusted backend and obtain the role from trusted claims/data.
            if (process.env.NODE_ENV === 'production') {
                alert('Sign-in is not configured for production. Please contact the system administrator.');
                return;
            }

            const isValidDemoCredential =
                password === 'demo123' &&
                ['admin@securehealthdemo.com', 'doctor@securehealthdemo.com', 'patient@securehealthdemo.com']
                    .includes(email.trim().toLowerCase());

            if (!isValidDemoCredential) {
                alert('Invalid demo credentials. Use a listed demo account and the demo password.');
                return;
            }

            // Keep demo access clearly isolated from the production data path.
            const demoRole: User['role'] =
                email.trim().toLowerCase().startsWith('admin@') ? 'admin' :
                email.trim().toLowerCase().startsWith('doctor@') ? 'doctor' : 'patient';

            const user: User = {
                id: `demo-${demoRole}`,
                name: demoRole === 'admin' ? 'Demo Administrator' :
                      demoRole === 'doctor' ? 'Demo Doctor' : 'Demo Patient',
                email: email.trim().toLowerCase(),
                role: demoRole,
                isActive: true,
                lastLogin: new Date().toISOString(),
                permissions: rbacService.getRolePermissions(demoRole)
            };

            setCurrentUser(user);
            rbacService.setCurrentUser(user);
            setAuthStep('verification');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationComplete = () => {
        // The verification component currently simulates biometrics and 2FA.
        // Do not let simulated checks grant access to a production deployment.
        if (process.env.NODE_ENV === 'production') {
            setCurrentUser(null);
            setIsAuthenticated(false);
            setAuthStep('login');
            alert('Production verification is not configured. Access was denied.');
            return;
        }
        setAuthStep('complete');
        setIsAuthenticated(true);
        void blockchainService.connectWallet();
    };

    const handleVerificationFailure = (error: string) => {
        console.error('Verification failed:', error);
        alert(`Verification failed: ${error}`);
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
            {showDemo && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-2xl">Demo</span>
                                <div>
                                    <h2 className="text-lg font-bold">Healthcare Security System — Demo Mode</h2>
                                    <p className="text-sm opacity-90">Demo users and records are for local testing only.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDemo(false)} className="text-white hover:text-gray-200" aria-label="Hide demo banner">✕</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-2xl">🏥</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">SecureHealth</h1>
                            <p className="text-gray-600">Healthcare Security Platform — Demo</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                        <Badge variant="secondary" size="lg">Encryption features — verify before production</Badge>
                        <Badge variant="primary" size="lg">Blockchain features — verify before production</Badge>
                    </div>
                    <p className="max-w-3xl mx-auto text-gray-600 text-lg">
                        This repository currently uses simulated authentication and demo data. Do not enter real patient information.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-8">
                    <div className="flex items-center justify-between">
                        {authSteps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : step.current ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                        {step.completed ? '✓' : index + 1}
                                    </div>
                                    <p className={`text-sm mt-2 ${step.current ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>{step.name}</p>
                                </div>
                                {index < authSteps.length - 1 && <div className={`flex-1 h-1 mx-4 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="max-w-md mx-auto">
                    {authStep === 'login' && (
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Demo Login</h2>
                                <p className="text-gray-600">For local testing only. Production sign-in is disabled until a trusted provider is configured.</p>
                            </div>
                            <SimpleLoginForm onLogin={handleLogin} isLoading={isLoading} />
                            {process.env.NODE_ENV !== 'production' && (
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800 font-medium mb-2">Local demo credentials</p>
                                    <div className="space-y-1 text-xs text-blue-700">
                                        <p>Admin: admin@securehealthdemo.com</p>
                                        <p>Doctor: doctor@securehealthdemo.com</p>
                                        <p>Patient: patient@securehealthdemo.com</p>
                                        <p>Password: demo123</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {authStep === 'verification' && currentUser && (
                        <VerificationFlow
                            isOpen={true}
                            onClose={() => { setAuthStep('login'); setCurrentUser(null); }}
                            onComplete={handleVerificationComplete}
                            onFailure={handleVerificationFailure}
                        />
                    )}
                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        ['Role-based UI', 'Dashboard views are demo UI, not a production authorization boundary.'],
                        ['Encryption', 'Encryption functionality requires independent security testing.'],
                        ['Blockchain', 'Do not store patient details or identifiable health data on-chain.'],
                        ['Real-time data', 'Firebase access must be constrained with server-enforced rules.'],
                        ['AI assistant', 'AI outputs should not be treated as medical advice.'],
                        ['Privacy', 'Use synthetic records until security controls are verified.']
                    ].map(([title, description]) => (
                        <div key={title} className="bg-white rounded-lg shadow-lg p-6 text-center">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-600 text-sm">{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HealthcareSecurityDashboard;
