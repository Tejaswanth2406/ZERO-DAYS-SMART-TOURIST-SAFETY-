import React, { useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { TouristID, Language } from '../types';
import { t } from '../lib/i18n';

interface RegistrationViewProps {
    onRegister: (data: TouristID) => void;
    language: Language;
}

const createHash = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const RegistrationView: React.FC<RegistrationViewProps> = ({ onRegister, language }) => {
    const [formData, setFormData] = useState({
        fullName: 'John Doe',
        passportId: 'A12345678',
        email: 'john.doe@example.com',
        tripStartDate: new Date().toISOString().split('T')[0],
        tripEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        emergencyContacts: 'Jane Doe +1-555-1234',
        bloodGroup: 'O+',
        allergies: 'Peanuts',
    });
    const [pairIotDevice, setPairIotDevice] = useState(true);
    const [registeredData, setRegisteredData] = useState<TouristID | null>(null);
    const [isPairing, setIsPairing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (pairIotDevice) {
            setIsPairing(true);
            await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate pairing delay
            setIsPairing(false);
        }

        const idString = `${formData.email}${Date.now()}`;
        const digitalId = (await createHash(idString)).substring(0, 16);
        const passportHash = await createHash(formData.passportId);
        const blockchainTx = await createHash(`${digitalId}${passportHash}${Date.now()}`);

        const finalData: TouristID = {
            id: digitalId,
            name: formData.fullName,
            passportHash: passportHash,
            tripItinerary: { startDate: formData.tripStartDate, endDate: formData.tripEndDate },
            emergencyContacts: formData.emergencyContacts,
            blockchainTx: blockchainTx,
            healthInfo: { bloodGroup: formData.bloodGroup, allergies: formData.allergies },
            iotDevice: pairIotDevice ? { deviceId: `IOT-${(await createHash(digitalId)).substring(0,8)}`, paired: true } : undefined,
        };
        setRegisteredData(finalData);
        onRegister(finalData);
    };

    if (isPairing) {
        return (
             <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
                <div className="bg-gray-800 p-8 rounded-lg text-center shadow-2xl border border-cyan-500/50">
                    <svg className="animate-spin h-10 w-10 text-cyan-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xl text-white font-semibold">Pairing IoT Device...</p>
                    <p className="text-sm text-gray-400 mt-1">Please wait while we establish a secure connection.</p>
                </div>
            </div>
        )
    }

    if (registeredData) {
        return (
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-2xl mx-auto text-center animate-fade-in">
                <h2 className="text-3xl font-bold text-cyan-400 mb-4">{t('registrationSuccessful', language)}</h2>
                <p className="text-gray-300 mb-6">{t('qrCodePrompt', language)}</p>
                <div className="bg-white p-4 inline-block rounded-lg shadow-md">
                    <QRCode value={JSON.stringify({ id: registeredData.id, name: registeredData.name })} size={256} />
                </div>
                <div className="mt-6 text-left bg-gray-700 p-4 rounded-lg">
                    <p className="text-lg"><strong className="text-cyan-400">{t('digitalId', language)}:</strong> <span className="font-mono">{registeredData.id}</span></p>
                    <p className="text-lg"><strong className="text-cyan-400">{t('fullName', language)}:</strong> {registeredData.name}</p>
                    <p className="text-lg"><strong className="text-cyan-400">{t('iotDevice', language)}:</strong> {registeredData.iotDevice?.paired ? `${t('paired', language)} (${registeredData.iotDevice.deviceId})` : t('notPaired', language)}</p>
                </div>
                <p className="mt-8 text-sm text-gray-400">{t('redirectToDashboard', language)}</p>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400">{t('createDigitalId', language)}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField name="fullName" label={t('fullName', language)} value={formData.fullName} onChange={handleChange} required />
                <InputField name="passportId" label={t('passportId', language)} value={formData.passportId} onChange={handleChange} required />
                <InputField name="email" label={t('email', language)} type="email" value={formData.email} onChange={handleChange} required />
                <InputField name="tripStartDate" label={t('tripStartDate', language)} type="date" value={formData.tripStartDate} onChange={handleChange} required />
                <InputField name="tripEndDate" label={t('tripEndDate', language)} type="date" value={formData.tripEndDate} onChange={handleChange} required />
                <InputField name="emergencyContacts" label={t('emergencyContacts', language)} value={formData.emergencyContacts} onChange={handleChange} required />
                <InputField name="bloodGroup" label={t('bloodGroup', language)} value={formData.bloodGroup} onChange={handleChange} />
                <InputField name="allergies" label={t('allergies', language)} value={formData.allergies} onChange={handleChange} />

                <div className="md:col-span-2 mt-4 bg-gray-700/50 p-4 rounded-lg">
                    <label htmlFor="pairIotDevice" className="flex items-center cursor-pointer">
                        <div className="relative">
                           <input type="checkbox" id="pairIotDevice" className="sr-only" checked={pairIotDevice} onChange={() => setPairIotDevice(!pairIotDevice)} />
                           <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                           <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform"></div>
                        </div>
                        <div className="ml-3 text-gray-200 font-medium">{t('pairIotDevice', language)}</div>
                    </label>
                </div>
                 <style>{`input:checked ~ .dot { transform: translateX(100%); background-color: #06b6d4; }`}</style>

                <div className="md:col-span-2 mt-4">
                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
                        {t('generateAndProceed', language)}
                    </button>
                </div>
            </form>
        </div>
    );
};

const InputField: React.FC<{name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean}> = 
({ name, label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        />
    </div>
);

export default RegistrationView;