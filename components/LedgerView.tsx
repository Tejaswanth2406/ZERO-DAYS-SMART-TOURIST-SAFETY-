import React from 'react';
import { LedgerEntry, Language } from '../types';
import { t } from '../lib/i18n';

interface LedgerViewProps {
    ledger: LedgerEntry[];
    language: Language;
}

const LedgerView: React.FC<LedgerViewProps> = ({ ledger, language }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('id', language)}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('timestamp', language)}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('type', language)}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('summary', language)}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">{t('transactionHash', language)}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-800">
                        {ledger.slice().reverse().map((entry) => (
                            <tr key={entry.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{entry.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{entry.timestamp.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-cyan-500/20 text-cyan-300">
                                        {entry.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{entry.data.summary}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400 font-mono" title={entry.data.blockchainTx}>
                                    {entry.data.blockchainTx.substring(0, 12)}...
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LedgerView;
