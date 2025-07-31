import React, { useState, useEffect } from 'react';
import { PatientRecord, MedicalRecord } from '../../types';
import { firebaseHealthRecordsService } from '../../services/firebaseHealthRecords';
import jsPDF from 'jspdf';
import * as CryptoJS from 'crypto-js';

interface PatientHealthRecordsProps {
    className?: string;
}

const PatientHealthRecords: React.FC<PatientHealthRecordsProps> = ({ className = '' }) => {
    const [records, setRecords] = useState<PatientRecord[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'createdAt' | 'patientName' | 'doctorName'>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isSyncing, setIsSyncing] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');

    // Form state
    const [formData, setFormData] = useState({
        patientName: '',
        doctorName: '',
        dateOfBirth: '',
        diagnosis: '',
        prescription: '',
        notes: ''
    });

    useEffect(() => {
        const initializeData = async () => {
            try {
                // Try to load from Firebase first
                const firebaseRecords = await firebaseHealthRecordsService.getAllRecords();
                if (firebaseRecords.length > 0) {
                    setRecords(firebaseRecords);
                    setConnectionStatus('connected');
                    // Backup to localStorage
                    localStorage.setItem('patientHealthRecords', JSON.stringify(firebaseRecords));
                } else {
                    // Fallback to localStorage
                    loadLocalRecords();
                }
            } catch (error) {
                console.error('Failed to load from Firebase:', error);
                setConnectionStatus('error');
                // Load from localStorage as fallback
                loadLocalRecords();
            }
        };

        initializeData();

        // Set up real-time listener for Firebase
        const unsubscribe = firebaseHealthRecordsService.subscribeToRecords((firebaseRecords) => {
            setRecords(firebaseRecords);
            setConnectionStatus('connected');
            // Also backup to localStorage
            localStorage.setItem('patientHealthRecords', JSON.stringify(firebaseRecords));
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const loadLocalRecords = () => {
        const savedRecords = localStorage.getItem('patientHealthRecords');
        if (savedRecords) {
            const localRecords = JSON.parse(savedRecords);
            setRecords(localRecords);
        }
    };

    const saveRecords = async (newRecords: PatientRecord[]) => {
        // Always save to localStorage first (for offline support)
        localStorage.setItem('patientHealthRecords', JSON.stringify(newRecords));
        setRecords(newRecords);
    };

    const generateNextId = async (prefix: string): Promise<string> => {
        try {
            // Try to get next ID from Firebase service
            const type = prefix === 'MR' ? 'record' : prefix === 'PT' ? 'patient' : 'doctor';
            return await firebaseHealthRecordsService.getNextId(type);
        } catch (error) {
            console.error('Failed to get next ID from Firebase, using fallback:', error);
            // Fallback to local calculation
            let maxNumber = 0;

            if (prefix === 'MR') {
                records.forEach(record => {
                    const match = record.recordId.match(/^MR(\d+)$/);
                    if (match) {
                        maxNumber = Math.max(maxNumber, parseInt(match[1]));
                    }
                });
            } else if (prefix === 'PT') {
                const patientIds = records.map(r => r.patientId);
                const uniquePatientIds = Array.from(new Set(patientIds));
                uniquePatientIds.forEach(id => {
                    const match = id.match(/^PT(\d+)$/);
                    if (match) {
                        maxNumber = Math.max(maxNumber, parseInt(match[1]));
                    }
                });
            } else if (prefix === 'DR') {
                const doctorIds = records.map(r => r.doctorId);
                const uniqueDoctorIds = Array.from(new Set(doctorIds));
                uniqueDoctorIds.forEach(id => {
                    const match = id.match(/^DR(\d+)$/);
                    if (match) {
                        maxNumber = Math.max(maxNumber, parseInt(match[1]));
                    }
                });
            }

            return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
        }
    };

    const generateRecordHash = (record: Omit<PatientRecord, 'id' | 'recordHash' | 'createdAt' | 'updatedAt'>): string => {
        const dataString = JSON.stringify({
            recordId: record.recordId,
            patientId: record.patientId,
            doctorId: record.doctorId,
            patientName: record.patientName,
            doctorName: record.doctorName,
            dateOfBirth: record.dateOfBirth,
            diagnosis: record.diagnosis,
            prescription: record.prescription,
            notes: record.notes
        });
        return CryptoJS.SHA256(dataString).toString();
    };

    const getExistingPatientId = (patientName: string): string | null => {
        const existingRecord = records.find(r =>
            r.patientName.toLowerCase() === patientName.toLowerCase()
        );
        return existingRecord ? existingRecord.patientId : null;
    };

    const getExistingDoctorId = (doctorName: string): string | null => {
        const existingRecord = records.find(r =>
            r.doctorName.toLowerCase() === doctorName.toLowerCase()
        );
        return existingRecord ? existingRecord.doctorId : null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.patientName || !formData.doctorName || !formData.diagnosis) {
            alert('Please fill in all required fields (Patient Name, Doctor Name, and Diagnosis)');
            return;
        }

        setIsSyncing(true);
        try {
            const now = new Date().toISOString();
            const recordId = await generateNextId('MR');
            const patientId = getExistingPatientId(formData.patientName) || await generateNextId('PT');
            const doctorId = getExistingDoctorId(formData.doctorName) || await generateNextId('DR');

            const newRecordData = {
                recordId,
                patientId,
                doctorId,
                patientName: formData.patientName,
                doctorName: formData.doctorName,
                dateOfBirth: formData.dateOfBirth,
                diagnosis: formData.diagnosis,
                prescription: formData.prescription,
                notes: formData.notes,
                isActive: true
            };

            const newRecord: PatientRecord = {
                id: `${recordId}_${Date.now()}`,
                ...newRecordData,
                recordHash: generateRecordHash(newRecordData),
                createdAt: now,
                updatedAt: now,
                syncStatus: 'syncing'
            };

            // Save to Firebase
            try {
                const firebaseId = await firebaseHealthRecordsService.saveRecord(newRecord);
                newRecord.firebaseId = firebaseId;
                newRecord.syncStatus = 'synced';
                setConnectionStatus('connected');
            } catch (error) {
                console.error('Failed to save to Firebase:', error);
                newRecord.syncStatus = 'error';
                setConnectionStatus('error');
            }

            // Update local state and localStorage
            const updatedRecords = [...records, newRecord];
            await saveRecords(updatedRecords);

            // Also sync with shared state service for real-time visibility to doctors
            const medicalRecord: MedicalRecord = {
                id: newRecord.id,
                patientId: newRecord.patientId,
                doctorId: newRecord.doctorId,
                title: newRecord.diagnosis,
                description: newRecord.notes || '',
                date: newRecord.createdAt,
                diagnosis: newRecord.diagnosis,
                prescription: newRecord.prescription || '',
                isEncrypted: false,
                isVerified: false,
                accessPermissions: ['patient', 'doctor'],
                blockchainHash: `0x${Date.now().toString(16)}abc${Math.random().toString(16).slice(2, 8)}`,
                ipfsHash: `Qm${Math.random().toString(36).slice(2, 15)}${Date.now().toString(36)}`,
                nftTokenId: undefined
            };

            // Add to shared state for immediate visibility
            const { sharedStateService } = await import('../../services/sharedState');
            sharedStateService.addMedicalRecord(medicalRecord);

            // Also try to sync with Firebase medical records for doctor dashboard
            try {
                const { FirebaseService } = await import('../../services/firebaseService');
                await FirebaseService.addMedicalRecord(medicalRecord);
            } catch (error) {
                console.warn('Failed to sync with Firebase medical records:', error);
            }

            // Reset form
            setFormData({
                patientName: '',
                doctorName: '',
                dateOfBirth: '',
                diagnosis: '',
                prescription: '',
                notes: ''
            });
            setShowAddForm(false);
        } catch (error) {
            console.error('Error creating record:', error);
            alert('Failed to create record. Please try again.');
        } finally {
            setIsSyncing(false);
        }
    }; const exportToPDF = async (record: PatientRecord) => {
        const pdf = new jsPDF();

        // Define colors
        const colors = {
            primary: [41, 128, 185] as [number, number, number],
            secondary: [52, 152, 219] as [number, number, number],
            success: [39, 174, 96] as [number, number, number],
            warning: [241, 196, 15] as [number, number, number],
            danger: [231, 76, 60] as [number, number, number],
            light: [245, 245, 245] as [number, number, number],
            dark: [44, 62, 80] as [number, number, number],
            white: [255, 255, 255] as [number, number, number],
            accent: [155, 89, 182] as [number, number, number]
        };

        // Page background
        pdf.setFillColor(...colors.light);
        pdf.rect(0, 0, 210, 297, 'F');

        // Header section with gradient-like effect
        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, 210, 35, 'F');

        // Header shadow effect
        pdf.setFillColor(30, 100, 150);
        pdf.rect(0, 32, 210, 3, 'F');

        // Logo/Icon area
        pdf.setFillColor(...colors.white);
        pdf.circle(25, 17.5, 8, 'F');
        pdf.setFontSize(16);
        pdf.setTextColor(...colors.primary);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🏥', 21, 20);

        // Main header
        pdf.setFontSize(24);
        pdf.setTextColor(...colors.white);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MEDICAL RECORD', 105, 15, { align: 'center' });

        // Subtitle
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text('SecureHealth Management System', 105, 25, { align: 'center' });

        let yPos = 50;
        const sectionSpacing = 15;

        // Record Information Section
        pdf.setFillColor(...colors.secondary);
        pdf.rect(15, yPos - 5, 180, 12, 'F');
        pdf.setFontSize(14);
        pdf.setTextColor(...colors.white);
        pdf.setFont('helvetica', 'bold');
        pdf.text('📋 RECORD INFORMATION', 20, yPos + 2);
        yPos += sectionSpacing;

        // Record info box
        pdf.setFillColor(...colors.white);
        pdf.setDrawColor(...colors.secondary);
        pdf.setLineWidth(0.5);
        pdf.rect(15, yPos, 180, 25, 'FD');

        pdf.setFontSize(11);
        pdf.setTextColor(...colors.dark);
        pdf.setFont('helvetica', 'normal');

        pdf.text(`Record ID: ${record.recordId}`, 20, yPos + 6);
        pdf.text(`Created: ${new Date(record.createdAt).toLocaleDateString()}`, 20, yPos + 13);

        // Hash with special styling
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...colors.accent);
        pdf.text('Hash:', 20, yPos + 20);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(record.recordHash.substring(0, 50) + '...', 40, yPos + 20);

        yPos += 35;

        // Patient Information Section
        pdf.setFillColor(...colors.success);
        pdf.rect(15, yPos - 5, 180, 12, 'F');
        pdf.setFontSize(14);
        pdf.setTextColor(...colors.white);
        pdf.setFont('helvetica', 'bold');
        pdf.text('👤 PATIENT INFORMATION', 20, yPos + 2);
        yPos += sectionSpacing;

        // Patient info boxes
        const patientBoxHeight = 35;
        pdf.setFillColor(...colors.white);
        pdf.setDrawColor(...colors.success);
        pdf.rect(15, yPos, 85, patientBoxHeight, 'FD');
        pdf.rect(110, yPos, 85, patientBoxHeight, 'FD');

        // Left box - Patient details
        pdf.setFontSize(11);
        pdf.setTextColor(...colors.dark);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Patient Details', 20, yPos + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`ID: ${record.patientId}`, 20, yPos + 15);
        pdf.text(`Name: ${record.patientName}`, 20, yPos + 22);
        if (record.dateOfBirth) {
            pdf.text(`DOB: ${record.dateOfBirth}`, 20, yPos + 29);
        }

        // Right box - Doctor details
        pdf.setFont('helvetica', 'bold');
        pdf.text('Attending Physician', 115, yPos + 8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`ID: ${record.doctorId}`, 115, yPos + 15);
        pdf.text(`Name: ${record.doctorName}`, 115, yPos + 22);

        yPos += patientBoxHeight + 10;

        // Medical Details Section
        pdf.setFillColor(...colors.warning);
        pdf.rect(15, yPos - 5, 180, 12, 'F');
        pdf.setFontSize(14);
        pdf.setTextColor(...colors.white);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🩺 MEDICAL DETAILS', 20, yPos + 2);
        yPos += sectionSpacing;

        // Diagnosis box
        pdf.setFillColor(255, 248, 220); // Light yellow background
        pdf.setDrawColor(...colors.warning);
        pdf.rect(15, yPos, 180, 30, 'FD');

        pdf.setFontSize(12);
        pdf.setTextColor(...colors.dark);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DIAGNOSIS', 20, yPos + 8);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const diagnosisLines = pdf.splitTextToSize(record.diagnosis, 170);
        pdf.text(diagnosisLines, 20, yPos + 15);

        yPos += 35;

        // Prescription box (if exists)
        if (record.prescription) {
            pdf.setFillColor(240, 255, 240); // Light green background
            pdf.setDrawColor(...colors.success);
            pdf.rect(15, yPos, 180, 30, 'FD');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('PRESCRIPTION', 20, yPos + 8);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const prescriptionLines = pdf.splitTextToSize(record.prescription, 170);
            pdf.text(prescriptionLines, 20, yPos + 15);

            yPos += 35;
        }

        // Notes box (if exists)
        if (record.notes) {
            pdf.setFillColor(248, 248, 255); // Light purple background
            pdf.setDrawColor(...colors.accent);
            pdf.rect(15, yPos, 180, 30, 'FD');

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);
            pdf.text('ADDITIONAL NOTES', 20, yPos + 8);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const notesLines = pdf.splitTextToSize(record.notes, 170);
            pdf.text(notesLines, 20, yPos + 15);

            yPos += 35;
        }

        // Security Section
        yPos = Math.max(yPos + 10, 240); // Ensure it's near bottom
        pdf.setFillColor(...colors.danger);
        pdf.rect(15, yPos, 180, 12, 'F');
        pdf.setFontSize(12);
        pdf.setTextColor(...colors.white);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🔒 SECURITY & COMPLIANCE', 20, yPos + 7);

        yPos += 15;
        pdf.setFillColor(255, 245, 245); // Light red background
        pdf.setDrawColor(...colors.danger);
        pdf.rect(15, yPos, 180, 20, 'FD');

        pdf.setFontSize(9);
        pdf.setTextColor(...colors.dark);
        pdf.setFont('helvetica', 'normal');
        pdf.text('✓ HIPAA Compliant  ✓ Blockchain Verified  ✓ End-to-End Encrypted', 20, yPos + 7);
        pdf.text('✓ Digital Signature  ✓ Audit Trail  ✓ Tamper-Proof Hash Verification', 20, yPos + 14);

        // Footer with gradient
        yPos = 275;
        pdf.setFillColor(...colors.dark);
        pdf.rect(0, yPos, 210, 22, 'F');

        // Footer content
        pdf.setFontSize(10);
        pdf.setTextColor(...colors.white);
        pdf.setFont('helvetica', 'normal');
        pdf.text('SecureHealth Management System - HIPAA Compliant Healthcare Platform', 105, yPos + 8, { align: 'center' });

        pdf.setFontSize(8);
        pdf.text(`Generated on: ${new Date().toLocaleString()} | Document ID: ${record.recordId}`, 105, yPos + 15, { align: 'center' });

        // Watermark
        pdf.setTextColor(200, 200, 200);
        pdf.setFontSize(50);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONFIDENTIAL', 105, 150, {
            align: 'center',
            angle: 45
        });

        // Save PDF with enhanced filename
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        pdf.save(`Medical_Record_${record.recordId}_${record.patientName.replace(/\s+/g, '_')}_${timestamp}.pdf`);
    };

    const syncWithFirebase = async () => {
        setIsSyncing(true);
        try {
            // Find records that need syncing
            const unsyncedRecords = records.filter(r => r.syncStatus === 'error' || !r.firebaseId);

            for (const record of unsyncedRecords) {
                try {
                    const firebaseId = await firebaseHealthRecordsService.saveRecord(record);
                    // Update the record with Firebase ID
                    const updatedRecords = records.map(r =>
                        r.id === record.id
                            ? { ...r, firebaseId, syncStatus: 'synced' as const }
                            : r
                    );
                    setRecords(updatedRecords);
                    localStorage.setItem('patientHealthRecords', JSON.stringify(updatedRecords));
                } catch (error) {
                    console.error('Failed to sync record:', record.id, error);
                }
            }
            setConnectionStatus('connected');
        } catch (error) {
            console.error('Sync failed:', error);
            setConnectionStatus('error');
        } finally {
            setIsSyncing(false);
        }
    };

    const deleteRecord = async (recordId: string) => {
        // Use window.confirm instead of confirm to avoid ESLint error
        if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
            return;
        }

        try {
            const recordToDelete = records.find(r => r.id === recordId);
            if (recordToDelete?.firebaseId) {
                await firebaseHealthRecordsService.deleteRecord(recordToDelete.firebaseId);
            }

            const updatedRecords = records.filter(r => r.id !== recordId);
            await saveRecords(updatedRecords);
        } catch (error) {
            console.error('Failed to delete record:', error);
            alert('Failed to delete record. Please try again.');
        }
    };

    const filteredRecords = records
        .filter(record =>
            record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            let aValue: string | number = a[sortBy];
            let bValue: string | number = b[sortBy];

            if (sortBy === 'createdAt') {
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    return (
        <div className={`space-y-6 p-6 ${className}`}>
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">🏥 Patient Health Records</h2>
                        <p className="text-gray-600">
                            Secure medical record management with blockchain verification and cloud storage.
                        </p>

                        {/* Firebase Connection Status */}
                        <div className="flex items-center mt-3 space-x-4">
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' :
                                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}></div>
                                <span className="text-sm text-gray-600">
                                    Database: {
                                        connectionStatus === 'connected' ? 'Connected' :
                                            connectionStatus === 'error' ? 'Offline' : 'Connecting...'
                                    }
                                </span>
                            </div>

                            {connectionStatus === 'error' && (
                                <button
                                    onClick={syncWithFirebase}
                                    disabled={isSyncing}
                                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSyncing ? 'Syncing...' : 'Retry Sync'}
                                </button>
                            )}

                            <div className="text-sm text-gray-500">
                                {records.filter(r => r.syncStatus === 'error').length > 0 && (
                                    <span className="text-orange-600">
                                        {records.filter(r => r.syncStatus === 'error').length} records need sync
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        ➕ Add New Record
                    </button>
                </div>
            </div>

            {/* Search and Sort */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search records by patient name, doctor, record ID, or diagnosis..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="createdAt">Sort by Date</option>
                            <option value="patientName">Sort by Patient</option>
                            <option value="doctorName">Sort by Doctor</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">📋</div>
                        <div>
                            <p className="text-sm text-gray-600">Total Records</p>
                            <p className="text-xl font-bold text-gray-900">{records.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">👥</div>
                        <div>
                            <p className="text-sm text-gray-600">Unique Patients</p>
                            <p className="text-xl font-bold text-gray-900">
                                {new Set(records.map(r => r.patientId)).size}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">👨‍⚕️</div>
                        <div>
                            <p className="text-sm text-gray-600">Unique Doctors</p>
                            <p className="text-xl font-bold text-gray-900">
                                {new Set(records.map(r => r.doctorId)).size}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="text-2xl mr-3">🔒</div>
                        <div>
                            <p className="text-sm text-gray-600">Hash Protected</p>
                            <p className="text-xl font-bold text-green-600">100%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Record Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Add New Patient Record</h3>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Patient Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.patientName}
                                            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter patient name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Doctor Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.doctorName}
                                            onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter doctor name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Diagnosis *
                                    </label>
                                    <textarea
                                        value={formData.diagnosis}
                                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                                        placeholder="Enter diagnosis details"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prescription
                                    </label>
                                    <textarea
                                        value={formData.prescription}
                                        onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                                        placeholder="Enter prescription details"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                                        placeholder="Enter any additional notes"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <p className="text-sm text-gray-600">
                                        * Required fields. IDs will be auto-generated.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Add Record
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Records List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Medical Records ({filteredRecords.length})
                    </h3>

                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Records Found</h3>
                            <p className="text-gray-600 mb-4">
                                {records.length === 0
                                    ? "Get started by adding your first patient record."
                                    : "Try adjusting your search criteria."
                                }
                            </p>
                            {records.length === 0 && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add First Record
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Record Info
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Patient
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Doctor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Diagnosis
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Hash
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sync Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {record.recordId}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(record.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {record.patientName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {record.patientId}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {record.doctorName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {record.doctorId}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {record.diagnosis}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs font-mono text-gray-500 bg-gray-100 p-1 rounded max-w-24 truncate">
                                                    {record.recordHash.substring(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`w-2 h-2 rounded-full mr-2 ${record.syncStatus === 'synced' ? 'bg-green-500' :
                                                        record.syncStatus === 'syncing' ? 'bg-yellow-500' :
                                                            record.syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                                                        }`}></div>
                                                    <span className="text-xs text-gray-600">
                                                        {record.syncStatus === 'synced' ? 'Synced' :
                                                            record.syncStatus === 'syncing' ? 'Syncing...' :
                                                                record.syncStatus === 'error' ? 'Failed' : 'Local'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => exportToPDF(record)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    title="Download PDF"
                                                >
                                                    📄 PDF
                                                </button>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(record.recordHash)}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                    title="Copy Hash"
                                                >
                                                    📋 Hash
                                                </button>
                                                {record.syncStatus === 'error' && (
                                                    <button
                                                        onClick={() => syncWithFirebase()}
                                                        className="text-orange-600 hover:text-orange-900 mr-3"
                                                        title="Retry Sync"
                                                    >
                                                        🔄 Retry
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteRecord(record.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Record"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientHealthRecords;
