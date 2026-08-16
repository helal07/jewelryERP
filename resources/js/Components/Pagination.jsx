import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links, from, to, total }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-semibold text-gray-500">
                Showing <span className="font-bold text-gray-900">{from || 0}</span> to <span className="font-bold text-gray-900">{to || 0}</span> of <span className="font-bold text-gray-900">{total || 0}</span> entries
            </div>
            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, key) => (
                    link.url === null ? (
                        <span
                            key={key}
                            className="px-3 py-1 text-xs text-gray-400 border border-gray-100 rounded-xl bg-gray-50 cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: link.label }}
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
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            preserveScroll
                        />
                    )
                ))}
            </div>
        </div>
    );
}
