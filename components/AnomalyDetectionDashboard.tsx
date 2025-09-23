import React from 'react';
import { Language, AnomalyStates, AnomalyStatus } from '../types';
import { t } from '../lib/i18n';

interface AnomalyDetectionDashboardProps {
    anomalyStates: AnomalyStates;
    language: Language;
}

const AnomalyDetectionDashboard: React.FC<AnomalyDetectionDashboardProps> = ({ anomalyStates, language }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">{t('anomalyDashboardTitle', language)}</h3>
            <div className="space-y-3">
                <StatusCard
                    icon="🌍"
                    title={t('geofenceMonitoring', language)}
                    description={t('geofenceDesc', language)}
                    status={anomalyStates.geofence}
                    language={language}
                />
                <StatusCard
                    icon="🚶"
                    title={t('inactivityMonitoring', language)}
                    description={t('inactivityDesc', language)}
                    status={anomalyStates.inactivity}
                    language={language}
                />
                 <StatusCard
                    icon="❤️"
                    title={t('vitalsMonitoring', language)}
                    description={t('vitalsDesc', language)}
                    status={anomalyStates.vitals}
                    language={language}
                />
            </div>
        </div>
    );
};

interface StatusCardProps {
    icon: string;
    title: string;
    description: string;
    status: AnomalyStatus;
    language: Language;
}

const StatusCard: React.FC<StatusCardProps> = ({ icon, title, description, status, language }) => {
    const isTriggered = status === 'TRIGGERED';
    const statusColor = isTriggered ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300';
    const statusText = isTriggered ? t('triggered', language) : t('monitoring', language);

    return (
         <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4">
            <div className="text-2xl bg-gray-700 p-2 rounded-lg">{icon}</div>
            <div className="flex-grow">
                <h5 className="font-bold text-white">{title}</h5>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
            <div className={`px-3 py-1 font-bold text-xs rounded-full whitespace-nowrap ${statusColor}`}>
                {statusText}
            </div>
        </div>
    );
};

export default AnomalyDetectionDashboard;
