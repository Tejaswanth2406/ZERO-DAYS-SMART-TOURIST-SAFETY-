import React from 'react';
import { TouristID, Language } from '../types';
import { t } from '../lib/i18n';
import { QRCodeSVG as QRCode } from 'qrcode.react';

interface DigitalIdModalProps {
    tourist: TouristID;
    onClose: () => void;
    language: Language;
}

const DigitalIdModal: React.FC<DigitalIdModalProps> = ({ tourist, onClose, language }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4 border border-cyan-500/50 text-center">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-cyan-400">{t('digitalIdCard', language)}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition text-3xl leading-none">&times;</button>
                </div>
                
                <div className="bg-white p-4 inline-block rounded-lg shadow-md mb-6">
                    <QRCode value={JSON.stringify({ id: tourist.id, name: tourist.name })} size={200} />
                </div>
                
                <div className="text-left bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm"><strong className="text-cyan-400">{t('digitalId', language)}:</strong></p>
                    <p className="font-mono text-sm break-words">{tourist.id}</p>
                    <p className="text-sm mt-2"><strong className="text-cyan-400">{t('fullName', language)}:</strong> <span className="text-white">{tourist.name}</span></p>
                </div>

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

export default DigitalIdModal;
