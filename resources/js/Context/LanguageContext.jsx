import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
    en: {
        // Header & General
        searchPlaceholder: "Search everything...",
        signedInAs: "Signed in as",
        profile: "Profile",
        logout: "Log Out",
        branch: "Branch",
        branches: "Branches",
        back: "Back",
        dismiss: "Dismiss",
        takeAction: "Take Action",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        actions: "Actions",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        
        // Sidebar Main Categories
        dashboard: "Dashboard",
        sales: "Sales",
        purchase: "Purchase",
        customOrders: "Custom Orders",
        mortgage: "Mortgage",
        production: "Production",
        inventory: "Inventory",
        products: "Products",
        contacts: "Contacts",
        hrm: "HRM",
        accounts: "Accounts",
        reports: "Reports",
        settings: "Settings",

        // Sidebar Sub-Items - Sales
        addSale: "Add Sales",
        saleList: "Sales List",
        wholesales: "Wholesales",
        saleReturns: "Sales Return",
        salePayments: "Due Collection",
        dueCollection: "Due Collection",

        // Sidebar Sub-Items - Products
        addProduct: "Add Product",
        productList: "Product List",
        productCategories: "Product Categories",
        printLabels: "Print Labels",

        // Sidebar Sub-Items - Purchase
        addPurchase: "Add Purchase",
        purchaseList: "Purchase List",
        purchaseReturns: "Purchase Returns",
        purchasePayments: "Purchase Payments",

        // Sidebar Sub-Items - Custom Orders
        orders: "Order",
        trackCustomOrders: "Track custom jewelry orders",
        newOrder: "New Order",
        newCustomerOrder: "New Customer Order",
        orderList: "Order List",
        assignOrder: "Assign Order",
        workOrderAssignment: "Work Order Assignment",
        artisanPayment: "Artisan Payment",
        artisanPaymentManagement: "Artisan Payment Management",

        // Sidebar Sub-Items - Mortgage
        addMortgage: "Add Mortgage",
        mortgageList: "Mortgage List",
        mortgageDetails: "Mortgage Details",
        mortgagePayments: "Mortgage Payments",

        // Sidebar Sub-Items - Production
        addProduction: "Add Production",
        productionList: "Production List",
        productionStatus: "Production Status",

        // Sidebar Sub-Items - Inventory
        openingStock: "Opening Stock",
        stockLedger: "Stock Ledger",
        stockAdjustment: "Stock Adjustment",
        stockAdjustments: "Stock Adjustments",
        artisanStock: "Artisan Stock",

        // Form Fields & Weights
        stockType: "Stock Type",
        date: "Date",
        ratePerVori: "Rate/Vori",
        brandSupplier: "Brand/Supplier",
        vat: "VAT",
        vori: "Vori",
        ana: "Ana",
        roti: "Roti",
        point: "Point",

        // Sidebar Sub-Items - Contacts
        customers: "Customers",
        addCustomer: "Add Customer",
        suppliers: "Suppliers",
        addSupplier: "Add Supplier",
        artisans: "Artisans",
        addArtisan: "Add Artisan",
        editArtisan: "Edit Artisan",
        mortgageCustomers: "Mortgage Customers",

        // Sidebar Sub-Items - HRM
        staff: "Staff",
        attendance: "Attendance",
        payroll: "Payroll",
        salaryPayments: "Salary Payments",

        // Sidebar Sub-Items - Accounts
        chartOfAccounts: "Chart of Accounts",
        contraEntries: "Contra Entries",
        otherIncomes: "Other Incomes",
        otherExpenses: "Other Expenses",
        cheques: "Cheques",

        // Sidebar Sub-Items - Reports
        accountsReport: "Accounts Report",
        salesReport: "Sales Report",
        wholesaleReport: "Wholesale Report",
        purchaseReport: "Purchase Report",
        customerOrderReport: "Customer Order Report",
        inventoryReport: "Inventory Report",
        artisanReport: "Artisan Report",
        mortgageReport: "Mortgage Report",

        // Sidebar Sub-Items - Settings
        userPermissions: "User Permissions",
        metalPrice: "Metal Price",
        metalPrices: "Metal Prices",
        purity: "Purity",
        purities: "Purities",
        notificationSettings: "Notification Settings",
        openingAccounts: "Opening Accounts",
        account: "Account",
        accountConfig: "Account Config",
        users: "Users",
        rolesPermissions: "Roles & Permissions",
        systemSettings: "System Settings",

        // Dashboard Common
        dashTitle: "Dashboard Overview",
        dashSubtitle: "Real-time overview of business performance",
        exportReport: "Export Report",
        newSaleBtn: "New Sale",
        vsLastMonth: "vs last month",
        threshold: "Threshold",
        left: "left",
        voriGramCalc: "Vori/Gram Calculator",
        todayCustomerOrders: "Today Customer Orders",
        todaySales: "Today Sales",
        bhori: "Bhori",

        // 1. Business Summary
        businessSummary: "Business Summary",
        totalRevenue: "Total Revenue",
        netProfit: "Net Profit",
        vaultValue: "Metal Vault Value",
        cashInHand: "Cash in Hand",

        // 2. Daily Sales Overview
        dailySalesOverview: "Daily Sales Overview",
        goldSales: "Gold Sales",
        silverSales: "Silver Sales",
        diamondSales: "Diamond Sales",
        paymentBreakdown: "Payment Methods",
        cash: "Cash",
        digitalCard: "bKash / Card",
        due: "Due",

        // 3. Purchase Overview
        purchaseOverview: "Purchase Overview",
        rawMetalPurchases: "Raw Metal Purchase",
        finishedJewelryPurchases: "Finished Jewelry Purchase",
        recentPurchases: "Recent Purchases",

        // 4. Customer Statistics
        customerStatistics: "Customer Statistics",
        totalCustomers: "Total Customers",
        newCustomersToday: "New Customers Today",
        customerDues: "Customer Dues (Receivable)",
        repeatRate: "Repeat Customers",

        // 5. Supplier Statistics
        supplierStatistics: "Supplier Statistics",
        totalSuppliers: "Total Suppliers",
        supplierPayables: "Supplier Dues (Payable)",
        pendingDeliveries: "Pending Supplier Orders",

        // 6. Inventory Status
        inventoryStatus: "Inventory & Vault Status",
        goldStock: "Gold Stock (Bhori)",
        silverStock: "Silver Stock (Bhori)",
        lowStockAlerts: "Low Stock Warnings",
        artisanHolding: "Artisan Stock Holding",

        // 7. Recent Activities
        recentActivities: "Recent Activities Log",
        viewAllActivity: "View All Activity Logs →",

        // 8. Notification Panel
        notificationPanel: "Urgent Alerts & Action Required",
        mortgageOverdue: "Mortgage Interest Overdue",
        lowGoldStock: "Low 22K Gold Stock Warning",
        pendingArtisanApprove: "Artisan Job Order Approval Pending",
    },
    bn: {
        // Header & General
        searchPlaceholder: "সবকিছু খুঁজুন...",
        signedInAs: "লগইন করেছেন",
        profile: "প্রোফাইল",
        logout: "লগ আউট",
        branch: "শাখা",
        branches: "শাখাসমূহ",
        back: "পেছনে",
        dismiss: "মুছে ফেলুন",
        takeAction: "অ্যাকশন নিন",
        save: "সংরক্ষণ",
        cancel: "বাতিল",
        delete: "মুছে ফেলুন",
        edit: "সম্পাদনা",
        actions: "অ্যাকশন",
        status: "অবস্থা",
        active: "সক্রিয়",
        inactive: "নিষ্ক্রিয়",
        
        // Sidebar Main Categories
        dashboard: "ড্যাশবোর্ড",
        sales: "বিক্রয়",
        purchase: "ক্রয়",
        customOrders: "কাস্টম অর্ডার",
        mortgage: "বন্ধক / বন্ধকী",
        production: "কারখানা / উৎপাদন",
        inventory: "ইনভেন্টরি / স্টক",
        products: "পণ্যসমূহ",
        contacts: "যোগাযোগ",
        hrm: "এইচআরএম",
        accounts: "হিসাব-নিকাশ",
        reports: "রিপোর্টসমূহ",
        settings: "সেটিংস",

        // Sidebar Sub-Items - Sales
        addSale: "বিক্রয় যোগ করুন",
        saleList: "বিক্রয় তালিকা",
        wholesales: "পাইকারি বিক্রয়",
        saleReturns: "বিক্রয় ফেরত",
        salePayments: "বকেয়া আদায়",
        dueCollection: "বকেয়া আদায়",

        // Sidebar Sub-Items - Products
        addProduct: "পণ্য যোগ করুন",
        productList: "পণ্য তালিকা",
        productCategories: "পণ্য ক্যাটাগরি",
        printLabels: "লেবেল প্রিন্ট",

        // Sidebar Sub-Items - Purchase
        addPurchase: "ক্রয় যোগ করুন",
        purchaseList: "ক্রয় তালিকা",
        purchaseReturns: "ক্রয় ফেরত",
        purchasePayments: "ক্রয় পেমেন্ট",

        // Sidebar Sub-Items - Custom Orders
        orders: "অর্ডার",
        trackCustomOrders: "কাস্টম গহনা অর্ডার ট্র্যাক করুন",
        newOrder: "নতুন অর্ডার",
        newCustomerOrder: "নতুন কাস্টমার অর্ডার",
        orderList: "অর্ডার তালিকা",
        assignOrder: "অর্ডার অর্পণ",
        workOrderAssignment: "ওয়ার্ক অর্ডার অ্যাসাইনমেন্ট",
        artisanPayment: "কারিগর পেমেন্ট",
        artisanPaymentManagement: "কারিগর পেমেন্ট ব্যবস্থাপনা",

        // Sidebar Sub-Items - Mortgage
        addMortgage: "বন্ধক যোগ করুন",
        mortgageList: "বন্ধক তালিকা",
        mortgageDetails: "বন্ধকের বিবরণ",
        mortgagePayments: "বন্ধক পেমেন্ট",

        // Sidebar Sub-Items - Production
        addProduction: "উৎপাদন যোগ করুন",
        productionList: "উৎপাদন তালিকা",
        productionStatus: "উৎপাদনের অবস্থা",

        // Sidebar Sub-Items - Inventory
        openingStock: "প্রাথমিক স্টক",
        stockLedger: "স্টক খতিয়ান",
        stockAdjustment: "স্টক সমন্বয়",
        stockAdjustments: "স্টক সমন্বয়সমূহ",
        artisanStock: "কারিগর স্টক",

        // Form Fields & Weights
        stockType: "স্টক টাইপ",
        date: "তারিখ",
        ratePerVori: "দর/ভরি",
        brandSupplier: "ব্র্যান্ড/সাপ্লায়ার",
        vat: "ভ্যাট",
        vori: "ভরি",
        ana: "আনা",
        roti: "রতি",
        point: "পয়েন্ট",

        // Sidebar Sub-Items - Contacts
        customers: "গ্রাহকগণ",
        addCustomer: "গ্রাহক যোগ করুন",
        suppliers: "সরবরাহকারীগণ",
        addSupplier: "সরবরাহকারী যোগ করুন",
        artisans: "কারিগরগণ",
        addArtisan: "কারিগর যোগ করুন",
        editArtisan: "কারিগর সম্পাদনা",
        mortgageCustomers: "বন্ধকী গ্রাহকগণ",

        // Sidebar Sub-Items - HRM
        staff: "স্টাফ / কর্মী",
        attendance: "উপস্থিতি",
        payroll: "পে-রোল",
        salaryPayments: "বেতন পেমেন্ট",

        // Sidebar Sub-Items - Accounts
        chartOfAccounts: "হিসাবের তালিকা (Chart of Accounts)",
        contraEntries: "কনট্রা এন্ট্রি",
        otherIncomes: "অন্যান্য আয়",
        otherExpenses: "অন্যান্য খরচ",
        cheques: "চেকসমূহ",

        // Sidebar Sub-Items - Reports
        accountsReport: "হিসাবের রিপোর্ট",
        salesReport: "বিক্রয় রিপোর্ট",
        wholesaleReport: "পাইকারি রিপোর্ট",
        purchaseReport: "ক্রয় রিপোর্ট",
        customerOrderReport: "কাস্টমার অর্ডার রিপোর্ট",
        inventoryReport: "ইনভেন্টরি রিপোর্ট",
        artisanReport: "কারিগর রিপোর্ট",
        mortgageReport: "বন্ধকী রিপোর্ট",

        // Sidebar Sub-Items - Settings
        userPermissions: "ব্যবহারকারী অনুমতি",
        metalPrice: "ধাতুর দর",
        metalPrices: "ধাতুর দাম (স্বর্ণ/রুপা)",
        purity: "ক্যারেট / বিশুদ্ধতা",
        purities: "ক্যারেট / বিশুদ্ধতা",
        notificationSettings: "বিজ্ঞপ্তি সেটিংস",
        openingAccounts: "প্রারম্ভিক হিসাব",
        account: "একাউন্ট",
        accountConfig: "হিসাব কনফিগারেশন",
        users: "ব্যবহারকারীগণ",
        rolesPermissions: "ভূমিকা ও অনুমতি",
        systemSettings: "সিস্টেম সেটিংস",

        // Dashboard Common
        dashTitle: "ড্যাশবোর্ড ওভারভিউ",
        dashSubtitle: "ব্যবসার রিয়েল-টাইম পারফরম্যান্সের ওভারভিউ",
        exportReport: "রিপোর্ট এক্সপোর্ট",
        newSaleBtn: "নতুন বিক্রয়",
        vsLastMonth: "গত মাসের তুলনায়",
        threshold: "সীমা",
        left: "বাকি",
        voriGramCalc: "ভরি/গ্রাম ক্যালকুলেটর",
        todayCustomerOrders: "আজকের কাস্টমার অর্ডার",
        todaySales: "আজকের বিক্রি",
        bhori: "ভরি",

        // 1. Business Summary
        businessSummary: "ব্যবসার সারসংক্ষেপ",
        totalRevenue: "মোট রাজস্ব",
        netProfit: "নিট লাভ",
        vaultValue: "মেটাল ভল্ট মান",
        cashInHand: "নগদ ব্যালেন্স",

        // 2. Daily Sales Overview
        dailySalesOverview: "দৈনিক বিক্রয় ওভারভিউ",
        goldSales: "স্বর্ণ বিক্রয়",
        silverSales: "রুপা বিক্রয়",
        diamondSales: "ডায়মন্ড বিক্রয়",
        paymentBreakdown: "পেমেন্ট মাধ্যম",
        cash: "নগদ",
        digitalCard: "বিকাশ / কার্ড",
        due: "বাকি",

        // 3. Purchase Overview
        purchaseOverview: "ক্রয় ওভারভিউ",
        rawMetalPurchases: "কাঁচা ধাতু ক্রয়",
        finishedJewelryPurchases: "তৈরি গহনা ক্রয়",
        recentPurchases: "সাম্প্রতিক ক্রয়সমূহ",

        // 4. Customer Statistics
        customerStatistics: "গ্রাহক পরিসংখ্যান",
        totalCustomers: "মোট গ্রাহক",
        newCustomersToday: "আজকের নতুন গ্রাহক",
        customerDues: "গ্রাহকের বাকি (প্রাপ্য)",
        repeatRate: "পুনরায় ক্রেতা",

        // 5. Supplier Statistics
        supplierStatistics: "সরবরাহকারী পরিসংখ্যান",
        totalSuppliers: "মোট সরবরাহকারী",
        supplierPayables: "সরবরাহকারীর দেয় টাকা",
        pendingDeliveries: "অপেক্ষমাণ সরবরাহকারী অর্ডার",

        // 6. Inventory Status
        inventoryStatus: "ইনভেন্টরি ও ভল্ট অবস্থা",
        goldStock: "স্বর্ণের স্টক (ভরি)",
        silverStock: "রুপার স্টক (ভরি)",
        lowStockAlerts: "কম স্টকের সতর্কতা",
        artisanHolding: "কারিগরদের কাছে মজুদ",

        // 7. Recent Activities
        recentActivities: "সাম্প্রতিক কর্মকাণ্ডের লগ",
        viewAllActivity: "সকল কর্মকাণ্ড দেখুন →",

        // 8. Notification Panel
        notificationPanel: "জরুরি অ্যালার্ট ও অ্যাকশন",
        mortgageOverdue: "বন্ধকী সুদের কিস্তি বকেয়া",
        lowGoldStock: "২২ ক্যারেট গোল্ড কম স্টকের সতর্কতা",
        pendingArtisanApprove: "কারিগর কাজের অনুমোদন অপেক্ষমাণ",
    }
};

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('app_language') || 'en';
        }
        return 'en';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('app_language', lang);
        }
    }, [lang]);

    const toggleLang = () => {
        setLang(prev => prev === 'en' ? 'bn' : 'en');
    };

    const t = (key) => {
        return translations[lang]?.[key] || translations['en']?.[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
