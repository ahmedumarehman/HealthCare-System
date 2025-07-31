import { ClipboardMonitor, SecurityEvent } from '../types';

class ClipboardMonitorService {
    private monitor: ClipboardMonitor = {
        isActive: false,
        detectedAddresses: [],
        alertCount: 0,
        lastCheck: new Date().toISOString()
    };

    private listeners: ((event: SecurityEvent) => void)[] = [];
    private intervalId: NodeJS.Timeout | null = null;
    private lastClipboardContent = '';

    // Ethereum address pattern
    private readonly ETH_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/;

    // Healthcare record ID pattern (custom for your system)
    private readonly HEALTH_RECORD_PATTERN = /^HR-[A-Z0-9]{8}-[A-Z0-9]{4}$/;

    // Bitcoin address pattern
    private readonly BTC_ADDRESS_PATTERN = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

    // Start monitoring clipboard
    async startMonitoring(): Promise<void> {
        if (this.monitor.isActive) return;

        try {
            // Check if clipboard API is available
            if (!navigator.clipboard || !navigator.clipboard.readText) {
                throw new Error('Clipboard API not available in this browser');
            }

            this.monitor.isActive = true;
            this.monitor.lastCheck = new Date().toISOString();

            // Start monitoring every 2 seconds
            this.intervalId = setInterval(() => {
                this.checkClipboard();
            }, 2000);

            console.log('Clipboard monitoring started');
        } catch (error) {
            this.monitor.isActive = false;
            throw new Error(`Failed to start clipboard monitoring: ${error}`);
        }
    }

    // Stop monitoring clipboard
    stopMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.monitor.isActive = false;
        console.log('Clipboard monitoring stopped');
    }

    // Check clipboard content
    private async checkClipboard(): Promise<void> {
        try {
            const clipboardText = await navigator.clipboard.readText();

            if (clipboardText !== this.lastClipboardContent && clipboardText.trim()) {
                this.lastClipboardContent = clipboardText;
                this.monitor.lastCheck = new Date().toISOString();

                await this.analyzeClipboardContent(clipboardText);
            }
        } catch (error) {
            // Handle clipboard access errors silently (user may have denied permission)
            console.warn('Clipboard access denied or failed:', error);
        }
    }

    // Analyze clipboard content for sensitive data
    private async analyzeClipboardContent(content: string): Promise<void> {
        const trimmedContent = content.trim();

        // Check for Ethereum addresses
        if (this.ETH_ADDRESS_PATTERN.test(trimmedContent)) {
            await this.handleSensitiveData('ethereum_address', trimmedContent);
        }

        // Check for Bitcoin addresses
        else if (this.BTC_ADDRESS_PATTERN.test(trimmedContent)) {
            await this.handleSensitiveData('bitcoin_address', trimmedContent);
        }

        // Check for health record IDs
        else if (this.HEALTH_RECORD_PATTERN.test(trimmedContent)) {
            await this.handleSensitiveData('health_record_id', trimmedContent);
        }

        // Check for potential private keys (long hex strings)
        else if (this.isPotentialPrivateKey(trimmedContent)) {
            await this.handleSensitiveData('potential_private_key', '***REDACTED***');
        }

        // Check for potential seed phrases
        else if (this.isPotentialSeedPhrase(trimmedContent)) {
            await this.handleSensitiveData('potential_seed_phrase', '***REDACTED***');
        }
    }

    // Handle detection of sensitive data
    private async handleSensitiveData(type: string, content: string): Promise<void> {
        // Set safe address if this is the first crypto address detected
        if ((type === 'ethereum_address' || type === 'bitcoin_address') && !this.monitor.safeAddress) {
            this.monitor.safeAddress = content;
            return; // Don't alert for the first address
        }

        // Check if this is a different address than the safe one
        if ((type === 'ethereum_address' || type === 'bitcoin_address') &&
            this.monitor.safeAddress && content !== this.monitor.safeAddress) {

            await this.triggerSecurityAlert({
                type: 'clipboard_hijack',
                description: `Potential clipboard hijacking detected: ${type} changed from safe address`,
                content: content,
                originalType: type
            });
        }

        // Alert for private keys and seed phrases
        if (type === 'potential_private_key' || type === 'potential_seed_phrase') {
            await this.triggerSecurityAlert({
                type: 'clipboard_hijack',
                description: `Sensitive data detected in clipboard: ${type}`,
                content: content,
                originalType: type
            });
        }

        // Store detected address
        if (type === 'ethereum_address' || type === 'bitcoin_address') {
            this.monitor.detectedAddresses.push(content);
            // Keep only last 10 addresses
            if (this.monitor.detectedAddresses.length > 10) {
                this.monitor.detectedAddresses = this.monitor.detectedAddresses.slice(-10);
            }
        }
    }

    // Check if content looks like a private key
    private isPotentialPrivateKey(content: string): boolean {
        // 64 character hex string (typical private key)
        return /^[a-fA-F0-9]{64}$/.test(content);
    }

    // Check if content looks like a seed phrase
    private isPotentialSeedPhrase(content: string): boolean {
        const words = content.toLowerCase().split(/\s+/);
        return words.length >= 12 && words.length <= 24 &&
            words.every(word => /^[a-z]+$/.test(word));
    }

    // Trigger security alert
    private async triggerSecurityAlert(details: {
        type: string;
        description: string;
        content: string;
        originalType: string;
    }): Promise<void> {
        this.monitor.alertCount++;

        const securityEvent: SecurityEvent = {
            id: `clip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'clipboard_hijack',
            description: details.description,
            severity: details.originalType.includes('private_key') || details.originalType.includes('seed_phrase')
                ? 'critical' : 'high',
            timestamp: new Date().toISOString(),
            resolved: false,
            metadata: {
                detectedType: details.originalType,
                contentPreview: details.content.length > 10 ?
                    details.content.substring(0, 10) + '...' : details.content
            }
        };

        // Notify all listeners
        this.listeners.forEach(listener => listener(securityEvent));

        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('Security Alert - EMRChains', {
                body: details.description,
                icon: '/favicon.ico',
                tag: 'clipboard-security'
            });
        }

        // Audio alert
        this.playAlertSound();
    }

    // Play alert sound
    private playAlertSound(): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Could not play alert sound:', error);
        }
    }

    // Subscribe to security events
    subscribe(listener: (event: SecurityEvent) => void): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Get current monitor status
    getStatus(): ClipboardMonitor {
        return { ...this.monitor };
    }

    // Clear detected addresses
    clearDetectedAddresses(): void {
        this.monitor.detectedAddresses = [];
        this.monitor.alertCount = 0;
    }

    // Set safe address manually
    setSafeAddress(address: string): void {
        this.monitor.safeAddress = address;
    }

    // Request notification permission
    async requestNotificationPermission(): Promise<boolean> {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }
}

export const clipboardMonitorService = new ClipboardMonitorService();
