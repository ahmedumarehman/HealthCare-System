import React, { useState, useEffect } from 'react';
import { SecurityEvent, SecurityStats, ClipboardMonitor } from '../../types';
import { clipboardMonitorService } from '../../services/clipboardMonitorService';
import { encryptionService } from '../../services/encryptionService';

interface SecurityDashboardProps {
    className?: string;
}

const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ className = '' }) => {
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
    const [clipboardStatus, setClipboardStatus] = useState<ClipboardMonitor>({
        isActive: false,
        detectedAddresses: [],
        alertCount: 0,
        lastCheck: ''
    });
    const [stats, setStats] = useState<SecurityStats>({
        totalAlerts: 0,
        totalLogs: 0,
        encryptedFiles: 0,
        sessionTimeRemaining: 1800, // 30 minutes
        lastActivity: new Date().toISOString()
    });
    const [sessionWarning, setSessionWarning] = useState(false);

    useEffect(() => {
        // Subscribe to clipboard monitoring events
        const unsubscribe = clipboardMonitorService.subscribe((event) => {
            setSecurityEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
            setStats(prev => ({ ...prev, totalAlerts: prev.totalAlerts + 1 }));
        });

        // Update clipboard status periodically
        const statusInterval = setInterval(() => {
            setClipboardStatus(clipboardMonitorService.getStatus());
        }, 2000);

        // Session timeout countdown
        const sessionInterval = setInterval(() => {
            setStats(prev => {
                const newTime = Math.max(0, prev.sessionTimeRemaining - 1);
                if (newTime <= 120 && !sessionWarning) { // 2 minutes warning
                    setSessionWarning(true);
                }
                if (newTime === 0) {
                    handleSessionExpiry();
                }
                return { ...prev, sessionTimeRemaining: newTime };
            });
        }, 1000);

        return () => {
            unsubscribe();
            clearInterval(statusInterval);
            clearInterval(sessionInterval);
        };
    }, [sessionWarning]);

    const handleSessionExpiry = () => {
        alert('Session expired for security. Please login again.');
        // In real app, redirect to login
    };

    const extendSession = () => {
        setStats(prev => ({ ...prev, sessionTimeRemaining: 1800 }));
        setSessionWarning(false);
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getSeverityColor = (severity: SecurityEvent['severity']) => {
        switch (severity) {
            case 'critical': return 'text-red-600 bg-red-100';
            case 'high': return 'text-orange-600 bg-orange-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const toggleClipboardMonitoring = async () => {
        try {
            if (clipboardStatus.isActive) {
                clipboardMonitorService.stopMonitoring();
            } else {
                await clipboardMonitorService.requestNotificationPermission();
                await clipboardMonitorService.startMonitoring();
            }
        } catch (error) {
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className={`space-y-6 p-6 ${className}`}>
            {/* Session Warning */}
            {sessionWarning && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="text-yellow-700">
                                <h3 className="text-sm font-medium">⚠️ Session Expiring Soon</h3>
                                <p className="text-xs mt-1">
                                    Your session will expire in {formatTime(stats.sessionTimeRemaining)} for security.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={extendSession}
                            className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                        >
                            Extend Session
                        </button>
                    </div>
                </div>
            )}

            {/* Security Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                        <div className="text-blue-600 text-2xl mr-3">🛡️</div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Session Time</p>
                            <p className="text-2xl font-bold text-gray-900">{formatTime(stats.sessionTimeRemaining)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                    <div className="flex items-center">
                        <div className="text-red-600 text-2xl mr-3">🚨</div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Security Alerts</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalAlerts}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-center">
                        <div className="text-green-600 text-2xl mr-3">🔐</div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Encrypted Files</p>
                            <p className="text-2xl font-bold text-gray-900">{encryptionService.getJobs().filter(j => j.operation === 'encrypt' && j.status === 'completed').length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                    <div className="flex items-center">
                        <div className="text-purple-600 text-2xl mr-3">📋</div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Clipboard Alerts</p>
                            <p className="text-2xl font-bold text-gray-900">{clipboardStatus.alertCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clipboard Monitor Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">📋 Clipboard Security Monitor</h3>
                    <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clipboardStatus.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {clipboardStatus.isActive ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                        <button
                            onClick={toggleClipboardMonitoring}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${clipboardStatus.isActive
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {clipboardStatus.isActive ? 'Stop Monitoring' : 'Start Monitoring'}
                        </button>
                    </div>
                </div>

                {clipboardStatus.safeAddress && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700">
                            <strong>Safe Address:</strong> {clipboardStatus.safeAddress}
                        </p>
                    </div>
                )}

                {clipboardStatus.detectedAddresses.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recently Detected Addresses:</h4>
                        <div className="space-y-1">
                            {clipboardStatus.detectedAddresses.slice(-5).map((address, index) => (
                                <div key={index} className="text-xs font-mono bg-gray-100 p-2 rounded">
                                    {address}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <p className="text-sm text-gray-600">
                    Last check: {clipboardStatus.lastCheck ? new Date(clipboardStatus.lastCheck).toLocaleTimeString() : 'Never'}
                </p>
            </div>

            {/* Security Events Log */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">🔍 Security Events</h3>
                    <button
                        onClick={() => setSecurityEvents([])}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                        Clear Events
                    </button>
                </div>

                {securityEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">🛡️</div>
                        <p>No security events detected</p>
                        <p className="text-sm">Your system is secure</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {securityEvents.map((event) => (
                            <div
                                key={event.id}
                                className={`p-4 rounded-lg border-l-4 ${event.severity === 'critical' ? 'border-red-500 bg-red-50' :
                                        event.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                                            event.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                                'border-green-500 bg-green-50'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                                                {event.severity.toUpperCase()}
                                            </span>
                                            <span className="ml-2 text-sm text-gray-500">
                                                {new Date(event.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-900">{event.description}</p>
                                        {event.metadata && (
                                            <div className="mt-2 text-xs text-gray-600">
                                                Type: {event.metadata.detectedType} | Preview: {event.metadata.contentPreview}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        {event.severity === 'critical' && <span className="text-red-600 text-xl">🚨</span>}
                                        {event.severity === 'high' && <span className="text-orange-600 text-xl">⚠️</span>}
                                        {event.severity === 'medium' && <span className="text-yellow-600 text-xl">⚡</span>}
                                        {event.severity === 'low' && <span className="text-green-600 text-xl">ℹ️</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecurityDashboard;
