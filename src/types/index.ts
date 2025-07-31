// Types for the healthcare system
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  walletAddress?: string;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  isActive: boolean;
  lastLogin: string;
  permissions: Permission[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  title: string;
  description: string;
  date: string;
  diagnosis: string;
  prescription: string;
  isEncrypted: boolean;
  blockchainHash?: string;
  ipfsHash?: string;
  isVerified: boolean;
  accessPermissions: string[];
  nftTokenId?: string; // Added for NFT functionality
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'record_upload' | 'access_grant' | 'prescription_mint' | 'consent_update';
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  gasPrice?: string;
  blockNumber?: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning' | 'info';
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  userId: string;
  startTime: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  deviceInfo: string;
  ipAddress: string;
}

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'data_breach' | 'unauthorized_access' | 'session_timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  isResolved: boolean;
}

export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  balance: string;
  network: string;
}

export interface NFTMedicalCertificate {
  tokenId: string;
  patientAddress: string;
  issuerAddress: string;
  certificateType: 'vaccination' | 'prescription' | 'diagnosis' | 'test_result';
  metadata: {
    title: string;
    description: string;
    issueDate: string;
    validUntil?: string;
    properties: Record<string, any>;
  };
  ipfsUri: string;
  isValid: boolean;
}

export interface SecurityEvent {
  id: string;
  type: 'clipboard_hijack' | 'unauthorized_access' | 'encryption_failure' | 'rpc_vulnerability';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface EncryptionJob {
  id: string;
  fileName: string;
  operation: 'encrypt' | 'decrypt';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: string;
  outputPath?: string;
  error?: string;
}

export interface WalletConnection {
  address: string;
  provider: 'metamask' | 'walletconnect' | 'coinbase';
  chainId: number;
  isConnected: boolean;
  balance?: string;
}

export interface ClipboardMonitor {
  isActive: boolean;
  safeAddress?: string;
  detectedAddresses: string[];
  alertCount: number;
  lastCheck: string;
}

export interface RPCConfig {
  id: string;
  name: string;
  endpoint: string;
  isSecure: boolean;
  vulnerabilities: string[];
  lastScanned: string;
}

export interface SecurityStats {
  totalAlerts: number;
  totalLogs: number;
  encryptedFiles: number;
  sessionTimeRemaining: number;
  lastActivity: string;
}

export interface PatientRecord {
  id: string;
  recordId: string; // MR001, MR002, etc.
  patientId: string; // PT001, PT002, etc.
  doctorId: string; // DR001, DR002, etc.
  patientName: string;
  doctorName: string;
  dateOfBirth: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  recordHash: string; // Unique hash for the record
  isActive: boolean;
  firebaseId?: string; // Firebase Realtime Database key
  syncStatus?: 'local' | 'synced' | 'syncing' | 'error'; // Sync status with Firebase
}

// Role-based access control types
export interface UserRole {
  role: 'patient' | 'doctor' | 'admin';
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// NFT Health Records
export interface HealthRecordNFT {
  tokenId: string;
  contractAddress: string;
  owner: string;
  recordId: string;
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  ipfsHash: string;
  blockchainTxId: string;
  mintedAt: string;
  isTransferable: boolean;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

// Smart Contract for Data Access
export interface DataAccessContract {
  id: string;
  contractAddress: string;
  patientId: string;
  doctorId: string;
  recordIds: string[];
  accessLevel: 'read' | 'read_write' | 'full';
  startDate: string;
  endDate: string;
  isActive: boolean;
  signatures: ContractSignature[];
  blockchainTxId: string;
}

export interface ContractSignature {
  signerId: string;
  signerRole: 'patient' | 'doctor';
  signature: string;
  timestamp: string;
  blockchainTxId: string;
}

// IPFS File Storage
export interface IPFSFile {
  hash: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  isEncrypted: boolean;
  relatedRecordId?: string;
}

// Blockchain Insurance Claims
export interface InsuranceClaim {
  id: string;
  claimNumber: string;
  patientId: string;
  providerId: string;
  doctorId?: string; // Added for doctor association
  insuranceCompany: string;
  insuranceProvider?: string; // Added for provider info
  amount: number;
  status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid'; // Added pending status
  submittedAt: string;
  submissionDate?: string; // Added for submission date
  approvalDate?: string; // Added for approval date
  description?: string; // Added for claim description
  relatedRecords: string[];
  smartContractAddress: string;
  blockchainTxId: string;
  isProcessedOnChain?: boolean; // Added for blockchain processing status
  approvalSignatures: ContractSignature[];
  ipfsDocuments: string[];
}

// AI Chatbot
export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  suggestions?: string[];
  isTyping?: boolean;
}

export interface ChatAttachment {
  type: 'image' | 'document' | 'audio';
  url: string;
  name: string;
  size: number;
}

export interface AIAnalysis {
  id: string;
  type: 'symptom_analysis' | 'drug_interaction' | 'risk_assessment';
  input: string;
  output: string;
  confidence: number;
  timestamp: string;
  relatedRecordId?: string;
}

// Extended User interface for RBAC
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  walletAddress?: string;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
  isActive: boolean;
  lastLogin: string;
  permissions: Permission[];
}

// Patient interface
export interface Patient {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  lastVisit: string;
  upcomingAppointment: string;
  isActive: boolean;
}

// System Metrics for Admin Dashboard
export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalRecords: number;
  securityAlerts: number;
  blockchainTransactions: number;
  systemUptime: string;
  dataIntegrity: string;
  encryptionStatus: string;
}

// NFT Health Record interface
export interface NFTHealthRecord {
  id: string;
  tokenId: string;
  patientId: string;
  recordId: string;
  name: string;
  description: string;
  imageUrl: string;
  metadataUri: string;
  contractAddress: string;
  blockchainNetwork: string;
  mintDate: string;
  currentOwner: string;
  isTransferable: boolean;
  accessLevel: string;
}

// Data Access Request interface
export interface DataAccessRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterRole: string;
  patientId: string;
  recordIds: string[];
  purpose: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  approvalDate?: string;
  expiryDate: string;
  smartContractAddress?: string;
}

// AI Health Insight interface
export interface AIHealthInsight {
  id: string;
  type: 'health_prediction' | 'medication_reminder' | 'risk_assessment' | 'wellness_tip';
  title: string;
  description: string;
  confidence: number;
  relevantRecords: string[];
  generatedDate: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  recommendations?: string[];
}

// Smart Contract interface
export interface SmartContract {
  id: string;
  address: string;
  type: 'data_access' | 'insurance' | 'consent' | 'nft_mint';
  creator: string;
  participants: string[];
  terms: Record<string, any>;
  status: 'draft' | 'active' | 'expired' | 'terminated';
  createdAt: string;
  blockchainTxId: string;
  isExecuted: boolean;
}
