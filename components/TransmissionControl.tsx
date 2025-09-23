import React, { useRef, useEffect } from 'react';
import { Language, MeshStatus, LoraStatus, SatelliteStatus, TransmissionLogEntry } from '../types';
import { t } from '../lib/i18n';
import useOfflineTransmitter from '../hooks/useDAHNSimulator';

interface TransmissionControlProps {
    transmitter: ReturnType<typeof useOfflineTransmitter>;
    language: Language;
}

const getStatusClasses = (status: MeshStatus | LoraStatus | SatelliteStatus) => {
    switch (status) {
        case 'IDLE': return 'bg-gray-600 text-gray-200';
        case 'SEARCHING':
        case 'CHECKING':
        case 'RELAYING':
        case 'TRANSMITTING': return 'bg-yellow-500 text-yellow-900 animate-pulse';
        case 'SUCCESS': return 'bg-green-500 text-white';
        case 'FAIL': return 'bg-red-500 text-white';
        default: return 'bg-gray-700 text-gray-300';
    }
};

const getLogIcon = (status: TransmissionLogEntry['status']) => {
    switch(status) {
        case 'system': return '⚙️';
        case 'info': return '➡️';
        case 'success': return '✅';
        case 'error': return '❌';
        default: return '➡️';
    }
};


const LogPanel: React.FC<{ log: TransmissionLogEntry[] }> = ({ log }) => {
    const logEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [log]);

    return (
        <div className="bg-gray-900/70 p-3 rounded-b-lg h-40 overflow-y-auto text-xs font-mono">
            {log.length === 0 ? <span className="text-gray-500">Awaiting action...</span> :
                log.map(entry => (
                    <div key={entry.id} className="flex items-start gap-2 mb-1 animate-fade-in">
                        <span className="flex-shrink-0">{getLogIcon(entry.status)}</span>
                        <span className="flex-grow text-gray-300">{entry.message}</span>
                    </div>
                ))
            }
            <div ref={logEndRef} />
        </div>
    );
};


const TransmissionControl: React.FC<TransmissionControlProps> = ({ transmitter, language }) => {
    
    return (
        <div className="bg-gray-800/50 border border-red-500/50 p-6 rounded-lg shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-red-400 mb-2">{t('transmissionControlTitle', language)}</h2>
            <p className="text-gray-400 mb-6">{t('transmissionIntro', language)}</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Method 1: Mesh Network */}
                <TransmissionMethod
                    title={t('meshNetwork', language)}
                    description={t('meshDescription', language)}
                    range={t('meshRange', language)}
                    status={transmitter.meshStatus}
                    log={transmitter.meshLog}
                    onInitiate={transmitter.initiateMeshRelay}
                    buttonText={t('initiateMesh', language)}
                    language={language}
                />

                {/* Method 2: LoRaWAN */}
                <TransmissionMethod
                    title={t('lora', language)}
                    description={t('loraDescription', language)}
                    range={t('loraRange', language)}
                    status={transmitter.loraStatus}
                    log={transmitter.loraLog}
                    onInitiate={transmitter.initiateLoRaUplink}
                    buttonText={t('initiateLora', language)}
                    language={language}
                />

                {/* Method 3: Satellite */}
                <TransmissionMethod
                    title={t('satellite', language)}
                    description={t('satelliteDescription', language)}
                    range={t('satelliteRange', language)}
                    status={transmitter.satelliteStatus}
                    log={transmitter.satelliteLog}
                    onInitiate={transmitter.initiateSatelliteUplink}
                    buttonText={t('initiateSatellite', language)}
                    language={language}
                />
            </div>
        </div>
    );
};

interface TransmissionMethodProps {
    title: string;
    description: string;
    range: string;
    status: MeshStatus | LoraStatus | SatelliteStatus;
    log: TransmissionLogEntry[];
    onInitiate: () => void;
    buttonText: string;
    language: Language;
}

const TransmissionMethod: React.FC<TransmissionMethodProps> = ({ title, description, range, status, log, onInitiate, buttonText, language }) => {
    
    const isIdle = status === 'IDLE';
    const isWorking = ['SEARCHING', 'CHECKING', 'RELAYING', 'TRANSMITTING'].includes(status);
    const isDone = status === 'SUCCESS' || status === 'FAIL';
    
    return (
        <div className="bg-gray-800 rounded-lg shadow-xl flex flex-col border border-gray-700">
            <div className="p-4 flex-grow">
                <h3 className="text-lg font-bold text-cyan-400">{title}</h3>
                <p className="text-xs text-gray-400 mt-1 mb-3">{description}</p>
                 <div className="flex justify-between items-center text-xs mb-4">
                    <span className="font-semibold text-gray-300">{t('range', language)}: <span className="text-purple-400 font-mono">{range}</span></span>
                     <span className={`px-2 py-1 font-bold text-xs rounded-full ${getStatusClasses(status)}`}>
                        {t((status.toLowerCase() as any), language)}
                     </span>
                </div>
                <button 
                    onClick={onInitiate}
                    disabled={!isIdle}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md transition disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {buttonText}
                </button>
            </div>
            <LogPanel log={log} />
        </div>
    );
};

export default TransmissionControl;