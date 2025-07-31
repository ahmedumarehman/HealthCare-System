import { database } from '../config/firebase';
import { ref, push, set, get, remove, update, onValue, off } from 'firebase/database';
import { PatientRecord } from '../types';

export class FirebaseHealthRecordsService {
    private readonly RECORDS_PATH = 'healthRecords';
    private readonly PATIENTS_PATH = 'patients';
    private readonly DOCTORS_PATH = 'doctors';
    private readonly COUNTERS_PATH = 'counters';

    /**
     * Save a new patient record to Firebase
     */
    async saveRecord(record: PatientRecord): Promise<string> {
        try {
            const recordsRef = ref(database, this.RECORDS_PATH);
            const newRecordRef = push(recordsRef);

            // Save the record with Firebase-generated key
            await set(newRecordRef, {
                ...record,
                firebaseId: newRecordRef.key,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            // Update patient and doctor indexes
            await this.updatePatientIndex(record.patientId, record.patientName);
            await this.updateDoctorIndex(record.doctorId, record.doctorName);

            return newRecordRef.key!;
        } catch (error) {
            console.error('Error saving record to Firebase:', error);
            throw new Error('Failed to save record to database');
        }
    }

    /**
     * Get all patient records from Firebase
     */
    async getAllRecords(): Promise<PatientRecord[]> {
        try {
            const recordsRef = ref(database, this.RECORDS_PATH);
            const snapshot = await get(recordsRef);

            if (snapshot.exists()) {
                const recordsData = snapshot.val();
                return Object.keys(recordsData).map(key => ({
                    ...recordsData[key],
                    firebaseId: key
                }));
            }

            return [];
        } catch (error) {
            console.error('Error fetching records from Firebase:', error);
            throw new Error('Failed to fetch records from database');
        }
    }

    /**
     * Get a specific record by Firebase ID
     */
    async getRecordById(firebaseId: string): Promise<PatientRecord | null> {
        try {
            const recordRef = ref(database, `${this.RECORDS_PATH}/${firebaseId}`);
            const snapshot = await get(recordRef);

            if (snapshot.exists()) {
                return {
                    ...snapshot.val(),
                    firebaseId
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching record by ID:', error);
            throw new Error('Failed to fetch record');
        }
    }

    /**
     * Update an existing record
     */
    async updateRecord(firebaseId: string, updates: Partial<PatientRecord>): Promise<void> {
        try {
            const recordRef = ref(database, `${this.RECORDS_PATH}/${firebaseId}`);
            await update(recordRef, {
                ...updates,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating record:', error);
            throw new Error('Failed to update record');
        }
    }

    /**
     * Delete a record
     */
    async deleteRecord(firebaseId: string): Promise<void> {
        try {
            const recordRef = ref(database, `${this.RECORDS_PATH}/${firebaseId}`);
            await remove(recordRef);
        } catch (error) {
            console.error('Error deleting record:', error);
            throw new Error('Failed to delete record');
        }
    }

    /**
     * Search records by patient name
     */
    async searchRecordsByPatient(patientName: string): Promise<PatientRecord[]> {
        try {
            const records = await this.getAllRecords();
            return records.filter(record =>
                record.patientName.toLowerCase().includes(patientName.toLowerCase())
            );
        } catch (error) {
            console.error('Error searching records:', error);
            throw new Error('Failed to search records');
        }
    }

    /**
     * Get records by doctor
     */
    async getRecordsByDoctor(doctorName: string): Promise<PatientRecord[]> {
        try {
            const records = await this.getAllRecords();
            return records.filter(record =>
                record.doctorName.toLowerCase().includes(doctorName.toLowerCase())
            );
        } catch (error) {
            console.error('Error fetching doctor records:', error);
            throw new Error('Failed to fetch doctor records');
        }
    }

    /**
     * Get next available ID for records, patients, or doctors
     */
    async getNextId(type: 'record' | 'patient' | 'doctor'): Promise<string> {
        try {
            const counterRef = ref(database, `${this.COUNTERS_PATH}/${type}`);
            const snapshot = await get(counterRef);

            let currentCount = 1;
            if (snapshot.exists()) {
                currentCount = snapshot.val() + 1;
            }

            // Update the counter
            await set(counterRef, currentCount);

            // Return formatted ID
            const prefix = type === 'record' ? 'MR' : type === 'patient' ? 'PT' : 'DR';
            return `${prefix}${String(currentCount).padStart(3, '0')}`;
        } catch (error) {
            console.error('Error getting next ID:', error);
            // Fallback to timestamp-based ID
            const timestamp = Date.now();
            const prefix = type === 'record' ? 'MR' : type === 'patient' ? 'PT' : 'DR';
            return `${prefix}${timestamp.toString().slice(-6)}`;
        }
    }

    /**
     * Update patient index for quick lookups
     */
    private async updatePatientIndex(patientId: string, patientName: string): Promise<void> {
        try {
            const patientRef = ref(database, `${this.PATIENTS_PATH}/${patientId}`);
            await set(patientRef, {
                name: patientName,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating patient index:', error);
        }
    }

    /**
     * Update doctor index for quick lookups
     */
    private async updateDoctorIndex(doctorId: string, doctorName: string): Promise<void> {
        try {
            const doctorRef = ref(database, `${this.DOCTORS_PATH}/${doctorId}`);
            await set(doctorRef, {
                name: doctorName,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating doctor index:', error);
        }
    }

    /**
     * Listen to real-time updates for records
     */
    subscribeToRecords(callback: (records: PatientRecord[]) => void): () => void {
        const recordsRef = ref(database, this.RECORDS_PATH);

        const unsubscribe = onValue(recordsRef, (snapshot) => {
            if (snapshot.exists()) {
                const recordsData = snapshot.val();
                const records = Object.keys(recordsData).map(key => ({
                    ...recordsData[key],
                    firebaseId: key
                }));
                callback(records);
            } else {
                callback([]);
            }
        });

        // Return unsubscribe function
        return () => off(recordsRef, 'value', unsubscribe);
    }

    /**
     * Get statistics about the database
     */
    async getStatistics(): Promise<{
        totalRecords: number;
        totalPatients: number;
        totalDoctors: number;
    }> {
        try {
            const [records, patients, doctors] = await Promise.all([
                this.getAllRecords(),
                get(ref(database, this.PATIENTS_PATH)),
                get(ref(database, this.DOCTORS_PATH))
            ]);

            return {
                totalRecords: records.length,
                totalPatients: patients.exists() ? Object.keys(patients.val()).length : 0,
                totalDoctors: doctors.exists() ? Object.keys(doctors.val()).length : 0
            };
        } catch (error) {
            console.error('Error getting statistics:', error);
            return { totalRecords: 0, totalPatients: 0, totalDoctors: 0 };
        }
    }

    /**
     * Backup data to localStorage as fallback
     */
    async backupToLocalStorage(): Promise<void> {
        try {
            const records = await this.getAllRecords();
            localStorage.setItem('firebaseBackup_healthRecords', JSON.stringify({
                records,
                timestamp: new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error backing up to localStorage:', error);
        }
    }

    /**
     * Restore data from localStorage backup
     */
    getLocalStorageBackup(): PatientRecord[] | null {
        try {
            const backup = localStorage.getItem('firebaseBackup_healthRecords');
            if (backup) {
                const parsedBackup = JSON.parse(backup);
                return parsedBackup.records || [];
            }
            return null;
        } catch (error) {
            console.error('Error reading localStorage backup:', error);
            return null;
        }
    }
}

// Create and export a singleton instance
export const firebaseHealthRecordsService = new FirebaseHealthRecordsService();
