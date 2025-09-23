import { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { TouristID, Language, MeshStatus, LoraStatus, SatelliteStatus, TransmissionLogEntry } from '../types';
// FIX: Import TranslationKey for strong typing.
import { t, TranslationKey } from '../lib/i18n';

const useOfflineTransmitter = (
    tourist: TouristID,
    language: Language
) => {
    const [meshStatus, setMeshStatus] = useState<MeshStatus>('IDLE');
    const [loraStatus, setLoraStatus] = useState<LoraStatus>('IDLE');
    const [satelliteStatus, setSatelliteStatus] = useState<SatelliteStatus>('IDLE');
    
    const [meshLog, setMeshLog] = useState<TransmissionLogEntry[]>([]);
    const [loraLog, setLoraLog] = useState<TransmissionLogEntry[]>([]);
    const [satelliteLog, setSatelliteLog] = useState<TransmissionLogEntry[]>([]);

    const addLog = (
        // FIX: Import Dispatch and SetStateAction and use them directly to resolve namespace error.
        setter: Dispatch<SetStateAction<TransmissionLogEntry[]>>, 
        // FIX: Use the imported TranslationKey type instead of a construct that resolves to 'never'.
        messageKey: TranslationKey,
        status: TransmissionLogEntry['status'],
        placeholders?: Record<string, string | number>
    ) => {
        let message = t(messageKey, language);
        if (placeholders) {
            Object.entries(placeholders).forEach(([key, value]) => {
                message = message.replace(`{${key}}`, String(value));
            });
        }
        const newEntry: TransmissionLogEntry = { id: Date.now() + Math.random(), timestamp: new Date(), message, status };
        setter(prev => [...prev, newEntry]);
    };

    const runSimulation = async (steps: { delay: number; action: () => void }[]) => {
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            step.action();
        }
    };

    const initiateMeshRelay = useCallback(() => {
        setMeshStatus('SEARCHING');
        setMeshLog([]);
        // FIX: Properly type the local log function's parameters to avoid 'any' type errors.
        const log = (msg: TranslationKey, stat: TransmissionLogEntry['status'], ph?: any) => addLog(setMeshLog, msg, stat, ph);
        
        const peerCount = Math.floor(Math.random() * 4); // 0-3 peers

        runSimulation([
            { delay: 500, action: () => log('logMeshScan', 'system') },
            { delay: 2000, action: () => {
                if (peerCount === 0) {
                    log('logMeshNoPeers', 'error');
                    setMeshStatus('FAIL');
                } else {
                    log('logMeshFoundPeers', 'success', { count: peerCount });
                    setMeshStatus('RELAYING');
                }
            }},
            // Simulate hopping if peers were found
            ...Array.from({ length: peerCount }).flatMap((_, i) => [
                { delay: 1500, action: () => log('logMeshHopping', 'info', { id: tourist.id.substring(0, 8), hop: i + 1, total: peerCount }) },
                { delay: 1500, action: () => {
                    const success = Math.random() > 0.3; // 70% chance this hop finds internet
                    if (success && i + 1 >= Math.max(1, Math.ceil(peerCount/2)) ) { // Success more likely on later hops
                         log('logMeshHopSuccess', 'success', { hop: i + 1 });
                         setMeshStatus('SUCCESS');
                         // End the simulation here
                         throw new Error("SIMULATION_SUCCESS");
                    } else {
                        log('logMeshHopFail', 'error', { hop: i + 1 });
                    }
                }}
            ]),
            { delay: 500, action: () => {
                 if(peerCount > 0){
                    log('logMeshRelayFail', 'error');
                    setMeshStatus('FAIL');
                 }
            }}
        ]).catch(e => {
            if (e.message !== "SIMULATION_SUCCESS") throw e;
        });

    }, [language, tourist.id]);

    const initiateLoRaUplink = useCallback(() => {
        setLoraStatus('CHECKING');
        setLoraLog([]);
        let deviceFound = false;
        // FIX: Properly type the local log function's parameters.
        const log = (msg: TranslationKey, stat: TransmissionLogEntry['status']) => addLog(setLoraLog, msg, stat);

        runSimulation([
            { delay: 500, action: () => log('logLoraCheck', 'system') },
            { delay: 1500, action: () => {
                deviceFound = Math.random() > 0.4; // 60% chance
                if (!deviceFound) {
                    log('logLoraNotFound', 'error');
                    setLoraStatus('FAIL');
                } else {
                    log('logLoraFound', 'success');
                    setLoraStatus('TRANSMITTING');
                }
            }},
            { delay: 1000, action: () => { if(deviceFound) log('logLoraSending', 'info') } },
            { delay: 2500, action: () => {
                if(deviceFound) {
                    log('logLoraSuccess', 'success');
                    setLoraStatus('SUCCESS');
                }
            }}
        ]);
    }, [language]);

    const initiateSatelliteUplink = useCallback(() => {
        setSatelliteStatus('CHECKING');
        setSatelliteLog([]);
        let deviceFound = false;
        // FIX: Properly type the local log function's parameters.
        const log = (msg: TranslationKey, stat: TransmissionLogEntry['status']) => addLog(setSatelliteLog, msg, stat);

        runSimulation([
            { delay: 500, action: () => log('logSatelliteCheck', 'system') },
            { delay: 1500, action: () => {
                deviceFound = Math.random() > 0.2; // 80% chance
                if (!deviceFound) {
                    log('logSatelliteNotFound', 'error');
                    setSatelliteStatus('FAIL');
                } else {
                    log('logSatelliteFound', 'success');
                    setSatelliteStatus('TRANSMITTING');
                }
            }},
            { delay: 1000, action: () => { if(deviceFound) log('logSatelliteSending', 'info') } },
            { delay: 3000, action: () => {
                if(deviceFound) {
                    log('logSatelliteSuccess', 'success');
                    setSatelliteStatus('SUCCESS');
                }
            }}
        ]);
    }, [language]);

    const reset = useCallback(() => {
        setMeshStatus('IDLE');
        setLoraStatus('IDLE');
        setSatelliteStatus('IDLE');
        setMeshLog([]);
        setLoraLog([]);
        setSatelliteLog([]);
    }, []);

    return { 
        meshStatus, loraStatus, satelliteStatus,
        meshLog, loraLog, satelliteLog,
        initiateMeshRelay, initiateLoRaUplink, initiateSatelliteUplink,
        reset
    };
};

export default useOfflineTransmitter;