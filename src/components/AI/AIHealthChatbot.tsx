import React, { useState, useRef, useEffect } from 'react';
import Badge from '../UI/Badge';
import { User, MedicalRecord, AIHealthInsight } from '../../types';

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    message: string;
    timestamp: Date;
    isTyping?: boolean;
    suggestions?: string[];
}

interface AIHealthChatbotProps {
    user: User;
    medicalRecords?: MedicalRecord[];
    className?: string;
}

const AIHealthChatbot: React.FC<AIHealthChatbotProps> = ({ user, medicalRecords = [], className = '' }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            sender: 'ai',
            message: `Hello ${user.name}! I'm your AI Health Assistant. I can help you understand your medical records, provide health insights, answer questions about medications, and offer general wellness advice. How can I assist you today?`,
            timestamp: new Date(),
            suggestions: [
                'Explain my latest test results',
                'When is my next vaccination due?',
                'What are my current medications?',
                'Provide health tips for my condition'
            ]
        }
    ]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Simulated AI responses based on user input
    const generateAIResponse = (userMessage: string): string => {
        const message = userMessage.toLowerCase();

        if (message.includes('test') || message.includes('results') || message.includes('lab')) {
            return `Based on your recent medical records, I can see you had some tests done. Your latest results from ${medicalRecords[0]?.date || 'recent visit'} show that your overall health indicators are good. However, I recommend discussing specific values with your healthcare provider for detailed interpretation. Would you like me to highlight any particular aspects of your results?`;
        }

        if (message.includes('vaccination') || message.includes('vaccine') || message.includes('shot')) {
            return `Looking at your vaccination history, I see you received a COVID-19 booster recently. Based on standard schedules, you may be due for your annual flu vaccination in September/October. I recommend checking with your healthcare provider for a complete vaccination review and schedule.`;
        }

        if (message.includes('medication') || message.includes('medicine') || message.includes('prescription')) {
            return `From your medical records, I can see prescriptions have been given. Always follow your doctor's instructions exactly as prescribed. If you have questions about dosage, side effects, or interactions, please consult your healthcare provider or pharmacist. Never stop or change medications without medical supervision.`;
        }

        if (message.includes('insurance') || message.includes('claim') || message.includes('coverage')) {
            return `I can see you have insurance claims in the system. Your recent claims show a good processing rate. For specific coverage questions or claim status, you can check your insurance portal or contact your provider directly. The blockchain verification ensures secure and transparent claim processing.`;
        }

        if (message.includes('nft') || message.includes('blockchain') || message.includes('crypto')) {
            return `Your health records are secured using blockchain technology and some are minted as NFTs. This ensures data integrity, privacy, and gives you ownership of your health data. Your NFT health records are non-transferable and provide cryptographic proof of authenticity. This technology helps prevent medical data tampering and ensures your records are truly yours.`;
        }

        if (message.includes('diet') || message.includes('nutrition') || message.includes('food')) {
            return `Based on general health principles, I recommend a balanced diet rich in fruits, vegetables, whole grains, and lean proteins. Stay hydrated, limit processed foods, and consider your specific dietary needs. For personalized nutrition advice based on your health conditions, consult with a registered dietitian or your healthcare provider.`;
        }

        if (message.includes('exercise') || message.includes('workout') || message.includes('fitness')) {
            return `Regular physical activity is crucial for overall health. Aim for at least 150 minutes of moderate aerobic activity per week, plus strength training exercises twice a week. Start slowly if you're new to exercise, and always consult your healthcare provider before beginning a new fitness routine, especially if you have existing health conditions.`;
        }

        if (message.includes('stress') || message.includes('anxiety') || message.includes('mental health')) {
            return `Mental health is just as important as physical health. Consider stress management techniques like meditation, deep breathing, regular exercise, and adequate sleep. If you're experiencing persistent stress, anxiety, or other mental health concerns, please reach out to a mental health professional or your healthcare provider.`;
        }

        if (message.includes('appointment') || message.includes('schedule') || message.includes('visit')) {
            return `I can see from your records that regular check-ups are important for maintaining your health. Based on your history, consider scheduling follow-up appointments as recommended by your healthcare provider. You can usually schedule appointments through your healthcare provider's portal or by calling their office directly.`;
        }

        if (message.includes('privacy') || message.includes('security') || message.includes('data')) {
            return `Your health data security is our top priority. We use end-to-end encryption, blockchain verification, and strict access controls. Only authorized healthcare providers you approve can access your records. You have full control over who sees your data and can revoke access at any time through the access control panel.`;
        }

        if (message.includes('emergency') || message.includes('urgent') || message.includes('help')) {
            return `🚨 If this is a medical emergency, please call 911 or go to your nearest emergency room immediately. For urgent but non-emergency medical questions, contact your healthcare provider's after-hours line. I'm here to provide general health information, but I cannot replace professional medical advice in urgent situations.`;
        }

        // Default response
        return `Thank you for your question! While I can provide general health information and help you understand your medical records, I recommend discussing specific medical concerns with your healthcare provider. They have access to your complete medical history and can provide personalized advice. Is there anything else about your health records or general wellness that I can help you with?`;
    };

    const handleSendMessage = async () => {
        if (!currentMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            message: currentMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoading(true);

        // Simulate AI thinking time
        setTimeout(() => {
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                message: generateAIResponse(currentMessage),
                timestamp: new Date(),
                suggestions: [
                    'Tell me more about this',
                    'What should I do next?',
                    'Are there any risks?',
                    'Can you explain in simpler terms?'
                ]
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    };

    const handleSuggestionClick = (suggestion: string) => {
        setCurrentMessage(suggestion);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg ${className}`}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">AI Health Assistant</h3>
                        <p className="text-sm opacity-90">Powered by Healthcare AI</p>
                    </div>
                    <div className="ml-auto">
                        <Badge variant="success" size="sm">🔒 HIPAA Secure</Badge>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex items-start space-x-2 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
                                    ? 'bg-green-500'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                }`}>
                                <span className="text-white text-sm">
                                    {message.sender === 'user' ? '👤' : '🤖'}
                                </span>
                            </div>

                            {/* Message bubble */}
                            <div className={`p-3 rounded-lg shadow-sm ${message.sender === 'user'
                                    ? 'bg-green-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-900 rounded-bl-none border'
                                }`}>
                                <p className="text-sm leading-relaxed">{message.message}</p>
                                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                                    }`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>

                                {/* Suggestions */}
                                {message.sender === 'ai' && message.suggestions && (
                                    <div className="mt-3 space-y-1">
                                        <p className="text-xs text-gray-500 font-medium">Quick suggestions:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {message.suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs hover:bg-blue-100 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-start space-x-2 max-w-xs">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">🤖</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg rounded-bl-none border shadow-sm">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex space-x-2">
                    <textarea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about your health, medications, test results, or general wellness..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim() || isLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                        <span>Send</span>
                        <span>📤</span>
                    </button>
                </div>

                {/* Quick actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                    <button
                        onClick={() => handleSuggestionClick('Explain my latest test results')}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        📊 Test Results
                    </button>
                    <button
                        onClick={() => handleSuggestionClick('When is my next vaccination due?')}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        💉 Vaccinations
                    </button>
                    <button
                        onClick={() => handleSuggestionClick('What are my current medications?')}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        💊 Medications
                    </button>
                    <button
                        onClick={() => handleSuggestionClick('Give me health tips for better wellness')}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs hover:bg-gray-200 transition-colors"
                        disabled={isLoading}
                    >
                        🌟 Health Tips
                    </button>
                </div>

                {/* Disclaimer */}
                <div className="mt-3 text-xs text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                    <span className="font-medium">⚠️ Medical Disclaimer:</span> This AI assistant provides general health information only and cannot replace professional medical advice. Always consult your healthcare provider for medical decisions.
                </div>
            </div>
        </div>
    );
};

export default AIHealthChatbot;
