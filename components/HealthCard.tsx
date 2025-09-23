import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { t } from '../lib/i18n';

interface HealthCardProps {
    onClose: () => void;
    language: Language;
}

interface HealthInfo {
    bloodGroup?: string;
    allergies?: string;
}

const HealthCard: React.FC<HealthCardProps> = ({ onClose, language }) => {
    const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);

    useEffect(() => {
        // Fetch from localStorage to ensure offline access
        const storedHealthCard = localStorage.getItem('healthCard');
        if (storedHealthCard) {
            setHealthInfo(JSON.parse(storedHealthCard));
        }
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 border border-cyan-500/50">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cyan-400">{t('healthCardTitle', language)}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl leading-none">&times;</button>
                </div>
                {healthInfo ? (
                    <div className="space-y-4 text-lg">
                        <div>
                            <p className="text-sm text-gray-400">{t('bloodGroupLabel', language)}</p>
                            <p className="font-bold text-white">{healthInfo.bloodGroup || t('notProvided', language)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">{t('allergiesLabel', language)}</p>
                            <p className="font-bold text-white">{healthInfo.allergies || t('notProvided', language)}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">{t('healthInfoError', language)}</p>
                )}
                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg transition"
                    >
                        {t('close', language)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthCard;