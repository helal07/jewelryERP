import React from 'react';
import { Link } from '@inertiajs/react';
import { Calendar, Wallet, Landmark, Smartphone, PieChart } from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

export default function AccountReportsNav({ activeTab = 'day-book' }) {
    const { t } = useLanguage();

    const tabs = [
        {
            id: 'day-book',
            label: t('dayBook') || 'Day Book',
            routeName: 'reports.day-book',
            icon: Calendar,
        },
        {
            id: 'cash-book',
            label: t('cashBook') || 'Cash Book',
            routeName: 'reports.cash-book',
            icon: Wallet,
        },
        {
            id: 'consol-bank-book',
            label: t('consolBankBook') || 'Consol Bank Book',
            routeName: 'reports.consol-bank-book',
            icon: Landmark,
        },
        {
            id: 'mobile-bank-book',
            label: t('mobileBankBook') || 'Mobile Bank Book',
            routeName: 'reports.mobile-bank-book',
            icon: Smartphone,
        },
        {
            id: 'profit-loss',
            label: t('profitLoss') || 'P&L',
            routeName: 'reports.profit-loss',
            icon: PieChart,
        },
    ];

    return (
        <div className="bg-white rounded-2xl p-1.5 shadow-2xs border border-gray-100 mb-6 print:hidden">
            <div className="flex flex-wrap items-center gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <Link
                            key={tab.id}
                            href={route(tab.routeName)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                                isActive
                                    ? 'text-white shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                            }`}
                            style={isActive ? { backgroundColor: 'rgb(177, 118, 51)' } : undefined}
                        >
                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

