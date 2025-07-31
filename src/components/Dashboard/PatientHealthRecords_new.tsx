import React, { useState, useEffect } from 'react';
import { PatientRecord } from '../../types';

interface PatientHealthRecordsNewProps {
    className?: string;
    patientId?: string;
}

// Demo data for enhanced health records
const createDemoRecords = (patientId: string = 'PT001'): PatientRecord[] => [
    {
        id: '1',
        recordId: 'MR001',
        patientId: patientId,
        patientName: 'Sarah Johnson',
        doctorName: 'Dr. Michael Chen',
        doctorId: 'DR001',
        dateOfBirth: '1985-03-15',
        diagnosis: 'Hypertension - Stage 1',
        prescription: 'Lisinopril 10mg daily, Low sodium diet',
        notes: 'Patient shows good response to medication. Blood pressure improved from 150/95 to 130/85.',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        recordHash: 'hash001',
        isActive: true,
        syncStatus: 'synced'
    },
    {
        id: '2',
        recordId: 'MR002',
        patientId: patientId,
        patientName: 'Sarah Johnson',
        doctorName: 'Dr. Emily Rodriguez',
        doctorId: 'DR002',
        dateOfBirth: '1985-03-15',
        diagnosis: 'Annual Physical Examination',
        prescription: 'Vitamin D3 supplement, Continue current medications',
        notes: 'Overall health is good. Recommended annual mammogram and colonoscopy screening.',
        createdAt: '2024-01-10T14:15:00Z',
        updatedAt: '2024-01-10T14:15:00Z',
        recordHash: 'hash002',
        isActive: true,
        syncStatus: 'synced'
    },
    {
        id: '3',
        recordId: 'MR003',
        patientId: patientId,
        patientName: 'Sarah Johnson',
        doctorName: 'Dr. James Thompson',
        doctorId: 'DR003',
        dateOfBirth: '1985-03-15',
        diagnosis: 'Acute Bronchitis',
        prescription: 'Albuterol inhaler, rest, increased fluid intake',
        notes: 'Patient presented with persistent cough and mild fever. Chest X-ray clear. Symptoms improving.',
        createdAt: '2024-01-05T09:45:00Z',
        updatedAt: '2024-01-08T16:20:00Z',
        recordHash: 'hash003',
        isActive: false,
        syncStatus: 'synced'
    }
];

/**
 * Enhanced Patient Health Records Component
 * Features modern UI, improved data visualization, and enhanced search capabilities
 */
const PatientHealthRecords_new: React.FC<PatientHealthRecordsNewProps> = ({
    className = '',
    patientId
}) => {
    const [records, setRecords] = useState<PatientRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<PatientRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState<'all' | 'recent' | 'active'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'diagnosis' | 'doctor'>('date');
    const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [copiedItems, setCopiedItems] = useState<{ type: string; value: string; timestamp: Date }[]>([]);
    const [showClipboardHistory, setShowClipboardHistory] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [clipboardSupported, setClipboardSupported] = useState(true);

    // Demo data for enhanced health records
    const demoRecords: PatientRecord[] = createDemoRecords(patientId || 'PT001');

    useEffect(() => {
        // Initialize with demo data
        setRecords(demoRecords);
        setFilteredRecords(demoRecords);
    }, [demoRecords]);

    useEffect(() => {
        // Check clipboard support on component mount with detailed logging
        const checkClipboardSupport = () => {
            console.log('🔍 Checking clipboard support...');
            console.log('navigator.clipboard:', !!navigator.clipboard);
            console.log('window.isSecureContext:', window.isSecureContext);
            console.log('document.queryCommandSupported:', !!document.queryCommandSupported);

            const hasClipboardAPI = !!(navigator.clipboard && window.isSecureContext);
            const hasExecCommand = document.queryCommandSupported && document.queryCommandSupported('copy');

            console.log('hasClipboardAPI:', hasClipboardAPI);
            console.log('hasExecCommand:', hasExecCommand);

            const supported = hasClipboardAPI || hasExecCommand;
            setClipboardSupported(supported);

            if (!supported) {
                console.warn('❌ Clipboard functionality not supported in this browser/context');
                console.log('💡 Try running on HTTPS or localhost for clipboard API support');
            } else {
                console.log('✅ Clipboard monitoring initialized successfully');
            }
        };

        checkClipboardSupport();
    }, []);

    useEffect(() => {
        // Filter and search records
        let filtered = records;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.notes.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (filterBy === 'recent') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            filtered = filtered.filter(record => new Date(record.createdAt) >= oneWeekAgo);
        } else if (filterBy === 'active') {
            filtered = filtered.filter(record => record.isActive);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'diagnosis':
                    return a.diagnosis.localeCompare(b.diagnosis);
                case 'doctor':
                    return a.doctorName.localeCompare(b.doctorName);
                default:
                    return 0;
            }
        });

        setFilteredRecords(filtered);
    }, [records, searchTerm, filterBy, sortBy]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Show visual feedback for successful copy operations
    const showCopyFeedback = (type: string) => {
        setCopyFeedback(`✅ Copied ${type}`);
        setTimeout(() => {
            setCopyFeedback(null);
        }, 2000);
    };

    // Helper function to create copy buttons with consistent styling
    const createCopyButton = (text: string, type: string, onClick?: () => void) => (
        <button
            onClick={(e) => {
                e?.stopPropagation();
                if (clipboardSupported) {
                    copyToClipboard(text, type);
                    onClick?.();
                }
            }}
            className={`p-1 transition-colors ${clipboardSupported
                ? 'text-gray-400 hover:text-blue-600'
                : 'text-gray-300 cursor-not-allowed'
                }`}
            title={clipboardSupported ? `Copy ${type}` : 'Clipboard not supported'}
            disabled={!clipboardSupported}
        >
            📋
        </button>
    );

    // Clipboard monitoring functions with enhanced error handling
    const copyToClipboard = async (text: string, type: string) => {
        console.log(`🔄 Attempting to copy ${type}: ${text}`);

        try {
            // Check if clipboard API is supported
            if (!navigator.clipboard) {
                console.warn('⚠️ navigator.clipboard not available, trying fallback...');
                throw new Error('Clipboard API not supported');
            }

            // Check if we're in a secure context (HTTPS or localhost)
            if (!window.isSecureContext) {
                console.warn('⚠️ Not in secure context, trying fallback...');
                throw new Error('Clipboard API requires secure context (HTTPS)');
            }

            await navigator.clipboard.writeText(text);
            const newCopiedItem = {
                type,
                value: text,
                timestamp: new Date()
            };
            setCopiedItems(prev => [newCopiedItem, ...prev.slice(0, 9)]); // Keep last 10 items

            // Show success notification
            console.log(`✅ Copied ${type}: ${text}`);

            // Optional: Show visual feedback
            showCopyFeedback(type);
        } catch (error) {
            console.error('❌ Primary copy method failed:', error);

            // Fallback: Try using the older execCommand method
            try {
                console.log('🔄 Trying execCommand fallback...');

                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                console.log('execCommand result:', successful);

                if (successful) {
                    const newCopiedItem = {
                        type,
                        value: text,
                        timestamp: new Date()
                    };
                    setCopiedItems(prev => [newCopiedItem, ...prev.slice(0, 9)]);
                    console.log(`✅ Copied ${type} (fallback): ${text}`);
                    showCopyFeedback(type);
                } else {
                    throw new Error('execCommand copy failed');
                }

                document.body.removeChild(textArea);
            } catch (fallbackError) {
                console.error('❌ Fallback copy also failed:', fallbackError);

                // Show manual copy instruction
                const message = `❌ Failed to copy ${type} automatically.\n\nPlease copy manually:\n${text}`;
                alert(message);

                // Still add to history for manual reference
                const newCopiedItem = {
                    type: `${type} (Manual)`,
                    value: text,
                    timestamp: new Date()
                };
                setCopiedItems(prev => [newCopiedItem, ...prev.slice(0, 9)]);
            }
        }
    };

    const formatClipboardTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Enhanced Health Records</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Comprehensive patient health information and medical history
                        </p>
                        {/* Debug info for clipboard status */}
                        <div className="mt-2 text-xs text-gray-400">
                            📋 Clipboard: {clipboardSupported ? '✅ Supported' : '❌ Not Supported'} |
                            🔒 Secure: {window.isSecureContext ? '✅ Yes' : '❌ No'} |
                            🌐 API: {navigator.clipboard ? '✅ Available' : '❌ Unavailable'}
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        {copyFeedback && (
                            <div className="animate-pulse bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-medium">
                                {copyFeedback}
                            </div>
                        )}
                        <button
                            onClick={() => copyToClipboard('Test clipboard functionality', 'Test')}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            🧪 Test Copy
                        </button>
                        <button
                            onClick={() => setShowClipboardHistory(true)}
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${clipboardSupported
                                ? 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                                : 'text-gray-500 bg-gray-50 border border-gray-200 cursor-not-allowed'
                                }`}
                            disabled={!clipboardSupported}
                            title={clipboardSupported ? 'View clipboard history' : 'Clipboard not supported in this browser/context'}
                        >
                            📋 Clipboard History ({copiedItems.length})
                            {!clipboardSupported && (
                                <span className="ml-1 text-red-500">⚠️</span>
                            )}
                        </button>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {filteredRecords.length} Records
                        </span>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search records, diagnoses, or doctors..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={filterBy}
                            onChange={(e) => setFilterBy(e.target.value as 'all' | 'recent' | 'active')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Records</option>
                            <option value="recent">Recent (7 days)</option>
                            <option value="active">Active Records</option>
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'date' | 'diagnosis' | 'doctor')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="diagnosis">Sort by Diagnosis</option>
                            <option value="doctor">Sort by Doctor</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Records Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredRecords.map((record) => (
                    <div
                        key={record.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                            setSelectedRecord(record);
                            setShowDetails(true);
                        }}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {record.diagnosis}
                                </h3>
                                <p className="text-sm text-gray-600">{record.doctorName}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${record.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {record.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {record.recordId}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="text-sm flex items-center justify-between">
                                <div>
                                    <span className="font-medium text-gray-700">Record ID:</span>
                                    <span className="ml-2 text-gray-600">{record.recordId}</span>
                                </div>
                                {createCopyButton(record.recordId, 'Record ID')}
                            </div>
                            <div className="text-sm">
                                <span className="font-medium text-gray-700">Date:</span>
                                <span className="ml-2 text-gray-600">{formatDate(record.createdAt)}</span>
                            </div>
                            <div className="text-sm">
                                <span className="font-medium text-gray-700">Sync Status:</span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${record.syncStatus === 'synced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {record.syncStatus || 'Local'}
                                </span>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 line-clamp-2">
                            {record.notes}
                        </div>
                    </div>
                ))}
            </div>

            {filteredRecords.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
                </div>
            )}

            {/* Detail Modal */}
            {showDetails && selectedRecord && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedRecord.diagnosis}</h3>
                                    <p className="text-gray-600">{selectedRecord.doctorName}</p>
                                </div>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-gray-700">Name:</span>
                                                <span className="ml-2 text-gray-600">{selectedRecord.patientName}</span>
                                            </div>
                                            {createCopyButton(selectedRecord.patientName, 'Patient Name')}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-gray-700">Date of Birth:</span>
                                                <span className="ml-2 text-gray-600">{selectedRecord.dateOfBirth}</span>
                                            </div>
                                            {createCopyButton(selectedRecord.dateOfBirth, 'Date of Birth')}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-gray-700">Record ID:</span>
                                                <span className="ml-2 text-gray-600">{selectedRecord.recordId}</span>
                                            </div>
                                            {createCopyButton(selectedRecord.recordId, 'Record ID')}
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Status:</span>
                                            <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedRecord.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {selectedRecord.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Record Details</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Created:</span>
                                            <span className="ml-2 text-gray-600">{formatDate(selectedRecord.createdAt)}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Updated:</span>
                                            <span className="ml-2 text-gray-600">{formatDate(selectedRecord.updatedAt)}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Sync Status:</span>
                                            <span className={`ml-2 px-2 py-1 rounded text-xs ${selectedRecord.syncStatus === 'synced' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {selectedRecord.syncStatus || 'Local'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium text-gray-700">Doctor:</span>
                                                <span className="ml-2 text-gray-600">{selectedRecord.doctorName}</span>
                                            </div>
                                            {createCopyButton(selectedRecord.doctorName, 'Doctor Name')}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">Prescription</h4>
                                        {createCopyButton(selectedRecord.prescription, 'Prescription')}
                                    </div>
                                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                                        {selectedRecord.prescription}
                                    </p>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-900">Clinical Notes</h4>
                                        {createCopyButton(selectedRecord.notes, 'Clinical Notes')}
                                    </div>
                                    <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                                        {selectedRecord.notes}
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clipboard History Modal */}
            {showClipboardHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">📋 Clipboard History</h3>
                                    <p className="text-gray-600 text-sm">Recently copied items</p>
                                    {!clipboardSupported && (
                                        <p className="text-red-600 text-xs mt-1">
                                            ⚠️ Clipboard functionality limited in this browser/context
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowClipboardHistory(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3">
                                {copiedItems.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No items copied yet</p>
                                        <p className="text-sm">Click any 📋 button to copy data</p>
                                    </div>
                                ) : (
                                    copiedItems.map((item, index) => (
                                        <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-sm font-medium text-blue-700">{item.type}</span>
                                                <span className="text-xs text-gray-500">{formatClipboardTime(item.timestamp)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-900 break-all">{item.value}</p>
                                                <button
                                                    onClick={() => {
                                                        if (clipboardSupported) {
                                                            copyToClipboard(item.value, item.type);
                                                        }
                                                    }}
                                                    className={`ml-2 p-1 transition-colors flex-shrink-0 ${clipboardSupported
                                                        ? 'text-gray-400 hover:text-blue-600'
                                                        : 'text-gray-300 cursor-not-allowed'
                                                        }`}
                                                    title={clipboardSupported ? 'Copy again' : 'Clipboard not supported'}
                                                    disabled={!clipboardSupported}
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {copiedItems.length > 0 && (
                                <div className="mt-6 flex justify-between">
                                    <button
                                        onClick={() => setCopiedItems([])}
                                        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Clear History
                                    </button>
                                    <button
                                        onClick={() => setShowClipboardHistory(false)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientHealthRecords_new;
