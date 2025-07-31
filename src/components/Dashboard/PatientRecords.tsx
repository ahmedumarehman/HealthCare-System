import React, { useState } from 'react';
import Badge from '../UI/Badge';
import Modal from '../UI/Modal';
import { MedicalRecord } from '../../types';

interface PatientRecordsProps {
  records: MedicalRecord[];
  onCreateRecord: (record: Partial<MedicalRecord>) => void;
  onUpdateRecord: (id: string, updates: Partial<MedicalRecord>) => void;
}

const PatientRecords: React.FC<PatientRecordsProps> = ({
  records,
  onCreateRecord,
  onUpdateRecord
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    diagnosis: '',
    prescription: ''
  });

  const handleCreateRecord = () => {
    const record: Partial<MedicalRecord> = {
      ...newRecord,
      date: new Date().toISOString().split('T')[0],
      isEncrypted: true,
      isVerified: false,
      accessPermissions: []
    };
    
    onCreateRecord(record);
    setNewRecord({ title: '', description: '', diagnosis: '', prescription: '' });
    setShowCreateModal(false);
  };

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleMintNFT = async (recordId: string) => {
    // Simulate NFT minting
    alert(`Minting Medical NFT for record ${recordId}...`);
    // Update record to show blockchain verification
    onUpdateRecord(recordId, { 
      isVerified: true, 
      blockchainHash: `0x${Math.random().toString(16).substring(2, 10)}...` 
    });
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Medical Records</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            + Add New Record
          </button>
        </div>

        <div className="space-y-4">
          {records.map(record => (
            <div key={record.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{record.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{record.description}</p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span>📅 {record.date}</span>
                    <span>👨‍⚕️ Dr. {record.doctorId}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-2">
                    {record.isEncrypted && <Badge variant="success" size="sm">🔒 Encrypted</Badge>}
                    {record.isVerified && <Badge variant="primary" size="sm">✅ On-Chain Verified</Badge>}
                    {!record.isVerified && <Badge variant="warning" size="sm">⏳ Pending Verification</Badge>}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                    {!record.isVerified && (
                      <button
                        onClick={() => handleMintNFT(record.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Mint NFT
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {record.blockchainHash && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
                  Blockchain Hash: {record.blockchainHash}
                </div>
              )}
            </div>
          ))}
        </div>

        {records.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first medical record.</p>
          </div>
        )}
      </div>

      {/* Create Record Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="📄 Create New Medical Record"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Record Title</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Annual Checkup, Blood Test Results"
              value={newRecord.title}
              onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Detailed description of the medical record"
              value={newRecord.description}
              onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
            <input
              type="text"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Medical diagnosis or findings"
              value={newRecord.diagnosis}
              onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prescription</label>
            <textarea
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              rows={2}
              placeholder="Prescribed medications or treatments"
              value={newRecord.prescription}
              onChange={(e) => setNewRecord({...newRecord, prescription: e.target.value})}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">🔐 Security Features</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>All records are encrypted end-to-end</li>
                    <li>Blockchain verification ensures immutability</li>
                    <li>Access control manages who can view your data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRecord}
              disabled={!newRecord.title || !newRecord.description}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Create Record
            </button>
          </div>
        </div>
      </Modal>

      {/* Record Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="📄 Medical Record Details"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.date}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRecord.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.diagnosis}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prescription</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.prescription}</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🔐 Security Status</h4>
              <div className="flex space-x-4">
                {selectedRecord.isEncrypted && <Badge variant="success">🔒 Encrypted</Badge>}
                {selectedRecord.isVerified && <Badge variant="primary">✅ Blockchain Verified</Badge>}
              </div>
              {selectedRecord.blockchainHash && (
                <div className="mt-2 text-xs text-green-700 font-mono">
                  Hash: {selectedRecord.blockchainHash}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default PatientRecords;
