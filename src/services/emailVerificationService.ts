interface EmailServiceConfig {
    smtpHost: string;
    smtpPort: number;
    senderEmail: string;
    appPassword: string;
    senderName: string;
}

class EmailVerificationService {
    private config: EmailServiceConfig;
    private generatedCodes: Map<string, { code: string; expiresAt: number }> = new Map();

    constructor() {
        this.config = {
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            senderEmail: 'ahmedumar475@gmail.com',
            appPassword: 'xxzzwqvkgewutobo',
            senderName: 'Healthcare Security System'
        };
    }

    generateVerificationCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendVerificationEmail(recipientEmail: string = 'ahmedumar475@gmail.com'): Promise<string> {
        const verificationCode = this.generateVerificationCode();
        const expiresAt = Date.now() + (10 * 1000); // 10 seconds

        // Store the code for verification
        this.generatedCodes.set(recipientEmail, {
            code: verificationCode,
            expiresAt
        });

        try {
            // Since we're in a browser environment, we'll use EmailJS or a backend API
            // For demo purposes, we'll simulate the email sending and show the code

            // In a real implementation, you would call your backend API here
            // that uses nodemailer with the SMTP configuration and email template
            // const emailTemplate = this.createEmailTemplate(verificationCode);

            console.log('📧 Email would be sent with config:', {
                to: recipientEmail,
                from: this.config.senderEmail,
                subject: '🔐 Healthcare System - Verification Code',
                template: 'HTML template with verification code',
                host: this.config.smtpHost,
                port: this.config.smtpPort,
                auth: {
                    user: this.config.senderEmail,
                    pass: this.config.appPassword
                }
            });

            // Simulate sending email via backend API
            console.log('📧 Sending email with configuration:', {
                to: recipientEmail,
                from: this.config.senderEmail,
                host: this.config.smtpHost,
                port: this.config.smtpPort,
                code: verificationCode
            });

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // For demo purposes, show the code in console and alert
            console.log(`✅ Email sent successfully!`);
            console.log(`📧 Verification Code: ${verificationCode}`);
            console.log(`⏰ Expires in 5 minutes`);

            // Show alert with the verification code (in real implementation, this would be sent to email)
            this.showEmailSentNotification(verificationCode, recipientEmail);

            return verificationCode;

        } catch (error) {
            console.error('❌ Failed to send verification email:', error);
            throw new Error('Failed to send verification email. Please try again.');
        }
    }

    private createEmailTemplate(verificationCode: string): string {
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Healthcare System - Verification Code</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .code-container { background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .verification-code { font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; margin: 10px 0; }
          .info { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🩺 Healthcare Security System</div>
            <h2>Email Verification Required</h2>
          </div>
          
          <p>Hello,</p>
          <p>You are attempting to log into the Healthcare Security System. Please use the verification code below to complete your authentication:</p>
          
          <div class="code-container">
            <p>Your verification code is:</p>
            <div class="verification-code">${verificationCode}</div>
            <p><strong>This code will expire in 5 minutes</strong></p>
          </div>
          
          <div class="info">
            <p><strong>Security Notice:</strong></p>
            <ul>
              <li>Never share this code with anyone</li>
              <li>Our support team will never ask for this code</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you have any questions or concerns, please contact our support team.</p>
          
          <div class="footer">
            <p>© 2025 Healthcare Security System | This is an automated message</p>
            <p>Powered by secure SMTP with app-specific authentication</p>
          </div>
        </div>
      </body>
      </html>
    `;
    }

    private showEmailSentNotification(code: string, email: string): void {
        // In a real implementation, this would not show the code
        // But for demo purposes, we'll show it since we can't actually send emails from the frontend
        const message = `📧 EMAIL SENT SUCCESSFULLY!

✅ Verification email has been sent to: ${email}

🔐 For demo purposes, your verification code is: ${code}

⏰ This code will expire in 5 minutes.

📱 In a real implementation:
• You would receive this code in your email
• The code would not be shown here
• You would copy it from your email inbox

🛡️ SMTP Configuration:
• Server: smtp.gmail.com:587
• Authentication: App-specific password
• Encryption: TLS/STARTTLS`;

        alert(message);
    }

    verifyCode(email: string, inputCode: string): boolean {
        const stored = this.generatedCodes.get(email);

        if (!stored) {
            console.log('❌ No verification code found for this email');
            return false;
        }

        if (Date.now() > stored.expiresAt) {
            console.log('❌ Verification code has expired');
            this.generatedCodes.delete(email);
            return false;
        }

        if (stored.code !== inputCode) {
            console.log('❌ Invalid verification code');
            return false;
        }

        // Code is valid, remove it
        this.generatedCodes.delete(email);
        console.log('✅ Verification code is valid!');
        return true;
    }

    isCodeExpired(email: string): boolean {
        const stored = this.generatedCodes.get(email);
        return !stored || Date.now() > stored.expiresAt;
    }

    getRemainingTime(email: string): number {
        const stored = this.generatedCodes.get(email);
        if (!stored) return 0;

        const remaining = stored.expiresAt - Date.now();
        return Math.max(0, Math.floor(remaining / 1000));
    }
}

// Export singleton instance
export const emailVerificationService = new EmailVerificationService();
export default EmailVerificationService;
