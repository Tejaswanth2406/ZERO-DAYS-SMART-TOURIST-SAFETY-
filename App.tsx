import React, { useState, useEffect, useCallback, useRef } from 'react';
import WelcomeView from './components/WelcomeView';
import RegistrationView from './components/RegistrationView';
import DashboardView from './components/DashboardView';
import AuthorityDashboardView from './components/AuthorityDashboardView';
import LoginView from './components/LoginView';
import { TouristID, LedgerEntry, Alert, Language, Incident, GpsPosition, IncidentType, EFIR, View, LedgerEntryType, Vitals, GeoFence } from './types';
import { t } from './lib/i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import { MOCK_TOURISTS, MOCK_POSITIONS, MOCK_VITALS } from './lib/mockData';

const createHash = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Central definition for Geofences
const safeZone: GeoFence = { id: 'safe-zone-1', name: 'Safe Zone', zone: { center: { lat: 19.0760, lng: 72.8777 }, radius: 500 }, riskLevel: 'safe' };
const dangerZones: GeoFence[] = [
    { id: 'danger-zone-1', name: 'Restricted Forest Area', zone: { center: { lat: 19.10, lng: 72.89 }, radius: 800 }, riskLevel: 'danger' },
    { id: 'danger-zone-2', name: 'Unstable Cliff Zone', zone: { center: { lat: 19.04, lng: 72.86 }, radius: 600 }, riskLevel: 'restricted' },
];


const App: React.FC = () => {
    const [view, setView] = useState<View>('welcome');
    const [tourists, setTourists] = useState<TouristID[]>([]);
    const [currentTourist, setCurrentTourist] = useState<TouristID | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [efirs, setEfirs] = useState<EFIR[]>([]);
    const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
    const [language, setLanguage] = useState<Language>('en');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    
    // Centralized simulation state
    const [touristPositions, setTouristPositions] = useState<Record<string, GpsPosition>>({});
    const [touristVitals, setTouristVitals] = useState<Record<string, Vitals>>({});
    const [simulationInterval, setSimulationInterval] = useState(3000);
    
    const simulationIntervalRef = useRef<number | null>(null);

    const addLedgerEntry = useCallback((entry: Omit<LedgerEntry, 'timestamp' | 'id'>) => {
        setLedger(prevLedger => [
            ...prevLedger,
            { ...entry, id: prevLedger.length + 1, timestamp: new Date() }
        ]);
    }, []);

    const addAlert = useCallback((alert: Omit<Alert, 'timestamp' | 'id'>) => {
        setAlerts(prevAlerts => {
            const newAlert = { ...alert, id: prevAlerts.length + 1, timestamp: new Date() };
            // Prevent duplicate alerts within a short timeframe
            const recentAlert = prevAlerts.find(a => a.message === newAlert.message);
            if(recentAlert && (new Date().getTime() - recentAlert.timestamp.getTime()) < 10000) {
                 return prevAlerts;
            }
            return [newAlert, ...prevAlerts];
        });
    }, []);

    const generateEFIR = useCallback(async (incident: Incident) => {
        const efirId = (await createHash(`efir-${incident.id}-${Date.now()}`)).substring(0, 16);
        const blockchainTx = await createHash(`${efirId}${incident.blockchainTx}`);
        const newEfir: EFIR = {
            id: efirId,
            incidentId: incident.id,
            touristId: incident.touristId,
            generatedAt: new Date(),
            pdfHash: await createHash(`PDF-content-for-${efirId}`),
            blockchainTx
        };
        const ledgerEntry = { type: LedgerEntryType.E_FIR_GENERATED, data: { summary: `e-FIR for incident ${incident.type.toUpperCase()}`, referenceId: newEfir.id, blockchainTx: newEfir.blockchainTx } };
        if (isOnline) {
            setEfirs(prev => [...prev, newEfir]);
            addLedgerEntry(ledgerEntry);
            addAlert({ type: 'info', message: `${t('eFirGenerated', language)} ${incident.id.substring(0, 8)}...` });
        } else {
            const offlineEvents = JSON.parse(localStorage.getItem('offlineEvents') || '[]');
            offlineEvents.push({ type: 'efir', payload: newEfir }, { type: 'ledger', payload: ledgerEntry });
            localStorage.setItem('offlineEvents', JSON.stringify(offlineEvents));
        }
    }, [addAlert, addLedgerEntry, isOnline, language]);

    const addIncident = useCallback(async (touristId: string, type: IncidentType, location: GpsPosition, severity: Incident['severity']) => {
        const allKnownTourists = [...tourists, ...MOCK_TOURISTS];
        const tourist = allKnownTourists.find(t => t.id === touristId);
        if (!tourist) return;
        
        // Prevent creating duplicate incidents too quickly
        const lastIncident = incidents.slice().reverse().find(i => i.touristId === touristId && i.type === type);
        if (lastIncident && (new Date().getTime() - lastIncident.time.getTime()) < 15000) { // 15s cooldown
            return;
        }

        const incidentId = (await createHash(`${type}-${tourist.id}-${Date.now()}`)).substring(0, 16);
        const blockchainTx = await createHash(`${incidentId}${tourist.blockchainTx}`);
        const newIncident: Incident = { id: incidentId, touristId: tourist.id, location, time: new Date(), type, severity, status: 'reported', evidenceHash: await createHash(`evidence-for-${incidentId}`), blockchainTx };
        const ledgerEntry = { type: LedgerEntryType.INCIDENT_REPORT, data: { summary: `Incident: ${type.toUpperCase()} by ${tourist.name}`, referenceId: newIncident.id, blockchainTx: newIncident.blockchainTx } };
        const alertMessage = {
            'sos': `${t('sosTriggered', language)}: ${tourist.name}`,
            'geofence': `${t('geofenceAlert', language)}: ${tourist.name}`,
            'inactivity': `${t('inactivityAlert', language)}: ${tourist.name}`,
            'iot': `${t('iotAlert', language)}: ${tourist.name}`
        }[type];

        if (isOnline) {
            setIncidents(prev => [newIncident, ...prev]);
            addLedgerEntry(ledgerEntry);
            addAlert({ type, message: alertMessage, location });
            if (severity === 'critical' || severity === 'high') {
                generateEFIR(newIncident);
            }
        } else {
            if (type === 'sos') addAlert({ type: 'error', message: t('sosQueued', language) });
            const offlineEvents = JSON.parse(localStorage.getItem('offlineEvents') || '[]');
            offlineEvents.push({ type: 'incident', payload: newIncident }, { type: 'ledger', payload: ledgerEntry });
            localStorage.setItem('offlineEvents', JSON.stringify(offlineEvents));
        }
    }, [tourists, incidents, isOnline, addAlert, addLedgerEntry, generateEFIR, language]);

    const handleRegistration = (data: TouristID) => {
        const newTourists = [...tourists, data];
        setTourists(newTourists);
        setCurrentTourist(data);
        addLedgerEntry({ type: LedgerEntryType.REGISTRATION, data: { summary: `Registered: ${data.name}`, referenceId: data.id, blockchainTx: data.blockchainTx } });
        localStorage.setItem('healthCard', JSON.stringify(data.healthInfo));
        
        // Initialize position and vitals for the new tourist
        setTouristPositions(prev => ({...prev, [data.id]: { lat: 19.0760, lng: 72.8777 }}));
        if(data.iotDevice?.paired) {
            setTouristVitals(prev => ({...prev, [data.id]: { heartRate: 75, status: 'normal' }}));
        }
        
        setTimeout(() => setView('tourist_dashboard'), 3000);
    };

    const handleLoginSuccess = async () => {
        setIsAuthenticated(true);
        setTourists(MOCK_TOURISTS);
        setTouristPositions(MOCK_POSITIONS);
        setTouristVitals(MOCK_VITALS);
        const mockLedgerEntries = MOCK_TOURISTS.map(t => ({
             type: LedgerEntryType.REGISTRATION, data: { summary: `Registered: ${t.name}`, referenceId: t.id, blockchainTx: t.blockchainTx }
        }));

        // Create mock incidents
        const mockIncidents: Incident[] = [];
        const incidentTypes: IncidentType[] = ['sos', 'geofence', 'iot', 'inactivity'];
        const severities: Incident['severity'][] = ['low', 'medium', 'high', 'critical'];

        for (let i = 0; i < 41; i++) {
            const tourist = MOCK_TOURISTS[i % MOCK_TOURISTS.length];
            const type = incidentTypes[i % incidentTypes.length];
            const severity = severities[i % severities.length];
            const incidentId = `incident_${i}_${await createHash(String(i))}`;
            const blockchainTx = await createHash(`tx_${incidentId}`);
            mockIncidents.push({
                id: incidentId,
                touristId: tourist.id,
                location: { 
                    lat: 19.0760 + (Math.random() - 0.5) * 0.1, 
                    lng: 72.8777 + (Math.random() - 0.5) * 0.1 
                },
                time: new Date(Date.now() - Math.random() * 1000 * 3600 * 24),
                type,
                severity,
                status: 'reported',
                evidenceHash: await createHash(`hash_${incidentId}`),
                blockchainTx,
            });
        }
        setIncidents(mockIncidents);
        
        // Avoid adding duplicate ledger entries on re-entry
        if(ledger.length < MOCK_TOURISTS.length){
            mockLedgerEntries.forEach(addLedgerEntry);
        }
        setView('authority_dashboard');
    };

    const toggleExpeditionMode = (enabled: boolean) => {
        setSimulationInterval(enabled ? 10000 : 3000);
        addAlert({type: 'info', message: enabled ? t('expeditionModeOn', language) : t('expeditionModeOff', language)});
    };
    
    const resetState = useCallback(() => {
        setTourists([]);
        setCurrentTourist(null);
        setLedger([]);
        setIncidents([]);
        setAlerts([]);
        setIsAuthenticated(false);
        setView('welcome');
    }, []);

    // Central Simulation Loop
    useEffect(() => {
        const simulate = () => {
             const allTourists = view === 'authority_dashboard' ? tourists : [currentTourist].filter(Boolean) as TouristID[];

             // 1. Simulate Positions
            setTouristPositions(prevPositions => {
                const newPositions = { ...prevPositions };
                allTourists.forEach(tourist => {
                    const currentPos = newPositions[tourist.id];
                    if (currentPos) {
                        newPositions[tourist.id] = {
                            lat: currentPos.lat + (Math.random() - 0.5) * 0.0005,
                            lng: currentPos.lng + (Math.random() - 0.5) * 0.0005,
                        };
                    } else { // Initialize if missing
                        newPositions[tourist.id] = { lat: 19.0760, lng: 72.8777 };
                    }
                });
                return newPositions;
            });
            // 2. Simulate Vitals
            setTouristVitals(prevVitals => {
                const newVitals = { ...prevVitals };
                allTourists.forEach(tourist => {
                     if(tourist.iotDevice?.paired) {
                        const currentHeartRate = newVitals[tourist.id]?.heartRate || 75;
                        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                        let newHeartRate = currentHeartRate + change;
                        
                        // Introduce more realistic spikes/drops
                        if (Math.random() < 0.01) newHeartRate = 140; // Random spike
                        if (Math.random() < 0.005) newHeartRate = 45; // Random drop
                        newHeartRate = Math.max(40, Math.min(180, newHeartRate)); // Clamp values

                        const isAbnormal = newHeartRate > 120 || newHeartRate < 50;
                        newVitals[tourist.id] = { heartRate: newHeartRate, status: isAbnormal ? 'abnormal' : 'normal' };
                     }
                });
                return newVitals;
            });
        };
        
        if ((view === 'tourist_dashboard' && currentTourist) || view === 'authority_dashboard') {
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = window.setInterval(simulate, simulationInterval);
        }

        return () => {
            if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
        };
    }, [view, tourists, currentTourist, simulationInterval]);


    const handleOfflineSync = useCallback(() => {
        const offlineEvents = JSON.parse(localStorage.getItem('offlineEvents') || '[]');
        if (offlineEvents.length > 0) {
            offlineEvents.forEach((event: any) => {
                if (event.type === 'ledger') addLedgerEntry(event.payload);
                if (event.type === 'incident') setIncidents(p => [event.payload, ...p]);
                if (event.type === 'efir') setEfirs(p => [...p, event.payload]);
            });
            localStorage.removeItem('offlineEvents');
            addAlert({ type: 'info', message: `${t('syncedOfflineEvents', language)} ${offlineEvents.length}` });
        }
    }, [addAlert, addLedgerEntry, language]);

    useEffect(() => {
        const updateOnlineStatus = () => {
            const online = navigator.onLine;
            setIsOnline(online);
            if (online) handleOfflineSync();
        };
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        if (isOnline) handleOfflineSync();
        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
        };
    }, [isOnline, handleOfflineSync]);

    const renderView = () => {
        switch (view) {
            case 'registration':
                return <RegistrationView onRegister={handleRegistration} language={language} />;
            case 'tourist_dashboard':
                if (currentTourist) {
                    return <DashboardView
                        touristData={currentTourist}
                        alerts={alerts.filter(a => !a.location || incidents.some(i => i.touristId === currentTourist.id && a.location === i.location))}
                        addIncident={(type, loc, sev) => addIncident(currentTourist.id, type, loc, sev)}
                        isOnline={isOnline}
                        language={language}
                        addAlert={addAlert}
                        position={touristPositions[currentTourist.id] || null}
                        vitals={touristVitals[currentTourist.id] || null}
                        toggleExpeditionMode={toggleExpeditionMode}
                        safeZone={safeZone}
                        dangerZones={dangerZones}
                    />;
                }
                return <WelcomeView setView={setView} language={language} />; // Fallback
            case 'login':
                return <LoginView onLoginSuccess={handleLoginSuccess} language={language} />;
            case 'authority_dashboard':
                 if (!isAuthenticated) return <LoginView onLoginSuccess={handleLoginSuccess} language={language} />;
                 return <AuthorityDashboardView 
                    tourists={tourists}
                    incidents={incidents}
                    ledger={ledger}
                    touristPositions={touristPositions}
                    language={language}
                    setLanguage={setLanguage}
                    goBack={resetState}
                    dangerZones={[...dangerZones]}
                 />
            case 'welcome':
            default:
                return <WelcomeView setView={setView} language={language} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
             { view !== 'authority_dashboard' && (
                <header className="relative text-center p-4 sm:p-6 lg:p-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">{t('appName', language)}</h1>
                    <p className="text-gray-400 mt-2">{t('appSlogan', language)}</p>
                    <div className="absolute top-0 right-0 p-4 sm:p-6 lg:p-8">
                        <LanguageSwitcher language={language} setLanguage={setLanguage} />
                    </div>
                </header>
             )}
            <main className={view !== 'authority_dashboard' ? 'p-4 sm:p-6 lg:p-8' : ''}>
                {renderView()}
            </main>
        </div>
    );
};

export default App;
