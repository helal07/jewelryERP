import React, { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import { Menu, X, Search, Globe, User, Building2 } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/Context/LanguageContext';

function HeaderContent({ sidebarOpen, setSidebarOpen, user }) {
    const { lang, setLang, t } = useLanguage();
    const { active_branch } = usePage().props.auth || {};
    const branch = active_branch || user?.branch;

    return (
        <header className="glass flex h-16 flex-shrink-0 items-center justify-between px-4 sm:px-6 lg:px-8 z-30 m-4 rounded-2xl print:hidden">
            <div className="flex items-center flex-1 gap-3">
                <button
                    type="button"
                    className="text-gray-500 hover:text-brand-600 focus:outline-none lg:hidden mr-2 transition-colors cursor-pointer"
                    onClick={() => setSidebarOpen(true)}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" />
                </button>
                
                {/* Search Bar */}
                <div className="hidden sm:flex items-center bg-gray-100/50 border border-gray-200 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-300 transition-all">
                    <Search className="h-4 w-4 text-gray-400 mr-2" />
                    <input 
                        type="text" 
                        placeholder={t('searchPlaceholder')} 
                        className="bg-transparent border-none focus:ring-0 text-sm w-56 text-gray-700 placeholder-gray-400 py-1"
                    />
                </div>

                {/* Active Branch Badge */}
                {branch && (
                    <div className="hidden md:flex items-center gap-1.5 bg-amber-50/90 border border-amber-200/90 px-3 py-1 rounded-full text-xs font-bold text-amber-900 shadow-xs">
                        <Building2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{branch.name}</span>
                        {branch.code && (
                            <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                                {branch.code}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-4">
                {/* Language Switcher Button */}
                <div className="flex items-center bg-gray-100/80 p-1 rounded-full border border-gray-200/80 shadow-inner">
                    <button 
                        type="button"
                        onClick={() => setLang('en')}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                            lang === 'en' 
                                ? 'text-white shadow-md scale-105' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={lang === 'en' ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                    >
                        English
                    </button>
                    <button 
                        type="button"
                        onClick={() => setLang('bn')}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-all duration-200 cursor-pointer ${
                            lang === 'bn' 
                                ? 'text-white shadow-md scale-105' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        style={lang === 'bn' ? { backgroundColor: 'rgb(177,118,51)' } : {}}
                    >
                        বাংলা
                    </button>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="inline-flex rounded-full">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white p-1.5 text-sm font-medium text-gray-700 transition duration-200 ease-in-out hover:border-indigo-300 hover:shadow-md focus:outline-none"
                                    title={user.name}
                                >
                                    <div className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm" style={{ backgroundColor: 'rgb(177,118,51)' }}>
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                </button>
                            </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="right" className="glassmorphism mt-2 w-48 rounded-xl border border-gray-100 shadow-xl">
                            <div className="block px-4 py-3 text-xs text-gray-500 border-b border-gray-100/50 bg-gray-50/50 rounded-t-xl">
                                {t('signedInAs')}<br/>
                                <span className="font-semibold text-gray-900">{user.email}</span>
                            </div>
                            <Dropdown.Link href={route('profile.edit')} className="hover:bg-brand-50 hover:text-brand-700 transition-colors">
                                {t('profile')}
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button" className="hover:bg-red-50 hover:text-red-700 transition-colors">
                                {t('logout')}
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </div>
        </header>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-[#FEF9E7] overflow-hidden font-sans">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm transition-opacity lg:hidden print:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-56 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 print:hidden
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar />
                {/* Mobile close button inside sidebar */}
                <button 
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden print:hidden"
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Main content wrapper */}
            <div className="flex flex-1 flex-col overflow-hidden relative print:overflow-visible">
                
                {/* Decorative background gradients */}
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-amber-100/40 to-transparent pointer-events-none -z-10 print:hidden" />

                {/* Header Component */}
                <HeaderContent 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                    user={user} 
                />

                {/* Page header (if provided) */}
                {header && (
                    <div className="px-4 sm:px-6 lg:px-8 mt-2 mb-4 animate-fade-in print:hidden">
                        {header}
                    </div>
                )}

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 custom-scrollbar">
                    <div className="mx-auto max-w-7xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
