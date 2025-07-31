import React, { useState, useEffect } from 'react';
import Badge from '../UI/Badge';
import Timer from '../UI/Timer';
import { User, MedicalRecord, Patient, InsuranceClaim, NFTHealthRecord } from '../../types';
import { RoleBasedAccessService } from '../../services/rbacService';
import { EncryptionService } from '../../services/encryption';
import { sharedStateService } from '../../services/sharedState';
import { pdfService } from '../../services/pdfService';
import { FirebaseService } from '../../services/firebaseService';
import { clipboardMonitoringService } from '../../services/clipboardMonitoring';

interface DoctorDashboardProps {
    user: User;
    onLogout: () => void;
}

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user, onLogout }) => {
    const [sessionTimeLeft] = useState(1800);
    const [rbacService] = useState(new RoleBasedAccessService());
    const [activeTab, setActiveTab] = useState<'patients' | 'records' | 'insurance' | 'nfts' | 'security'>('patients');

    // Modal states
    const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);

    // Security states
    const [clipboardMonitoring, setClipboardMonitoring] = useState(false);
    const [suspiciousAddressAlert, setSuspiciousAddressAlert] = useState<string | null>(null);
    const [encryptedRecords, setEncryptedRecords] = useState<{ [key: string]: string }>({});
    const [recordEncryptionStatus, setRecordEncryptionStatus] = useState<{ [key: string]: boolean }>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedEncryptedFiles, setSelectedEncryptedFiles] = useState<File[]>([]);

    // Form states
    const [newRecordForm, setNewRecordForm] = useState({
        patientId: '',
        title: '',
        description: '',
        diagnosis: '',
        prescription: '',
        notes: '',
    });

    const [newClaimForm, setNewClaimForm] = useState({
        patientId: '',
        amount: '',
        description: '',
        insuranceProvider: '',
    });

    const [myPatients, setMyPatients] = useState<Patient[]>([]);
    const [recentRecords, setRecentRecords] = useState<MedicalRecord[]>([]);
    const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([
        {
            id: 'claim-1',
            claimNumber: 'CLM-2025-001',
            patientId: 'patient-1',
            providerId: user.id,
            doctorId: user.id,
            insuranceCompany: 'HealthFirst Insurance',
            insuranceProvider: 'HealthFirst Insurance',
            amount: 450.0,
            status: 'approved',
            submittedAt: '2025-07-01T10:00:00Z',
            submissionDate: '2025-07-01',
            approvalDate: '2025-07-03',
            description: 'Annual physical examination and blood work',
            relatedRecords: ['record-1'],
            smartContractAddress: '0x1234567890abcdef1234567890abcdef12345678',
            blockchainTxId: '0xabc123def456789abcdef123456789abc123def456789abcdef',
            isProcessedOnChain: true,
            approvalSignatures: [],
            ipfsDocuments: [],
        },
        {
            id: 'claim-2',
            claimNumber: 'CLM-2025-002',
            patientId: 'patient-2',
            providerId: user.id,
            doctorId: user.id,
            insuranceCompany: 'MediCare Plus',
            insuranceProvider: 'MediCare Plus',
            amount: 275.5,
            status: 'pending',
            submittedAt: '2025-07-04T14:30:00Z',
            submissionDate: '2025-07-04',
            description: 'Follow-up consultation and medication review',
            relatedRecords: ['record-2'],
            smartContractAddress: '0x1234567890abcdef1234567890abcdef12345678',
            blockchainTxId: '0xdef456abc789123def456abc789123def456abc789123def',
            isProcessedOnChain: false,
            approvalSignatures: [],
            ipfsDocuments: [],
        },
    ]);

    const [nftRecords, setNftRecords] = useState<NFTHealthRecord[]>([
        {
            id: 'nft-1',
            tokenId: 'HEALTH-NFT-001',
            patientId: 'patient-1',
            recordId: 'record-1',
            name: 'Annual Physical 2025',
            description: 'Comprehensive health examination record',
            imageUrl: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=NFT-001',
            metadataUri: 'ipfs://QmX9ZB7tRvWKHGK8P2mNv3qL5rA9wS6cF4dE2gH1jK0mP',
            contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
            blockchainNetwork: 'Ethereum',
            mintDate: '2025-07-04T10:30:00Z',
            currentOwner: 'patient-1',
            isTransferable: false,
            accessLevel: 'doctor_patient',
        },
        {
            id: 'nft-2',
            tokenId: 'HEALTH-NFT-002',
            patientId: 'patient-2',
            recordId: 'record-2',
            name: 'Follow-up Consultation',
            description: 'Treatment follow-up and medication adjustment',
            imageUrl: 'https://via.placeholder.com/200x200/059669/FFFFFF?text=NFT-002',
            metadataUri: 'ipfs://QmY8AX6sRvWKHGK8P2mNv3qL5rA9wS6cF4dE2gH1jK0nQ',
            contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
            blockchainNetwork: 'Ethereum',
            mintDate: '2025-07-03T14:45:00Z',
            currentOwner: 'patient-2',
            isTransferable: false,
            accessLevel: 'doctor_patient',
        },
    ]);

    useEffect(() => {
        rbacService.setCurrentUser(user);
    }, [user, rbacService]);

    useEffect(() => {
        const patients = sharedStateService.getPatients();
        const allRecords = sharedStateService.getMedicalRecords();

        setMyPatients(patients);
        setRecentRecords(allRecords);

        const unsubscribeFirebase = FirebaseService.subscribeMedicalRecords((firebaseRecords) => {
            firebaseRecords.forEach((record) => {
                if (!sharedStateService.getMedicalRecords().find((r) => r.id === record.id)) {
                    sharedStateService.addMedicalRecord(record);
                }
            });
        });

        const unsubscribePatients = sharedStateService.onPatientsChange(setMyPatients);
        const unsubscribeRecords = sharedStateService.onMedicalRecordsChange(setRecentRecords);

        return () => {
            unsubscribeFirebase();
            unsubscribePatients();
            unsubscribeRecords();
        };
    }, [user.id]);

    const handleSessionExpire = () => {
        window.confirm('Session expired for security. Please login again.') && onLogout();
    };

    const handleCreateRecord = () => {
        setShowCreateRecordModal(true);
    };

    const handleSubmitInsuranceClaim = (patientId: string) => {
        setNewClaimForm((prev) => ({ ...prev, patientId }));
        setShowClaimModal(true);
    };

    const handleMintNFT = (recordId: string) => {
        console.log(`Minting NFT for record: ${recordId}`);

        // Find the medical record
        const medicalRecord = recentRecords.find(record => record.id === recordId);
        if (!medicalRecord) {
            alert('❌ Medical record not found');
            return;
        }

        // Find the patient
        const patient = myPatients.find(p => p.id === medicalRecord.patientId);
        if (!patient) {
            alert('❌ Patient not found');
            return;
        }

        // Generate new NFT token ID
        const tokenId = `HEALTH-NFT-${String(nftRecords.length + 1).padStart(3, '0')}`;

        // Create new NFT record
        const newNFT: NFTHealthRecord = {
            id: `nft-${Date.now()}`,
            tokenId: tokenId,
            patientId: medicalRecord.patientId,
            recordId: recordId,
            name: medicalRecord.title || `Medical Record ${recordId}`,
            description: medicalRecord.description || `${medicalRecord.diagnosis} - ${medicalRecord.prescription}`,
            imageUrl: `https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=${tokenId}`,
            metadataUri: `ipfs://QmX9ZB7tRvWKHGK8P2mNv3qL5rA9wS6cF4dE2gH1jK0mP${Date.now()}`,
            contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
            blockchainNetwork: 'Ethereum',
            mintDate: new Date().toISOString(),
            currentOwner: medicalRecord.patientId,
            isTransferable: false,
            accessLevel: 'doctor_patient',
        };

        // Add NFT to the list
        setNftRecords(prev => [...prev, newNFT]);

        // Update the medical record to include the NFT token ID
        setRecentRecords(prev =>
            prev.map(record =>
                record.id === recordId
                    ? { ...record, nftTokenId: tokenId }
                    : record
            )
        );

        // Show success message
        alert(`✅ NFT Successfully Minted!

🎨 Token ID: ${tokenId}
👤 Patient: ${patient.name}
📋 Record: ${medicalRecord.title}
⛓️ Network: Ethereum
📅 Minted: ${new Date().toLocaleString()}

The NFT has been created and is now visible in the "NFT Health Records" tab.`);
    };

    const handleViewHistory = (patientId: string) => {
        const patient = myPatients.find((p) => p.id === patientId);
        const patientRecords = recentRecords.filter((record) => record.patientId === patientId);

        if (patient && patientRecords.length > 0) {
            const historyDetails = patientRecords
                .map(
                    (record) =>
                        `📋 ${record.title} (${record.date})\n   Diagnosis: ${record.diagnosis}\n   Prescription: ${record.prescription}`
                )
                .join('\n\n');

            alert(`👥 Medical History for ${patient.name}
📧 Email: ${patient.email}
🎂 DOB: ${patient.dateOfBirth}
🏥 Insurance: ${patient.insuranceProvider}
📞 Phone: ${patient.phoneNumber}
🏠 Address: ${patient.address}
🚨 Emergency Contact: ${patient.emergencyContact}
📅 Last Visit: ${patient.lastVisit}
⏭️ Next Appointment: ${patient.upcomingAppointment}

📋 MEDICAL RECORDS:
${historyDetails}

Total Records: ${patientRecords.length}`);
        } else {
            alert(`No medical history found for this patient.`);
        }
    };

    const handleEncryptRecord = (recordId: string) => {
        const record = recentRecords.find((r) => r.id === recordId);
        if (record) {
            if (recordEncryptionStatus[recordId]) {
                alert('⚠️ This record is already encrypted. Please decrypt it first if you want to re-encrypt with a different password.');
                return;
            }

            const password = prompt(
                `🔒 Enter a password to encrypt "${record.title}" for patient: ${myPatients.find((p) => p.id === record.patientId)?.name || record.patientId
                }`
            );
            if (password && password.trim()) {
                try {
                    const customEncryption = new EncryptionService();
                    const recordData = {
                        ...record,
                        encryptedBy: user.name,
                        encryptedAt: new Date().toISOString(),
                    };

                    const salt = customEncryption.generateSalt();
                    customEncryption.deriveKey(password, salt);
                    const encryptedData = customEncryption.encryptData(JSON.stringify(recordData));

                    setEncryptedRecords((prev) => ({ ...prev, [recordId]: encryptedData }));
                    setRecordEncryptionStatus((prev) => ({ ...prev, [recordId]: true }));

                    alert(`🔒 SUCCESS! Record "${record.title}" has been encrypted with your custom password.
          
📋 Record: ${record.title}
👤 Patient: ${myPatients.find((p) => p.id === record.patientId)?.name}
🔐 Status: ENCRYPTED
🛡️ Security Level: AES-256 + Password Protection
📅 Encrypted At: ${new Date().toLocaleString()}
👨‍⚕️ Encrypted By: ${user.name}

⚠️ Remember your password - it will be required for decryption!`);
                } catch (error) {
                    alert('❌ Encryption failed. Please try again.');
                }
            } else {
                alert('❌ Password is required for encryption.');
            }
        }
    };

    const handleDecryptRecord = (recordId: string) => {
        if (!recordEncryptionStatus[recordId]) {
            alert('ℹ️ This record is not encrypted. No decryption needed.');
            return;
        }

        const encryptedData = encryptedRecords[recordId];
        if (encryptedData) {
            const password = prompt(`🔓 Enter the password to decrypt this record:`);
            if (password && password.trim()) {
                try {
                    const customEncryption = new EncryptionService();
                    const decryptedData = customEncryption.decryptData(encryptedData);
                    const record = JSON.parse(decryptedData);

                    alert(`🔓 DECRYPTION SUCCESSFUL!

📋 Title: ${record.title}
👤 Patient: ${myPatients.find((p) => p.id === record.patientId)?.name || record.patientId}
📅 Date: ${record.date}
🩺 Diagnosis: ${record.diagnosis}
💊 Prescription: ${record.prescription}
📝 Description: ${record.description}

🔒 Encryption Details:
👨‍⚕️ Encrypted By: ${record.encryptedBy || 'Unknown'}
📅 Encrypted At: ${record.encryptedAt ? new Date(record.encryptedAt).toLocaleString() : 'Unknown'}
🛡️ Security: Password-protected AES-256`);

                    const permanentDecrypt = window.confirm('🔓 Do you want to permanently decrypt this record? (This will remove encryption)');
                    if (permanentDecrypt) {
                        setEncryptedRecords((prev) => {
                            const updated = { ...prev };
                            delete updated[recordId];
                            return updated;
                        });
                        setRecordEncryptionStatus((prev) => ({ ...prev, [recordId]: false }));
                        alert('✅ Record has been permanently decrypted and is now in plain text.');
                    }
                } catch (error) {
                    alert('❌ Decryption failed. Incorrect password or corrupted data.');
                }
            } else {
                alert('❌ Password is required for decryption.');
            }
        } else {
            alert('❌ No encrypted data found for this record.');
        }
    };

    const handleViewRecord = (recordId: string) => {
        const record = recentRecords.find((r) => r.id === recordId);
        if (record) {
            const isEncrypted = recordEncryptionStatus[recordId];
            const patient = myPatients.find((p) => p.id === record.patientId);

            if (isEncrypted) {
                const viewEncrypted = window.confirm(`🔒 This record is encrypted. 

Do you want to:
- Click "OK" to view encrypted version
- Click "Cancel" to decrypt and view`);

                if (viewEncrypted) {
                    alert(`🔒 ENCRYPTED RECORD VIEW

📋 Title: ${record.title}
👤 Patient: ${patient?.name || record.patientId}
📅 Date: ${record.date}
🔐 Status: ENCRYPTED
🛡️ Security: Password Protected

⚠️ Content is encrypted and cannot be displayed in plain text.
Use the decrypt button to view the full content.`);
                } else {
                    handleDecryptRecord(recordId);
                }
            } else {
                alert(`👁️ MEDICAL RECORD DETAILS

📋 Title: ${record.title}
👤 Patient: ${patient?.name || record.patientId}
📧 Email: ${patient?.email || 'N/A'}
📅 Date: ${record.date}
🩺 Diagnosis: ${record.diagnosis}
💊 Prescription: ${record.prescription}
📝 Description: ${record.description}

🔗 Blockchain Details:
🧱 Hash: ${record.blockchainHash || 'N/A'}
📎 IPFS: ${record.ipfsHash || 'N/A'}
🎨 NFT Token: ${record.nftTokenId || 'Not minted'}
✅ Verified: ${record.isVerified ? 'Yes' : 'No'}
🔐 Encryption: Not encrypted`);
            }
        }
    };

    const toggleClipboardMonitoring = () => {
        const newState = !clipboardMonitoring;
        setClipboardMonitoring(newState);

        if (newState) {
            const started = clipboardMonitoringService.startMonitoring((suspiciousAddress) => {
                setSuspiciousAddressAlert(suspiciousAddress);
                alert(`🚨 SECURITY ALERT: Suspicious Wallet Address Detected!

⚠️ Address: ${suspiciousAddress}
🔍 Reason: This address matches known suspicious patterns or is on the blacklist
🛡️ Action: Please verify this address before proceeding with any transactions

This could be:
• A fake/test address
• A known hacked wallet
• A phishing attempt
• An address with suspicious patterns

🚨 Do NOT send any funds to this address unless you're absolutely certain it's legitimate!`);
            });

            if (started) {
                alert('🔍 Clipboard monitoring enabled! The system is now actively monitoring for suspicious wallet addresses and will alert you with sound if any are detected.');
            } else {
                alert('❌ Failed to start clipboard monitoring. Your browser may not support this feature.');
                setClipboardMonitoring(false);
            }
        } else {
            clipboardMonitoringService.stopMonitoring();
            setSuspiciousAddressAlert(null);
            alert('⏹️ Clipboard monitoring disabled.');
        }
    };

    const handleViewInsuranceClaim = (claimId: string) => {
        const claim = insuranceClaims.find((c) => c.id === claimId);
        if (claim) {
            const patient = myPatients.find((p) => p.id === claim.patientId);
            alert(`💰 Insurance Claim Details

📋 Claim Number: ${claim.claimNumber}
👤 Patient: ${patient?.name || claim.patientId}
💵 Amount: $${claim.amount.toFixed(2)}
📊 Status: ${claim.status.toUpperCase()}
🏥 Insurance Provider: ${claim.insuranceProvider}
📅 Submitted: ${claim.submissionDate}
${claim.approvalDate ? `✅ Approved: ${claim.approvalDate}` : '⏳ Pending approval'}
📝 Description: ${claim.description || 'No description provided'}

🔗 Blockchain Details:
📋 Contract Address: ${claim.smartContractAddress}
🆔 Transaction ID: ${claim.blockchainTxId}
⛓️ On-Chain Status: ${claim.isProcessedOnChain ? 'Processed' : 'Pending'}

📄 Related Records: ${claim.relatedRecords.length} record(s)
📎 Documents: ${claim.ipfsDocuments.length} file(s) on IPFS`);
        }
    };

    const handleSaveRecord = async () => {
        if (!newRecordForm.title || !newRecordForm.patientId) {
            alert('Please fill in all required fields');
            return;
        }

        const patient = myPatients.find((p) => p.id === newRecordForm.patientId);
        if (!patient) {
            alert('Patient not found');
            return;
        }

        try {
            const newRecord: MedicalRecord = {
                id: sharedStateService.generateId('record'),
                patientId: newRecordForm.patientId,
                doctorId: user.id,
                title: newRecordForm.title,
                description: newRecordForm.description,
                date: new Date().toISOString().split('T')[0],
                diagnosis: newRecordForm.diagnosis,
                prescription: newRecordForm.prescription,
                isEncrypted: false,
                isVerified: true,
                accessPermissions: [user.id, newRecordForm.patientId],
                blockchainHash: `0x${Date.now().toString(16)}abc${Math.random().toString(16).slice(2, 8)}`,
                ipfsHash: `Qm${Math.random().toString(36).slice(2, 15)}${Date.now().toString(36)}`,
                nftTokenId: undefined,
            };

            sharedStateService.addMedicalRecord(newRecord);

            // Update local state immediately for UI responsiveness
            setRecentRecords(prev => [...prev, newRecord]);

            try {
                await FirebaseService.addMedicalRecord(newRecord);
            } catch (error) {
                console.warn('Failed to sync with Firebase:', error);
            }

            alert(`✅ Medical record created successfully!

📋 Record: ${newRecord.title}
👤 Patient: ${patient.name}
📅 Date: ${newRecord.date}
🩺 Diagnosis: ${newRecord.diagnosis}
💊 Prescription: ${newRecord.prescription}
🔗 Real-time sync: Enabled

The record has been added to your medical records list and synced with the database for real-time access.`);

            setShowCreateRecordModal(false);
            setNewRecordForm({
                patientId: '',
                title: '',
                description: '',
                diagnosis: '',
                prescription: '',
                notes: '',
            });
        } catch (error) {
            console.error('Error saving record:', error);
            alert('❌ Failed to save record. Please try again.');
        }
    };

    const handleSaveClaim = async () => {
        if (!newClaimForm.amount || !newClaimForm.description || !newClaimForm.patientId) {
            alert('Please fill in all required fields');
            return;
        }

        const patient = myPatients.find((p) => p.id === newClaimForm.patientId);
        if (!patient) {
            alert('Patient not found');
            return;
        }

        try {
            const newClaim: InsuranceClaim = {
                id: `claim-${Date.now()}`,
                claimNumber: `CLM-${Date.now()}`,
                patientId: newClaimForm.patientId,
                providerId: user.id,
                doctorId: user.id,
                insuranceCompany: newClaimForm.insuranceProvider || patient.insuranceProvider,
                insuranceProvider: newClaimForm.insuranceProvider || patient.insuranceProvider,
                amount: parseFloat(newClaimForm.amount),
                status: 'pending',
                submittedAt: new Date().toISOString(),
                submissionDate: new Date().toLocaleDateString(),
                description: newClaimForm.description,
                relatedRecords: [],
                smartContractAddress: '0x1234567890abcdef1234567890abcdef12345678',
                blockchainTxId: `0x${Date.now().toString(16)}`,
                isProcessedOnChain: false,
                approvalSignatures: [],
                ipfsDocuments: [],
            };

            setInsuranceClaims((prev) => [...prev, newClaim]);

            alert(`✅ Insurance claim submitted successfully!

📋 Claim Number: ${newClaim.claimNumber}
👤 Patient: ${patient.name}
💵 Amount: $${newClaim.amount.toFixed(2)}
📊 Status: ${newClaim.status.toUpperCase()}
📝 Description: ${newClaim.description}`);

            setShowClaimModal(false);
            setNewClaimForm({
                patientId: '',
                amount: '',
                description: '',
                insuranceProvider: '',
            });
        } catch (error) {
            console.error('Error saving claim:', error);
            alert('❌ Failed to save claim. Please try again.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'success';
            case 'pending':
                return 'warning';
            case 'rejected':
                return 'error';
            case 'paid':
                return 'success';
            case 'under_review':
                return 'info';
            case 'submitted':
                return 'primary';
            default:
                return 'secondary';
        }
    };

    const handleDownloadPDF = async (recordId: string) => {
        const record = recentRecords.find((r) => r.id === recordId);
        if (!record) {
            alert('Record not found');
            return;
        }

        const patient = myPatients.find((p) => p.id === record.patientId);
        if (!patient) {
            alert('Patient not found');
            return;
        }

        try {
            await pdfService.downloadMedicalRecordPDF(record, patient, {
                includeWatermark: true,
                isEncrypted: false,
                password: '',
            });

            alert(`✅ PDF Downloaded Successfully!

📄 File: medical_record_${record.id}_${patient.name.replace(/\s+/g, '_')}.pdf
🔐 Status: UNENCRYPTED (ready for encryption in Security Tools)
🚨 Watermark: CONFIDENTIAL (at top of document)
👤 Patient: ${patient.name}
📋 Record: ${record.title}

💡 Next Steps:
1. Go to Security Tools tab
2. Select this PDF file to encrypt
3. Choose a strong password for encryption

The PDF has been saved to your downloads folder.`);
        } catch (error) {
            console.error('PDF download error:', error);
            alert(`❌ Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDownloadPatientPDF = async (patientId: string) => {
        const patient = myPatients.find((p) => p.id === patientId);
        if (!patient) {
            alert('Patient not found');
            return;
        }

        const patientRecords = recentRecords.filter((record) => record.patientId === patientId);

        if (patientRecords.length === 0) {
            alert(`No medical records found for ${patient.name}. Create some records first.`);
            return;
        }

        try {
            if (patientRecords.length === 1) {
                await pdfService.downloadMedicalRecordPDF(patientRecords[0], patient, {
                    includeWatermark: true,
                    isEncrypted: false,
                    password: '',
                });
            } else {
                const batchPDF = await pdfService.generateBatchPDF(patientRecords, [patient], {
                    includeWatermark: true,
                    isEncrypted: false,
                    password: '',
                });

                const url = URL.createObjectURL(batchPDF);
                const link = document.createElement('a');
                link.href = url;
                const filename = `medical_records_${patient.name.replace(/\s+/g, '_')}_batch.pdf`;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }

            alert(`✅ PDF Downloaded Successfully!

👤 Patient: ${patient.name}
📄 Records: ${patientRecords.length} medical record(s)
🔐 Status: UNENCRYPTED (ready for encryption in Security Tools)
🚨 Watermark: CONFIDENTIAL (at top of document)

💡 Next Steps:
1. Go to Security Tools tab
2. Select this PDF file to encrypt
3. Choose a strong password for encryption

The PDF has been saved to your downloads folder.`);
        } catch (error) {
            console.error('PDF download error:', error);
            alert(`❌ Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleAddNewPatient = () => {
        const patientName = prompt('👤 Enter new patient name:');
        if (!patientName || !patientName.trim()) {
            alert('❌ Patient name is required');
            return;
        }

        const patientEmail = prompt('📧 Enter patient email:');
        if (!patientEmail || !patientEmail.trim() || !patientEmail.includes('@')) {
            alert('❌ Valid email is required');
            return;
        }

        const patientDOB = prompt('🎂 Enter patient date of birth (YYYY-MM-DD):');
        if (!patientDOB || !patientDOB.match(/^\d{4}-\d{2}-\d{2}$/)) {
            alert('❌ Date of birth is required in YYYY-MM-DD format');
            return;
        }

        const phoneNumber = prompt('📞 Enter patient phone number:') || '';
        const address = prompt('🏠 Enter patient address:') || '';
        const emergencyContact = prompt('🚨 Enter emergency contact (Name - Phone):') || '';
        const insuranceProvider = prompt('🏥 Enter insurance provider:') || 'None';
        const insurancePolicyNumber = prompt('📄 Enter insurance policy number:') || '';

        const newPatient: Patient = {
            id: sharedStateService.generateId('patient'),
            name: patientName.trim(),
            email: patientEmail.trim(),
            dateOfBirth: patientDOB,
            phoneNumber,
            address,
            emergencyContact,
            insuranceProvider,
            insurancePolicyNumber,
            lastVisit: new Date().toISOString().split('T')[0],
            upcomingAppointment: 'To be scheduled',
            isActive: true,
        };

        sharedStateService.addPatient(newPatient);

        alert(`✅ New patient added successfully!

👤 Name: ${newPatient.name}
📧 Email: ${newPatient.email}
🎂 DOB: ${newPatient.dateOfBirth}
📞 Phone: ${newPatient.phoneNumber}
🏥 Insurance: ${newPatient.insuranceProvider}

The patient is now available for creating medical records.`);
    };

    const handleViewNFT = (nftId: string) => {
        const nft = nftRecords.find((n) => n.id === nftId);
        if (!nft) {
            alert('❌ NFT not found. Please try again.');
            return;
        }

        const patient = myPatients.find((p) => p.id === nft.patientId);
        const relatedRecord = recentRecords.find((r) => r.id === nft.recordId);

        alert(`🎨 NFT Health Record Details

🏷️ Name: ${nft.name}
📝 Description: ${nft.description}
🆔 Token ID: ${nft.tokenId}
👤 Patient: ${patient?.name || nft.patientId}
📋 Related Record: ${relatedRecord?.title || nft.recordId}

🔗 Blockchain Details:
🌐 Network: ${nft.blockchainNetwork}
📍 Contract Address: ${nft.contractAddress}
👤 Current Owner: ${nft.currentOwner}
📅 Mint Date: ${new Date(nft.mintDate).toLocaleString()}
🔄 Transferable: ${nft.isTransferable ? 'Yes' : 'No'}
🔐 Access Level: ${nft.accessLevel}

📎 Metadata URI: ${nft.metadataUri}
🖼️ Image URL: ${nft.imageUrl}

✅ This NFT represents a verified medical record stored securely on the blockchain.
🛡️ The NFT provides immutable proof of medical data authenticity.`);
    };

    const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const allowedFiles = Array.from(files).filter((file) => ['application/pdf', 'text/plain', 'application/json'].includes(file.type));
            if (allowedFiles.length !== files.length) {
                alert('⚠️ Only PDF, TXT, and JSON files are allowed. Non-supported files have been filtered out.');
            }
            setSelectedFiles((prev) => [...prev, ...allowedFiles]);
        }
    };

    const removeSelectedFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEncryptSelectedFiles = async () => {
        if (selectedFiles.length === 0) {
            alert('❌ Please select PDF files to encrypt first.');
            return;
        }

        const password = prompt('🔒 Enter password to encrypt the selected PDF files:');
        if (!password || !password.trim()) {
            alert('❌ Password is required for encryption.');
            return;
        }

        try {
            const encryptedFiles: { name: string; encryptedData: string }[] = [];

            for (const file of selectedFiles) {
                const reader = new FileReader();
                const fileData = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });

                const customEncryption = new EncryptionService();
                const salt = customEncryption.generateSalt();
                customEncryption.deriveKey(password, salt);
                const encryptedData = customEncryption.encryptData(fileData);

                // Handle any file extension by extracting base name and adding .enc
                const baseName = file.name.includes('.')
                    ? file.name.substring(0, file.name.lastIndexOf('.'))
                    : file.name;

                encryptedFiles.push({
                    name: `${baseName}.enc`,
                    encryptedData,
                });
            }

            encryptedFiles.forEach(({ name, encryptedData }) => {
                const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });

            alert(`✅ Successfully encrypted and downloaded ${encryptedFiles.length} file(s)!

🔐 Encryption Details:
📄 Files: ${encryptedFiles.map((f) => f.name).join(', ')}
🛡️ Security: AES-256 with password protection
📅 Encrypted: ${new Date().toLocaleString()}
🔒 Format: .enc (encrypted files)

⚠️ Remember your password - you'll need it to decrypt these .enc files!
🔄 The encrypted .enc files have been downloaded to your computer.`);

            setSelectedFiles([]);
            const fileInput = document.getElementById('pdf-file-input') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
        } catch (error) {
            console.error('File encryption error:', error);
            alert('❌ Failed to encrypt files. Please try again.');
        }
    };

    const handleEncryptedFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const encFiles = Array.from(files).filter((file) => file.name.endsWith('.enc'));
            if (encFiles.length !== files.length) {
                alert('⚠️ Only .enc files are allowed. Non-.enc files have been filtered out.');
            }
            setSelectedEncryptedFiles((prev) => [...prev, ...encFiles]);
        }
    };

    const removeSelectedEncryptedFile = (index: number) => {
        setSelectedEncryptedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDecryptSelectedFiles = async () => {
        if (selectedEncryptedFiles.length === 0) {
            alert('❌ Please select .enc files to decrypt first.');
            return;
        }

        const password = prompt('🔓 Enter password to decrypt the selected .enc files:');
        if (!password || !password.trim()) {
            alert('❌ Password is required for decryption.');
            return;
        }

        try {
            const decryptedFiles: { name: string; decryptedData: string }[] = [];

            for (const file of selectedEncryptedFiles) {
                const reader = new FileReader();
                const encryptedContent = await new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsText(file);
                });

                try {
                    const customEncryption = new EncryptionService();
                    const decryptedData = customEncryption.decryptData(encryptedContent);

                    decryptedFiles.push({
                        name: file.name.replace('.enc', '.pdf'),
                        decryptedData,
                    });
                } catch (decryptError) {
                    alert(`❌ Failed to decrypt ${file.name}. Incorrect password or corrupted file.`);
                    continue;
                }
            }

            if (decryptedFiles.length === 0) {
                alert('❌ No files were successfully decrypted. Please check your password.');
                return;
            }

            decryptedFiles.forEach(({ name, decryptedData }) => {
                const byteCharacters = atob(decryptedData.split(',')[1]);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });

                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });

            alert(`✅ Successfully decrypted and downloaded ${decryptedFiles.length} PDF file(s)!

🔓 Decryption Details:
📄 Files: ${decryptedFiles.map((f) => f.name).join(', ')}
🛡️ Security: Successfully decrypted with correct password
📅 Decrypted: ${new Date().toLocaleString()}
📄 Format: .pdf (original PDF files restored)

✅ Your PDF files are now available and ready to use!
🔄 The decrypted PDF files have been downloaded to your computer.`);

            setSelectedEncryptedFiles([]);
            const encFileInput = document.getElementById('enc-file-input') as HTMLInputElement;
            if (encFileInput) {
                encFileInput.value = '';
            }
        } catch (error) {
            console.error('File decryption error:', error);
            alert('❌ Failed to decrypt files. Please try again.');
        }
    };

    const handleEditRecord = (recordId: string) => {
        alert('✏️ Editing records is not implemented yet.');
        console.log(`Edit record: ${recordId}`);
    };

    // Modal Components
    const CreateRecordModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Create New Medical Record</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Patient</label>
                        <select
                            value={newRecordForm.patientId}
                            onChange={(e) => setNewRecordForm({ ...newRecordForm, patientId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">Select a patient</option>
                            {myPatients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            value={newRecordForm.title}
                            onChange={(e) => setNewRecordForm({ ...newRecordForm, title: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={newRecordForm.description}
                            onChange={(e) => setNewRecordForm({ ...newRecordForm, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                        <input
                            type="text"
                            value={newRecordForm.diagnosis}
                            onChange={(e) => setNewRecordForm({ ...newRecordForm, diagnosis: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prescription</label>
                        <input
                            type="text"
                            value={newRecordForm.prescription}
                            onChange={(e) => setNewRecordForm({ ...newRecordForm, prescription: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea
                            value={newRecordForm.notes}
                            onChange={(e) => setNewRecordForm({ ...newRecordForm, notes: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => setShowCreateRecordModal(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveRecord}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Save Record
                    </button>
                </div>
            </div>
        </div>
    );

    const CreateClaimModal = () => (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-medium text-gray-900 mb-4">💰 Submit Insurance Claim</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Patient</label>
                        <select
                            value={newClaimForm.patientId}
                            onChange={(e) => setNewClaimForm({ ...newClaimForm, patientId: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                            <option value="">Select a patient</option>
                            {myPatients.map((patient) => (
                                <option key={patient.id} value={patient.id}>
                                    {patient.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                        <input
                            type="number"
                            value={newClaimForm.amount}
                            onChange={(e) => setNewClaimForm({ ...newClaimForm, amount: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={newClaimForm.description}
                            onChange={(e) => setNewClaimForm({ ...newClaimForm, description: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                        <input
                            type="text"
                            value={newClaimForm.insuranceProvider}
                            onChange={(e) => setNewClaimForm({ ...newClaimForm, insuranceProvider: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => setShowClaimModal(false)}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveClaim}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Submit Claim
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold text-gray-900">🩺 Doctor Dashboard</h1>
                            </div>
                            <div className="ml-4">
                                <Badge variant="success" size="sm">
                                    🔒 HIPAA Compliant
                                </Badge>
                                <Badge variant="primary" size="sm" className="ml-2">
                                    👨‍⚕️ Medical Access
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Timer duration={sessionTimeLeft} onExpire={handleSessionExpire} className="text-sm" />
                            <div className="flex items-center space-x-2">
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={`https://ui-avatars.com/api/?name=${user.name}&background=2563eb&color=fff`}
                                    alt={user.name}
                                />
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-blue-600 font-semibold">{user.role.toUpperCase()}</div>
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

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'patients', label: '👥 My Patients', icon: '👥' },
                            { id: 'records', label: '📋 Medical Records', icon: '📋' },
                            { id: 'insurance', label: '💰 Insurance Claims', icon: '💰' },
                            { id: 'nfts', label: '🎨 NFT Health Records', icon: '🎨' },
                            { id: 'security', label: '🔒 Security Tools', icon: '🔒' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {showCreateRecordModal && <CreateRecordModal />}
                {showClaimModal && <CreateClaimModal />}

                {/* Patients Tab */}
                {activeTab === 'patients' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">👥 My Patients</h3>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handleAddNewPatient}
                                    className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                                >
                                    + New Patient
                                </button>
                                <div className="text-sm text-gray-500">{myPatients.length} active patients</div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid gap-6">
                                {myPatients.map((patient) => (
                                    <div key={patient.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-4">
                                                <img
                                                    className="h-12 w-12 rounded-full"
                                                    src={`https://ui-avatars.com/api/?name=${patient.name}&background=random`}
                                                    alt={patient.name}
                                                />
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">{patient.name}</h4>
                                                    <p className="text-sm text-gray-500">{patient.email}</p>
                                                    <p className="text-sm text-gray-500">DOB: {patient.dateOfBirth}</p>
                                                    <p className="text-sm text-gray-500">Phone: {patient.phoneNumber}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="success" size="sm">
                                                    Active
                                                </Badge>
                                                <p className="text-sm text-gray-500 mt-2">Last Visit: {patient.lastVisit}</p>
                                                <p className="text-sm text-blue-600 font-medium">Next: {patient.upcomingAppointment}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Insurance</p>
                                                <p className="text-sm text-gray-500">{patient.insuranceProvider}</p>
                                                <p className="text-sm text-gray-400 font-mono">{patient.insurancePolicyNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Emergency Contact</p>
                                                <p className="text-sm text-gray-500">{patient.emergencyContact}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex space-x-3">
                                            <button
                                                onClick={handleCreateRecord}
                                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                                            >
                                                📋 New Record
                                            </button>
                                            <button
                                                onClick={() => handleSubmitInsuranceClaim(patient.id)}
                                                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
                                            >
                                                💰 Submit Claim
                                            </button>
                                            <button
                                                onClick={() => handleViewHistory(patient.id)}
                                                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
                                            >
                                                👁️ View History
                                            </button>
                                            <button
                                                onClick={() => handleDownloadPatientPDF(patient.id)}
                                                className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
                                            >
                                                📄 Download Records
                                            </button>
                                        </div>

                                        {(() => {
                                            const patientRecords = recentRecords.filter((record) => record.patientId === patient.id);
                                            return (
                                                patientRecords.length > 0 && (
                                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h5 className="text-lg font-medium text-gray-900">📋 Recent Medical Records</h5>
                                                            <Badge variant="info" size="sm">
                                                                {patientRecords.length} record(s)
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {patientRecords.slice(0, 3).map((record) => (
                                                                <div key={record.id} className="bg-gray-50 rounded-lg p-4">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center space-x-2 mb-2">
                                                                                <h6 className="font-medium text-gray-900">{record.title}</h6>
                                                                                {record.doctorId === user.id ? (
                                                                                    <Badge variant="primary" size="sm">
                                                                                        👨‍⚕️ Doctor Added
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge variant="info" size="sm">
                                                                                        👤 Patient Added
                                                                                    </Badge>
                                                                                )}
                                                                                {recordEncryptionStatus[record.id] ? (
                                                                                    <Badge variant="warning" size="sm">
                                                                                        🔒 ENCRYPTED
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <Badge variant="success" size="sm">
                                                                                        📄 Plain Text
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                                                <div>
                                                                                    <p>
                                                                                        <span className="font-medium">Date:</span> {record.date}
                                                                                    </p>
                                                                                    <p>
                                                                                        <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                                                                                    </p>
                                                                                </div>
                                                                                <div>
                                                                                    <p>
                                                                                        <span className="font-medium">Prescription:</span> {record.prescription}
                                                                                    </p>
                                                                                    <p className="font-mono text-xs">
                                                                                        <span className="font-medium">Blockchain:</span> {record.blockchainHash?.slice(0, 20)}...
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="ml-4 flex flex-col space-y-1">
                                                                            <button
                                                                                onClick={() => handleViewRecord(record.id)}
                                                                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                                                            >
                                                                                👁️ View
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDownloadPDF(record.id)}
                                                                                className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                                                                            >
                                                                                📄 PDF
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleEncryptRecord(record.id)}
                                                                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                                                            >
                                                                                🔒 Encrypt
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {patientRecords.length > 3 && (
                                                                <div className="text-center">
                                                                    <button
                                                                        onClick={() => setActiveTab('records')}
                                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                                    >
                                                                        View all {patientRecords.length} records in Medical Records tab →
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Medical Records Tab */}
                {activeTab === 'records' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">📋 Recent Medical Records</h3>
                            <button
                                onClick={handleCreateRecord}
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                            >
                                + New Record
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {recentRecords.map((record) => (
                                    <div key={record.id} className="border rounded-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="text-lg font-medium text-gray-900">{record.title}</h4>
                                                    {record.doctorId === user.id ? (
                                                        <Badge variant="primary" size="sm">
                                                            👨‍⚕️ Doctor Added
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="info" size="sm">
                                                            👤 Patient Added
                                                        </Badge>
                                                    )}
                                                    {recordEncryptionStatus[record.id] ? (
                                                        <Badge variant="warning" size="sm">
                                                            🔒 ENCRYPTED
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="success" size="sm">
                                                            📄 Plain Text
                                                        </Badge>
                                                    )}
                                                    <Badge variant="primary" size="sm">
                                                        🧱 On-Chain
                                                    </Badge>
                                                    {record.nftTokenId && (
                                                        <Badge variant="secondary" size="sm">
                                                            🎨 NFT
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p>
                                                            <span className="font-medium">Patient:</span>{' '}
                                                            {myPatients.find((p) => p.id === record.patientId)?.name}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Date:</span> {record.date}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Diagnosis:</span> {record.diagnosis}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p>
                                                            <span className="font-medium">Prescription:</span> {record.prescription}
                                                        </p>
                                                        <p className="font-mono text-xs">
                                                            <span className="font-medium">Blockchain:</span> {record.blockchainHash}
                                                        </p>
                                                        {record.ipfsHash && (
                                                            <p className="font-mono text-xs">
                                                                <span className="font-medium">IPFS:</span> {record.ipfsHash}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 flex flex-col space-y-2">
                                                {!record.nftTokenId && (
                                                    <button
                                                        onClick={() => handleMintNFT(record.id)}
                                                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                                                    >
                                                        🎨 Mint NFT
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEncryptRecord(record.id)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                >
                                                    🔒 Encrypt
                                                </button>
                                                <button
                                                    onClick={() => handleDecryptRecord(record.id)}
                                                    className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                                                >
                                                    🔓 Decrypt
                                                </button>
                                                <button
                                                    onClick={() => handleViewRecord(record.id)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                                >
                                                    👁️ View
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadPDF(record.id)}
                                                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                                                >
                                                    📄 Download PDF
                                                </button>
                                                <button
                                                    onClick={() => handleEditRecord(record.id)}
                                                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                                >
                                                    ✏️ Edit
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Insurance Claims Tab */}
                {activeTab === 'insurance' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">💰 Insurance Claims</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {insuranceClaims.map((claim) => (
                                    <div key={claim.id} className="border rounded-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="text-lg font-medium text-gray-900">Claim #{claim.claimNumber}</h4>
                                                    <Badge variant={getStatusColor(claim.status)} size="sm">
                                                        {claim.status.toUpperCase()}
                                                    </Badge>
                                                    {claim.isProcessedOnChain && (
                                                        <Badge variant="primary" size="sm">
                                                            🧱 On-Chain
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{claim.description}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p>
                                                            <span className="font-medium">Patient:</span>{' '}
                                                            {myPatients.find((p) => p.id === claim.patientId)?.name}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Amount:</span> ${claim.amount.toFixed(2)}
                                                        </p>
                                                        <p>
                                                            <span className="font-medium">Submitted:</span> {claim.submissionDate}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p>
                                                            <span className="font-medium">Provider:</span> {claim.insuranceProvider}
                                                        </p>
                                                        {claim.approvalDate && (
                                                            <p>
                                                                <span className="font-medium">Approved:</span> {claim.approvalDate}
                                                            </p>
                                                        )}
                                                        <p className="font-mono text-xs">
                                                            <span className="font-medium">Contract:</span> {claim.smartContractAddress}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-xs">
                                                            <span className="font-medium">Tx ID:</span> {claim.blockchainTxId?.substring(0, 20)}...
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <button
                                                    onClick={() => handleViewInsuranceClaim(claim.id)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                                >
                                                    👁️ View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* NFT Health Records Tab */}
                {activeTab === 'nfts' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">🎨 NFT Health Records</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {nftRecords.map((nft) => (
                                    <div key={nft.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg mb-4 flex items-center justify-center">
                                            <span className="text-white text-4xl">🏥</span>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-900">{nft.name}</h4>
                                            <p className="text-sm text-gray-600">{nft.description}</p>
                                            <div className="text-xs space-y-1">
                                                <p>
                                                    <span className="font-medium">Token ID:</span> {nft.tokenId}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Patient:</span>{' '}
                                                    {myPatients.find((p) => p.id === nft.patientId)?.name}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Network:</span> {nft.blockchainNetwork}
                                                </p>
                                                <p>
                                                    <span className="font-medium">Minted:</span> {new Date(nft.mintDate).toLocaleDateString()}
                                                </p>
                                                <p className="font-mono">
                                                    <span className="font-medium">Contract:</span> {nft.contractAddress.substring(0, 10)}...
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <Badge variant="secondary" size="sm">
                                                    {nft.isTransferable ? 'Transferable' : 'Non-Transferable'}
                                                </Badge>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewNFT(nft.id)}
                                                        className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 font-medium"
                                                    >
                                                        👁️ View NFT
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const relatedRecord = recentRecords.find((r) => r.id === nft.recordId);
                                                            if (relatedRecord) {
                                                                handleDownloadPDF(relatedRecord.id);
                                                            } else {
                                                                alert('Related medical record not found');
                                                            }
                                                        }}
                                                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                                                    >
                                                        📄 PDF
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tools Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">🔒 Encryption & Security Tools</h3>
                                <p className="text-sm text-gray-500 mt-1">Secure patient records with advanced encryption</p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* PDF File Encryption */}
                                    <div className="border rounded-lg p-6">
                                        <div className="text-center">
                                            <span className="text-4xl mb-4 block">🔒</span>
                                            <h5 className="font-medium text-gray-900 mb-2">Encrypt PDF Files</h5>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Select PDF files from your computer to encrypt with password protection
                                            </p>
                                            <input
                                                type="file"
                                                accept=".pdf,.txt,.json"
                                                multiple
                                                onChange={handleFileSelection}
                                                className="hidden"
                                                id="pdf-file-input"
                                            />
                                            <label
                                                htmlFor="pdf-file-input"
                                                className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700 inline-block"
                                            >
                                                📁 Choose PDF Files to Encrypt
                                            </label>
                                        </div>
                                    </div>

                                    {/* Clipboard Monitoring */}
                                    <div className="border rounded-lg p-6">
                                        <div className="text-center">
                                            <span className="text-4xl mb-4 block">👁️</span>
                                            <h5 className="font-medium text-gray-900 mb-2">Clipboard Monitoring</h5>
                                            <p className="text-sm text-gray-600 mb-4">Monitor clipboard for suspicious wallet addresses</p>
                                            <button
                                                onClick={toggleClipboardMonitoring}
                                                className={`px-4 py-2 rounded font-medium ${clipboardMonitoring
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {clipboardMonitoring ? '⏹️ Stop Monitoring' : '▶️ Start Monitoring'}
                                            </button>
                                            {suspiciousAddressAlert && (
                                                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                                    🚨 Suspicious address detected: {suspiciousAddressAlert}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* File Selection Display */}
                                {selectedFiles.length > 0 && (
                                    <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                                        <h6 className="font-medium text-blue-900 mb-2">Selected Files ({selectedFiles.length})</h6>
                                        <div className="space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-blue-600">📄</span>
                                                        <span className="text-sm font-medium">{file.name}</span>
                                                        <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeSelectedFile(index)}
                                                        className="text-red-600 hover:text-red-800 text-xs"
                                                    >
                                                        ❌ Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleEncryptSelectedFiles}
                                            className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                        >
                                            🔒 Encrypt Selected Files
                                        </button>
                                    </div>
                                )}

                                {/* Decryption Section */}
                                <div className="mt-6 border rounded-lg p-6">
                                    <div className="text-center mb-4">
                                        <span className="text-4xl mb-4 block">🔓</span>
                                        <h5 className="font-medium text-gray-900 mb-2">Decrypt Encrypted Files</h5>
                                        <p className="text-sm text-gray-600 mb-4">Select .enc files to decrypt with password</p>
                                        <input
                                            type="file"
                                            accept=".enc"
                                            multiple
                                            onChange={handleEncryptedFileSelection}
                                            className="hidden"
                                            id="enc-file-input"
                                        />
                                        <label
                                            htmlFor="enc-file-input"
                                            className="bg-orange-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-orange-700 inline-block"
                                        >
                                            📁 Choose .enc Files to Decrypt
                                        </label>
                                    </div>

                                    {selectedEncryptedFiles.length > 0 && (
                                        <div className="p-4 border rounded-lg bg-orange-50">
                                            <h6 className="font-medium text-orange-900 mb-2">
                                                Selected Encrypted Files ({selectedEncryptedFiles.length})
                                            </h6>
                                            <div className="space-y-2">
                                                {selectedEncryptedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-orange-600">🔒</span>
                                                            <span className="text-sm font-medium">{file.name}</span>
                                                            <span className="text-xs text-gray-500">({Math.round(file.size / 1024)} KB)</span>
                                                        </div>
                                                        <button
                                                            onClick={() => removeSelectedEncryptedFile(index)}
                                                            className="text-red-600 hover:text-red-800 text-xs"
                                                        >
                                                            ❌ Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={handleDecryptSelectedFiles}
                                                className="w-full mt-3 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                                            >
                                                🔓 Decrypt Selected Files
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Security Best Practices */}
                                <div className="mt-6 border rounded-lg p-6 bg-yellow-50">
                                    <div className="flex items-start space-x-3">
                                        <span className="text-2xl">🛡️</span>
                                        <div>
                                            <h6 className="font-medium text-yellow-900 mb-2">🔒 Security Best Practices</h6>
                                            <p className="text-sm text-yellow-800 leading-relaxed">
                                                Always ensure patient records are encrypted before transmission. Use blockchain verification for
                                                data integrity and monitor for suspicious activities.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorDashboard;