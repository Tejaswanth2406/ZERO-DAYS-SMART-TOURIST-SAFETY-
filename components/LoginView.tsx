import React, { useState, useEffect, useMemo } from 'react';
import { Language } from '../types';
import { t } from '../lib/i18n';

interface LoginViewProps {
    onLoginSuccess: () => void;
    language: Language;
}

const generateCaptcha = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, language }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password');
    const [captcha, setCaptcha] = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);

    const captchaText = useMemo(() => generateCaptcha(), []);

    useEffect(() => {
        setCaptcha(captchaText);
    }, [captchaText]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const triggerError = () => {
            setError(t('loginError', language));
            setCaptcha(generateCaptcha()); // Regenerate captcha on failure
            setCaptchaInput('');
            setShake(true);
            setTimeout(() => setShake(false), 820); // Reset shake animation after it finishes
        };

        if (captchaInput.toUpperCase() !== captcha) {
            triggerError();
            return;
        }

        // Hardcoded credentials for hackathon demo
        if (username === 'admin' && password === 'password') {
            onLoginSuccess();
        } else {
            triggerError();
        }
    };

    return (
        <div className={`max-w-md mx-auto bg-gray-800 p-8 rounded-lg shadow-2xl border border-purple-500/30 ${shake ? 'animate-shake' : 'animate-fade-in'}`}>
            <h2 className="text-2xl font-bold mb-6 text-center text-purple-400">{t('authorityLogin', language)}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    name="username"
                    label={t('username', language)}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <InputField
                    name="password"
                    label={t('password', language)}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">{t('captcha', language)}</label>
                    <div className="flex items-center justify-center bg-gray-900 border border-gray-700 rounded-lg p-3">
                        <span className="text-2xl font-bold tracking-[.2em] text-cyan-400 select-none" style={{ textDecoration: 'line-through', fontStyle: 'italic' }}>
                            {captcha}
                        </span>
                    </div>
                     <InputField
                        name="captchaInput"
                        label={t('enterCaptcha', language)}
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                        required
                    />
                </div>
                
                {error && <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg text-center">{error}</p>}

                <button
                    type="submit"
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    {t('login', language)}
                </button>
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
            autoComplete={type === 'password' ? 'current-password' : 'off'}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        />
    </div>
);

export default LoginView;