import React from 'react';
import Modal from '../UI/Modal';

interface CameraTroubleshootingGuideProps {
    isOpen: boolean;
    onClose: () => void;
    onRetry: () => void;
    onSkip: () => void;
}

const CameraTroubleshootingGuide: React.FC<CameraTroubleshootingGuideProps> = ({
    isOpen,
    onClose,
    onRetry,
    onSkip
}) => {
    const getBrowserSpecificInstructions = () => {
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes('chrome')) {
            return {
                browser: 'Chrome',
                icon: '🟢',
                steps: [
                    'Look for the camera icon 📷 in the address bar',
                    'Click the icon and select "Always allow camera access"',
                    'If no icon appears, click the lock icon 🔒 next to the URL',
                    'Set Camera permission to "Allow"',
                    'Refresh the page and try again'
                ]
            };
        } else if (userAgent.includes('firefox')) {
            return {
                browser: 'Firefox',
                icon: '🦊',
                steps: [
                    'Look for the camera icon 📷 in the address bar',
                    'Click "Allow" when prompted for camera access',
                    'If blocked, click the shield icon 🛡️ in the address bar',
                    'Select "Unblock" for camera permissions',
                    'Refresh the page and try again'
                ]
            };
        } else if (userAgent.includes('safari')) {
            return {
                browser: 'Safari',
                icon: '🧭',
                steps: [
                    'Go to Safari menu → Preferences → Websites',
                    'Select "Camera" from the left sidebar',
                    'Find this website and set to "Allow"',
                    'Alternatively, look for camera icon in address bar',
                    'Refresh the page and try again'
                ]
            };
        } else if (userAgent.includes('edge')) {
            return {
                browser: 'Edge',
                icon: '🔷',
                steps: [
                    'Look for the camera icon 📷 in the address bar',
                    'Click the icon and select "Allow"',
                    'Or click the lock icon 🔒 next to the URL',
                    'Set Camera permission to "Allow"',
                    'Refresh the page and try again'
                ]
            };
        } else {
            return {
                browser: 'Your Browser',
                icon: '🌐',
                steps: [
                    'Look for camera/permission icons in the address bar',
                    'Allow camera access when prompted',
                    'Check browser settings for camera permissions',
                    'Add this site to allowed camera sites',
                    'Refresh the page and try again'
                ]
            };
        }
    };

    const browserInfo = getBrowserSpecificInstructions();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="📷 Camera Troubleshooting" size="lg">
            <div className="space-y-6">
                {/* Quick Fixes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">🔧 Quick Fixes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 border">
                            <h4 className="font-medium text-gray-900 mb-2">🔄 Basic Steps</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Refresh the page</li>
                                <li>• Allow camera permissions</li>
                                <li>• Close other camera apps</li>
                                <li>• Try a different browser</li>
                            </ul>
                        </div>
                        <div className="bg-white rounded-lg p-3 border">
                            <h4 className="font-medium text-gray-900 mb-2">⚠️ Common Issues</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Camera blocked in settings</li>
                                <li>• Another app using camera</li>
                                <li>• Non-secure connection</li>
                                <li>• Outdated browser</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Browser-Specific Instructions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-3">
                        {browserInfo.icon} {browserInfo.browser} Instructions
                    </h3>
                    <ol className="text-sm text-green-800 space-y-2">
                        {browserInfo.steps.map((step, index) => (
                            <li key={index} className="flex items-start">
                                <span className="font-semibold text-green-600 mr-2">{index + 1}.</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* System Requirements */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">💻 System Requirements</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">✅ Required</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Working camera/webcam</li>
                                <li>• Modern browser</li>
                                <li>• HTTPS connection</li>
                                <li>• Camera permissions</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-2">🚫 Troubleshoot</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Close Zoom/Skype/Teams</li>
                                <li>• Check camera privacy settings</li>
                                <li>• Update browser</li>
                                <li>• Test camera in other apps</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Windows-Specific Instructions */}
                {navigator.platform.toLowerCase().includes('win') && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="font-semibold text-purple-900 mb-3">🪟 Windows Camera Settings</h3>
                        <ol className="text-sm text-purple-800 space-y-2">
                            <li className="flex items-start">
                                <span className="font-semibold text-purple-600 mr-2">1.</span>
                                <span>Go to Start → Settings → Privacy & Security → Camera</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-purple-600 mr-2">2.</span>
                                <span>Enable "Allow apps to access your camera"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-purple-600 mr-2">3.</span>
                                <span>Enable "Allow desktop apps to access your camera"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-purple-600 mr-2">4.</span>
                                <span>Restart your browser and try again</span>
                            </li>
                        </ol>
                    </div>
                )}

                {/* Mac-Specific Instructions */}
                {navigator.platform.toLowerCase().includes('mac') && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h3 className="font-semibold text-indigo-900 mb-3">🍎 macOS Camera Settings</h3>
                        <ol className="text-sm text-indigo-800 space-y-2">
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-2">1.</span>
                                <span>Go to Apple Menu → System Preferences → Security & Privacy</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-2">2.</span>
                                <span>Click the "Privacy" tab and select "Camera"</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-2">3.</span>
                                <span>Check the box next to your browser</span>
                            </li>
                            <li className="flex items-start">
                                <span className="font-semibold text-indigo-600 mr-2">4.</span>
                                <span>Restart your browser and try again</span>
                            </li>
                        </ol>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                    <button
                        onClick={onRetry}
                        className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                        🔄 Try Camera Again
                    </button>
                    <button
                        onClick={onSkip}
                        className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                    >
                        ⏭️ Skip & Use 2FA Only
                    </button>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Still having issues? Contact support or use the 2FA option above.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default CameraTroubleshootingGuide;
