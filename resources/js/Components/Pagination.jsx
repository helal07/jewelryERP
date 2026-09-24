import React from 'react';
import { Link } from '@inertiajs/react';
import { useLanguage } from '@/Context/LanguageContext';

export default function Pagination({ links, from, to, total }) {
    const { lang } = useLanguage();
    if (!links || links.length <= 3) return null;

    const formatLabel = (label) => {
        if (!label) return '';
        if (lang === 'bn') {
            return label
                .replace('&laquo; Previous', '&laquo; পূর্ববর্তী')
                .replace('Previous', 'পূর্ববর্তী')
                .replace('Next &raquo;', 'পরবর্তী &raquo;')
                .replace('Next', 'পরবর্তী');
        }
        return label;
    };

    return (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-semibold text-gray-500">
                {lang === 'bn' ? (
                    <>
                        মোট <span className="font-bold text-gray-900">{total || 0}</span> টির মধ্যে <span className="font-bold text-gray-900">{from || 0}</span> থেকে <span className="font-bold text-gray-900">{to || 0}</span> দেখানো হচ্ছে
                    </>
                ) : (
                    <>
                        Showing <span className="font-bold text-gray-900">{from || 0}</span> to <span className="font-bold text-gray-900">{to || 0}</span> of <span className="font-bold text-gray-900">{total || 0}</span> entries
                    </>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, key) => (
                    link.url === null ? (
                        <span
                            key={key}
                            className="px-3 py-1 text-xs text-gray-400 border border-gray-100 rounded-xl bg-gray-50 cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: formatLabel(link.label) }}
                        />
                    ) : (
                        <Link
                            key={key}
                            href={link.url}
                            className={`px-3 py-1 text-xs font-bold border rounded-xl transition-colors ${
                                link.active
                                    ? 'bg-[#E88A1A] text-white border-[#E88A1A] shadow-sm'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-amber-50 hover:border-amber-300'
                            }`}
                            dangerouslySetInnerHTML={{ __html: formatLabel(link.label) }}
                            preserveScroll
                        />
                    )
                ))}
            </div>
        </div>
    );
}

