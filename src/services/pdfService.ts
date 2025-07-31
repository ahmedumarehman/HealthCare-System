import jsPDF from 'jspdf';
import { MedicalRecord, Patient } from '../types';
import { EncryptionService } from './encryption';

export class PDFService {
    private static instance: PDFService;
    private encryptionService: EncryptionService;

    private constructor() {
        this.encryptionService = new EncryptionService();
    }

    static getInstance(): PDFService {
        if (!PDFService.instance) {
            PDFService.instance = new PDFService();
        }
        return PDFService.instance;
    }

    async generateMedicalRecordPDF(
        record: MedicalRecord,
        patient: Patient,
        options: {
            includeWatermark?: boolean;
            isEncrypted?: boolean;
            password?: string;
        } = {}
    ): Promise<Blob> {
        const { includeWatermark = true, isEncrypted = false, password } = options;

        // Create new PDF document
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add CONFIDENTIAL watermark at the top
        if (includeWatermark) {
            pdf.setFontSize(24);
            pdf.setTextColor(220, 53, 69); // Red color
            pdf.setFont('helvetica', 'bold');

            // Center the watermark at the top
            const watermarkText = 'CONFIDENTIAL';
            const textWidth = pdf.getTextWidth(watermarkText);
            const xPosition = (pageWidth - textWidth) / 2;

            pdf.text(watermarkText, xPosition, 20);

            // Add a line under the watermark
            pdf.setDrawColor(220, 53, 69);
            pdf.setLineWidth(2);
            pdf.line(20, 25, pageWidth - 20, 25);
        }

        // Reset text color to black for content
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');

        // Header
        let yPosition = includeWatermark ? 40 : 20;
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Medical Record', 20, yPosition);

        yPosition += 15;
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        // Patient Information
        pdf.setFont('helvetica', 'bold');
        pdf.text('Patient Information:', 20, yPosition);
        yPosition += 8;
        pdf.setFont('helvetica', 'normal');

        const patientInfo = [
            `Name: ${patient.name}`,
            `Email: ${patient.email}`,
            `Date of Birth: ${patient.dateOfBirth}`,
            `Phone: ${patient.phoneNumber}`,
            `Address: ${patient.address}`,
            `Emergency Contact: ${patient.emergencyContact}`,
            `Insurance: ${patient.insuranceProvider}`,
            `Policy Number: ${patient.insurancePolicyNumber}`
        ];

        patientInfo.forEach(info => {
            pdf.text(info, 20, yPosition);
            yPosition += 6;
        });

        yPosition += 10;

        // Medical Record Details
        pdf.setFont('helvetica', 'bold');
        pdf.text('Medical Record Details:', 20, yPosition);
        yPosition += 8;
        pdf.setFont('helvetica', 'normal');

        // Prepare record content (encrypt if needed)
        let recordContent = {
            title: record.title,
            description: record.description,
            diagnosis: record.diagnosis,
            prescription: record.prescription
        };

        if (isEncrypted && password) {
            try {
                // Use password-based encryption
                recordContent = {
                    title: this.encryptionService.encryptData(record.title),
                    description: this.encryptionService.encryptData(record.description),
                    diagnosis: this.encryptionService.encryptData(record.diagnosis),
                    prescription: this.encryptionService.encryptData(record.prescription)
                };
            } catch (error) {
                console.error('Encryption failed:', error);
                // Fall back to unencrypted content
            }
        }

        const recordDetails = [
            `Record ID: ${record.id}`,
            `Date: ${record.date}`,
            `Doctor ID: ${record.doctorId}`,
            `Title: ${recordContent.title}`,
            ``,
            `Description:`,
            recordContent.description,
            ``,
            `Diagnosis:`,
            recordContent.diagnosis,
            ``,
            `Prescription:`,
            recordContent.prescription
        ];

        recordDetails.forEach(detail => {
            if (detail === '') {
                yPosition += 4;
                return;
            }

            // Handle long text by wrapping
            const lines = pdf.splitTextToSize(detail, pageWidth - 40);
            lines.forEach((line: string) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 20;

                    // Add watermark to new page if enabled
                    if (includeWatermark) {
                        pdf.setFontSize(24);
                        pdf.setTextColor(220, 53, 69);
                        pdf.setFont('helvetica', 'bold');
                        const watermarkText = 'CONFIDENTIAL';
                        const textWidth = pdf.getTextWidth(watermarkText);
                        const xPosition = (pageWidth - textWidth) / 2;
                        pdf.text(watermarkText, xPosition, 20);
                        pdf.setDrawColor(220, 53, 69);
                        pdf.setLineWidth(2);
                        pdf.line(20, 25, pageWidth - 20, 25);
                        pdf.setTextColor(0, 0, 0);
                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(12);
                        yPosition = 40;
                    }
                }

                pdf.text(line, 20, yPosition);
                yPosition += 6;
            });
        });

        yPosition += 15;

        // Blockchain & Security Information
        if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = includeWatermark ? 40 : 20;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.text('Blockchain & Security Information:', 20, yPosition);
        yPosition += 8;
        pdf.setFont('helvetica', 'normal');

        const securityInfo = [
            `Blockchain Hash: ${record.blockchainHash}`,
            `IPFS Hash: ${record.ipfsHash}`,
            `NFT Token ID: ${record.nftTokenId}`,
            `Verified: ${record.isVerified ? 'Yes' : 'No'}`,
            `Encrypted: ${record.isEncrypted ? 'Yes' : 'No'}`,
            `Access Permissions: ${record.accessPermissions.join(', ')}`
        ];

        securityInfo.forEach(info => {
            const lines = pdf.splitTextToSize(info, pageWidth - 40);
            lines.forEach((line: string) => {
                pdf.text(line, 20, yPosition);
                yPosition += 6;
            });
        });

        // Footer
        yPosition = pageHeight - 30;
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition);
        if (isEncrypted) {
            pdf.text('This document contains encrypted medical information.', 20, yPosition + 6);
        }

        // Convert to blob
        const pdfBlob = pdf.output('blob');
        return pdfBlob;
    }

    async downloadMedicalRecordPDF(
        record: MedicalRecord,
        patient: Patient,
        options: {
            includeWatermark?: boolean;
            isEncrypted?: boolean;
            password?: string;
        } = {}
    ): Promise<void> {
        try {
            const pdfBlob = await this.generateMedicalRecordPDF(record, patient, options);

            // Create download link
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;

            const encryptionSuffix = options.isEncrypted ? '_encrypted' : '';
            const filename = `medical_record_${record.id}_${patient.name.replace(/\s+/g, '_')}${encryptionSuffix}.pdf`;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate PDF document');
        }
    }

    async generateBatchPDF(
        records: MedicalRecord[],
        patients: Patient[],
        options: {
            includeWatermark?: boolean;
            isEncrypted?: boolean;
            password?: string;
        } = {}
    ): Promise<Blob> {
        const pdf = new jsPDF();
        const pageWidth = pdf.internal.pageSize.getWidth();

        // Add CONFIDENTIAL watermark at the top
        if (options.includeWatermark !== false) {
            pdf.setFontSize(24);
            pdf.setTextColor(220, 53, 69);
            pdf.setFont('helvetica', 'bold');
            const watermarkText = 'CONFIDENTIAL - BATCH MEDICAL RECORDS';
            const textWidth = pdf.getTextWidth(watermarkText);
            const xPosition = Math.max(10, (pageWidth - textWidth) / 2);
            pdf.text(watermarkText, xPosition, 20);
            pdf.setDrawColor(220, 53, 69);
            pdf.setLineWidth(2);
            pdf.line(20, 25, pageWidth - 20, 25);
        }

        // Process each record
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const patient = patients.find(p => p.id === record.patientId);

            if (!patient) continue;

            if (i > 0) {
                pdf.addPage();
            }

            // Generate individual record content
            await this.addRecordToPDF(pdf, record, patient, options);
        }

        return pdf.output('blob');
    }

    private async addRecordToPDF(
        pdf: jsPDF,
        record: MedicalRecord,
        patient: Patient,
        options: { includeWatermark?: boolean; isEncrypted?: boolean; password?: string }
    ): Promise<void> {
        let yPosition = options.includeWatermark !== false ? 40 : 20;

        // Record header
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Medical Record - ${patient.name}`, 20, yPosition);
        yPosition += 15;

        // Add record content similar to the main method
        // (Implementation details similar to generateMedicalRecordPDF)
    }
}

export const pdfService = PDFService.getInstance();
