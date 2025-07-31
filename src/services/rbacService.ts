import { User, UserRole, Permission } from '../types';

export class RoleBasedAccessService {
    private currentUser: User | null = null;

    // Default permissions for each role
    private rolePermissions: Record<string, Permission[]> = {
        admin: [
            {
                id: 'admin_all',
                name: 'Full System Access',
                description: 'Complete access to all system resources',
                resource: '*',
                actions: ['create', 'read', 'update', 'delete']
            },
            {
                id: 'user_management',
                name: 'User Management',
                description: 'Manage all users and their roles',
                resource: 'users',
                actions: ['create', 'read', 'update', 'delete']
            },
            {
                id: 'system_settings',
                name: 'System Settings',
                description: 'Configure system-wide settings',
                resource: 'settings',
                actions: ['create', 'read', 'update', 'delete']
            }
        ],
        doctor: [
            {
                id: 'patient_records_full',
                name: 'Patient Records Management',
                description: 'Full access to patient medical records',
                resource: 'medical_records',
                actions: ['create', 'read', 'update', 'delete']
            },
            {
                id: 'prescription_management',
                name: 'Prescription Management',
                description: 'Create and manage prescriptions',
                resource: 'prescriptions',
                actions: ['create', 'read', 'update', 'delete']
            },
            {
                id: 'patient_data_read',
                name: 'Patient Data Access',
                description: 'View patient information and history',
                resource: 'patients',
                actions: ['read']
            },
            {
                id: 'insurance_claims',
                name: 'Insurance Claims',
                description: 'Submit and manage insurance claims',
                resource: 'insurance',
                actions: ['create', 'read', 'update']
            },
            {
                id: 'blockchain_signing',
                name: 'Blockchain Signing',
                description: 'Sign smart contracts and blockchain transactions',
                resource: 'blockchain',
                actions: ['create', 'read']
            }
        ],
        patient: [
            {
                id: 'own_records_read',
                name: 'Own Medical Records',
                description: 'View own medical records and history',
                resource: 'own_medical_records',
                actions: ['read']
            },
            {
                id: 'access_control',
                name: 'Data Access Control',
                description: 'Grant/revoke access to personal data',
                resource: 'data_access',
                actions: ['create', 'read', 'update', 'delete']
            },
            {
                id: 'appointment_management',
                name: 'Appointment Management',
                description: 'Schedule and manage appointments',
                resource: 'appointments',
                actions: ['create', 'read', 'update', 'delete']
            },
            {
                id: 'insurance_view',
                name: 'Insurance Information',
                description: 'View insurance claims and coverage',
                resource: 'insurance',
                actions: ['read']
            },
            {
                id: 'consent_management',
                name: 'Consent Management',
                description: 'Manage consent forms and agreements',
                resource: 'consent',
                actions: ['create', 'read', 'update']
            }
        ]
    };

    setCurrentUser(user: User) {
        this.currentUser = user;
    }

    getCurrentUser(): User | null {
        return this.currentUser;
    }

    getUserRole(): UserRole | null {
        if (!this.currentUser) return null;

        return {
            role: this.currentUser.role,
            permissions: this.rolePermissions[this.currentUser.role] || []
        };
    }

    hasPermission(resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean {
        const userRole = this.getUserRole();
        if (!userRole) return false;

        // Admin has access to everything
        if (userRole.role === 'admin') return true;

        // Check specific permissions
        return userRole.permissions.some(permission =>
            (permission.resource === resource || permission.resource === '*') &&
            permission.actions.includes(action)
        );
    }

    canAccessResource(resource: string): boolean {
        const userRole = this.getUserRole();
        if (!userRole) return false;

        if (userRole.role === 'admin') return true;

        return userRole.permissions.some(permission =>
            permission.resource === resource || permission.resource === '*'
        );
    }

    getAccessibleFeatures(): string[] {
        const userRole = this.getUserRole();
        if (!userRole) return [];

        if (userRole.role === 'admin') {
            return ['dashboard', 'patients', 'doctors', 'records', 'prescriptions', 'insurance', 'blockchain', 'settings', 'users', 'analytics', 'audit'];
        }

        if (userRole.role === 'doctor') {
            return ['dashboard', 'patients', 'records', 'prescriptions', 'insurance', 'blockchain', 'analytics'];
        }

        if (userRole.role === 'patient') {
            return ['dashboard', 'my-records', 'appointments', 'insurance', 'consent', 'access-control'];
        }

        return [];
    }

    getDashboardConfig() {
        const userRole = this.getUserRole();
        if (!userRole) return null;

        const baseConfig = {
            role: userRole.role,
            features: this.getAccessibleFeatures(),
            permissions: userRole.permissions
        };

        switch (userRole.role) {
            case 'admin':
                return {
                    ...baseConfig,
                    title: 'System Administrator Dashboard',
                    primaryActions: [
                        'Manage Users',
                        'System Settings',
                        'View Analytics',
                        'Audit Logs'
                    ],
                    widgets: [
                        'system-stats',
                        'user-activity',
                        'security-alerts',
                        'blockchain-status'
                    ]
                };

            case 'doctor':
                return {
                    ...baseConfig,
                    title: 'Doctor Dashboard',
                    primaryActions: [
                        'View Patients',
                        'Create Records',
                        'Write Prescriptions',
                        'Review Claims'
                    ],
                    widgets: [
                        'patient-list',
                        'recent-records',
                        'pending-prescriptions',
                        'insurance-claims'
                    ]
                };

            case 'patient':
                return {
                    ...baseConfig,
                    title: 'Patient Portal',
                    primaryActions: [
                        'View My Records',
                        'Book Appointment',
                        'Manage Access',
                        'Insurance Status'
                    ],
                    widgets: [
                        'my-health-summary',
                        'upcoming-appointments',
                        'recent-prescriptions',
                        'insurance-coverage'
                    ]
                };

            default:
                return baseConfig;
        }
    }

    // Audit logging for access control
    logAccess(resource: string, action: string, success: boolean, metadata?: any) {
        const logEntry = {
            userId: this.currentUser?.id || 'anonymous',
            userRole: this.currentUser?.role || 'unknown',
            resource,
            action,
            success,
            timestamp: new Date().toISOString(),
            metadata
        };

        console.log('Access Log:', logEntry);

        // In a real application, this would be sent to a logging service
        // You could integrate with your Firebase service or another logging solution
    }

    getRolePermissions(role: string): Permission[] {
        return this.rolePermissions[role] || [];
    }

    initializeDemoUsers(): void {
        // Initialize demo users for testing
        console.log('Demo users initialized');
    }

    logout(): void {
        this.currentUser = null;
        console.log('User logged out');
    }

    // Demo user creation for testing
    createDemoUsers(): User[] {
        return [
            {
                id: 'admin_001',
                email: 'admin@healthcare.com',
                name: 'System Administrator',
                role: 'admin',
                isActive: true,
                lastLogin: new Date().toISOString(),
                permissions: this.getRolePermissions('admin'),
                isVerified: true,
                twoFactorEnabled: true,
                walletAddress: '0x742d35Cc6551C0532a0fD0f7a7e2f1B987B5e9c4'
            },
            {
                id: 'doctor_001',
                email: 'dr.smith@healthcare.com',
                name: 'Dr. Sarah Smith',
                role: 'doctor',
                isActive: true,
                lastLogin: new Date().toISOString(),
                permissions: this.getRolePermissions('doctor'),
                isVerified: true,
                twoFactorEnabled: true,
                walletAddress: '0x8Ba1f109551bD432803012645Hac136c22ABB49d'
            },
            {
                id: 'patient_001',
                email: 'john.doe@email.com',
                name: 'John Doe',
                role: 'patient',
                isActive: true,
                lastLogin: new Date().toISOString(),
                permissions: this.getRolePermissions('patient'),
                isVerified: true,
                twoFactorEnabled: false,
                walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
            }
        ];
    }
}

// Create and export singleton instance
export const rbacService = new RoleBasedAccessService();
