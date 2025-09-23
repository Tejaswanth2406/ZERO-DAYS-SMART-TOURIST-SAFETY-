import React from 'react';
import { Language, View } from '../types';
import { t } from '../lib/i18n';

interface WelcomeViewProps {
    setView: (view: View) => void;
    language: Language;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ setView, language }) => {
    return (
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-4">{t('welcomeTitle', language)}</h2>
            <p className="text-gray-400 mb-12">{t('appSlogan', language)}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tourist Portal Card */}
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-cyan-500/30 flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-cyan-400 mb-2">{t('touristPortal', language)}</h3>
                    <p className="text-gray-400 mb-6 flex-grow">{t('touristPortalDesc', language)}</p>
                    <button
                        onClick={() => setView('registration')}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        {t('registerAsTourist', language)}
                    </button>
                </div>

                {/* Authority Portal Card */}
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-purple-500/30 flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-purple-400 mb-2">{t('authorityPortal', language)}</h3>
                    <p className="text-gray-400 mb-6 flex-grow">{t('authorityPortalDesc', language)}</p>
                    <button
                        onClick={() => setView('login')}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                    >
                        {t('accessDashboard', language)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeView;
