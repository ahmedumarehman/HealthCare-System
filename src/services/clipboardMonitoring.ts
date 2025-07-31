// Known suspicious/hacked wallet addresses (in a real app, this would be fetched from a security API)
const SUSPICIOUS_ADDRESSES = [
    '0x1234567890abcdef1234567890abcdef12345678', // Example fake address
    '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef', // Example malicious address
    '0x0000000000000000000000000000000000000000', // Null address
    '0xffffffffffffffffffffffffffffffffffffffff', // Max address (suspicious)
    // Add more known suspicious addresses here
];

// Common patterns for suspicious addresses
const SUSPICIOUS_PATTERNS = [
    /^0x0+$/, // All zeros
    /^0xf+$/i, // All Fs
    /^0x(dead|beef|cafe|babe|face)/i, // Common test/fake patterns
    /^0x1234567890abcdef/i, // Sequential pattern
];

export class ClipboardMonitoringService {
    private isMonitoring = false;
    private lastClipboardContent = '';
    private alertSound: HTMLAudioElement | null = null;
    private onSuspiciousAddressCallback?: (address: string) => void;
    private pasteHandler: ((e: ClipboardEvent) => void) | null = null;
    private copyHandler: ((e: ClipboardEvent) => void) | null = null;
    private cutHandler: ((e: ClipboardEvent) => void) | null = null;
    private focusHandler: ((e: FocusEvent) => void) | null = null;
    private manualCheckInterval: number | null = null;
    private permissionDeniedNotified = false;

    // Declare missing properties
    private handleClipboardEvent: (e: ClipboardEvent) => void;
    private onFocus: (e: FocusEvent) => void;
    private requestClipboardPermission: () => Promise<void>;
    private intervalId: number | null = null;

    constructor() {
        // Create alert sound
        this.alertSound = new Audio();
        // Replace the long base64 string with a shorter valid one for demonstration purposes
        this.alertSound.src = 'data:audio/wav;base64,UklGRh4AAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

        // Implement missing methods
        this.handleClipboardEvent = (e: ClipboardEvent) => {
            console.log('Clipboard event detected:', e.type);
        };

        this.onFocus = (e: FocusEvent) => {
            console.log('Window focused:', e);
        };

        this.requestClipboardPermission = async () => {
            try {
                const permission = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
                if (permission.state === 'granted' || permission.state === 'prompt') {
                    console.log('Clipboard permission granted');
                } else {
                    console.warn('Clipboard permission denied');
                }
            } catch (error) {
                console.error('Error requesting clipboard permission:', error);
            }
        };
    }

    startMonitoring(onSuspiciousAddress?: (address: string) => void): boolean {
        if (this.isMonitoring) {
            return false;
        }

        this.onSuspiciousAddressCallback = onSuspiciousAddress;

        try {
            // Add event listeners for clipboard events
            document.addEventListener('copy', this.handleClipboardEvent);
            document.addEventListener('cut', this.handleClipboardEvent);
            document.addEventListener('paste', this.handleClipboardEvent);

            // Set up focus/blur monitoring
            window.addEventListener('focus', this.onFocus);

            // Request initial clipboard permission
            this.requestClipboardPermission();

            this.isMonitoring = true;
            console.log('Clipboard monitoring started');
            return true;
        } catch (error) {
            console.error('Error starting clipboard monitoring:', error);
            return false;
        }
    }

    stopMonitoring(): void {
        if (!this.isMonitoring) {
            return;
        }

        this.isMonitoring = false;

        // Remove event listeners
        document.removeEventListener('copy', this.handleClipboardEvent);
        document.removeEventListener('cut', this.handleClipboardEvent);
        document.removeEventListener('paste', this.handleClipboardEvent);
        window.removeEventListener('focus', this.onFocus);

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        console.log('Clipboard monitoring stopped');
    }

    isActive(): boolean {
        return this.isMonitoring;
    }

    private async checkClipboard(): Promise<void> {
        try {
            const clipboardText = await navigator.clipboard.readText();

            // Only check if clipboard content has changed
            if (clipboardText !== this.lastClipboardContent) {
                this.lastClipboardContent = clipboardText;

                // Check for wallet addresses
                const walletAddresses = this.extractWalletAddresses(clipboardText);

                for (const address of walletAddresses) {
                    if (this.isSuspiciousAddress(address)) {
                        this.alertSuspiciousAddress(address);
                    }
                }
            }
        } catch (error) {
            // Clipboard access might be denied or not available
            console.warn('Could not access clipboard:', error);
        }
    }

    private extractWalletAddresses(text: string): string[] {
        // Ethereum address pattern (0x followed by 40 hex characters)
        const ethPattern = /0x[a-fA-F0-9]{40}/g;

        // Bitcoin address patterns
        const btcLegacyPattern = /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/g;
        const btcSegwitPattern = /bc1[a-z0-9]{39,59}/g;

        const addresses: string[] = [];

        // Extract Ethereum addresses
        const ethMatches = text.match(ethPattern);
        if (ethMatches) {
            addresses.push(...ethMatches);
        }

        // Extract Bitcoin addresses (basic validation)
        const btcLegacyMatches = text.match(btcLegacyPattern);
        if (btcLegacyMatches) {
            addresses.push(...btcLegacyMatches.filter(addr => this.isValidBitcoinAddress(addr)));
        }

        const btcSegwitMatches = text.match(btcSegwitPattern);
        if (btcSegwitMatches) {
            addresses.push(...btcSegwitMatches);
        }

        return addresses;
    }

    private isValidBitcoinAddress(address: string): boolean {
        // Basic Bitcoin address validation (simplified)
        if (address.length < 26 || address.length > 35) {
            return false;
        }

        // Check if it starts with valid characters
        if (!/^[13]/.test(address)) {
            return false;
        }

        // Check for invalid characters
        if (/[0OIl]/.test(address)) {
            return false;
        }

        return true;
    }

    private isSuspiciousAddress(address: string): boolean {
        // Check against known suspicious addresses
        if (SUSPICIOUS_ADDRESSES.includes(address.toLowerCase())) {
            return true;
        }

        // Check against suspicious patterns
        for (const pattern of SUSPICIOUS_PATTERNS) {
            if (pattern.test(address)) {
                return true;
            }
        }

        // Additional heuristics for suspicious addresses

        // Check for repeated characters (might indicate test/fake address)
        const hexPart = address.startsWith('0x') ? address.slice(2) : address;
        const charCounts: { [key: string]: number } = {};
        for (const char of hexPart) {
            charCounts[char] = (charCounts[char] || 0) + 1;
        }

        // If any character appears more than 60% of the time, it's suspicious
        const maxCount = Math.max(...Object.values(charCounts) as number[]);
        if (maxCount > hexPart.length * 0.6) {
            return true;
        }

        // Check for sequential patterns
        if (this.hasSequentialPattern(hexPart)) {
            return true;
        }

        return false;
    }

    private hasSequentialPattern(hex: string): boolean {
        let sequentialCount = 0;
        for (let i = 1; i < hex.length; i++) {
            const prev = parseInt(hex[i - 1], 16);
            const curr = parseInt(hex[i], 16);

            if (!isNaN(prev) && !isNaN(curr)) {
                if (Math.abs(curr - prev) === 1) {
                    sequentialCount++;
                    if (sequentialCount >= 4) { // 5 consecutive sequential characters
                        return true;
                    }
                } else {
                    sequentialCount = 0;
                }
            }
        }
        return false;
    }

    private alertSuspiciousAddress(address: string): void {
        console.warn('🚨 SUSPICIOUS WALLET ADDRESS DETECTED:', address);

        // Play alert sound
        if (this.alertSound) {
            this.alertSound.currentTime = 0;
            this.alertSound.play().catch(error => {
                console.warn('Could not play alert sound:', error);
            });
        }

        // Call the callback if provided
        if (this.onSuspiciousAddressCallback) {
            this.onSuspiciousAddressCallback(address);
        }
    }

    // Method to add suspicious addresses dynamically
    addSuspiciousAddress(address: string): void {
        if (!SUSPICIOUS_ADDRESSES.includes(address.toLowerCase())) {
            SUSPICIOUS_ADDRESSES.push(address.toLowerCase());
        }
    }

    // Method to get current suspicious addresses (for testing/debugging)
    getSuspiciousAddresses(): string[] {
        return [...SUSPICIOUS_ADDRESSES];
    }
}

// Singleton instance
export const clipboardMonitoringService = new ClipboardMonitoringService();
