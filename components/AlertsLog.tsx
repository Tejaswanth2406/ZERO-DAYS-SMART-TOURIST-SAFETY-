import React from 'react';
import { Alert, Language } from '../types';
import { t } from '../lib/i18n';

interface AlertsLogProps {
    alerts: Alert[];
    language: Language;
}

const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
        case 'sos':
            return { icon: '🚨', color: 'bg-red-500/10 border-red-500', textColor: 'text-red-400' };
        case 'geofence':
            return { icon: '🚧', color: 'bg-yellow-500/10 border-yellow-500', textColor: 'text-yellow-400' };
        case 'inactivity':
            return { icon: '⌛', color: 'bg-orange-500/10 border-orange-500', textColor: 'text-orange-400' };
        case 'iot':
            return { icon: '❤️‍🩹', color: 'bg-pink-500/10 border-pink-500', textColor: 'text-pink-400' };
        case 'info':
             return { icon: 'ℹ️', color: 'bg-blue-500/10 border-blue-500', textColor: 'text-blue-400' };
        case 'dahn':
            return { icon: '📡', color: 'bg-purple-500/10 border-purple-500', textColor: 'text-purple-400' };
        case 'error':
             return { icon: '🔌', color: 'bg-gray-500/10 border-gray-500', textColor: 'text-gray-400' };
        default:
            return { icon: '🔔', color: 'bg-gray-700/20 border-gray-600', textColor: 'text-gray-300' };
    }
};


const AlertsLog: React.FC<AlertsLogProps> = ({ alerts, language }) => {
    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold mb-4 text-cyan-400">{t('alertsLog', language)}</h3>
            <div className="flex-grow overflow-y-auto pr-2">
                {alerts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>{t('noAlerts', language)}</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {alerts.map((alert) => {
                            const styles = getAlertStyles(alert.type);
                            return (
                                <li
                                    key={alert.id}
                                    className={`flex items-start p-3 rounded-lg border ${styles.color} animate-fade-in`}
                                >
                                    <span className="text-lg mr-3 flex-shrink-0">{styles.icon}</span>
                                    <div className="flex-1 text-sm">
                                        <p className={`font-semibold ${styles.textColor}`}>
                                            {t(alert.type, language)?.toUpperCase() || alert.type.toUpperCase()}
                                        </p>
                                        <p className="text-gray-300">{alert.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {alert.timestamp.toLocaleTimeString()}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AlertsLog;