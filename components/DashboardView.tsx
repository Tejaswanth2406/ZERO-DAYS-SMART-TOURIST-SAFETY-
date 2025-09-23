import React, { useState, useCallback } from 'react';
import { TouristID, Alert, GpsPosition, Language, SafetyScore, GeoFence, Vitals } from '../types';
import MapDisplay from './Map';
import AlertsLog from './AlertsLog';
import HealthCard from './HealthCard';
import { t } from '../lib/i18n';
import TransmissionControl from './TransmissionControl';
import useOfflineTransmitter from '../hooks/useDAHNSimulator';
import DigitalIdModal from './DigitalIdModal';
import ConnectionMethodsDashboard from './ConnectionMethodsDashboard';
import useAnomalyDetector from '../hooks/useAnomalyDetector';
import AnomalyDetectionDashboard from './AnomalyDetectionDashboard';

interface DashboardViewProps {
    touristData: TouristID;
    alerts: Alert[];
    addIncident: (type: any, location: GpsPosition, severity: any) => Promise<void>;
    addAlert: (alert: Omit<Alert, 'timestamp' | 'id'>) => void;
    isOnline: boolean;
    language: Language;
    position: GpsPosition | null;
    vitals: Vitals | null;
    toggleExpeditionMode: (enabled: boolean) => void;
    safeZone: GeoFence;
    dangerZones: GeoFence[];
}

const DashboardView: React.FC<DashboardViewProps> = ({
    touristData, alerts, addIncident, isOnline, language, position, vitals, toggleExpeditionMode, safeZone, dangerZones
}) => {
    const [showHealthCard, setShowHealthCard] = useState(false);
    const [showDigitalId, setShowDigitalId] = useState(false);
    const [safetyScore, setSafetyScore] = useState<SafetyScore>({ touristId: touristData.id, currentScore: 100, lastUpdate: new Date() });
    const [expeditionMode, setExpeditionMode] = useState(false);
    const [showTransmissionControl, setShowTransmissionControl] = useState(false);
    
    const transmitter = useOfflineTransmitter(touristData, language);

    const updateSafetyScore = useCallback((hit: number) => {
        setSafetyScore(prev => ({ ...prev, currentScore: Math.max(0, prev.currentScore - hit), lastUpdate: new Date() }));
    }, []);

    const anomalyStates = useAnomalyDetector({
        position,
        vitals,
        dangerZones,
        addIncident,
        updateSafetyScore
    });

    const handleSOS = useCallback(() => {
        if (!position) return;
        updateSafetyScore(50);
        addIncident('sos', position, 'critical');
        if (!isOnline) {
             setShowTransmissionControl(true);
        }
    }, [position, isOnline, addIncident, updateSafetyScore]);
    
    const handleExpeditionToggle = () => {
        const newMode = !expeditionMode;
        setExpeditionMode(newMode);
        toggleExpeditionMode(newMode);
    };
    
    const score = safetyScore.currentScore;
    const scoreColor = score > 70 ? 'text-green-400' : score > 40 ? 'text-yellow-400' : 'text-red-400';
    const vitalsColor = vitals?.status === 'abnormal' ? 'text-red-400 animate-pulse-vitals' : 'text-green-400';

    return (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                <div className="lg:col-span-3 space-y-6">
                     <div className="bg-gray-800 p-4 rounded-lg shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-cyan-400">{t('realTimeMonitoring', language)}</h3>
                        <div className="h-96 w-full">
                            <MapDisplay position={position} safeZone={safeZone} dangerZones={dangerZones} isOnline={isOnline} />
                        </div>
                    </div>
                     <button onClick={handleSOS} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg text-2xl flex items-center justify-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4a1 1 0 012 0v5a1 1 0 11-2 0V4zm1 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                        {t('panicButton', language)}
                    </button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-cyan-400">{t('systemStatus', language)}</h3>
                                <p className="text-sm text-gray-400 truncate">{touristData.name}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-400 text-sm">{t('safetyScore', language)}</p>
                                <p className={`font-bold text-4xl ${scoreColor}`}>{score}</p>
                            </div>
                        </div>

                        {touristData.iotDevice?.paired && vitals && (
                            <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-lg mb-4">
                                <div>
                                    <p className="text-gray-400 text-sm">{t('iotDevice', language)} ({t('vitals', language)})</p>
                                    <p className="font-semibold text-green-400">{t('paired', language)}</p>
                                </div>
                                <p className={`font-bold text-3xl ${vitalsColor}`}>♥ {vitals.heartRate}</p>
                            </div>
                        )}
                        
                        <ConnectionMethodsDashboard
                            isOnline={isOnline}
                            meshStatus={transmitter.meshStatus}
                            loraStatus={transmitter.loraStatus}
                            satelliteStatus={transmitter.satelliteStatus}
                            language={language}
                        />

                         <div className="mt-4 grid grid-cols-2 gap-3">
                             <button onClick={() => setShowHealthCard(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition">{t('viewHealthCard', language)}</button>
                             <button onClick={() => setShowDigitalId(true)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition">{t('showDigitalId', language)}</button>
                         </div>
                         <div className="mt-3 flex items-center justify-center bg-gray-700/50 p-2 rounded-lg">
                            <label htmlFor="expeditionMode" className="flex items-center cursor-pointer text-sm">
                                <div className="relative">
                                    <input type="checkbox" id="expeditionMode" className="sr-only" checked={expeditionMode} onChange={handleExpeditionToggle} />
                                    <div className="block bg-gray-600 w-10 h-6 rounded-full"></div>
                                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform"></div>
                                </div>
                                <div className="ml-2 text-gray-200 font-medium">{t('expeditionMode', language)}</div>
                            </label>
                            <style>{`input:checked ~ .dot { transform: translateX(100%); background-color: #06b6d4; }`}</style>
                        </div>
                    </div>
                    <AnomalyDetectionDashboard anomalyStates={anomalyStates} language={language} />
                    <div className="bg-gray-800 p-4 rounded-lg shadow-2xl h-[28rem]">
                        <AlertsLog alerts={alerts} language={language} />
                    </div>
                </div>
            </div>
            {showTransmissionControl && (
                <div className="mt-6">
                    <TransmissionControl transmitter={transmitter} language={language} />
                </div>
            )}
            {showHealthCard && <HealthCard onClose={() => setShowHealthCard(false)} language={language} />}
            {showDigitalId && <DigitalIdModal tourist={touristData} onClose={() => setShowDigitalId(false)} language={language} />}
        </div>
    );
};

export default DashboardView;
