import React, { useState } from 'react';
import { TouristID, Incident, Language, GpsPosition, GeoFence, LedgerEntry } from '../types';
import AuthorityMap from './AuthorityMap';
import LedgerView from './LedgerView';
import { t } from '../lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';

interface AuthorityDashboardViewProps {
    tourists: TouristID[];
    incidents: Incident[];
    ledger: LedgerEntry[];
    touristPositions: Record<string, GpsPosition>;
    language: Language;
    setLanguage: (lang: Language) => void;
    goBack: () => void;
    dangerZones: GeoFence[];
}

const KPICard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-between">
        <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className={`text-4xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-full">
            {icon}
        </div>
    </div>
);

const AuthorityDashboardView: React.FC<AuthorityDashboardViewProps> = ({
    tourists, incidents, ledger, touristPositions, language, setLanguage, goBack, dangerZones
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const activeIncidents = incidents.filter(i => i.status !== 'resolved');

    const tabs = [
        { id: 'overview', name: t('overview', language) },
        { id: 'tactical_map', name: 'Tactical Map' },
        { id: 'all_tourists', name: t('allTourists', language) },
        { id: 'incidents', name: t('incidents', language) },
        { id: 'blockchain_ledger', name: t('blockchainLedger', language) },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard 
                            title={t('totalTourists', language)} 
                            value={tourists.length}
                            color="text-cyan-400"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>}
                        />
                        <KPICard 
                            title={t('activeIncidents', language)} 
                            value={activeIncidents.length}
                            color="text-red-400"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
                        />
                        <KPICard 
                            title={t('online', language)} 
                            value={tourists.length}
                            color="text-green-400"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                        />
                         <KPICard 
                            title={t('offline', language)} 
                            value={0}
                            color="text-red-400"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
                        />
                    </div>
                );
            case 'tactical_map':
                return (
                    <div className="h-[75vh] w-full rounded-lg overflow-hidden">
                        <AuthorityMap 
                            tourists={tourists} 
                            incidents={incidents} 
                            positions={touristPositions} 
                            dangerZones={dangerZones} 
                        />
                    </div>
                );
            case 'all_tourists':
                return (
                     <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Location</th>
                                </tr>
                            </thead>
                            <tbody className="bg-gray-900 divide-y divide-gray-800">
                                {tourists.map(tourist => {
                                    const inDistress = activeIncidents.some(i => i.touristId === tourist.id);
                                    const position = touristPositions[tourist.id];
                                    return (
                                        <tr key={tourist.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{tourist.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{tourist.id.substring(0,12)}...</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inDistress ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                                    {inDistress ? 'Distress' : 'Normal'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : 'N/A'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                );
            case 'incidents':
                return (
                     <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-700">
                             <thead className="bg-gray-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tourist</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                             <tbody className="bg-gray-900 divide-y divide-gray-800">
                                {incidents.map(incident => (
                                    <tr key={incident.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{incident.time.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{tourists.find(t => t.id === incident.touristId)?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 uppercase">{incident.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-300 capitalize">{incident.severity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-cyan-300 capitalize">{incident.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'blockchain_ledger':
                return <LedgerView ledger={ledger} language={language} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-purple-400">{t('authorityDashboard', language)}</h2>
                <div className="flex items-center gap-4">
                    <LanguageSwitcher language={language} setLanguage={setLanguage} />
                    <button onClick={goBack} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                        {t('goBack', language)}
                    </button>
                </div>
            </header>

            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-cyan-400 text-cyan-400'
                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <main className="mt-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default AuthorityDashboardView;
