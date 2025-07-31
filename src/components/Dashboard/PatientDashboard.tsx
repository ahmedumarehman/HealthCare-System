import React, { useState, useEffect } from 'react';
import Badge from '../UI/Badge';
import Timer from '../UI/Timer';
import { User, MedicalRecord, InsuranceClaim, NFTHealthRecord, DataAccessRequest, AIHealthInsight } from '../../types';
import { RoleBasedAccessService } from '../../services/rbacService';
import PatientHealthRecords from './PatientHealthRecords';
import AIHealthChatbot from '../AI/AIHealthChatbot';
import { sharedStateService } from '../../services/sharedState';
import { FirebaseService } from '../../services/firebaseService';

interface PatientDashboardProps {
    user: User;
    onLogout: () => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onLogout }) => {
    const [sessionTimeLeft] = useState(1800);
    const [rbacService] = useState(new RoleBasedAccessService());
    const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'insurance' | 'nfts' | 'access' | 'ai'>('overview');

    const [myRecords, setMyRecords] = useState<MedicalRecord[]>([]);

    // Initialize data from Firebase and shared state service
    useEffect(() => {
        // Get initial data from shared state
        const records = sharedStateService.getMedicalRecordsByPatient(user.id);
        setMyRecords(records);

        // Subscribe to Firebase real-time changes for patient records
        const unsubscribeFirebase = FirebaseService.subscribePatientRecords(user.id, (firebaseRecords) => {
            // Sync Firebase records with shared state
            firebaseRecords.forEach(record => {
                if (!sharedStateService.getMedicalRecords().find(r => r.id === record.id)) {
                    sharedStateService.addMedicalRecord(record);
                }
            });
        });

        // Subscribe to shared state changes (for local updates)
        const unsubscribeSharedState = sharedStateService.onMedicalRecordsChange((allRecords) => {
            const patientRecords = allRecords.filter(record => record.patientId === user.id);
            setMyRecords(patientRecords);
        });

        return () => {
            unsubscribeFirebase();
            unsubscribeSharedState();
        };
    }, [user.id]);

    const [myInsuranceClaims] = useState<InsuranceClaim[]>([
        {
            id: 'claim-1',
            claimNumber: 'CLM-2025-001',
            patientId: user.id,
            providerId: 'doctor-1',
            doctorId: 'doctor-1',
            insuranceCompany: 'HealthFirst Insurance',
            insuranceProvider: 'HealthFirst Insurance',
            amount: 450.00,
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
            ipfsDocuments: []
        },
        {
            id: 'claim-2',
            claimNumber: 'CLM-2025-002',
            patientId: user.id,
            providerId: 'doctor-1',
            doctorId: 'doctor-1',
            insuranceCompany: 'HealthFirst Insurance',
            insuranceProvider: 'HealthFirst Insurance',
            amount: 85.00,
            status: 'pending',
            submittedAt: '2025-06-15T14:30:00Z',
            submissionDate: '2025-06-15',
            description: 'COVID-19 booster vaccination',
            relatedRecords: ['record-2'],
            smartContractAddress: '0x1234567890abcdef1234567890abcdef12345678',
            blockchainTxId: '0xdef456abc789123def456abc789123def456abc789123def',
            isProcessedOnChain: false,
            approvalSignatures: [],
            ipfsDocuments: []
        }
    ]);

    const [myNFTs] = useState<NFTHealthRecord[]>([
        {
            id: 'nft-1',
            tokenId: 'HEALTH-NFT-001',
            patientId: user.id,
            recordId: 'record-1',
            name: 'Annual Physical 2025',
            description: 'Comprehensive health examination record',
            imageUrl: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=NFT-001',
            metadataUri: 'ipfs://QmX9ZB7tRvWKHGK8P2mNv3qL5rA9wS6cF4dE2gH1jK0mP',
            contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
            blockchainNetwork: 'Ethereum',
            mintDate: '2025-07-04T10:30:00Z',
            currentOwner: user.id,
            isTransferable: false,
            accessLevel: 'patient_only'
        },
        {
            id: 'nft-2',
            tokenId: 'HEALTH-NFT-002',
            patientId: user.id,
            recordId: 'record-2',
            name: 'COVID-19 Vaccination',
            description: 'COVID-19 booster vaccination record',
            imageUrl: 'https://via.placeholder.com/200x200/059669/FFFFFF?text=NFT-002',
            metadataUri: 'ipfs://QmY8AX6sRvWKHGK8P2mNv3qL5rA9wS6cF4dE2gH1jK0nQ',
            contractAddress: '0x9876543210fedcba9876543210fedcba98765432',
            blockchainNetwork: 'Ethereum',
            mintDate: '2025-06-15T11:15:00Z',
            currentOwner: user.id,
            isTransferable: false,
            accessLevel: 'patient_only'
        }
    ]);

    const [accessRequests] = useState<DataAccessRequest[]>([
        {
            id: 'access-1',
            requesterId: 'doctor-2',
            requesterName: 'Dr. Emily Johnson',
            requesterRole: 'doctor',
            patientId: user.id,
            recordIds: ['record-1'],
            purpose: 'Second opinion consultation for ongoing treatment',
            requestDate: '2025-07-03',
            status: 'pending',
            expiryDate: '2025-07-10',
            smartContractAddress: '0x1111222233334444555566667777888899990000'
        },
        {
            id: 'access-2',
            requesterId: 'researcher-1',
            requesterName: 'Dr. Research Team',
            requesterRole: 'researcher',
            patientId: user.id,
            recordIds: ['record-1', 'record-2'],
            purpose: 'Anonymized data for healthcare research study',
            requestDate: '2025-07-02',
            status: 'approved',
            approvalDate: '2025-07-04',
            expiryDate: '2025-08-02',
            smartContractAddress: '0x2222333344445555666677778888999900001111'
        }
    ]);

    const [aiInsights] = useState<AIHealthInsight[]>([
        {
            id: 'insight-1',
            type: 'health_prediction',
            title: 'Preventive Care Recommendation',
            description: 'Based on your recent health data, consider scheduling a cardiovascular screening in the next 3 months.',
            confidence: 0.85,
            relevantRecords: ['record-1'],
            generatedDate: '2025-07-04',
            priority: 'medium',
            actionable: true,
            recommendations: [
                'Schedule cardiovascular screening',
                'Maintain current exercise routine',
                'Monitor blood pressure weekly'
            ]
        },
        {
            id: 'insight-2',
            type: 'medication_reminder',
            title: 'Vaccination Schedule',
            description: 'You may be due for your annual flu vaccination in the fall.',
            confidence: 0.92,
            relevantRecords: ['record-2'],
            generatedDate: '2025-07-04',
            priority: 'low',
            actionable: true,
            recommendations: [
                'Schedule flu vaccination for September/October',
                'Consult with your primary care physician'
            ]
        }
    ]);

    useEffect(() => {
        rbacService.setCurrentUser(user);
    }, [user, rbacService]);

    const handleSessionExpire = () => {
        window.confirm('Session expired for security. Please login again.') && onLogout();
    };

    const handleAccessRequest = (requestId: string, action: 'approve' | 'deny') => {
        const request = accessRequests.find(req => req.id === requestId);
        if (request) {
            if (action === 'approve') {
                alert(`✅ Access request from ${request.requesterName} has been APPROVED. They now have access to your medical records for the specified purpose: "${request.purpose}"`);
            } else {
                alert(`❌ Access request from ${request.requesterName} has been DENIED. They will not have access to your medical records.`);
            }
            console.log(`${action} access request: ${requestId}`);
        }
    };

    const handleViewNFT = (nftId: string) => {
        const nft = myNFTs.find(n => n.id === nftId);
        if (nft) {
            alert(`🎨 NFT Health Record Details:
            
📋 Name: ${nft.name}
🏥 Description: ${nft.description}
🆔 Token ID: ${nft.tokenId}
🔗 Blockchain: ${nft.blockchainNetwork}
📅 Minted: ${nft.mintDate}
👤 Owner: ${nft.currentOwner}
🌐 Contract: ${nft.contractAddress}
📊 Access Level: ${nft.accessLevel}
🔄 Transferable: ${nft.isTransferable ? 'Yes' : 'No'}

This NFT provides cryptographic proof of authenticity for your health record and is secured on the blockchain.`);
        }
        console.log(`Viewing NFT: ${nftId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': case 'denied': return 'error';
            case 'paid': return 'success';
            case 'under_review': return 'info';
            case 'submitted': return 'primary';
            default: return 'secondary';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'success';
            default: return 'secondary';
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
                                <h1 className="text-xl font-bold text-gray-900">🏥 My Health Dashboard</h1>
                            </div>
                            <div className="ml-4">
                                <Badge variant="success" size="sm">🔒 Privacy Protected</Badge>
                                <Badge variant="primary" size="sm" className="ml-2">👤 Patient Portal</Badge>
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
                                    src={`https://ui-avatars.com/api/?name=${user.name}&background=059669&color=fff`}
                                    alt={user.name}
                                />
                                <div className="text-sm">
                                    <div className="font-medium text-gray-900">{user.name}</div>
                                    <div className="text-green-600 font-semibold">{user.role.toUpperCase()}</div>
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
                            { id: 'overview', label: '📊 Overview', icon: '📊' },
                            { id: 'records', label: '📋 My Records', icon: '📋' },
                            { id: 'insurance', label: '💰 Insurance', icon: '💰' },
                            { id: 'nfts', label: '🎨 My NFTs', icon: '🎨' },
                            { id: 'access', label: '🔐 Access Control', icon: '🔐' },
                            { id: 'ai', label: '🤖 AI Insights', icon: '🤖' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-green-500 text-green-600'
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

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Health Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <span className="text-2xl">📋</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Medical Records</p>
                                        <p className="text-2xl font-bold text-gray-900">{myRecords.length}</p>
                                        <p className="text-sm text-green-600">All secured</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <span className="text-2xl">🎨</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">NFT Records</p>
                                        <p className="text-2xl font-bold text-gray-900">{myNFTs.length}</p>
                                        <p className="text-sm text-green-600">Blockchain verified</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <span className="text-2xl">💰</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Insurance Claims</p>
                                        <p className="text-2xl font-bold text-gray-900">{myInsuranceClaims.length}</p>
                                        <p className="text-sm text-blue-600">$535.00 total</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <span className="text-2xl">🔐</span>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Access Requests</p>
                                        <p className="text-2xl font-bold text-gray-900">{accessRequests.length}</p>
                                        <p className="text-sm text-yellow-600">1 pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">📈 Recent Activity</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                        <span className="text-green-600">✅</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Annual Physical Examination completed</p>
                                            <p className="text-xs text-gray-500">July 4, 2025 - Record added to blockchain</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                        <span className="text-blue-600">🎨</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Health record NFT minted</p>
                                            <p className="text-xs text-gray-500">July 4, 2025 - HEALTH-NFT-001 created</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                        <span className="text-yellow-600">⏳</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">New access request received</p>
                                            <p className="text-xs text-gray-500">July 3, 2025 - Dr. Emily Johnson requesting access</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Records Tab */}
                {activeTab === 'records' && (
                    <PatientHealthRecords />
                )}

                {/* Insurance Tab */}
                {activeTab === 'insurance' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">💰 My Insurance Claims</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {myInsuranceClaims.map((claim) => (
                                    <div key={claim.id} className="border rounded-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="text-lg font-medium text-gray-900">Claim #{claim.claimNumber}</h4>
                                                    <Badge variant={getStatusColor(claim.status)} size="sm">
                                                        {claim.status.toUpperCase()}
                                                    </Badge>
                                                    {claim.isProcessedOnChain && (
                                                        <Badge variant="primary" size="sm">🧱 On-Chain</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4">{claim.description}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <p><span className="font-medium">Amount:</span> ${claim.amount.toFixed(2)}</p>
                                                        <p><span className="font-medium">Submitted:</span> {claim.submissionDate}</p>
                                                        {claim.approvalDate && (
                                                            <p><span className="font-medium">Approved:</span> {claim.approvalDate}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p><span className="font-medium">Provider:</span> {claim.insuranceProvider}</p>
                                                        <p className="font-mono text-xs"><span className="font-medium">Contract:</span> {claim.smartContractAddress?.substring(0, 10)}...</p>
                                                    </div>
                                                    <div>
                                                        {claim.blockchainTxId && (
                                                            <p className="font-mono text-xs"><span className="font-medium">Tx ID:</span> {claim.blockchainTxId.substring(0, 20)}...</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* NFTs Tab */}
                {activeTab === 'nfts' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">🎨 My Health NFTs</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myNFTs.map((nft) => (
                                    <div key={nft.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="aspect-square bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mb-4 flex items-center justify-center">
                                            <span className="text-white text-4xl">🏥</span>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-900">{nft.name}</h4>
                                            <p className="text-sm text-gray-600">{nft.description}</p>
                                            <div className="text-xs space-y-1">
                                                <p><span className="font-medium">Token ID:</span> {nft.tokenId}</p>
                                                <p><span className="font-medium">Network:</span> {nft.blockchainNetwork}</p>
                                                <p><span className="font-medium">Minted:</span> {new Date(nft.mintDate).toLocaleDateString()}</p>
                                                <p className="font-mono"><span className="font-medium">Contract:</span> {nft.contractAddress.substring(0, 10)}...</p>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <Badge variant="success" size="sm">Owned</Badge>
                                                <button
                                                    onClick={() => handleViewNFT(nft.id)}
                                                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                                >
                                                    👁️ View NFT
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Access Control Tab */}
                {activeTab === 'access' && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">🔐 Data Access Requests</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {accessRequests.map((request) => (
                                    <div key={request.id} className="border rounded-lg p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="text-lg font-medium text-gray-900">{request.requesterName}</h4>
                                                    <Badge variant="secondary" size="sm">{request.requesterRole}</Badge>
                                                    <Badge variant={getStatusColor(request.status)} size="sm">
                                                        {request.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4">{request.purpose}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p><span className="font-medium">Requested:</span> {request.requestDate}</p>
                                                        <p><span className="font-medium">Expires:</span> {request.expiryDate}</p>
                                                        <p><span className="font-medium">Records:</span> {request.recordIds.length} record(s)</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-xs"><span className="font-medium">Smart Contract:</span> {request.smartContractAddress?.substring(0, 20)}...</p>
                                                        {request.approvalDate && (
                                                            <p><span className="font-medium">Approved:</span> {request.approvalDate}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {request.status === 'pending' && (
                                                <div className="ml-4 flex space-x-2">
                                                    <button
                                                        onClick={() => handleAccessRequest(request.id, 'approve')}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleAccessRequest(request.id, 'deny')}
                                                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                                                    >
                                                        ❌ Deny
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Insights Tab */}
                {activeTab === 'ai' && (
                    <div className="space-y-6">
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">🤖 AI Health Insights</h3>
                                <p className="text-sm text-gray-500 mt-1">Personalized health recommendations based on your medical data</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {aiInsights.map((insight) => (
                                        <div key={insight.id} className="border rounded-lg p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h4 className="text-lg font-medium text-gray-900">{insight.title}</h4>
                                                        <Badge variant={getPriorityColor(insight.priority)} size="sm">
                                                            {insight.priority.toUpperCase()}
                                                        </Badge>
                                                        <Badge variant="secondary" size="sm">
                                                            {Math.round(insight.confidence * 100)}% confidence
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-4">{insight.description}</p>
                                                    {insight.recommendations && insight.recommendations.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-medium text-gray-900 mb-2">Recommendations:</p>
                                                            <ul className="text-sm text-gray-600 space-y-1">
                                                                {insight.recommendations.map((rec, index) => (
                                                                    <li key={index} className="flex items-start space-x-2">
                                                                        <span className="text-green-600">•</span>
                                                                        <span>{rec}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-gray-500">
                                                        Generated on {insight.generatedDate} | Based on {insight.relevantRecords.length} record(s)
                                                    </p>
                                                </div>
                                                {insight.actionable && (
                                                    <div className="ml-4">
                                                        <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                                                            📅 Take Action
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* AI Chatbot */}
                        <AIHealthChatbot
                            user={user}
                            medicalRecords={myRecords}
                            className="h-96"
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default PatientDashboard;
