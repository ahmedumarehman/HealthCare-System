import { ref, push, set, onValue, off, query, orderByChild, equalTo } from 'firebase/database';
import { MedicalRecord, Patient, InsuranceClaim } from '../types';
import { database } from '../config/firebase';

export class FirebaseService {
    // Medical Records
    static async addMedicalRecord(record: Omit<MedicalRecord, 'id'>): Promise<string> {
        try {
            const recordsRef = ref(database, 'medicalRecords');
            const newRecordRef = push(recordsRef);
            const recordWithId = { ...record, id: newRecordRef.key };
            await set(newRecordRef, recordWithId);
            return newRecordRef.key!;
        } catch (error) {
            console.error('Error adding medical record:', error);
            throw error;
        }
    }

    static subscribeMedicalRecords(callback: (records: MedicalRecord[]) => void): () => void {
        const recordsRef = ref(database, 'medicalRecords');
        const unsubscribe = onValue(recordsRef, (snapshot) => {
            const data = snapshot.val();
            const records: MedicalRecord[] = data ? Object.values(data) : [];
            callback(records);
        });

        return () => off(recordsRef, 'value', unsubscribe);
    }

    static subscribePatientRecords(patientId: string, callback: (records: MedicalRecord[]) => void): () => void {
        const recordsRef = ref(database, 'medicalRecords');
        const patientRecordsQuery = query(recordsRef, orderByChild('patientId'), equalTo(patientId));

        const unsubscribe = onValue(patientRecordsQuery, (snapshot) => {
            const data = snapshot.val();
            const records: MedicalRecord[] = data ? Object.values(data) : [];
            callback(records);
        });

        return () => off(recordsRef, 'value', unsubscribe);
    }

    static subscribeDoctorRecords(doctorId: string, callback: (records: MedicalRecord[]) => void): () => void {
        const recordsRef = ref(database, 'medicalRecords');
        const doctorRecordsQuery = query(recordsRef, orderByChild('doctorId'), equalTo(doctorId));

        const unsubscribe = onValue(doctorRecordsQuery, (snapshot) => {
            const data = snapshot.val();
            const records: MedicalRecord[] = data ? Object.values(data) : [];
            callback(records);
        });

        return () => off(recordsRef, 'value', unsubscribe);
    }

    // Patients
    static async addPatient(patient: Omit<Patient, 'id'>): Promise<string> {
        try {
            const patientsRef = ref(database, 'patients');
            const newPatientRef = push(patientsRef);
            const patientWithId = { ...patient, id: newPatientRef.key };
            await set(newPatientRef, patientWithId);
            return newPatientRef.key!;
        } catch (error) {
            console.error('Error adding patient:', error);
            throw error;
        }
    }

    static subscribePatients(callback: (patients: Patient[]) => void): () => void {
        const patientsRef = ref(database, 'patients');
        const unsubscribe = onValue(patientsRef, (snapshot) => {
            const data = snapshot.val();
            const patients: Patient[] = data ? Object.values(data) : [];
            callback(patients);
        });

        return () => off(patientsRef, 'value', unsubscribe);
    }

    // Insurance Claims
    static async addInsuranceClaim(claim: Omit<InsuranceClaim, 'id'>): Promise<string> {
        try {
            const claimsRef = ref(database, 'insuranceClaims');
            const newClaimRef = push(claimsRef);
            const claimWithId = { ...claim, id: newClaimRef.key };
            await set(newClaimRef, claimWithId);
            return newClaimRef.key!;
        } catch (error) {
            console.error('Error adding insurance claim:', error);
            throw error;
        }
    }

    static subscribeInsuranceClaims(callback: (claims: InsuranceClaim[]) => void): () => void {
        const claimsRef = ref(database, 'insuranceClaims');
        const unsubscribe = onValue(claimsRef, (snapshot) => {
            const data = snapshot.val();
            const claims: InsuranceClaim[] = data ? Object.values(data) : [];
            callback(claims);
        });

        return () => off(claimsRef, 'value', unsubscribe);
    }
}
