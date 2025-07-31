import { MedicalRecord, Patient, InsuranceClaim } from '../types';

type Listener<T> = (data: T[]) => void;

class SharedStateService {
    private static instance: SharedStateService;
    private patients: Patient[] = [
        {
            id: 'patient-1',
            name: 'Michael Johnson',
            email: 'mjohnson@email.com',
            dateOfBirth: '1985-03-15',
            phoneNumber: '+1-555-0123',
            address: '123 Main St, City, State 12345',
            emergencyContact: 'Jane Johnson - +1-555-0124',
            insuranceProvider: 'HealthFirst Insurance',
            insurancePolicyNumber: 'HF-12345-MJ',
            lastVisit: '2025-06-15',
            upcomingAppointment: '2025-07-10',
            isActive: true
        },
        {
            id: 'patient-2',
            name: 'Sarah Wilson',
            email: 'swilson@email.com',
            dateOfBirth: '1990-08-22',
            phoneNumber: '+1-555-0125',
            address: '456 Oak Ave, City, State 12345',
            emergencyContact: 'Robert Wilson - +1-555-0126',
            insuranceProvider: 'MediCare Plus',
            insurancePolicyNumber: 'MP-67890-SW',
            lastVisit: '2025-06-20',
            upcomingAppointment: '2025-07-08',
            isActive: true
        },
        {
            id: 'patient-3',
            name: 'Ahmed Umar',
            email: 'ahmedumar@email.com',
            dateOfBirth: '1992-11-18',
            phoneNumber: '+1-555-0126',
            address: '789 Pine St, City, State 12345',
            emergencyContact: 'Fatima Umar - +1-555-0127',
            insuranceProvider: 'Universal Health',
            insurancePolicyNumber: 'UH-54321-AU',
            lastVisit: '2025-07-02',
            upcomingAppointment: '2025-07-15',
            isActive: true
        }
    ];

    private medicalRecords: MedicalRecord[] = [
        {
            id: 'record-1',
            patientId: 'patient-1',
            doctorId: 'doctor-1',
            title: 'Annual Physical Examination',
            description: 'Comprehensive health checkup including blood work and vital signs',
            date: '2025-07-04',
            diagnosis: 'Excellent health, all vitals normal',
            prescription: 'Continue healthy lifestyle, return in 6 months',
            isEncrypted: true,
            blockchainHash: '0xabc123def456789abcdef123456789abc',
            isVerified: true,
            accessPermissions: ['patient-1', 'doctor-1'],
            ipfsHash: 'QmX9ZB7tRvWKHGK8P2mNv3qL5rA9wS6cF4dE2gH1jK0mP',
            nftTokenId: 'HEALTH-NFT-001'
        },
        {
            id: 'record-2',
            patientId: 'patient-2',
            doctorId: 'doctor-1',
            title: 'Follow-up Consultation',
            description: 'Review of previous treatment and medication adjustment',
            date: '2025-07-03',
            diagnosis: 'Improvement noted, continue current treatment',
            prescription: 'Adjust medication dosage, schedule follow-up in 3 weeks',
            isEncrypted: true,
            blockchainHash: '0xdef456abc789123def456abc789123def',
            isVerified: true,
            accessPermissions: ['patient-2', 'doctor-1'],
            ipfsHash: 'QmY8AX6sRvWKHGK8P2mNv3qL5rA9wS6cF4dE2gH1jK0nQ',
            nftTokenId: 'HEALTH-NFT-002'
        }
    ];

    private insuranceClaims: InsuranceClaim[] = [];

    // Listeners for state changes
    private patientListeners: Listener<Patient>[] = [];
    private recordListeners: Listener<MedicalRecord>[] = [];
    private claimListeners: Listener<InsuranceClaim>[] = [];

    private constructor() { }

    static getInstance(): SharedStateService {
        if (!SharedStateService.instance) {
            SharedStateService.instance = new SharedStateService();
        }
        return SharedStateService.instance;
    }

    // Patient management
    getPatients(): Patient[] {
        return [...this.patients];
    }

    addPatient(patient: Patient): void {
        this.patients.push(patient);
        this.notifyPatientListeners();
    }

    updatePatient(patientId: string, updates: Partial<Patient>): void {
        const index = this.patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            this.patients[index] = { ...this.patients[index], ...updates };
            this.notifyPatientListeners();
        }
    }

    onPatientsChange(listener: Listener<Patient>): () => void {
        this.patientListeners.push(listener);
        return () => {
            const index = this.patientListeners.indexOf(listener);
            if (index > -1) {
                this.patientListeners.splice(index, 1);
            }
        };
    }

    private notifyPatientListeners(): void {
        this.patientListeners.forEach(listener => listener(this.patients));
    }

    // Medical record management
    getMedicalRecords(): MedicalRecord[] {
        return [...this.medicalRecords];
    }

    getMedicalRecordsByPatient(patientId: string): MedicalRecord[] {
        return this.medicalRecords.filter(record => record.patientId === patientId);
    }

    getMedicalRecordsByDoctor(doctorId: string): MedicalRecord[] {
        return this.medicalRecords.filter(record => record.doctorId === doctorId);
    }

    addMedicalRecord(record: MedicalRecord): void {
        this.medicalRecords.push(record);
        this.notifyRecordListeners();
    }

    updateMedicalRecord(recordId: string, updates: Partial<MedicalRecord>): void {
        const index = this.medicalRecords.findIndex(r => r.id === recordId);
        if (index !== -1) {
            this.medicalRecords[index] = { ...this.medicalRecords[index], ...updates };
            this.notifyRecordListeners();
        }
    }

    onMedicalRecordsChange(listener: Listener<MedicalRecord>): () => void {
        this.recordListeners.push(listener);
        return () => {
            const index = this.recordListeners.indexOf(listener);
            if (index > -1) {
                this.recordListeners.splice(index, 1);
            }
        };
    }

    private notifyRecordListeners(): void {
        this.recordListeners.forEach(listener => listener(this.medicalRecords));
    }

    // Insurance claim management
    getInsuranceClaims(): InsuranceClaim[] {
        return [...this.insuranceClaims];
    }

    getInsuranceClaimsByPatient(patientId: string): InsuranceClaim[] {
        return this.insuranceClaims.filter(claim => claim.patientId === patientId);
    }

    addInsuranceClaim(claim: InsuranceClaim): void {
        this.insuranceClaims.push(claim);
        this.notifyClaimListeners();
    }

    updateInsuranceClaim(claimId: string, updates: Partial<InsuranceClaim>): void {
        const index = this.insuranceClaims.findIndex(c => c.id === claimId);
        if (index !== -1) {
            this.insuranceClaims[index] = { ...this.insuranceClaims[index], ...updates };
            this.notifyClaimListeners();
        }
    }

    onInsuranceClaimsChange(listener: Listener<InsuranceClaim>): () => void {
        this.claimListeners.push(listener);
        return () => {
            const index = this.claimListeners.indexOf(listener);
            if (index > -1) {
                this.claimListeners.splice(index, 1);
            }
        };
    }

    private notifyClaimListeners(): void {
        this.claimListeners.forEach(listener => listener(this.insuranceClaims));
    }

    // Utility methods
    generateId(prefix: string): string {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

export const sharedStateService = SharedStateService.getInstance();
