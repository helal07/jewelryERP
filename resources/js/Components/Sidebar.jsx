import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { 
    Home,
    Tag,
    Diamond,
    ShoppingBag,
    ClipboardList,
    UsersRound,
    Wallet,
    UserCog,
    Landmark,
    Layers,
    Boxes,
    LineChart,
    Sliders,
    Gem,
    ChevronDown, 
    ChevronUp 
} from 'lucide-react';
import { useLanguage } from '@/Context/LanguageContext';

const SidebarItem = ({ icon: Icon, label, href, active, isOpen, onToggle, children }) => {
    const hasChildren = Boolean(children);

    const handleClick = (e) => {
        if (hasChildren) {
            e.preventDefault();
            onToggle();
        }
    };

    const baseClasses = "flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-colors duration-200 group";
    const activeClasses = active 
        ? "bg-white/20 text-white font-bold shadow-sm" 
        : hasChildren && isOpen
            ? "bg-black/10 text-white" 
            : "text-white/80 hover:bg-black/10 hover:text-white";

    return (
        <div className="mb-0.5">
            <Link 
                href={href || '#'} 
                onClick={handleClick}
                className={`${baseClasses} ${activeClasses}`}
            >
                <Icon className={`mr-2.5 h-4 w-4 flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110' : ''}`} />
                <span className="flex-1 truncate">{label}</span>
                {hasChildren && (
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </Link>
            
            {hasChildren && isOpen && (
                <div className="ml-5 mt-0.5 space-y-0.5 border-l border-white/20 pl-2">
                    {children}
                </div>
            )}
        </div>
    );
};

const SidebarSubItem = ({ label, href, active }) => {
    const activeClasses = active ? "text-white font-bold bg-black/15" : "text-white/75 hover:text-white hover:bg-black/10";
    
    return (
        <Link 
            href={href} 
            className={`block px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors duration-200 ${activeClasses}`}
        >
            {label}
        </Link>
    );
};

export default function Sidebar({ className = '' }) {
    const { t } = useLanguage();
    const scrollContainerRef = useRef(null);

    // Helper to gracefully check active routes without crashing if route is missing
    const isActive = (routeName) => {
        try {
            return route().current(routeName);
        } catch (e) {
            return false;
        }
    };

    const isGroupActive = (prefix) => {
        try {
            return route().current(`${prefix}.*`);
        } catch (e) {
            return false;
        }
    };

    // Auto-folding Accordion State (only one group open at a time)
    const [openGroup, setOpenGroup] = useState(() => {
        // First check session storage for persistence across navigations
        const saved = sessionStorage.getItem('sidebar_open_group');
        if (saved !== null && saved !== 'null') return saved;

        // Fallback to active route calculation
        if (isGroupActive('sales')) return 'sales';
        if (isGroupActive('purchases')) return 'purchases';
        if (isGroupActive('orders') || isGroupActive('artisan-payments')) return 'orders';
        if (isGroupActive('mortgages')) return 'mortgages';
        if (isGroupActive('production')) return 'production';
        if (isGroupActive('inventory')) return 'inventory';
        if (isGroupActive('products')) return 'products';
        if (isGroupActive('customers') || isGroupActive('suppliers') || isGroupActive('artisans') || isGroupActive('mortgage-customers')) return 'contacts';
        if (isGroupActive('accounts')) return 'accounts';
        if (isGroupActive('hrm')) return 'hrm';
        if (isGroupActive('reports')) return 'reports';
        if (isGroupActive('settings') || isGroupActive('branches') || isGroupActive('users')) return 'settings';
        return null;
    });

    const toggleGroup = (groupKey) => {
        setOpenGroup(prev => {
            const next = prev === groupKey ? null : groupKey;
            sessionStorage.setItem('sidebar_open_group', next);
            return next;
        });
    };

    // Restore scroll position to prevent the sidebar from jumping to top on navigation
    useEffect(() => {
        const savedScroll = sessionStorage.getItem('sidebar_scroll');
        if (savedScroll && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = parseInt(savedScroll, 10);
        }

        const handleScroll = (e) => {
            sessionStorage.setItem('sidebar_scroll', e.target.scrollTop);
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <div className={`flex h-full flex-col shadow-xl ${className}`} style={{ backgroundColor: 'rgb(250, 151, 10)' }}>
            <div className="flex h-16 flex-shrink-0 items-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                <Link href="/" className="flex items-center">
                    <Gem className="h-7 w-7 text-amber-200" />
                    <span className="ml-2.5 text-base font-black text-white tracking-wide truncate">Jewelry ERP</span>
                </Link>
            </div>
            
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 custom-scrollbar"
            >
                <nav className="space-y-1">
                    {/* 1. Dashboard */}
                    <SidebarItem 
                        icon={Home} 
                        label={t('dashboard')} 
                        href={route('dashboard')} 
                        active={isActive('dashboard')}
                        isOpen={false}
                        onToggle={() => setOpenGroup(null)}
                    />

                    {/* 2. Sales */}
                    <SidebarItem 
                        icon={Tag} 
                        label={t('sales')} 
                        active={isGroupActive('sales')}
                        isOpen={openGroup === 'sales'}
                        onToggle={() => toggleGroup('sales')}
                    >
                        <SidebarSubItem label={t('addSale')} href={route('sales.create')} active={isActive('sales.create')} />
                        <SidebarSubItem label={t('saleList')} href={route('sales.index')} active={isActive('sales.index')} />
                        <SidebarSubItem label={t('wholesales')} href={route('sales.wholesale')} active={isActive('sales.wholesale*')} />
                        <SidebarSubItem label={t('saleReturns')} href={route('sales.returns.index')} active={isActive('sales.returns.*')} />
                        <SidebarSubItem label={t('dueCollection')} href={route('sales.payments.index')} active={isActive('sales.payments.*')} />
                    </SidebarItem>

                    {/* 3. Products */}
                    <SidebarItem 
                        icon={Diamond} 
                        label={t('products')} 
                        active={isGroupActive('products') || isGroupActive('product-categories')}
                        isOpen={openGroup === 'products'}
                        onToggle={() => toggleGroup('products')}
                    >
                        <SidebarSubItem label={t('addProduct')} href={route('products.create')} active={isActive('products.create')} />
                        <SidebarSubItem label={t('productList')} href={route('products.index')} active={isActive('products.index')} />
                        <SidebarSubItem label={t('productCategories')} href={route('product-categories.index')} active={isActive('product-categories.*')} />
                        <SidebarSubItem label={t('printLabels')} href={route('products.print-labels')} active={isActive('products.print-labels')} />
                    </SidebarItem>

                    {/* 4. Purchase */}
                    <SidebarItem 
                        icon={ShoppingBag} 
                        label={t('purchase')} 
                        active={isGroupActive('purchases')}
                        isOpen={openGroup === 'purchases'}
                        onToggle={() => toggleGroup('purchases')}
                    >
                        <SidebarSubItem label={t('addPurchase')} href={route('purchases.create')} active={isActive('purchases.create')} />
                        <SidebarSubItem label={t('purchaseList')} href={route('purchases.index')} active={isActive('purchases.index')} />
                        <SidebarSubItem label={t('purchaseReturns')} href={route('purchases.returns')} active={isActive('purchases.returns')} />
                        <SidebarSubItem label={t('purchasePayments')} href={route('purchases.payments')} active={isActive('purchases.payments')} />
                    </SidebarItem>

                    {/* 5. Order (Track custom jewelry orders) */}
                    <SidebarItem 
                        icon={ClipboardList} 
                        label={t('orders')} 
                        active={isGroupActive('orders') || isGroupActive('artisan-payments')}
                        isOpen={openGroup === 'orders'}
                        onToggle={() => toggleGroup('orders')}
                    >
                        <SidebarSubItem 
                            label={t('newOrder')} 
                            href={route('orders.create')} 
                            active={isActive('orders.create')} 
                        />
                        <SidebarSubItem 
                            label={t('orderList')} 
                            href={route('orders.index')} 
                            active={isActive('orders.index') || isActive('orders.show') || isActive('orders.edit')} 
                        />
                        <SidebarSubItem 
                            label={t('assignOrder')} 
                            href={route('orders.assignments')} 
                            active={isActive('orders.assignments')} 
                        />
                        <SidebarSubItem 
                            label={t('artisanPayment')} 
                            href={route('artisan-payments.index')} 
                            active={isActive('artisan-payments.*')} 
                        />
                    </SidebarItem>

                    {/* 6. Mortgage */}
                    <SidebarItem 
                        icon={Landmark} 
                        label={t('mortgage')} 
                        active={isGroupActive('mortgages')}
                        isOpen={openGroup === 'mortgages'}
                        onToggle={() => toggleGroup('mortgages')}
                    >
                        <SidebarSubItem label={t('addMortgage')} href={route('mortgages.create')} active={isActive('mortgages.create')} />
                        <SidebarSubItem label={t('mortgageList')} href={route('mortgages.index')} active={isActive('mortgages.index')} />
                        <SidebarSubItem label={t('mortgageDetails')} href={route('mortgages.details')} active={isActive('mortgages.details') || isActive('mortgages.show')} />
                    </SidebarItem>

                    {/* 6.5 Production (Monitor jewelry production workflow) */}
                    <SidebarItem 
                        icon={Layers} 
                        label={t('production')} 
                        active={isGroupActive('production')}
                        isOpen={openGroup === 'production'}
                        onToggle={() => toggleGroup('production')}
                    >
                        <SidebarSubItem label={t('addProduction')} href={route('production.create')} active={isActive('production.create')} />
                        <SidebarSubItem label={t('productionList')} href={route('production.index')} active={isActive('production.index')} />
                        <SidebarSubItem label={t('productionStatus')} href={route('production.status')} active={isActive('production.status')} />
                    </SidebarItem>

                    {/* 7. Inventory */}
                    <SidebarItem 
                        icon={Boxes} 
                        label={t('inventory')} 
                        active={isGroupActive('inventory')}
                        isOpen={openGroup === 'inventory'}
                        onToggle={() => toggleGroup('inventory')}
                    >
                        <SidebarSubItem label={t('openingStock')} href={route('inventory.opening.index')} active={isActive('inventory.opening.*')} />
                        <SidebarSubItem label={t('artisanStock')} href={route('inventory.artisan.index')} active={isActive('inventory.artisan.*')} />
                        <SidebarSubItem label={t('stockAdjustment')} href={route('inventory.adjustments.index')} active={isActive('inventory.adjustments.*')} />
                    </SidebarItem>

                    {/* 8. Contacts */}
                    <SidebarItem 
                        icon={UsersRound} 
                        label={t('contacts')} 
                        active={isGroupActive('customers') || isGroupActive('suppliers') || isGroupActive('artisans') || isGroupActive('mortgage-customers')}
                        isOpen={openGroup === 'contacts'}
                        onToggle={() => toggleGroup('contacts')}
                    >
                        <SidebarSubItem label={t('customers')} href={route('customers.index')} active={isActive('customers.*')} />
                        <SidebarSubItem label={t('suppliers')} href={route('suppliers.index')} active={isActive('suppliers.*')} />
                        <SidebarSubItem label={t('artisans')} href={route('artisans.index')} active={isActive('artisans.*')} />
                        <SidebarSubItem label={t('mortgageCustomers')} href={route('mortgage-customers.index')} active={isActive('mortgage-customers.*')} />
                    </SidebarItem>

                    {/* 9. Accounts */}
                    <SidebarItem 
                        icon={Wallet} 
                        label={t('accounts')} 
                        active={isGroupActive('accounts')}
                        isOpen={openGroup === 'accounts'}
                        onToggle={() => toggleGroup('accounts')}
                    >
                        <SidebarSubItem label={t('chartOfAccounts')} href={route('accounts.chart-of-accounts.index')} active={isActive('accounts.chart-of-accounts.*')} />
                        <SidebarSubItem label={t('contraEntries')} href={route('accounts.contra.index')} active={isActive('accounts.contra.*')} />
                        <SidebarSubItem label={t('otherIncomes')} href={route('accounts.other-incomes.index')} active={isActive('accounts.other-incomes.*')} />
                        <SidebarSubItem label={t('otherExpenses')} href={route('accounts.other-expenses.index')} active={isActive('accounts.other-expenses.*')} />
                        <SidebarSubItem label={t('cheques')} href={route('accounts.cheques.index')} active={isActive('accounts.cheques.*')} />
                    </SidebarItem>

                    {/* 10. HRM */}
                    <SidebarItem 
                        icon={UserCog} 
                        label={t('hrm')} 
                        active={isGroupActive('hrm')}
                        isOpen={openGroup === 'hrm'}
                        onToggle={() => toggleGroup('hrm')}
                    >
                        <SidebarSubItem label={t('staff')} href={route('hrm.staff.index')} active={isActive('hrm.staff.*')} />
                        <SidebarSubItem label={t('attendance')} href={route('hrm.attendance.index')} active={isActive('hrm.attendance.*')} />
                        <SidebarSubItem label={t('payroll')} href={route('hrm.payroll.index')} active={isActive('hrm.payroll.*')} />
                        <SidebarSubItem label={t('salaryPayments')} href={route('hrm.salary.index')} active={isActive('hrm.salary.*')} />
                    </SidebarItem>

                    {/* 11. Reports */}
                    <SidebarItem 
                        icon={LineChart} 
                        label={t('reports')} 
                        active={isGroupActive('reports')}
                        isOpen={openGroup === 'reports'}
                        onToggle={() => toggleGroup('reports')}
                    >
                        <SidebarSubItem label={t('accountsReport')} href={route('reports.accounts')} active={isActive('reports.accounts')} />
                        <SidebarSubItem label={t('salesReport')} href={route('reports.sales')} active={isActive('reports.sales')} />
                        <SidebarSubItem label={t('wholesaleReport')} href={route('reports.wholesale')} active={isActive('reports.wholesale')} />
                        <SidebarSubItem label={t('purchaseReport')} href={route('reports.purchase')} active={isActive('reports.purchase')} />
                        <SidebarSubItem label={t('customerOrderReport')} href={route('reports.customer-orders')} active={isActive('reports.customer-orders')} />
                        <SidebarSubItem label={t('inventoryReport')} href={route('reports.inventory')} active={isActive('reports.inventory')} />
                        <SidebarSubItem label={t('artisanReport')} href={route('reports.artisan')} active={isActive('reports.artisan')} />
                        <SidebarSubItem label={t('mortgageReport')} href={route('reports.mortgage')} active={isActive('reports.mortgage')} />
                    </SidebarItem>

                    {/* 12. Settings */}
                    <SidebarItem 
                        icon={Sliders} 
                        label={t('settings')} 
                        active={isGroupActive('settings') || isGroupActive('branches')}
                        isOpen={openGroup === 'settings'}
                        onToggle={() => toggleGroup('settings')}
                    >
                        <SidebarSubItem label={t('userPermissions')} href={route('settings.roles.index')} active={isActive('settings.roles.*')} />
                        <SidebarSubItem label={t('branch')} href={route('branches.index')} active={isActive('branches.*')} />
                        <SidebarSubItem label={t('metalPrice')} href={route('settings.metal-prices.index')} active={isActive('settings.metal-prices.*')} />
                        <SidebarSubItem label={t('purity')} href={route('settings.purities.index')} active={isActive('settings.purities.*')} />
                        <SidebarSubItem label={t('notificationSettings')} href={route('settings.notifications.index')} active={isActive('settings.notifications.*')} />
                        <SidebarSubItem label={t('openingAccounts')} href={route('settings.opening-accounts.index')} active={isActive('settings.opening-accounts.*')} />
                        <SidebarSubItem label={t('accountConfig')} href={route('settings.account-config.index')} active={isActive('settings.account-config.*')} />
                    </SidebarItem>
                </nav>
            </div>
        </div>
    );
}
