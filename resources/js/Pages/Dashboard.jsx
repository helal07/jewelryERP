import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Calendar,
    ShoppingBag,
    TrendingUp,
    Clock,
    DollarSign,
    Users,
    Scale,
    Building2,
    Truck,
    Package,
    ShieldCheck,
    Coins,
    AlertCircle,
    AlertTriangle,
    BellRing,
    CheckCircle2,
    Sparkles,
    Calculator,
    UserPlus,
    CreditCard,
    ArrowRight,
    ShoppingBasket,
    BadgePercent,
    PlusCircle,
    Plus,
    Gem,
    Trash2,
    PackagePlus
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';
import { useState, useEffect } from 'react';
import VoriGramCalculator from '@/Components/VoriGramCalculator';
import Modal from '@/Components/Modal';
import { X } from 'lucide-react';

// Gold Ribbon Stat Card Component (Reference Screenshot Style)
const GoldRibbonCard = ({ value, title, subtitle }) => {
    return (
        <div className="bg-white rounded-md shadow-sm border border-gray-200/90 relative p-4 pl-14 flex flex-col justify-center min-h-[96px] hover:shadow-md transition-shadow">
            {/* Gold Ribbon Graphic on Left */}
            <div className="absolute left-0 top-0 bottom-0 w-11 flex flex-col justify-between overflow-hidden rounded-l-md">
                <div className="h-full w-full bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 shadow-inner relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-200/50 via-white/40 to-transparent"></div>
                    <div className="absolute top-0 left-0 w-full h-2 bg-yellow-200/60"></div>
                    <div className="absolute bottom-0 right-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-amber-800/80"></div>
                </div>
            </div>
            
            {/* Card Content */}
            <div className="z-10 pl-2">
                <div className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    {value}
                </div>
                <div className="text-xs font-bold text-gray-600 mt-1 uppercase tracking-wide">
                    {title}
                </div>
                {subtitle && (
                    <div className="text-[10px] text-gray-400 font-medium mt-0.5">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    );
};

const fmtBDT = (val) =>
    Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard({ customers = [], products = [], branches = [], autoInvoiceNo, defaultVatRate = 5 }) {
    const { t, lang } = useLanguage();
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const isBn = lang === 'bn';

    // ── Sale form ──────────────────────────────────────────────────────────────
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: customers.length > 0 ? customers[0].id : '',
        branch_id:   branches.length  > 0 ? branches[0].id  : '',
        invoice_no:  autoInvoiceNo || `INV-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`,
        sale_date:   new Date().toISOString().split('T')[0],
        sale_type:   'retail',
        items: [{ product_id:'', gross_weight:'', stone_weight:0, net_weight:'', rate_per_gram:'', making_charge:0, stone_charge:0, quantity:1, total_amount:0 }],
        subtotal: 0, discount: 0, vat_percent: defaultVatRate, tax: 0,
        old_gold_exchange_value: 0, grand_total: 0, paid_amount: 0,
    });

    const addItem = () => setData('items', [...data.items, { product_id:'', gross_weight:'', stone_weight:0, net_weight:'', rate_per_gram:'', making_charge:0, stone_charge:0, quantity:1, total_amount:0 }]);

    const removeItem = (index) => {
        if (data.items.length === 1) {
            setData('items', [{ product_id:'', gross_weight:'', stone_weight:0, net_weight:'', rate_per_gram:'', making_charge:0, stone_charge:0, quantity:1, total_amount:0 }]);
            return;
        }
        setData('items', data.items.filter((_, i) => i !== index));
    };

    const handleProductSelect = (index, productId) => {
        const prod = products.find(p => p.id === Number(productId));
        const newItems = [...data.items];
        if (prod) {
            const gross   = Number(prod.gross_weight || 0);
            const stone   = Number(prod.stone_weight || 0);
            const net     = Math.max(0, gross - stone);
            const rate    = Number(prod.selling_price || 0);
            const making  = Number(prod.making_charge || 0);
            newItems[index] = { ...newItems[index], product_id: prod.id, gross_weight: gross, stone_weight: stone, net_weight: net, rate_per_gram: rate, making_charge: making, stone_charge: 0, quantity:1, total_amount:(net*rate)+making };
        } else {
            newItems[index].product_id = '';
        }
        setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        const gross   = Number(newItems[index].gross_weight || 0);
        const stone   = Number(newItems[index].stone_weight || 0);
        const net     = Math.max(0, gross - stone);
        newItems[index].net_weight = net;
        const rate    = Number(newItems[index].rate_per_gram || 0);
        const making  = Number(newItems[index].making_charge || 0);
        const stoneC  = Number(newItems[index].stone_charge  || 0);
        const qty     = Number(newItems[index].quantity || 1);
        newItems[index].total_amount = ((net * rate) + making + stoneC) * qty;
        setData('items', newItems);
    };

    const addProductToSale = (prod) => {
        const gross  = Number(prod.gross_weight || 10);
        const stone  = Number(prod.stone_weight || 0);
        const net    = Math.max(0, gross - stone);
        const rate   = Number(prod.selling_price || 0);
        const making = Number(prod.making_charge || 0);
        const newItem = { product_id: prod.id, gross_weight: gross, stone_weight: stone, net_weight: net, rate_per_gram: rate, making_charge: making, stone_charge:0, quantity:1, total_amount:(net*rate)+making };
        if (data.items.length === 1 && !data.items[0].product_id) {
            setData('items', [newItem]);
        } else {
            setData('items', [...data.items, newItem]);
        }
    };

    useEffect(() => {
        const sub      = data.items.reduce((acc, item) => acc + Number(item.total_amount || 0), 0);
        const disc     = Number(data.discount || 0);
        const vatPct   = Number(data.vat_percent || 0);
        const oldGold  = Number(data.old_gold_exchange_value || 0);
        const taxVal   = Math.max(0, (sub - disc) * (vatPct / 100));
        const grand    = Math.max(0, sub - disc + taxVal - oldGold);
        setData(prev => ({ ...prev, subtotal: sub, tax: taxVal, grand_total: grand, paid_amount: prev.paid_amount || grand }));
    }, [JSON.stringify(data.items), data.discount, data.vat_percent, data.old_gold_exchange_value]);

    const handleSaleSubmit = (e) => {
        e.preventDefault();
        post(route('sales.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaleModalOpen(false);
                reset();
            },
        });
    };

    const closeSaleModal = () => {
        setIsSaleModalOpen(false);
        reset();
        setProductSearch('');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
    );
    // ──────────────────────────────────────────────────────────────────────────

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-[#FEF9E7] p-3 rounded-xl border border-amber-200/60 shadow-sm text-xs font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-gray-900 tracking-tight">
                            {t('dashboard')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsCalculatorOpen(true)}
                            className="px-3 py-1.5 bg-white hover:bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                            <Calculator className="w-3.5 h-3.5 text-amber-700" />
                            {t('voriGramCalc')}
                        </button>
                        <button 
                            onClick={() => setIsSaleModalOpen(true)}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
                        >
                            <PlusCircle className="w-4 h-4 text-white" />
                            {t('newSaleBtn')}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={t('dashboard')} />

            {/* Main Page Container with Warm Cream Background (#FEF9E7) */}
            <div className="-m-6 p-4 sm:p-6 bg-[#FEF9E7] min-h-screen space-y-6">

                {/* FEATURE 1: BUSINESS SUMMARY */}
                <div>
                    <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-700" />
                            {t('businessSummary')}
                        </h3>
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                            {isBn ? "লাইভ সামারি" : "Real-time Overview"}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <GoldRibbonCard title="Total POS Sale" value="30,739,180.97" subtitle={isBn ? "২৮ টি মেমো" : "28 Invoices"} />
                        <GoldRibbonCard title="POS Sales Return" value="5,669,905.60" subtitle={isBn ? "৩ টি ফেরত" : "3 Returned Items"} />
                        <GoldRibbonCard title="Total Customer Order" value="24,532,648.91" subtitle={isBn ? "১৫ টি অর্ডার" : "15 Custom Orders"} />
                        <GoldRibbonCard title="Stock Valuation (Metal)" value="92,599,532.63" subtitle={isBn ? "ভল্ট মেটাল" : "Vault Metal & Jewelry"} />
                    </div>
                </div>

                {/* GRID ROW: FEATURE 2 (DAILY SALES OVERVIEW) & FEATURE 4 (CUSTOMER STATISTICS) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* FEATURE 2: DAILY SALES OVERVIEW */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <ShoppingBasket className="w-4 h-4 text-teal-600" />
                                {t('todaySales')}
                            </h4>
                            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                                {isBn ? "আজকের বিক্রি" : "Daily Sales Overview"}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                <p className="text-emerald-700 font-bold text-[10px]">{t('cash')}</p>
                                <p className="text-xs font-black text-emerald-900 mt-0.5">{isBn ? "BDT ২৬২,৯০০" : "BDT 262,900"}</p>
                            </div>
                            <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                                <p className="text-indigo-700 font-bold text-[10px]">{t('digitalCard')}</p>
                                <p className="text-xs font-black text-indigo-900 mt-0.5">{isBn ? "BDT ১৪৩,৪০০" : "BDT 143,400"}</p>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-amber-700 font-bold text-[10px]">{t('due')}</p>
                                <p className="text-xs font-black text-amber-900 mt-0.5">{isBn ? "BDT ৭১,৭০০" : "BDT 71,700"}</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-xs text-left text-gray-600">
                                <thead className="bg-[#FEF9E7] text-gray-800 font-bold border-b border-gray-200">
                                    <tr>
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3">Invoice No</th>
                                        <th className="py-2 px-3">Customer</th>
                                        <th className="py-2 px-3">Total Bill</th>
                                        <th className="py-2 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="5" className="py-3 text-center text-gray-500 font-medium bg-white text-[11px]">
                                            {isBn ? "কোনো তথ্য পাওয়া যায়নি" : "Data Not Found"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FEATURE 4: CUSTOMER STATISTICS */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-sm space-y-3">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <Users className="w-4 h-4 text-amber-600" />
                                {t('todayCustomerOrders')} & {t('customerStatistics')}
                            </h4>
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                                {isBn ? "গ্রাহক তথ্য" : "Customer Statistics"}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <GoldRibbonCard title="Customer Orders" value="24,532,648" subtitle={isBn ? "১৫৪ টি কাস্টম অর্ডার" : "154 Custom Orders"} />
                            <GoldRibbonCard title="Sale Due (POS+CO)" value="29,518,647" subtitle={isBn ? "গ্রাহকের বকেয়া প্রাপ্য" : "Total Receivable Due"} />
                        </div>

                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-xs text-left text-gray-600">
                                <thead className="bg-[#FEF9E7] text-gray-800 font-bold border-b border-gray-200">
                                    <tr>
                                        <th className="py-2 px-3">Date</th>
                                        <th className="py-2 px-3">Order No</th>
                                        <th className="py-2 px-3">Customer</th>
                                        <th className="py-2 px-3">Total Bill</th>
                                        <th className="py-2 px-3">Due</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan="5" className="py-3 text-center text-gray-500 font-medium bg-white text-[11px]">
                                            {isBn ? "কোনো তথ্য পাওয়া যায়নি" : "Data Not Found"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* GRID ROW: FEATURE 3 (PURCHASE OVERVIEW) & FEATURE 5 (SUPPLIER STATISTICS) */}
                <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <Truck className="w-4 h-4 text-indigo-600" />
                            {t('purchaseOverview')} & {t('supplierStatistics')}
                        </h4>
                        <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {isBn ? "মহাজন হিসাব" : "Supplier Statistics & Procurement"}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <GoldRibbonCard title="Total Purchase" value="58,098,044.31" subtitle={isBn ? "কাঁচা ধাতু ও তৈরি" : "Raw Metal & Jewelry"} />
                        <GoldRibbonCard title="Purchase Return" value="70,004.80" subtitle={isBn ? "মহাজন ফেরত" : "Supplier Returns"} />
                        <GoldRibbonCard title="Purchase Due" value="50,628,424.51" subtitle={isBn ? "মহাজন দেনা" : "Payables Outstanding"} />
                        <GoldRibbonCard title="Cash Balance" value="9,608,442.57" subtitle={isBn ? "নগদ স্থিতি" : "Cash In Vault"} />
                    </div>
                </div>

                {/* FEATURE 6: INVENTORY STATUS */}
                <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <Scale className="w-4 h-4 text-amber-600" />
                            {t('inventoryStatus')}
                        </h4>
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                            {isBn ? "ভল্ট লকড" : "Vault Secured"}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-100">{t('goldStock')}</p>
                                    <h3 className="text-2xl font-black text-white mt-0.5">142.5 {t('bhori')}</h3>
                                    <p className="text-[11px] text-amber-100 font-medium mt-0.5">~1,661.5g</p>
                                </div>
                                <Coins className="w-5 h-5 text-white/80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">{t('silverStock')}</p>
                                    <h3 className="text-2xl font-black text-white mt-0.5">320.0 {t('bhori')}</h3>
                                    <p className="text-[11px] text-slate-300 font-medium mt-0.5">~3,731.2g</p>
                                </div>
                                <Scale className="w-5 h-5 text-white/80" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 text-white rounded-xl p-4 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">{t('artisanHolding')}</p>
                                    <h3 className="text-2xl font-black text-white mt-0.5">45.2 {t('bhori')}</h3>
                                    <p className="text-[11px] text-indigo-100 font-medium mt-0.5">8 Artisans</p>
                                </div>
                                <Package className="w-5 h-5 text-white/80" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h5 className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            {t('lowStockAlerts')}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                            {[
                                { name: isBn ? '২২ ক্যারেট চেইন (১০g)' : '22K Chain (10g)', stock: isBn ? '২ টি' : '2 left' },
                                { name: isBn ? 'ডায়মন্ড রিং' : 'Diamond Ring', stock: isBn ? '১ টি' : '1 left' },
                                { name: isBn ? 'রূপার পায়েল' : 'Silver Anklet', stock: isBn ? '৪ টি' : '4 left' },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center p-2 bg-rose-50 border border-rose-100 rounded-lg">
                                    <span className="font-bold text-gray-900">{item.name}</span>
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full">{item.stock}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* GRID ROW: FEATURE 7 (RECENT ACTIVITIES) & FEATURE 8 (NOTIFICATION PANEL) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    
                    {/* FEATURE 7: RECENT ACTIVITIES */}
                    <div className="lg:col-span-2 bg-white rounded-xl p-4 border border-gray-200/90 shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                {t('recentActivities')}
                            </h4>
                            <button 
                                onClick={() => alert('Activity log is coming soon!')}
                                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
                            >
                                {t('viewAllActivity')}
                            </button>
                        </div>

                        <div className="space-y-2 text-xs">
                            {[
                                { title: isBn ? 'নতুন বিক্রি মেমো তৈরি' : 'New Sale Invoice Created', desc: isBn ? 'ইনভয়েস #INV-202608-001' : 'Invoice #INV-202608-001', time: isBn ? '১০ মিনিট আগে' : '10 mins ago', badge: 'BDT 125,000' },
                                { title: isBn ? 'কারিগর মেটাল দেওয়া হয়েছে' : 'Artisan Metal Issued', desc: isBn ? 'বাবুল কারিগরকে ৫০ গ্রাম সোনা' : 'Issued 50g 22K Gold', time: isBn ? '১ ঘণ্টা আগে' : '1 hour ago', badge: '+50g Gold' },
                                { title: isBn ? 'মহাজন মেটাল রিসিভ' : 'Supplier Bullion PO Received', desc: isBn ? 'স্ট্যান্ডার্ড গোল্ড বুলিয়ন PO-9982' : 'PO-9982 from Standard Gold', time: isBn ? '২ ঘণ্টা আগে' : '2 hours ago', badge: 'BDT 450,000' },
                                { title: isBn ? 'বন্ধকী সুদের টাকা জমা' : 'Mortgage Interest Payment', desc: isBn ? 'মেমো #M-102 এর লভ্যাংশ' : 'Mortgage #M-102 interest', time: isBn ? '৪ ঘণ্টা আগে' : '4 hours ago', badge: 'BDT 15,000' },
                            ].map((activity, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 text-xs">
                                    <div className="flex gap-2.5 items-center">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-[10px]">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 leading-tight">{activity.title}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">{activity.desc} • {activity.time}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                                        {activity.badge}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FEATURE 8: NOTIFICATION PANEL */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200/90 shadow-sm space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                <BellRing className="w-4 h-4 text-rose-600" />
                                {t('notificationPanel')}
                            </h4>
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                            <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h5 className="font-bold text-rose-900">{t('mortgageOverdue')}</h5>
                                        <p className="text-rose-700 mt-0.5 text-[11px]">
                                            {isBn ? "মেমো #M-204 এর ৫ দিনের বকেয়া সুদ (BDT ৪,৫০০)।" : "Mortgage #M-204 interest overdue by 5 days (BDT 4,500)."}
                                        </p>
                                        <button 
                                            onClick={() => alert('Action panel is coming soon!')}
                                            className="mt-1.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2 py-0.5 rounded transition-colors shadow-sm"
                                        >
                                            {t('takeAction')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h5 className="font-bold text-amber-900">{t('lowGoldStock')}</h5>
                                        <p className="text-amber-800 mt-0.5 text-[11px]">
                                            {isBn ? "২২ ক্যারেট চেইন স্টক সীমা শেষ (মাত্র ২ টি)।" : "22K Gold Chain stock low (2 left)."}
                                        </p>
                                        <button 
                                            onClick={() => alert('Stock ordering is coming soon!')}
                                            className="mt-1.5 text-[10px] font-bold text-white bg-amber-600 hover:bg-amber-700 px-2 py-0.5 rounded transition-colors shadow-sm"
                                        >
                                            {isBn ? "অর্ডার দিন" : "Order Stock"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            <VoriGramCalculator 
                show={isCalculatorOpen} 
                onClose={() => setIsCalculatorOpen(false)} 
            />

            {/* ── Quick New Sale Modal ─────────────────────────────────────────── */}
            <Modal show={isSaleModalOpen} onClose={closeSaleModal} maxWidth="5xl">
                <div className="flex h-[90vh] max-h-[720px] overflow-hidden rounded-2xl">

                    {/* LEFT: Sale Form */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <ShoppingBag className="w-4 h-4 text-amber-800" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-900 leading-tight">New Sale</h3>
                                    <p className="text-[11px] text-gray-500">Create POS sales invoice</p>
                                </div>
                            </div>
                            <button onClick={closeSaleModal} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaleSubmit} className="space-y-4 text-xs">
                            {/* Invoice Header Fields */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Invoice No *</label>
                                    <input type="text" value={data.invoice_no} onChange={e => setData('invoice_no', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-xs font-bold py-1.5" required />
                                    {errors.invoice_no && <p className="text-rose-500 text-[10px] mt-0.5">{errors.invoice_no}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Sale Date *</label>
                                    <input type="date" value={data.sale_date} onChange={e => setData('sale_date', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 text-xs py-1.5" required />
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Branch *</label>
                                    <select value={data.branch_id} onChange={e => setData('branch_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-amber-500 text-xs py-1.5" required>
                                        {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-gray-700 mb-1">Customer *</label>
                                    <select value={data.customer_id} onChange={e => setData('customer_id', e.target.value)}
                                        className="w-full rounded-lg border-gray-300 focus:border-amber-500 text-xs py-1.5" required>
                                        <option value="">Select Customer</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>)}
                                    </select>
                                    {errors.customer_id && <p className="text-rose-500 text-[10px] mt-0.5">{errors.customer_id}</p>}
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-700 uppercase text-[10px] tracking-wider">Items</span>
                                    <button type="button" onClick={addItem}
                                        className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer">
                                        <Plus className="w-3 h-3" /> Add Row
                                    </button>
                                </div>
                                {data.items.map((item, idx) => (
                                    <div key={idx} className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <select value={item.product_id} onChange={e => handleProductSelect(idx, e.target.value)}
                                                className="flex-1 rounded-lg border-gray-300 focus:border-amber-500 text-xs py-1.5 font-bold" required>
                                                <option value="">Select Product *</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.purity?.name || '22K'}) — ৳{Number(p.selling_price||0).toLocaleString()}/g</option>)}
                                            </select>
                                            <button type="button" onClick={() => removeItem(idx)}
                                                className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 bg-white p-2 rounded-lg border border-gray-200">
                                            {[
                                                { label:'Gross (g)', field:'gross_weight', step:'0.001' },
                                                { label:'Net (g)',   field:'net_weight',   step:'0.001', readOnly:true },
                                                { label:'Rate/g',   field:'rate_per_gram', step:'0.01' },
                                                { label:'Making',   field:'making_charge', step:'0.01' },
                                                { label:'Qty',      field:'quantity',      step:'1', min:'1' },
                                            ].map(f => (
                                                <div key={f.field}>
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-0.5">{f.label}</label>
                                                    <input type="number" step={f.step} min={f.min} value={item[f.field]} readOnly={f.readOnly}
                                                        onChange={e => !f.readOnly && handleItemChange(idx, f.field, e.target.value)}
                                                        className={`w-full rounded-md border-gray-300 text-xs font-semibold py-1 text-center ${f.readOnly ? 'bg-gray-50 border-gray-200' : 'focus:border-amber-500'}`} />
                                                </div>
                                            ))}
                                            <div>
                                                <label className="block text-[10px] font-bold text-amber-900 uppercase mb-0.5 text-right">Total</label>
                                                <div className="py-1 px-2 bg-amber-50 rounded-md border border-amber-200 text-right font-black text-gray-900 text-xs">
                                                    ৳ {Number(item.total_amount||0).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Old Gold Exchange (৳)</label>
                                        <input type="number" step="0.01" value={data.old_gold_exchange_value} onChange={e => setData('old_gold_exchange_value', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-amber-500 text-xs font-bold text-amber-700 py-1.5" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-gray-700 mb-1">Discount (৳)</label>
                                        <input type="number" step="0.01" value={data.discount} onChange={e => setData('discount', e.target.value)}
                                            className="w-full rounded-lg border-gray-300 focus:border-amber-500 text-xs font-bold text-right py-1.5" />
                                    </div>
                                </div>
                                <div className="bg-[#FEF9E7] p-3.5 rounded-xl border border-amber-200 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600 font-semibold">Subtotal:</span>
                                        <span className="font-bold text-gray-900">৳ {fmtBDT(data.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-gray-700">VAT (%):</span>
                                        <div className="flex items-center gap-1">
                                            <input type="number" step="0.1" min="0" max="100" value={data.vat_percent} onChange={e => setData('vat_percent', e.target.value)}
                                                className="w-14 rounded-lg border-amber-300 text-xs font-bold text-right py-1" />
                                            <span className="font-bold text-gray-700">% (৳ {fmtBDT(data.tax)})</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-t border-amber-200 pt-2 text-sm font-black text-amber-900">
                                        <span>Grand Total:</span>
                                        <span>৳ {fmtBDT(data.grand_total)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-700 font-bold text-xs">Paid Amount:</span>
                                        <input type="number" step="0.01" value={data.paid_amount} onChange={e => setData('paid_amount', e.target.value)}
                                            className="w-28 rounded-lg border-amber-300 text-xs font-bold text-emerald-700 text-right py-1" required />
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-rose-700 border-t border-amber-200/80 pt-1">
                                        <span>Due Balance:</span>
                                        <span>৳ {fmtBDT(Math.max(0, data.grand_total - data.paid_amount))}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <Link href={route('sales.create')} className="px-4 py-2 text-xs font-bold text-amber-800 border border-amber-300 bg-white hover:bg-amber-50 rounded-lg transition-colors cursor-pointer">
                                    Full POS Screen
                                </Link>
                                <div className="flex gap-2">
                                    <button type="button" onClick={closeSaleModal}
                                        className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={processing}
                                        className="px-5 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5">
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        {processing ? 'Saving...' : 'Save Sale'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT: Product Catalog */}
                    <div className="w-64 border-l border-gray-100 bg-gray-50 flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-gray-200">
                            <p className="text-[11px] font-black text-gray-700 uppercase tracking-wider mb-2">Quick Add Product</p>
                            <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full text-xs rounded-lg border-gray-300 focus:border-amber-500 focus:ring-amber-500 py-1.5" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                            {filteredProducts.length === 0 ? (
                                <p className="text-center text-gray-400 text-[11px] py-8">No products found</p>
                            ) : (
                                filteredProducts.map(prod => (
                                    <div key={prod.id} onClick={() => addProductToSale(prod)}
                                        className="bg-white rounded-lg border border-gray-200 p-2.5 hover:border-amber-400 hover:shadow-sm transition-all cursor-pointer group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 bg-amber-50 rounded-md flex items-center justify-center flex-shrink-0 border border-amber-200">
                                                <Gem className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-gray-900 text-[11px] truncate group-hover:text-amber-700">{prod.name}</p>
                                                <p className="text-[10px] text-gray-500">{prod.purity?.name || '22K'} · {prod.gross_weight || 0}g</p>
                                                <p className="text-[10px] font-black text-amber-800">৳ {Number(prod.selling_price || 0).toLocaleString()}/g</p>
                                            </div>
                                            <Plus className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 ml-auto" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}






