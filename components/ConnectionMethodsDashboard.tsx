import React from 'react';
import { Language, MeshStatus, LoraStatus, SatelliteStatus } from '../types';
import { t } from '../lib/i18n';

interface ConnectionMethodsDashboardProps {
    isOnline: boolean;
    meshStatus: MeshStatus;
    loraStatus: LoraStatus;
    satelliteStatus: SatelliteStatus;
    language: Language;
}

// FIX: Pass language as an argument to the function to resolve "Cannot find name 'language'" errors. The unused isOnline parameter was also removed.
const getStatus = (status: MeshStatus | LoraStatus | SatelliteStatus, language: Language): { text: string, color: string } => {
    const statusKey = status.toLowerCase() as any;
    
    if (status === 'IDLE') return { text: t('idle', language), color: 'bg-gray-500 text-gray-200' };
    if (status === 'SUCCESS') return { text: t('success', language), color: 'bg-green-500 text-white' };
    if (status === 'FAIL') return { text: t('fail', language), color: 'bg-red-500 text-white' };
    
    // Active statuses
    return { text: t(statusKey, language), color: 'bg-yellow-500 text-yellow-900 animate-pulse' };
};


const ConnectionMethodsDashboard: React.FC<ConnectionMethodsDashboardProps> = ({
    isOnline, meshStatus, loraStatus, satelliteStatus, language
}) => {
    return (
        <div className="bg-gray-700/50 p-4 rounded-lg space-y-4 my-4">
             <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-300">{t('connectionChannels', language)}</h4>
                <div className={`px-3 py-1 font-semibold rounded-full text-xs ${isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {isOnline ? t('online', language) : t('offline', language)}
                </div>
            </div>

            <div className="space-y-3">
                <MethodCard 
                    icon="🌐"
                    title={t('meshNetwork', language)}
                    description={t('meshDescription', language)}
                    range={t('meshRange', language)}
                    status={getStatus(meshStatus, language)}
                    language={language}
                />
                <MethodCard 
                    icon="📶"
                    title={t('lora', language)}
                    description={t('loraDescription', language)}
                    range={t('loraRange', language)}
                    status={getStatus(loraStatus, language)}
                    language={language}
                />
                <MethodCard 
                    icon="🛰️"
                    title={t('satellite', language)}
                    description={t('satelliteDescription', language)}
                    range={t('satelliteRange', language)}
                    status={getStatus(satelliteStatus, language)}
                    language={language}
                />
            </div>
        </div>
    );
};

interface MethodCardProps {
    icon: string;
    title: string;
    description: string;
    range: string;
    status: { text: string, color: string };
    language: Language;
}

const MethodCard: React.FC<MethodCardProps> = ({ icon, title, description, range, status, language }) => (
    <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4">
        <div className="text-2xl bg-gray-700 p-2 rounded-lg">{icon}</div>
        <div className="flex-grow">
            <h5 className="font-bold text-white">{title}</h5>
            <p className="text-xs text-gray-400">{description} ({t('range', language)}: {range})</p>
        </div>
        <div className={`px-3 py-1 font-bold text-xs rounded-full whitespace-nowrap ${status.color}`}>
            {status.text}
        </div>
    </div>
);


export default ConnectionMethodsDashboard;