import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const LanguageContext = createContext();

export const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
export const EN_DIGITS = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

export function toBengaliNumber(val) {
    if (val === null || val === undefined) return '';
    return String(val).replace(/[0-9]/g, d => BN_DIGITS[d]);
}

export function toEnglishNumber(val) {
    if (val === null || val === undefined) return '';
    return String(val).replace(/[০-৯]/g, d => EN_DIGITS[d] || d);
}

export function formatNumberWithLang(val, lang = 'en', options = {}) {
    if (val === null || val === undefined || val === '') return '';
    const num = typeof val === 'number' ? val : Number(val);
    if (isNaN(num)) {
        return lang === 'bn' ? toBengaliNumber(val) : toEnglishNumber(val);
    }
    const formatted = num.toLocaleString('en-US', options);
    return lang === 'bn' ? toBengaliNumber(formatted) : formatted;
}

export const translations = {
    en: {
        // Header & General
        searchPlaceholder: "Search everything...",
        signedInAs: "Signed in as",
        profile: "Profile",
        profileInformation: "Profile Information",
        personalContactInfo: "Personal & Contact Info",
        fullName: "Full Name",
        emailAddress: "Email / Gmail Address",
        contactPhoneNumber: "Contact Phone Number",
        saveChanges: "Save Changes",
        saved: "Saved!",
        changePassword: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        updatePassword: "Update Password",
        passwordUpdated: "Password Updated!",
        dangerZone: "Danger Zone",
        deleteAccount: "Delete Account",
        confirmAccountDeletion: "Confirm Account Deletion",
        permanentlyDeleteAccount: "Permanently delete your account and access",
        enterPasswordToDelete: "Please enter your password to permanently delete your account.",
        memberSince: "Member Since",
        headOffice: "Head Office",
        admin: "Admin",
        superAdmin: "Super Admin",
        manager: "Manager",
        salesman: "Salesman",
        salesManager: "Sales Manager",
        accountant: "Accountant",
        staffMember: "Staff",
        userRole: "User",
        emailUnverified: "Your email address is unverified.",
        min8Chars: "Minimum 8 characters",
        reEnterNewPassword: "Re-enter new password",
        phonePlaceholder: "+880 1XXXXXXXXX",
        logout: "Log Out",
        branch: "Branch",
        branches: "Branches",
        back: "Back",
        backToList: "Back to List",
        dismiss: "Dismiss",
        takeAction: "Take Action",
        save: "Save",
        saveChanges: "Save Changes",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        actions: "Actions",
        status: "Status",
        active: "Active",
        inactive: "Inactive",
        filter: "Filter",
        reset: "Reset",
        search: "Search",
        export: "Export",
        exportExcel: "Export Excel",
        exportPdf: "Export PDF",
        print: "Print",
        printInvoice: "Print Invoice",
        download: "Download",
        downloadPdf: "Download PDF",
        addNew: "Add New",
        submit: "Submit",
        confirm: "Confirm",
        close: "Close",
        loading: "Loading...",
        processing: "Processing...",
        success: "Success",
        error: "Error",
        warning: "Warning",
        info: "Info",
        all: "All",
        total: "Total",
        notes: "Notes",
        remarks: "Remarks",
        description: "Description",
        details: "Details",
        photo: "Photo",
        attachment: "Attachment",
        select: "Select",
        choose: "Choose",
        optional: "Optional",
        required: "Required",
        perGram: "Per gm",
        perVori: "Per vori",
        
        // Sidebar Main Categories
        dashboard: "Dashboard",
        sales: "Sales",
        purchase: "Purchase",
        purchases: "Purchases",
        customOrders: "Custom Orders",
        mortgage: "Mortgage",
        mortgages: "Mortgages",
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
        wholesale: "Wholesale",
        addWholesale: "Add Wholesale",
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
        ratePerGram: "Rate/Gram",
        brandSupplier: "Brand/Supplier",
        vat: "VAT",
        tax: "Tax",
        subtotal: "Subtotal",
        discount: "Discount",
        otherCharges: "Other Charges",
        grandTotal: "Grand Total",
        paidAmount: "Paid Amount",
        dueAmount: "Due Amount",
        vori: "Vori",
        ana: "Ana",
        roti: "Roti",
        point: "Point",
        gram: "Gram",
        grossWeight: "Gross Weight",
        netWeight: "Net Weight",
        stoneWeight: "Stone Weight",
        wastagePercentage: "Wastage %",
        makingCharge: "Making Charge",
        stoneCharge: "Stone Charge",
        gold: "Gold",
        silver: "Silver",
        platinum: "Platinum",
        diamond: "Diamond",

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
        dayBook: "Day Book",
        cashBook: "Cash Book",
        consolBankBook: "Consol Bank Book",
        mobileBankBook: "Mobile Bank Book",
        profitLoss: "P&L",
        profitLossFull: "Profit & Loss Statement",
        accountReports: "Account Reports",
        operationalReports: "Operational Reports",
        salesReport: "Sales Report",
        wholesaleReport: "Wholesale Report",
        purchaseReport: "Purchase Report",
        customerOrderReport: "Customer Order Report",
        inventoryReport: "Inventory Report",
        artisanReport: "Artisan Report",
        mortgageReport: "Mortgage Report",
        stockValuation: "Stock Valuation",
        stockValuationMetal: "Stock Valuation (Metal)",
        inventoryStockValuationReport: "Inventory & Stock Valuation Report",
        stockWeight: "Stock Weight",
        stockQty: "Stock Qty",
        totalItems: "Total Items",
        artisanHolding: "Artisan Holding",
        vaultMetalJewelry: "Vault Metal & Jewelry",
        allPurities: "All Purities",
        allMetals: "All Metals",
        noInventoryItemsFound: "No inventory items found",
        startDate: "Start Date",
        endDate: "End Date",
        allBranches: "All Branches",
        allCustomers: "All Customers",
        allSuppliers: "All Suppliers",
        allArtisans: "All Artisans",
        allStatuses: "All Statuses",
        wholesaleOrders: "Wholesale Orders",
        totalPurchases: "Total Purchases",
        totalOrders: "Total Orders",
        totalValue: "Total Value",
        advanceReceived: "Advance Received",
        dueBalance: "Due Balance",
        holdingWeight: "Holding Weight",
        activeJobs: "Active Jobs",
        completed: "Completed",
        totalArtisans: "Total Artisans",
        payableDue: "Payable Due",
        principalDisbursed: "Principal Disbursed",
        interestCollected: "Interest Collected",
        activeAccounts: "Active Accounts",
        incomeRecords: "Income Records",
        expenseRecords: "Expense Records",
        noIncomeRecords: "No income records found",
        noExpenseRecords: "No expense records found",
        noSalesRecords: "No sales records found",
        noWholesaleRecords: "No wholesale records found",
        noPurchaseRecords: "No purchase records found",
        noOrderRecords: "No order records found",
        noArtisanRecords: "No artisan records found",
        noMortgageRecords: "No mortgage records found",

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
        invoiceSettings: "Invoice Settings",
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

        // Pagination
        showing: "Showing",
        to: "to",
        of: "of",
        entries: "entries",
        previous: "Previous",
        next: "Next",
    },
    bn: {
        // Header & General
        searchPlaceholder: "সবকিছু খুঁজুন...",
        signedInAs: "লগইন করেছেন",
        profile: "প্রোফাইল",
        profileInformation: "প্রোফাইল তথ্য",
        personalContactInfo: "ব্যক্তিগত ও যোগাযোগের তথ্য",
        fullName: "পূর্ণ নাম",
        emailAddress: "ইমেইল / জিমেইল ঠিকানা",
        contactPhoneNumber: "যোগাযোগের ফোন নম্বর",
        saveChanges: "পরিবর্তন সংরক্ষণ করুন",
        saved: "সংরক্ষিত হয়েছে!",
        changePassword: "পাসওয়ার্ড পরিবর্তন",
        currentPassword: "বর্তমান পাসওয়ার্ড",
        newPassword: "নতুন পাসওয়ার্ড",
        confirmNewPassword: "নতুন পাসওয়ার্ড নিশ্চিত করুন",
        updatePassword: "পাসওয়ার্ড আপডেট করুন",
        passwordUpdated: "পাসওয়ার্ড আপডেট হয়েছে!",
        dangerZone: "বিপদজনক এলাকা",
        deleteAccount: "অ্যাকাউন্ট মুছে ফেলুন",
        confirmAccountDeletion: "অ্যাকাউন্ট মুছে ফেলা নিশ্চিত করুন",
        permanentlyDeleteAccount: "আপনার অ্যাকাউন্ট এবং সকল অ্যাক্সেস স্থায়ীভাবে মুছে ফেলুন",
        enterPasswordToDelete: "আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।",
        memberSince: "যুক্ত হয়েছেন",
        headOffice: "প্রধান কার্যালয়",
        admin: "এডমিন",
        superAdmin: "সুপার এডমিন",
        manager: "ম্যানেজার",
        salesman: "বিক্রয়কর্মী",
        salesManager: "বিক্রয় ব্যবস্থাপক",
        accountant: "হিসাবরক্ষক",
        staffMember: "স্টাফ",
        userRole: "ব্যবহারকারী",
        emailUnverified: "আপনার ইমেইল ঠিকানা যাচাই করা হয়নি।",
        min8Chars: "কমপক্ষে ৮টি অক্ষর",
        reEnterNewPassword: "নতুন পাসওয়ার্ড পুনরায় লিখুন",
        phonePlaceholder: "+৮৮০ ১XXXXXXXXX",
        logout: "লগ আউট",
        branch: "শাখা",
        branches: "শাখাসমূহ",
        back: "পেছনে",
        backToList: "তালিকায় ফিরে যান",
        dismiss: "মুছে ফেলুন",
        takeAction: "অ্যাকশন নিন",
        save: "সংরক্ষণ",
        saveChanges: "পরিবর্তন সংরক্ষণ করুন",
        cancel: "বাতিল",
        delete: "মুছে ফেলুন",
        edit: "সম্পাদনা",
        view: "দেখুন",
        actions: "অ্যাকশন",
        status: "অবস্থা",
        active: "সক্রিয়",
        inactive: "নিষ্ক্রিয়",
        filter: "ফিল্টার",
        reset: "রিসেট",
        search: "অনুসন্ধান",
        export: "এক্সপোর্ট",
        exportExcel: "এক্সেল এক্সপোর্ট",
        exportPdf: "পিডিএফ এক্সপোর্ট",
        print: "প্রিন্ট",
        printInvoice: "ইনভয়েস প্রিন্ট",
        download: "ডাউনলোড",
        downloadPdf: "পিডিএফ ডাউনলোড",
        addNew: "নতুন যোগ করুন",
        submit: "জমা দিন",
        confirm: "নিশ্চিত করুন",
        close: "বন্ধ করুন",
        loading: "লোড হচ্ছে...",
        processing: "প্রক্রিয়াধীন...",
        success: "সফল",
        error: "ত্রুটি",
        warning: "সতর্কতা",
        info: "তথ্য",
        all: "সকল",
        total: "মোট",
        notes: "নোট",
        remarks: "মন্তব্য",
        description: "বিবরণ",
        details: "বিস্তারিত",
        photo: "ছবি",
        attachment: "সংযুক্তি",
        select: "নির্বাচন করুন",
        choose: "বাছাই করুন",
        optional: "ঐচ্ছিক",
        required: "আবশ্যক",
        perGram: "প্রতি গ্রাম",
        perVori: "প্রতি ভরি",
        
        // Sidebar Main Categories
        dashboard: "ড্যাশবোর্ড",
        sales: "বিক্রয়",
        purchase: "ক্রয়",
        purchases: "ক্রয়সমূহ",
        customOrders: "কাস্টম অর্ডার",
        mortgage: "বন্ধক / বন্ধকী",
        mortgages: "বন্ধকসমূহ",
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
        wholesale: "পাইকারি বিক্রয়",
        addWholesale: "পাইকারি যোগ করুন",
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
        ratePerGram: "দর/গ্রাম",
        brandSupplier: "ব্র্যান্ড/সাপ্লায়ার",
        vat: "ভ্যাট",
        tax: "ট্যাক্স",
        subtotal: "উপমোট",
        discount: "ছাড় / ডিসকাউন্ট",
        otherCharges: "অন্যান্য চার্জ",
        grandTotal: "সর্বমোট",
        paidAmount: "পরিশোধিত টাকা",
        dueAmount: "বকেয়া টাকা",
        vori: "ভরি",
        ana: "আনা",
        roti: "রতি",
        point: "পয়েন্ট",
        gram: "গ্রাম",
        grossWeight: "মোট ওজন",
        netWeight: "নিট ওজন",
        stoneWeight: "পাথরের ওজন",
        wastagePercentage: "অপচয় %",
        makingCharge: "মজুরি",
        stoneCharge: "পাথরের মূল্য",
        gold: "স্বর্ণ",
        silver: "রুপা",
        platinum: "প্লাটিনাম",
        diamond: "হীরা / ডায়মন্ড",

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
        chartOfAccounts: "হিসাবের তালিকা",
        contraEntries: "কনট্রা এন্ট্রি",
        otherIncomes: "অন্যান্য আয়",
        otherExpenses: "অন্যান্য খরচ",
        cheques: "চেকসমূহ",

        // Sidebar Sub-Items - Reports
        accountsReport: "হিসাবের রিপোর্ট",
        dayBook: "ডে বুক",
        cashBook: "ক্যাশ বুক",
        consolBankBook: "কনসোল ব্যাংক বুক",
        mobileBankBook: "মোবাইল ব্যাংক বুক",
        profitLoss: "P&L",
        profitLossFull: "লাভ-ক্ষতি বিবরণী (P&L)",
        accountReports: "হিসাব রিপোর্ট",
        operationalReports: "কার্যক্রম রিপোর্ট",
        salesReport: "বিক্রয় রিপোর্ট",
        wholesaleReport: "পাইকারি রিপোর্ট",
        purchaseReport: "ক্রয় রিপোর্ট",
        customerOrderReport: "কাস্টমার অর্ডার রিপোর্ট",
        inventoryReport: "ইনভেন্টরি রিপোর্ট",
        artisanReport: "কারিগর রিপোর্ট",
        mortgageReport: "বন্ধকী রিপোর্ট",
        stockValuation: "স্টক মূল্যায়ন",
        stockValuationMetal: "স্টক মূল্যায়ন (ধাতু)",
        inventoryStockValuationReport: "ইনভেন্টরি ও স্টক মূল্যায়ন রিপোর্ট",
        stockWeight: "স্টকের ওজন",
        stockQty: "স্টক পরিমাণ",
        totalItems: "মোট আইটেম",
        artisanHolding: "কারিগরদের নিকট মজুদ",
        vaultMetalJewelry: "ভল্ট মেটাল ও গহনা",
        allPurities: "সকল ক্যারেট/বিশুদ্ধতা",
        allMetals: "সকল ধাতু",
        noInventoryItemsFound: "কোনো ইনভেন্টরি আইটেম পাওয়া যায়নি",
        startDate: "শুরুর তারিখ",
        endDate: "শেষের তারিখ",
        allBranches: "সকল শাখা",
        allCustomers: "সকল কাস্টমার",
        allSuppliers: "সকল সরবরাহকারী",
        allArtisans: "সকল কারিগর",
        allStatuses: "সকল অবস্থা",
        wholesaleOrders: "পাইকারি অর্ডার",
        totalPurchases: "মোট ক্রয়",
        totalOrders: "মোট অর্ডার",
        totalValue: "মোট মূল্য",
        advanceReceived: "অগ্রিম গ্রহণ",
        dueBalance: "বকেয়া ব্যালেন্স",
        holdingWeight: "হাতে থাকা ওজন",
        activeJobs: "চলমান কাজ",
        completed: "সম্পন্ন",
        totalArtisans: "মোট কারিগর",
        payableDue: "প্রদেয় বকেয়া",
        principalDisbursed: "প্রদত্ত আসল ঋণ",
        interestCollected: "আদায়কৃত সুদ",
        activeAccounts: "চলমান একাউন্ট",
        incomeRecords: "আয়ের বিবরণী",
        expenseRecords: "ব্যয়ের বিবরণী",
        noIncomeRecords: "কোনো আয়ের রেকর্ড পাওয়া যায়নি",
        noExpenseRecords: "কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি",
        noSalesRecords: "কোনো বিক্রয়ের রেকর্ড পাওয়া যায়নি",
        noWholesaleRecords: "কোনো পাইকারি বিক্রয়ের রেকর্ড পাওয়া যায়নি",
        noPurchaseRecords: "কোনো ক্রয়ের রেকর্ড পাওয়া যায়নি",
        noOrderRecords: "কোনো অর্ডারের রেকর্ড পাওয়া যায়নি",
        noArtisanRecords: "কোনো কারিগরের রেকর্ড পাওয়া যায়নি",
        noMortgageRecords: "কোনো বন্ধকী রেকর্ড পাওয়া যায়নি",

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
        invoiceSettings: "ইনভয়েস সেটিংস",
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

        // Pagination
        showing: "প্রদর্শিত",
        to: "থেকে",
        of: "এর মধ্যে মোট",
        entries: "টি তথ্য",
        previous: "পূর্ববর্তী",
        next: "পরবর্তী",
    }
};

// Comprehensive bidirectional phrase dictionary for UI text translation
export const EN_TO_BN_PHRASES = {
    // Navigation & Primary Headers
    "Dashboard": "ড্যাশবোর্ড",
    "Sales": "বিক্রয়",
    "Purchase": "ক্রয়",
    "Purchases": "ক্রয়সমূহ",
    "Custom Orders": "কাস্টম অর্ডার",
    "Order": "অর্ডার",
    "Orders": "অর্ডার",
    "Mortgage": "বন্ধক / বন্ধকী",
    "Mortgages": "বন্ধকসমূহ",
    "Production": "কারখানা / উৎপাদন",
    "Inventory": "ইনভেন্টরি / স্টক",
    "Products": "পণ্যসমূহ",
    "Contacts": "যোগাযোগ",
    "HRM": "এইচআরএম",
    "Accounts": "হিসাব-নিকাশ",
    "Reports": "রিপোর্টসমূহ",
    "Settings": "সেটিংস",
    "Dashboard Overview": "ড্যাশবোর্ড ওভারভিউ",
    "Real-time overview of business performance": "ব্যবসার রিয়েল-টাইম পারফরম্যান্সের ওভারভিউ",
    "Business Summary": "ব্যবসার সারসংক্ষেপ",
    "Daily Sales Overview": "দৈনিক বিক্রয় ওভারভিউ",
    "Purchase Overview": "ক্রয় ওভারভিউ",
    "Customer Statistics": "গ্রাহক পরিসংখ্যান",
    "Supplier Statistics": "সরবরাহকারী পরিসংখ্যান",
    "Inventory & Vault Status": "ইনভেন্টরি ও ভল্ট অবস্থা",
    "Recent Activities Log": "সাম্প্রতিক কর্মকাণ্ডের লগ",
    "Urgent Alerts & Action Required": "জরুরি অ্যালার্ট ও অ্যাকশন প্রয়োজন",
    "Vori / Gram Calculator": "ভরি / গ্রাম ক্যালকুলেটর",
    "Vori/Gram Calculator": "ভরি/গ্রাম ক্যালকুলেটর",
    "Convert gold weight between Vori and Grams.": "স্বর্ণের ওজন ভরি বা গ্রামে রূপান্তর করুন।",
    "Traditional (Vori)": "সনাতন হিসাব (ভরি)",
    "Gram (Metric)": "গ্রাম হিসাব",
    "Traditional (Vori-Ana-Roti-Point)": "সনাতন পদ্ধতি (ভরি-আনা-রতি-পয়েন্ট)",
    "Rate Per Vori (BDT)": "দর প্রতি ভরি (টাকা)",
    "Rate Per Gram (BDT)": "দর প্রতি গ্রাম (টাকা)",
    "Work Order Assignment": "ওয়ার্ক অর্ডার অ্যাসাইনমেন্ট",
    "Artisan Payment Management": "কারিগর পেমেন্ট ব্যবস্থাপনা",
    "Artisan Pending Dues & Balances": "কারিগরদের বকেয়া ও পাওনা হিসাব",
    "Payment History": "পেমেন্ট ইতিহাস",
    "Pending Dues": "বকেয়া পাওনা",
    "Chart of Accounts": "হিসাবের তালিকা",
    "Roles & Permissions": "ভূমিকা ও অনুমতি",
    "System Settings": "সিস্টেম সেটিংস",
    "Notification Settings": "বিজ্ঞপ্তি সেটিংস",
    "Opening Accounts": "প্রারম্ভিক হিসাব",
    "Account Config": "হিসাব কনফিগারেশন",
    "Invoice Settings": "ইনভয়েস সেটিংস",
    "Print Labels": "লেবেল প্রিন্ট",
    "Product Categories": "পণ্য ক্যাটাগরি",
    "Metal Prices": "ধাতুর দর",
    "Metal Price": "ধাতুর দর",
    "Salary Payments": "বেতন পেমেন্ট",
    "Contra Entries": "কনট্রা এন্ট্রি",
    "Other Incomes": "অন্যান্য আয়",
    "Other Expenses": "অন্যান্য খরচ",
    "Mortgage Details": "বন্ধকের বিবরণ",
    "Mortgage Payments": "বন্ধক পেমেন্ট",
    "Mortgage Customers": "বন্ধকী গ্রাহকগণ",
    "Customer Orders": "কাস্টমার অর্ডার",
    "Custom Orders": "কাস্টম অর্ডার",
    "Production Status": "উৎপাদনের অবস্থা",
    "Production List": "উৎপাদন তালিকা",
    "Stock Adjustments": "স্টক সমন্বয়সমূহ",
    "Stock Adjustment": "স্টক সমন্বয়",
    "Stock Ledger": "স্টক খতিয়ান",
    "Opening Stock": "প্রাথমিক স্টক",
    "Artisan Stock": "কারিগর স্টক",
    "Sales Return": "বিক্রয় ফেরত",
    "Sales Returns": "বিক্রয় ফেরতসমূহ",
    "Due Collection": "বকেয়া আদায়",
    "Wholesale Sales": "পাইকারি বিক্রয়",
    "Wholesales": "পাইকারি বিক্রয়",
    "Wholesale": "পাইকারি বিক্রয়",
    "Purchase Returns": "ক্রয় ফেরতসমূহ",
    "Purchase Payments": "ক্রয় পেমেন্টসমূহ",
    "Accounts Report": "হিসাবের রিপোর্ট",
    "Sales Report": "বিক্রয় রিপোর্ট",
    "Wholesale Report": "পাইকারি রিপোর্ট",
    "Purchase Report": "ক্রয় রিপোর্ট",
    "Customer Order Report": "কাস্টমার অর্ডার রিপোর্ট",
    "Inventory Report": "ইনভেন্টরি রিপোর্ট",
    "Artisan Report": "কারিগর রিপোর্ট",
    "Mortgage Report": "বন্ধকী রিপোর্ট",
    "User Permissions": "ব্যবহারকারী অনুমতি",
    "Branch": "শাখা",
    "Branches": "শাখাসমূহ",
    "Staff": "স্টাফ / কর্মী",
    "Attendance": "উপস্থিতি",
    "Payroll": "পে-রোল",
    "Cheques": "চেকসমূহ",
    "Customers": "গ্রাহকগণ",
    "Suppliers": "সরবরাহকারীগণ",
    "Artisans": "কারিগরগণ",
    "Product List": "পণ্য তালিকা",
    "Sales List": "বিক্রয় তালিকা",
    "Purchase List": "ক্রয় তালিকা",
    "Mortgage List": "বন্ধক তালিকা",
    "Order List": "অর্ডার তালিকা",
    "New Order": "নতুন অর্ডার",
    "Assign Order": "অর্ডার অর্পণ",
    "Artisan Payment": "কারিগর পেমেন্ট",
    "Add Wholesale": "পাইকারি বিক্রয় যোগ করুন",

    // Action Buttons
    "Add Sales": "বিক্রয় যোগ করুন",
    "Add Sale": "বিক্রয় যোগ করুন",
    "New Sale": "নতুন বিক্রয়",
    "Add Purchase": "ক্রয় যোগ করুন",
    "Add Product": "পণ্য যোগ করুন",
    "Add Customer": "গ্রাহক যোগ করুন",
    "Add Supplier": "সরবরাহকারী যোগ করুন",
    "Add Artisan": "কারিগর যোগ করুন",
    "Add Mortgage": "বন্ধক যোগ করুন",
    "Add Production": "উৎপাদন যোগ করুন",
    "Add New": "নতুন যোগ করুন",
    "Add Item": "আইটেম যোগ করুন",
    "Add Item Card": "আইটেম কার্ড যোগ করুন",
    "Remove Card": "কার্ড মুছুন",
    "Remove Item": "আইটেম মুছুন",
    "Quick Add": "দ্রুত যোগ করুন",
    "Quick Add Customer": "গ্রাহক যোগ করুন",
    "Quick Add Supplier": "সরবরাহকারী যোগ করুন",
    "Quick Add Product": "পণ্য যোগ করুন",
    "Record Payment": "পেমেন্ট রেকর্ড করুন",
    "Give Payment": "পেমেন্ট দিন",
    "Save Artisan": "কারিগর সংরক্ষণ করুন",
    "Save Customer": "গ্রাহক সংরক্ষণ করুন",
    "Save Supplier": "সরবরাহকারী সংরক্ষণ করুন",
    "Save Product": "পণ্য সংরক্ষণ করুন",
    "Save Changes": "পরিবর্তন সংরক্ষণ করুন",
    "Complete Sale": "বিক্রয় সম্পন্ন করুন",
    "Save Purchase": "ক্রয় সংরক্ষণ করুন",
    "Save Order": "অর্ডার সংরক্ষণ করুন",
    "Back to Purchase List": "ক্রয় তালিকায় ফিরে যান",
    "Back to Sales List": "বিক্রয় তালিকায় ফিরে যান",
    "Back to Order List": "অর্ডার তালিকায় ফিরে যান",
    "Back to List": "তালিকায় ফিরে যান",
    "Export Report": "রিপোর্ট এক্সপোর্ট",
    "Export Excel": "এক্সেল এক্সপোর্ট",
    "Print Invoice": "ইনভয়েস প্রিন্ট",
    "Print Receipt": "রসিদ প্রিন্ট",
    "View Receipt": "রসিদ দেখুন",
    "Download PDF": "পিডিএফ ডাউনলোড",
    "Take Action": "অ্যাকশন নিন",
    "Product Showcase / Catalog": "পণ্য প্রদর্শনী / ক্যাটালগ",
    "Add Custom Item": "কাস্টম আইটেম যোগ করুন",

    // Table Headers & Labels
    "Invoice #": "ইনভয়েস নং",
    "Invoice No": "ইনভয়েস নং",
    "Invoice Number": "ইনভয়েস নম্বর",
    "Payment #": "পেমেন্ট নং",
    "Order #": "অর্ডার নং",
    "Order No": "অর্ডার নং",
    "Customer": "গ্রাহক",
    "Customer Name": "গ্রাহকের নাম",
    "Customer Phone": "গ্রাহকের ফোন",
    "Customer Email": "গ্রাহকের ইমেইল",
    "Customer Address": "গ্রাহকের ঠিকানা",
    "Supplier": "সরবরাহকারী",
    "Supplier Name": "সরবরাহকারীর নাম",
    "Company Name": "কোম্পানির নাম",
    "Artisan": "কারিগর",
    "Artisan Name": "কারিগরের নাম",
    "Branch": "শাখা",
    "Branches": "শাখাগুলো",
    "Main Branch": "প্রধান শাখা",
    "MAIN BRANCH": "প্রধান শাখা",
    "Main branch": "প্রধান শাখা",
    "Main": "প্রধান",
    "MAIN": "প্রধান",
    "Head Office": "প্রধান কার্যালয়",
    "HEAD OFFICE": "প্রধান কার্যালয়",
    "Head office": "প্রধান কার্যালয়",
    "Active Branch": "সক্রিয় শাখা",
    "Select Branch": "শাখা নির্বাচন করুন",
    "All Branches": "সকল শাখা",
    "Receiving Branch": "গ্রহণকারী শাখা",
    "Assigned Artisan": "অর্পিত কারিগর",
    "Product": "পণ্য",
    "Product Name": "পণ্যের নাম",
    "Product Name *": "পণ্যের নাম *",
    "Product Details": "পণ্যের বিবরণ",
    "Add Product": "পণ্য যোগ করুন",
    "Edit Product": "পণ্য সম্পাদনা",
    "Product List": "পণ্য তালিকা",
    "Product Categories": "পণ্য ক্যাটাগরি",
    "Add Category": "ক্যাটাগরি যোগ করুন",
    "Edit Category": "ক্যাটাগরি সম্পাদনা",
    "Save Category": "ক্যাটাগরি সংরক্ষণ করুন",
    "Update Category": "ক্যাটাগরি আপডেট করুন",
    "Print Labels": "লেবেল প্রিন্ট",
    "Print Label": "লেবেল প্রিন্ট",
    "Print Labels Preview": "লেবেল প্রিন্ট প্রিভিউ",
    "Print Preview": "প্রিন্ট প্রিভিউ",
    "Category": "ক্যাটাগরি",
    "Category *": "ক্যাটাগরি *",
    "Categories": "ক্যাটাগরিসমূহ",
    "Category Details": "ক্যাটাগরির বিবরণ",
    "Category Name": "ক্যাটাগরির নাম",
    "Category Name *": "ক্যাটাগরির নাম *",
    "Parent Category": "প্যারেন্ট ক্যাটাগরি",
    "Parent": "প্যারেন্ট",
    "Sub-categories": "সাব-ক্যাটাগরি",
    "Subcategories": "সাব-ক্যাটাগরি",
    "Root category": "প্রধান ক্যাটাগরি",
    "None (Root Category)": "কোনোটি নয় (প্রধান ক্যাটাগরি)",
    "Weight/vori": "ভরি",
    "Weight/gm": "গ্রাম",
    "Weight Details": "ওজনের বিবরণ",
    "Weight In Gm": "ওজন (গ্রাম)",
    "Weight In Gm *": "ওজন (গ্রাম) *",
    "Weight Calculator": "ওজন ক্যালকুলেটর",
    "Pr. Code": "কোড",
    "In-stock": "স্টক",
    "Type": "ধাতু",
    "Price": "মূল্য",
    "Ready Stock": "রেডি স্টক",
    "Order Stock": "অর্ডার স্টক",
    "Barcode / Code": "বারকোড / কোড",
    "Supplier / Brand": "সরবরাহকারী / ব্র্যান্ড",
    "Select Category": "ক্যাটাগরি নির্বাচন করুন",
    "Select Supplier": "সরবরাহকারী নির্বাচন করুন",
    "Select Metal": "ধাতু নির্বাচন করুন",
    "Select Metal Type": "ধাতুর ধরন নির্বাচন করুন",
    "Select Purity": "ক্যারেট নির্বাচন করুন",
    "All Categories": "সকল ক্যাটাগরি",
    "All Metals": "সকল ধাতু",
    "M.C Type": "মজুরির ধরন",
    "Mk. Charge": "মজুরি চার্জ",
    "Mk. Charge *": "মজুরি চার্জ *",
    "VAT %": "ভ্যাট %",
    "Unit": "একক",
    "Barcode": "বারকোড",
    "Gold": "স্বর্ণ",
    "Silver": "রুপা",
    "Platinum": "প্লাটিনাম",
    "Diamond": "হীরা",
    "Mixed": "মিশ্র",
    "gold": "স্বর্ণ",
    "silver": "রুপা",
    "platinum": "প্লাটিনাম",
    "diamond": "হীরা",
    "mixed": "মিশ্র",
    "Back to List": "তালিকায় ফিরে যান",
    "Scan or type...": "স্ক্যান বা লিখুন...",
    "e.g. 22K Gold Bridal Necklace": "যেমন: ২২ ক্যারেট ব্রাইডাল নেকলেস",
    "e.g. Necklaces, Rings, Bangles": "যেমন: নেকলেস, আংটি, বালা",
    "Add New Supplier": "নতুন সরবরাহকারী যোগ করুন",
    "Rate / Vori": "দর / ভরি",
    "% of Price": "% মূল্য",
    "Photo": "ছবি",
    "There are validation errors in this row. Please check required fields.": "এই সারিতে কিছু তথ্য অসম্পূর্ণ রয়েছে। প্রয়োজনীয় ঘরগুলো পূরণ করুন।",
    "Saving...": "সংরক্ষণ করা হচ্ছে...",
    "Update Product": "পণ্য আপডেট করুন",
    "Company Name": "কোম্পানির নাম",
    "Contact Person Name": "যোগাযোগের ব্যক্তির নাম",
    "NID Number": "জাতীয় পরিচয়পত্র (এনআইডি) নম্বর",
    "Save Supplier": "সরবরাহকারী সংরক্ষণ করুন",
    "Charges & Wastage": "চার্জ ও অপচয়",
    "Making Charge Type": "মজুরির ধরন",
    "Making Charge Value": "মজুরির পরিমাণ",
    "No products in the list. Search and click \"+ Add\" above.": "তালিকায় কোনো পণ্য নেই। উপরে সার্চ করে '+ Add' ক্লিক করুন।",
    "Product Code": "পণ্য কোড",
    "Label": "লেবেল",
    "Labels": "লেবেল",
    "Weights": "ওজন",
    "Price / Rate": "মূল্য / দর",
    "Rate:": "দর:",
    "MC:": "মজুরি:",
    "Gross:": "মোট:",
    "Net:": "নিট:",
    "Stone:": "পাথর:",
    "Metal:": "ধাতু:",
    "No Products Selected": "কোনো পণ্য নির্বাচন করা হয়নি",
    "Leave empty to create a root-level category.": "প্রধান ক্যাটাগরি তৈরি করতে ফাঁকা রাখুন।",
    "Vori": "ভরি",
    "Ana": "আনা",
    "Roti": "রতি",
    "Point": "পয়েন্ট",
    "View Details": "বিবরণ দেখুন",
    "Search by name, SKU, barcode...": "নাম, এসকেইউ বা বারকোড দিয়ে খুঁজুন...",
    "No products found.": "কোনো পণ্য পাওয়া যায়নি।",
    "No categories found.": "কোনো ক্যাটাগরি পাওয়া যায়নি।",
    "Create your first product to get started.": "শুরু করতে আপনার প্রথম পণ্য যোগ করুন।",
    "Create your first product category.": "আপনার প্রথম পণ্য ক্যাটাগরি তৈরি করুন।",
    "Specialization": "বিশেষত্ব / কাজ",
    "Metal": "ধাতু",
    "Metal Type": "ধাতুর ধরন",
    "Purity": "ক্যারেট",
    "Purity / Carat": "ক্যারেট / বিশুদ্ধতা",
    "Hallmark / Cert": "হলমার্ক / সনদ",
    "Hallmark No": "হলমার্ক নং",
    "Stock Type": "স্টক টাইপ",
    "Weight": "ওজন",
    "Gross Weight": "মোট ওজন",
    "Net Weight": "নিট ওজন",
    "Stone Weight": "পাথরের ওজন",
    "Gross Wt (g)": "মোট ওজন (গ্রাম)",
    "Stone Wt (g)": "পাথর (গ্রাম)",
    "Net Wt (g)": "নিট ওজন (গ্রাম)",
    "Rate / gm (BDT)": "দর/গ্রাম (টাকা)",
    "Rate / Vori (BDT)": "দর/ভরি (টাকা)",
    "Quantity": "পরিমাণ",
    "Qty": "পরিমাণ",
    "Qty *": "পরিমাণ *",
    "Wastage": "অপচয়",
    "Wastage %": "অপচয় %",
    "Making Charge": "মজুরি",
    "Stone Charge": "পাথরের মূল্য",
    "Hallmark Charge": "হলমার্ক চার্জ",
    "Other Charges": "অন্যান্য খরচ",
    "Old Gold Exchange Value": "পুরাতন স্বর্ণের বিনিময় মূল্য",
    "Old Gold Exchange Value (BDT)": "পুরাতন স্বর্ণের বিনিময় মূল্য (টাকা)",
    "Rate/gm": "দর/গ্রাম",
    "Rate/Vori": "দর/ভরি",
    "Rate/Vori *": "দর/ভরি *",
    "Rate/Gram *": "দর/গ্রাম *",
    "Total Payable": "মোট প্রদেয়",
    "Total Paid": "মোট পরিশোধিত",
    "Due Amount": "বকেয়া টাকা",
    "Due Balance": "বকেয়া ব্যালেন্স",
    "Due Balance:": "বকেয়া ব্যালেন্স:",
    "Paid Amount": "পরিশোধিত টাকা",
    "Paid Amount:": "পরিশোধিত টাকা:",
    "Receivable Amount": "প্রাপ্য টাকা",
    "Receivable Amount:": "প্রাপ্য টাকা:",
    "Total Amount": "মোট টাকা",
    "Total Metal Price": "মোট ধাতুর মূল্য",
    "Total Metal Price:": "মোট ধাতুর মূল্য:",
    "VAT On Metal": "ধাতুর উপর ভ্যাট",
    "VAT On Metal:": "ধাতুর উপর ভ্যাট:",
    "Total": "মোট",
    "TOTAL": "মোট",
    "Total (BDT)": "মোট (টাকা)",
    "TOTAL (BDT)": "মোট (টাকা)",
    "Total (৳)": "মোট (৳)",
    "Subtotal": "উপমোট",
    "Grand Total": "সর্বমোট",
    "Discount": "ছাড়",
    "Discount (BDT)": "ছাড় (টাকা)",
    "Making (BDT)": "মজুরি (টাকা)",
    "Stone (BDT)": "পাথর (টাকা)",
    "Hallmark (BDT)": "হলমার্ক (টাকা)",
    "Stone:": "পাথর:",
    "Mk. Charge:": "মজুরি চার্জ:",
    "Hallmark:": "হলমার্ক:",
    "Mk. Type": "মজুরির ধরন",
    "Sale": "বিক্রয়",
    "SALE": "বিক্রয়",
    "Complete Sale": "বিক্রয় সম্পন্ন করুন",
    "Update Sale": "বিক্রয় আপডেট করুন",
    "Add Row": "সারি যোগ করুন",
    "Add New Row": "নতুন সারি যোগ করুন",
    "Select Product Item *": "পণ্য আইটেম নির্বাচন করুন *",
    "Select Product Item": "পণ্য আইটেম নির্বাচন করুন",
    "Wt(V-A-R-P)": "ওজন (ভ-আ-র-প)",
    "Gross | Net(g)": "মোট | নিট (গ্রাম)",
    "Gross": "মোট ওজন",
    "Net": "নিট ওজন",
    "Fixed": "নির্দিষ্ট",
    "Per Gram": "প্রতি গ্রাম",
    "Fixed/Vori": "নির্দিষ্ট/ভরি",
    "Percent": "শতকরা (%)",
    "Branch *": "শাখা *",
    "Customer *": "গ্রাহক *",
    "Invoice / Bill No": "ইনভয়েস / বিল নং",
    "Date *": "তারিখ *",
    "Add Product": "পণ্য যোগ করুন",
    "Save Customer": "গ্রাহক সংরক্ষণ করুন",
    "Add New Customer": "নতুন গ্রাহক যোগ করুন",
    "Add New Product": "নতুন পণ্য যোগ করুন",
    "Search jewelry by name or SKU...": "পণ্যের নাম বা এসকেইউ দিয়ে খুঁজুন...",
    "Opening Balance (BDT)": "প্রারম্ভিক ব্যালেন্স (টাকা)",
    "Credit Limit (BDT)": "ক্রেডিট লিমিট (টাকা)",
    "Rate / Gram (BDT) *": "দর / গ্রাম (টাকা) *",
    "Rate / Gram (BDT)": "দর / গ্রাম (টাকা)",
    "Making / Labor Charge (BDT)": "মজুরি চার্জ (টাকা)",
    "Stone Charge (BDT)": "পাথরের মূল্য (টাকা)",
    "Stock Quantity *": "স্টক পরিমাণ *",
    "Gross Wt (g) *": "মোট ওজন (গ্রাম) *",
    "Stone Wt (g)": "পাথরের ওজন (গ্রাম)",
    "SKU / Item Code": "এসকেইউ / আইটেম কোড",
    "Gold Purity / Karat *": "স্বর্ণের ক্যারেট / বিশুদ্ধতা *",
    "Product Name *": "পণ্যের নাম *",
    "Add Item": "আইটেম যোগ করুন",
    "Update Order": "অর্ডার আপডেট করুন",
    "Create Order": "অর্ডার তৈরি করুন",
    "Calculated Remaining Due (৳)": "বকেয়া পাওনা (৳)",
    "Calculated Due": "মোট বকেয়া",
    "Estimated Amount (৳)": "আনুমানিক মূল্য (৳)",
    "Advance Received (৳)": "অগ্রিম গ্রহণ (৳)",
    "Estimated Weight (g)": "আনুমানিক ওজন (গ্রাম)",
    "Product Description": "পণ্যের বিবরণ",
    "Jewelry Specifications": "গহনার বিবরণ",
    "Pricing & Advance Payment": "মূল্য ও অগ্রিম পেমেন্ট",
    "Customer & Order Status": "গ্রাহক ও অর্ডারের অবস্থা",
    "Order Status": "অর্ডারের অবস্থা",
    "New Order": "নতুন অর্ডার",
    "Assigned": "নিয়োগকৃত",
    "In Production": "উৎপাদনে রয়েছে",
    "Ready for Delivery": "ডেলিভারির জন্য প্রস্তুত",
    "Wholesale Dealer / Merchant": "পাইকারি ব্যবসায়ী / মার্চেন্ট",
    "Retail Customer": "খুচরা ক্রেতা",
    "Full Address": "পূর্ণ ঠিকানা",
    "Description / Notes": "বিবরণ / নোট",
    "VAT": "ভ্যাট",
    "VAT (%)": "ভ্যাট (%)",
    "Tax": "ট্যাক্স",
    "Method": "মাধ্যম",
    "Payment Method": "পেমেন্ট মাধ্যম",
    "Payment Date": "পেমেন্টের তারিখ",
    "Sale Date": "বিক্রয়ের তারিখ",
    "Purchase Date": "ক্রয়ের তারিখ",
    "Order Date": "অর্ডারের তারিখ",
    "Delivery Date": "ডেলিভারি তারিখ",
    "Date": "তারিখ",
    "Status": "অবস্থা",
    "Action": "অ্যাকশন",
    "Actions": "অ্যাকশন",
    "Phone": "ফোন",
    "Phone Number": "ফোন নম্বর",
    "Email": "ইমেইল",
    "Address": "ঠিকানা",
    "Photo": "ছবি",
    "Attachment": "সংযুক্তি",
    "Related Order": "সংশ্লিষ্ট অর্ডার",
    "Payment Notes / Remarks": "পেমেন্ট নোট / মন্তব্য",
    "Opening Balance": "প্রারম্ভিক ব্যালেন্স",
    "Credit Limit": "ক্রেডিট লিমিট",
    "NID Number": "জাতীয় পরিচয়পত্র নং",
    "Item Details": "আইটেমের বিবরণ",
    "Sale Type": "বিক্রয়ের ধরন",
    "Retail": "খুচরা",
    "Wholesale": "পাইকারি",

    // Status Badges & Terms
    "FULL PAYMENT": "সম্পূর্ণ পরিশোধ",
    "PARTIAL PAYMENT": "আংশিক পরিশোধ",
    "UNPAID / 100% DUE": "বকেয়া / অপরিশোধিত",
    "PAID IN FULL": "সম্পূর্ণ পরিশোধিত",
    "Paid": "পরিশোধিত",
    "Unpaid": "অপরিশোধিত",
    "Partial": "আংশিক",
    "Due": "বাকি",
    "Active": "সক্রিয়",
    "Inactive": "নিষ্ক্রিয়",
    "Pending": "অপেক্ষমাণ",
    "Completed": "সম্পন্ন",
    "Delivered": "ডেলিভারি হয়েছে",
    "Cancelled": "বাতিল",
    "In Progress": "চলমান",
    "Ready Stock": "রেডি স্টক",
    "Custom Order": "কাস্টম অর্ডার",
    "Raw Gold / Metal": "কাঁচা স্বর্ণ / ধাতু",
    "Scrap / Old Gold": "পুরাতন স্বর্ণ / স্ক্র্যাপ",
    "Existing Product": "বিদ্যমান পণ্য",
    "Custom Item / Metal": "কাস্টম আইটেম / ধাতু",
    "Cash": "নগদ",
    "bKash": "বিকাশ",
    "Nagad": "নগদ (Nagad)",
    "Bank Transfer": "ব্যাংক ট্রান্সফার",
    "Cheque": "চেক",
    "Card": "কার্ড",
    "POS": "পিওএস",
    "Goldsmith (কারিগর)": "স্বর্ণকার / কারিগর",
    "Goldsmith": "স্বর্ণকার",
    "Polisher": "পলিশার",
    "Setter": "পাথর সেটার",

    // Stat Cards & Metrics
    "Total POS Sale": "মোট পিওএস বিক্রয়",
    "POS Sales Return": "পিওএস বিক্রয় ফেরত",
    "Total Customer Order": "মোট কাস্টমার অর্ডার",
    "Customer Orders": "কাস্টমার অর্ডার",
    "Sale Due (POS+CO)": "বিক্রয় বকেয়া (পিওএস+অর্ডার)",
    "Total Purchase": "মোট ক্রয়",
    "Purchase Return": "ক্রয় ফেরত",
    "Purchase Due": "ক্রয় বকেয়া",
    "Cash Balance": "নগদ ব্যালেন্স",
    "Stock Valuation": "স্টক মূল্যায়ন",
    "Stock Valuation (Metal)": "স্টক মূল্যায়ন (ধাতু)",
    "Inventory & Stock Valuation Report": "ইনভেন্টরি ও স্টক মূল্যায়ন রিপোর্ট",
    "Inventory Valuation Report": "ইনভেন্টরি মূল্যায়ন রিপোর্ট",
    "Stock Weight": "স্টকের ওজন",
    "Stock Qty": "স্টক পরিমাণ",
    "Total Items": "মোট আইটেম",
    "Artisan Holding": "কারিগরদের নিকট মজুদ",
    "Vault Metal & Jewelry": "ভল্ট মেটাল ও গহনা",
    "Vault Secured": "ভল্ট সুরক্ষিত",
    "Valuation": "মূল্যায়ন",
    "All Purities": "সকল ক্যারেট/বিশুদ্ধতা",
    "All Metals": "সকল ধাতু",
    "No inventory items found": "কোনো ইনভেন্টরি আইটেম পাওয়া যায়নি",
    "28 Invoices": "২৮ টি মেমো",
    "3 Returned Items": "৩ টি ফেরত",
    "15 Custom Orders": "১৫ টি অর্ডার",
    "154 Custom Orders": "১৫৪ টি কাস্টম অর্ডার",
    "Total Receivable Due": "গ্রাহকের বকেয়া প্রাপ্য",
    "Raw Metal & Jewelry": "কাঁচা ধাতু ও তৈরি গহনা",
    "Supplier Returns": "মহাজন ফেরত",
    "Payables Outstanding": "মহাজন দেনা",
    "Cash In Vault": "ভল্টে নগদ স্থিতি",
    "Total Payments Recorded": "মোট সংরক্ষিত পেমেন্ট",
    "Total Amount Paid": "মোট পরিশোধিত অর্থ",
    "Paid Today": "আজকের পরিশোধ",
    "Total Pending Dues": "মোট বকেয়া পাওনা",
    "Total Revenue": "মোট রাজস্ব",
    "Net Profit": "নিট লাভ",
    "Metal Vault Value": "মেটাল ভল্ট মান",
    "Cash in Hand": "নগদ ব্যালেন্স",
    "Gold Sales": "স্বর্ণ বিক্রয়",
    "Silver Sales": "রুপা বিক্রয়",
    "Diamond Sales": "ডায়মন্ড বিক্রয়",
    "Total Customers": "মোট গ্রাহক",
    "New Customers Today": "আজকের নতুন গ্রাহক",
    "Customer Dues (Receivable)": "গ্রাহকের বাকি (প্রাপ্য)",
    "Repeat Customers": "পুনরায় ক্রেতা",
    "Total Suppliers": "মোট সরবরাহকারী",
    "Supplier Dues (Payable)": "সরবরাহকারীর দেয় টাকা",
    "Pending Supplier Orders": "অপেক্ষমাণ সরবরাহকারী অর্ডার",
    "Gold Stock (Bhori)": "স্বর্ণের স্টক (ভরি)",
    "Silver Stock (Bhori)": "রুপার স্টক (ভরি)",
    "Low Stock Warnings": "কম স্টকের সতর্কতা",
    "Artisan Stock Holding": "কারিগরদের কাছে মজুদ",
    "Live Summary": "লাইভ সারসংক্ষেপ",
    "Real-time Overview": "রিয়েল-টাইম ওভারভিউ",

    // Units & Measures
    "Vori": "ভরি",
    "Ana": "আনা",
    "Roti": "রতি",
    "Point": "পয়েন্ট",
    "Gram": "গ্রাম",
    "Gold": "স্বর্ণ",
    "Silver": "রুপা",
    "Platinum": "প্লাটিনাম",
    "Diamond": "ডায়মন্ড",
    "22K Gold": "২২ ক্যারেট স্বর্ণ",
    "21K Gold": "২১ ক্যারেট স্বর্ণ",
    "18K Gold": "১৮ ক্যারেট স্বর্ণ",
    "24K Gold": "২৪ ক্যারেট স্বর্ণ",
    "Plat": "প্লাটিনাম",
    "Diam": "ডায়মন্ড",
    "Per gm": "প্রতি গ্রাম",
    "Per vori": "প্রতি ভরি",
    "Orders": "অর্ডার",

    // Placeholders & Helpers
    "Search everything...": "সবকিছু খুঁজুন...",
    "Search payment #, artisan name...": "পেমেন্ট নং বা কারিগরের নাম দিয়ে খুঁজুন...",
    "Search by invoice, customer, phone...": "ইনভয়েস, গ্রাহক বা ফোন নম্বর দিয়ে খুঁজুন...",
    "Search by Product Name or SKU...": "পণ্যের নাম বা এসকেইউ দিয়ে খুঁজুন...",
    "Choose Artisan": "কারিগর নির্বাচন করুন",
    "Choose Customer": "গ্রাহক নির্বাচন করুন",
    "Select Customer": "গ্রাহক নির্বাচন করুন",
    "Select Product": "পণ্য নির্বাচন করুন",
    "Select Category": "ক্যাটাগরি নির্বাচন করুন",
    "Select Existing Product": "বিদ্যমান পণ্য নির্বাচন করুন",
    "All Categories": "সকল ক্যাটাগরি",
    "All Artisans": "সকল কারিগর",
    "All Customers": "সকল গ্রাহক",
    "All Branches": "সকল শাখা",
    "All Methods": "সকল মাধ্যম",
    "All Status": "সকল অবস্থা",
    "No pending artisan dues": "কোনো বকেয়া কারিগর পাওনা নেই",
    "No artisan payments recorded": "কোনো কারিগর পেমেন্ট পাওয়া যায়নি",
    "Record a payment to craftsmen for order labor.": "অর্ডার মজুরির জন্য কারিগরদের পেমেন্ট রেকর্ড করুন।",
    "No records found": "কোনো রেকর্ড পাওয়া যায়নি",
    "No data found": "কোনো তথ্য পাওয়া যায়নি",
    "Showing": "প্রদর্শিত",
    "to": "থেকে",
    "of": "এর মধ্যে মোট",
    "entries": "টি তথ্য",
    "Previous": "পূর্ববর্তী",
    "Next": "পরবর্তী",
    "Save": "সংরক্ষণ",
    "Cancel": "বাতিল",
    "Delete": "মুছে ফেলুন",
    "Edit": "সম্পাদনা",
    "View": "দেখুন",
    "Filter": "ফিল্টার",
    "Reset": "রিসেট",
    "General Payment": "সাধারণ পেমেন্ট",
    "None (General Wage Payment)": "কোনোটি নয় (সাধারণ মজুরি পেমেন্ট)",
    "Link to Custom Order (Optional)": "কাস্টম অর্ডারের সাথে যুক্ত করুন (ঐচ্ছিক)",
    "Enter artisan name": "কারিগরের নাম লিখুন",
    "Signed in as": "লগইন করেছেন",
    "Profile": "প্রোফাইল",
    "Log Out": "লগ আউট",
    "Logout": "লগ আউট",
    "Personal & Contact Info": "ব্যক্তিগত ও যোগাযোগের তথ্য",
    "Personal and Contact Info": "ব্যক্তিগত ও যোগাযোগের তথ্য",
    "Full Name": "পূর্ণ নাম",
    "Full Name *": "পূর্ণ নাম *",
    "Email / Gmail Address": "ইমেইল / জিমেইল ঠিকানা",
    "Email / Gmail Address *": "ইমেইল / জিমেইল ঠিকানা *",
    "Email Address": "ইমেইল ঠিকানা",
    "Contact Phone Number": "যোগাযোগের ফোন নম্বর",
    "Save Changes": "পরিবর্তন সংরক্ষণ করুন",
    "Saved!": "সংরক্ষিত হয়েছে!",
    "Saved": "সংরক্ষিত",
    "Your email address is unverified.": "আপনার ইমেইল ঠিকানা যাচাই করা হয়নি।",
    "Change Password": "পাসওয়ার্ড পরিবর্তন",
    "Current Password": "বর্তমান পাসওয়ার্ড",
    "Current Password *": "বর্তমান পাসওয়ার্ড *",
    "New Password": "নতুন পাসওয়ার্ড",
    "New Password *": "নতুন পাসওয়ার্ড *",
    "Confirm New Password": "নতুন পাসওয়ার্ড নিশ্চিত করুন",
    "Confirm New Password *": "নতুন পাসওয়ার্ড নিশ্চিত করুন *",
    "Minimum 8 characters": "কমপক্ষে ৮টি অক্ষর",
    "Re-enter new password": "নতুন পাসওয়ার্ড পুনরায় লিখুন",
    "Update Password": "পাসওয়ার্ড আপডেট করুন",
    "Password Updated!": "পাসওয়ার্ড আপডেট হয়েছে!",
    "Password Updated": "পাসওয়ার্ড আপডেট হয়েছে",
    "Danger Zone": "বিপদজনক এলাকা",
    "Permanently delete your account and access": "আপনার অ্যাকাউন্ট এবং সকল অ্যাক্সেস স্থায়ীভাবে মুছে ফেলুন",
    "Delete Account": "অ্যাকাউন্ট মুছে ফেলুন",
    "Confirm Account Deletion": "অ্যাকাউন্ট মুছে ফেলা নিশ্চিত করুন",
    "Please enter your password to permanently delete your account.": "আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে অনুগ্রহ করে আপনার পাসওয়ার্ড লিখুন।",
    "Member Since": "যুক্ত হয়েছেন",
    "Head Office": "প্রধান কার্যালয়",
    "Super Admin": "সুপার এডমিন",
    "Admin": "এডমিন",
    "Manager": "ম্যানেজার",
    "Salesman": "বিক্রয়কর্মী",
    "Sales Manager": "বিক্রয় ব্যবস্থাপক",
    "Accountant": "হিসাবরক্ষক",
    "Staff": "স্টাফ",
    "User": "ব্যবহারকারী",
    "Active": "সক্রিয়",
    "Inactive": "নিষ্ক্রিয়",
    "Open sidebar": "সাইডবার খুলুন",
    "Close sidebar": "সাইডবার বন্ধ করুন",

    // Categories & Products
    "Add Category": "ক্যাটাগরি যোগ করুন",
    "Edit Category": "ক্যাটাগরি সম্পাদনা",
    "Category Details": "ক্যাটাগরির বিবরণ",
    "Category Name": "ক্যাটাগরির নাম",
    "Category Name *": "ক্যাটাগরির নাম *",
    "Parent Category": "প্যারেন্ট ক্যাটাগরি",
    "None (Root Category)": "কোনোটি নয় (মূল ক্যাটাগরি)",
    "Root Category": "মূল ক্যাটাগরি",
    "Leave empty to create a root-level category.": "মূল ক্যাটাগরি তৈরি করতে ফাঁকা রাখুন।",
    "e.g. Necklaces, Rings, Bangles": "যেমন: নেকলেস, আংটি, চুড়ি",
    "Select Metal Type": "ধাতুর ধরন নির্বাচন করুন",
    "Save Category": "ক্যাটাগরি সংরক্ষণ করুন",
    "Saving...": "সংরক্ষণ হচ্ছে...",
    "Category List": "ক্যাটাগরি তালিকা",
    "Total Categories": "মোট ক্যাটাগরি",
    "Bangles": "চুড়ি / বালা",
    "Necklaces": "নেকলেস / হার",
    "Rings": "আংটি",
    "Earrings": "কানের দুল",
    "Chains": "চেইন",
    "Bracelets": "ব্রেসলেট",
    "Pendants": "লকেট / পেন্ডেন্ট",
    "Nosepins": "নাকফুল",
    "Anklets": "পায়েল / নূপুর",
    "Crowns": "মুকুট / টিকলি",
    "Tikkas": "টিকলি",
    "Coins": "মুদ্রা / কয়েন",
    "Bars": "বার / বিস্কুট",
    "Waist Chains": "কোমরবন্ধ",
    "Brooches": "ব্রোচ",
    "Bangle": "চুড়ি / বালা",
    "Necklace": "নেকলেস / হার",
    "Ring": "আংটি",
    "Earring": "কানের দুল",
    "Chain": "চেইন",
    "Bracelet": "ব্রেসলেট",
    "Pendant": "লকেট / পেন্ডেন্ট",
    "Nosepin": "নাকফুল",
    "Anklet": "পায়েল / নূপুর",
    "Crown": "মুকুট",
    "Tikka": "টিকলি",
    "Coin": "মুদ্রা / কয়েন",
    "Bar": "বার / বিস্কুট",
    "Waist Chain": "কোমরবন্ধ",
    "Brooch": "ব্রোচ",
    "Diamond Ring": "ডায়মন্ড রিং",
    "Silver Anklet": "রূপার পায়েল",
    "22K Chain (10g)": "২২ ক্যারেট চেইন (১০g)",
    "2 left": "২ টি",
    "1 left": "১ টি",
    "4 left": "৪ টি",
    "154 Custom Orders": "১৫৪ টি কাস্টম অর্ডার",
    "28 Invoices": "২৮ টি মেমো",
    "3 Returned Items": "৩ টি ফেরত",
    "15 Custom Orders": "১৫ টি অর্ডার",
    "Vault Metal & Jewelry": "ভল্ট মেটাল ও গহনা",
    "Total Receivable Due": "গ্রাহকের মোট বকেয়া প্রাপ্য",
    "Raw Metal & Jewelry": "কাঁচা ধাতু ও তৈরি গহনা",
    "Supplier Returns": "মহাজন ফেরত",
    "Payables Outstanding": "মহাজন দেনা",
    "Cash In Vault": "ভল্টে নগদ স্থিতি",
    "Data Not Found": "কোনো তথ্য পাওয়া যায়নি",
    "No users found.": "কোনো ব্যবহারকারী পাওয়া যায়নি।",
    "No records found.": "কোনো রেকর্ড পাওয়া যায়নি।",
    "Vault Secured": "ভল্ট সুরক্ষিত",
    "Vault Locked": "ভল্ট লকড",
    "Order Stock": "স্টক অর্ডার দিন",
    "Order Stock Now": "এখনই স্টক অর্ডার দিন",
    "SKU": "এসকেইউ",
    "Barcode": "বারকোড",
    "Product Code": "পণ্য কোড",
    "Purity Name": "বিশুদ্ধতার নাম",
    "Product Details": "পণ্যের বিবরণ",
    "Add New Product": "নতুন পণ্য যোগ করুন",
    "Edit Product": "পণ্য সম্পাদনা",
    "Stock Quantity": "মজুদ পরিমাণ",
    "Alert Quantity": "সতর্কতা পরিমাণ",
    "Min Stock": "সর্বনিম্ন মজুদ",
    "Cost Price": "ক্রয় মূল্য",
    "Selling Price": "বিক্রয় মূল্য",
    "Making Charge / gm": "মজুরি / গ্রাম",
    "Making Charge / Vori": "মজুরি / ভরি",
    "Print Barcode": "বারকোড প্রিন্ট",
    "Print Barcodes": "বারকোড প্রিন্ট",
    "Generate Barcode": "বারকোড তৈরি",
    "Barcode Format": "বারকোড ফরম্যাট",
    "Number of Copies": "কপির সংখ্যা",
    "Preview Barcode": "বারকোড প্রিভিউ",

    // Sales & Orders
    "Sales Invoice": "বিক্রয় ইনভয়েস",
    "Add New Sale": "নতুন বিক্রয় যোগ করুন",
    "POS Register": "পিওএস রেজিস্টার",
    "Select Branch": "শাখা নির্বাচন করুন",
    "Retail Sale": "খুচরা বিক্রয়",
    "Wholesale Sale": "পাইকারি বিক্রয়",
    "Sale Information": "বিক্রয়ের তথ্য",
    "Customer Information": "গ্রাহকের তথ্য",
    "Payment Details": "পেমেন্টের বিবরণ",
    "Amount Paid": "পরিশোধিত টাকা",
    "Change Amount": "ফেরত টাকা",
    "Payment Status": "পেমেন্টের অবস্থা",
    "Old Gold / Exchange": "পুরাতন স্বর্ণ / বিনিময়",
    "Discount (Flat)": "ছাড় (টাকা)",
    "Tax Amount": "ট্যাক্সের পরিমাণ",
    "Invoice Note": "ইনভয়েস নোট",
    "Terms & Conditions": "শর্তাবলী",
    "Download Invoice": "ইনভয়েস ডাউনলোড",
    "Full Paid": "সম্পূর্ণ পরিশোধিত",
    "Partially Paid": "আংশিক পরিশোধিত",
    "Order Information": "অর্ডারের তথ্য",
    "Assign Craftsman": "কারিগর অর্পণ করুন",
    "Target Date": "সম্ভাব্য সমাপ্তির তারিখ",
    "Order Status": "অর্ডারের অবস্থা",
    "Order Priority": "অর্ডার অগ্রাধিকার",
    "Urgent": "জরুরি",
    "High": "উচ্চ",
    "Normal": "সাধারণ",
    "Low": "কম",
    "Advance Payment": "অগ্রিম টাকা",
    "Artisan Labor Cost": "কারিগর মজুরি",
    "Estimated Weight": "আনুমানিক ওজন",
    "Actual Weight": "প্রকৃত ওজন",
    "Delivery Note": "ডেলিভারি নোট",
    "Job Card": "জব কার্ড",
    "Work Order": "ওয়ার্ক অর্ডার",
    "Assigned On": "অর্পণের তারিখ",
    "Completed On": "সম্পন্নের তারিখ",

    // Purchases & Mortgage
    "Total Purchases": "মোট ক্রয়",
    "Total Paid Amount": "মোট পরিশোধিত টাকা",
    "Outstanding Dues": "বকেয়া টাকা",
    "Full Paid": "পরিশোধিত",
    "Partial Payment": "আংশিক পরিশোধ",
    "Unpaid / Due": "বকেয়া / অপরিশোধিত",
    "Manage supplier purchases, stock receipts & payment settlements": "সরবরাহকারী ক্রয়, স্টক গ্রহণ এবং পেমেন্ট নিষ্পত্তি পরিচালনা করুন",
    "Manage custom customer orders, artisan assignments & production status": "গ্রাহকের অর্ডার, কারিগর নিয়োগ এবং উৎপাদন অবস্থা পরিচালনা করুন",
    "Manage gold & jewelry mortgages, loan disbursements & settlement redemptions": "স্বর্ণ ও গহনা বন্ধক, ঋণ বিতরণ এবং খালাস পরিচালনা করুন",
    "Manage workshop manufacturing, artisan job assignments & craft tracking": "কারখানা উৎপাদন, কারিগর কাজ বরাদ্দ এবং কাজের অগ্রগতি পর্যবেক্ষণ করুন",
    "Purchase Invoice": "ক্রয় ইনভয়েস",
    "Supplier Information": "সরবরাহকারীর তথ্য",
    "Purchase Items": "ক্রয়কৃত আইটেম",
    "Raw Metal Weight": "কাঁচা ধাতুর ওজন",
    "Finished Goods": "তৈরি পণ্য",
    "Scrap Gold": "স্ক্র্যাপ / পুরাতন স্বর্ণ",
    "Purchase Rate": "ক্রয় দর",
    "Purchase Cost": "ক্রয় খরচ",
    "Supplier Bill": "মহাজন বিল",
    "Bill No": "বিল নং",
    "Purchase Status": "ক্রয়ের অবস্থা",
    "Receive Status": "গ্রহণের অবস্থা",
    "Received": "গৃহীত",
    "Ordered": "অর্ডারকৃত",
    "Mortgage Information": "বন্ধকের তথ্য",
    "Collateral Details": "বন্ধকী পণ্যের বিবরণ",
    "Loan Amount": "ঋণের পরিমাণ",
    "Interest Rate (%)": "সুদের হার (%)",
    "Interest Rate": "সুদের হার",
    "Monthly Interest": "মাসিক সুদ",
    "Tenure (Months)": "মেয়াদ (মাস)",
    "Start Date": "শুরুর তারিখ",
    "Maturity Date": "মেয়াদপূর্তির তারিখ",
    "Mortgage Status": "বন্ধকের অবস্থা",
    "Redeemed": "খালাসকৃত",
    "Released": "খালাসকৃত",
    "Forfeited": "বাজেয়াপ্ত",
    "Auctioned": "নিলামকৃত",
    "Interest Payment": "সুদ প্রদান",
    "Principal Payment": "মূলধন প্রদান",
    "Release Items": "পণ্য খালাস করুন",
    "Release / Redeem": "খালাস / গ্রহণ",
    "Redeem": "খালাস",
    "Artisans": "কারিগরবৃন্দ",
    "Artisan Assignments": "কারিগর বরাদ্দ",
    "Artisan Payments": "কারিগর পেমেন্ট",
    "Customer Orders": "গ্রাহক অর্ডার",
    "Delivery Date": "ডেলিভারির তারিখ",
    "Order Date": "অর্ডারের তারিখ",
    "Total Weight": "মোট ওজন",
    "Advance": "অগ্রিম",
    "Invoice #": "ইনভয়েস নং",
    "Order #": "অর্ডার নং",
    "Mortgage #": "বন্ধক নং",
    "Loan": "ঋণ",
    "Disbursed": "বিতরণকৃত",

    // Production & Inventory
    "Production Batch": "উৎপাদন ব্যাচ",
    "Batch Number": "ব্যাচ নম্বর",
    "Stage": "পর্যায় / ধাপ",
    "Melting": "গলানো",
    "Casting": "ঢালাই",
    "Filing": "ঘষা-মাজা",
    "Setting": "পাথর বসানো",
    "Polishing": "পলিশিং",
    "Quality Assurance": "মান নিয়ন্ত্রণ (QA)",
    "QA Passed": "মানোত্তীর্ণ",
    "QA Failed": "বাতিল",
    "Loss / Wastage Weight": "অপচয় ওজন",
    "Worker / Artisan": "কারিগর",
    "Start Stage": "ধাপ শুরু করুন",
    "Next Stage": "পরবর্তী ধাপ",
    "Complete Batch": "ব্যাচ সম্পন্ন করুন",
    "Stock Status": "স্টকের অবস্থা",
    "Stock In": "স্টক আগমন",
    "Stock Out": "স্টক নির্গমন",
    "Adjust Stock": "স্টক সমন্বয়",
    "Adjustment Type": "সমন্বয়ের ধরন",
    "Addition": "যোগ",
    "Subtraction": "বিয়োগ",
    "Damage": "ক্ষতিগ্রস্ত",
    "Loss": "হারানো / ঘাটতি",
    "Audit": "নিরীক্ষা / অডিট",
    "Reason for Adjustment": "সমন্বয়ের কারণ",
    "Physical Count": "শারীরিক গণনা",
    "System Count": "সিস্টেম গণনা",
    "Difference": "পার্থক্য",
    "Shop Floor Stock": "দোকানের মেঝেতে মজুদ",

    // Contacts & HRM
    "Add New Customer": "নতুন গ্রাহক যোগ করুন",
    "Edit Customer": "গ্রাহক সম্পাদনা",
    "Customer Group": "গ্রাহক গ্রুপ",
    "Regular": "নিয়মিত",
    "VIP": "ভিআইপি",
    "Wholesale Customer": "পাইকারি গ্রাহক",
    "Credit Balance": "ক্রেডিট ব্যালেন্স",
    "Total Orders": "মোট অর্ডার",
    "Add New Supplier": "নতুন সরবরাহকারী যোগ করুন",
    "Edit Supplier": "সরবরাহকারী সম্পাদনা",
    "Contact Person": "যোগাযোগ ব্যক্তি",
    "Add New Artisan": "নতুন কারিগর যোগ করুন",
    "Edit Artisan": "কারিগর সম্পাদনা",
    "Skill / Specialty": "দক্ষতা / বিশেষত্ব",
    "Wages Rate": "মজুরি দর",
    "Total Work Orders": "মোট ওয়ার্ক অর্ডার",
    "Staff Name": "কর্মীর নাম",
    "Employee ID": "কর্মী আইডি",
    "Designation": "পদবী",
    "Department": "বিভাগ",
    "Joining Date": "যোগদানের তারিখ",
    "Basic Salary": "মূল বেতন",
    "Monthly Salary": "মাসিক বেতন",
    "Daily Salary": "দৈনিক মজুরি",
    "Attendance Sheet": "উপস্থিতি খাতা",
    "Present Days": "উপস্থিত দিন",
    "Absent Days": "অনুপস্থিত দিন",
    "Late Days": "বিলম্বিত দিন",
    "Leave Days": "ছুটির দিন",
    "Clock In": "ইন টাইম",
    "Clock Out": "আউট টাইম",
    "Overtime (Hours)": "ওভারটাইম (ঘণ্টা)",
    "Salary Month": "বেতনের মাস",
    "Total Allowances": "মোট ভাতা",
    "Total Deductions": "মোট কর্তন",
    "Net Salary": "নিট বেতন",
    "Pay Slip": "পে স্লিপ",
    "Generate Salary": "বেতন প্রস্তুত করুন",

    // Accounts & Reports
    "Account Head": "হিসাবের খাত",
    "Account Subhead": "উপখাত",
    "Asset": "সম্পদ",
    "Liability": "দায়",
    "Equity": "মালিকানাস্বত্ব",
    "Revenue": "রাজস্ব / আয়",
    "Expense": "খরচ",
    "Debit": "ডেবিট",
    "Credit": "ক্রেডিট",
    "Debit Amount": "ডেবিট টাকা",
    "Credit Amount": "ক্রেডিট টাকা",
    "Closing Balance": "সমাপনী ব্যালেন্স",
    "Contra Voucher": "কনট্রা ভাউচার",
    "Transfer From Account": "উৎস হিসাব",
    "Transfer To Account": "গন্তব্য হিসাব",
    "Income Source": "আয়ের উৎস",
    "Expense Purpose": "খরচের উদ্দেশ্য",
    "Cheque In Hand": "হাতে থাকা চেক",
    "Cheque In Bank": "ব্যাংকে জমা চেক",
    "Cheque Cleared": "ক্লিয়ারকৃত চেক",
    "Cheque Bounced": "প্রত্যাখ্যাত / বাউন্সড চেক",
    "Cheque Deposited": "জমাকৃত চেক",
    "Sales Summary Report": "বিক্রয় সারসংক্ষেপ রিপোর্ট",
    "Purchase Summary Report": "ক্রয় সারসংক্ষেপ রিপোর্ট",
    "Customer Due Report": "গ্রাহক বকেয়া রিপোর্ট",
    "Supplier Due Report": "মহাজন দেনা রিপোর্ট",
    "Inventory Valuation Report": "ইনভেন্টরি মূল্যায়ন রিপোর্ট",
    "Artisan Outstanding Report": "কারিগর বকেয়া রিপোর্ট",
    "Mortgage Ledger Report": "বন্ধকী খতিয়ান রিপোর্ট",
    "Profit & Loss Statement": "লাভ-ক্ষতি বিবরণী",
    "Balance Sheet": "উদ্বৃত্তপত্র / ব্যালেন্স শিট",
    "Trial Balance": "রেওয়ামিল / ট্রায়াল ব্যালেন্স",
    "Cash Flow Statement": "নগদ প্রবাহ বিবরণী",
    "Daily Register Report": "দৈনিক রেজিস্টার রিপোর্ট",
    "Date Range": "তারিখের ব্যাপ্তি",
    "From Date": "শুরুর তারিখ",
    "To Date": "শেষ তারিখ",
    "Filter by Branch": "শাখা দ্বারা ফিল্টার",
    "Generate Report": "রিপোর্ট প্রস্তুত করুন",
    "Print Report": "রিপোর্ট প্রিন্ট করুন",

    // Table Headers, Badges & Specific List Phrases
    "MOBILE": "মোবাইল নম্বর",
    "Mobile": "মোবাইল নম্বর",
    "Mobile No": "মোবাইল নম্বর",
    "Mobile Number": "মোবাইল নম্বর",
    "TOTAL BILL": "মোট বিল",
    "Total Bill": "মোট বিল",
    "Bill": "বিল",
    "BILL": "বিল",
    "RECEIVED": "গৃহীত",
    "Received": "গৃহীত",
    "DUE": "বাকি",
    "PAID": "পরিশোধিত",
    "UNPAID": "অপরিশোধিত",
    "PARTIAL": "আংশিক",
    "RETURNED": "ফেরত",
    "Returned": "ফেরত",
    "STATUS": "অবস্থা",
    "ACTION": "অ্যাকশন",
    "ACTIONS": "অ্যাকশন",
    "DATE": "তারিখ",
    "INVOICE NO": "ইনভয়েস নং",
    "INVOICE #": "ইনভয়েস নং",
    "INVOICE": "ইনভয়েস",
    "CUSTOMER": "গ্রাহক",
    "CUSTOMER NAME": "গ্রাহকের নাম",
    "CUSTOMER / DEALER": "গ্রাহক / ডিলার",
    "Customer / Dealer": "গ্রাহক / ডিলার",
    "DEALER": "ডিলার",
    "Dealer": "ডিলার",
    "All Statuses": "সকল অবস্থা",
    "ALL STATUSES": "সকল অবস্থা",
    "ALL STATUS": "সকল অবস্থা",
    "ALL BRANCHES": "সকল শাখা",
    "ALL CUSTOMERS": "সকল গ্রাহক",
    "Clear": "রিসেট",
    "CLEAR": "রিসেট",
    "Return #": "রিটার্ন নং",
    "RETURN #": "রিটার্ন নং",
    "Return No": "রিটার্ন নং",
    "RETURN NO": "রিটার্ন নং",
    "Return Date": "ফেরতের তারিখ",
    "RETURN DATE": "ফেরতের তারিখ",
    "Sale Invoice": "বিক্রয় ইনভয়েস",
    "SALE INVOICE": "বিক্রয় ইনভয়েস",
    "Sales Invoice": "বিক্রয় ইনভয়েস",
    "SALES INVOICE": "বিক্রয় ইনভয়েস",
    "Refund Amount": "ফেরত টাকা",
    "REFUND AMOUNT": "ফেরত টাকা",
    "Reason": "কারণ",
    "REASON": "কারণ",
    "New Return": "নতুন ফেরত",
    "+ New Return": "+ নতুন ফেরত",
    "+ NEW RETURN": "+ নতুন ফেরত",
    "Total Outstanding Due": "মোট বকেয়া পাওনা",
    "TOTAL OUTSTANDING DUE": "মোট বকেয়া পাওনা",
    "Total Outstanding": "মোট বকেয়া পাওনা",
    "TOTAL OUTSTANDING": "মোট বকেয়া পাওনা",
    "Total Collected": "মোট আদায়কৃত",
    "TOTAL COLLECTED": "মোট আদায়কৃত",
    "Receive Due Payment": "বকেয়া পেমেন্ট গ্রহণ",
    "RECEIVE DUE PAYMENT": "বকেয়া পেমেন্ট গ্রহণ",
    "Search Customer / Invoice": "গ্রাহক / ইনভয়েস খুঁজুন",
    "SEARCH CUSTOMER / INVOICE": "গ্রাহক / ইনভয়েস খুঁজুন",
    "Amount (৳) *": "টাকার পরিমাণ (৳) *",
    "AMOUNT (৳) *": "টাকার পরিমাণ (৳) *",
    "Reference / Trx ID": "রেফারেন্স / লেনদেন আইডি",
    "REFERENCE / TRX ID": "রেফারেন্স / লেনদেন আইডি",
    "Optional": "ঐচ্ছিক",
    "OPTIONAL": "ঐচ্ছিক",
    "Payment Receive History": "পেমেন্ট সংগ্রহের ইতিহাস",
    "PAYMENT RECEIVE HISTORY": "পেমেন্ট সংগ্রহের ইতিহাস",
    "Customer Detail": "গ্রাহকের বিবরণ",
    "CUSTOMER DETAIL": "গ্রাহকের বিবরণ",
    "Customer Details": "গ্রাহকের বিবরণ",
    "Balance Due": "অবশিষ্ট বাকি",
    "BALANCE DUE": "অবশিষ্ট বাকি",
    "Collected": "আদায়কৃত",
    "COLLECTED": "আদায়কৃত",
    "Record Payment": "পেমেন্ট রেকর্ড করুন",
    "RECORD PAYMENT": "পেমেন্ট রেকর্ড করুন",
    "Recording...": "সংরক্ষণ করা হচ্ছে...",
    "Select Invoice to Pay *": "পরিশোধের ইনভয়েস নির্বাচন করুন *",
    "-- Choose Invoice --": "-- ইনভয়েস বাছাই করুন --",
    "No sale return vouchers found.": "কোনো বিক্রয় ফেরত ভাউচার পাওয়া যায়নি।",
    "No wholesale sales records found.": "কোনো পাইকারি বিক্রয় তথ্য পাওয়া যায়নি।",
    "No sales records found.": "কোনো বিক্রয় তথ্য পাওয়া যায়নি।",
    "No history found.": "কোনো ইতিহাস পাওয়া যায়নি।",
    "No matching customers found.": "কোনো গ্রাহক পাওয়া যায়নি।",
    "Search wholesale by invoice no, dealer name or phone...": "ইনভয়েস নং, ডিলারের নাম বা ফোন নম্বর দিয়ে খুঁজুন...",
    "Search by return no, invoice no, or customer name...": "রিটার্ন নং, ইনভয়েস নং বা গ্রাহকের নাম দিয়ে খুঁজুন...",
    "Search by invoice no, customer name or phone...": "ইনভয়েস নং, গ্রাহকের নাম বা ফোন নম্বর দিয়ে খুঁজুন...",
    "Search history by name, mobile, address...": "নাম, মোবাইল বা ঠিকানা দিয়ে ইতিহাস খুঁজুন...",
    "Mobile, Name, Address, or Invoice No...": "মোবাইল, নাম, ঠিকানা বা ইনভয়েস নং...",
    "Manage wholesale dealer sales, bulk orders, and B2B invoices": "পাইকারি ডিলার বিক্রয়, বাল্ক অর্ডার এবং বিটুবি ইনভয়েস ব্যবস্থাপনা",
    "Walk-in Customer": "সরাসরি ক্রেতা",
    "Walk-in Client": "সরাসরি ক্রেতা",
    "Walk-in": "সরাসরি ক্রেতা",
    "Wholesale Client": "পাইকারি ক্রেতা",
    "Total Due": "মোট বাকি",
    "TOTAL DUE": "মোট বাকি",

    // General Actions & Notifications
    "Options": "অপশন",
    "OPTIONS": "অপশন",
    "Card / POS": "কার্ড / পিওএস",
    "Mobile Money": "মোবাইল ব্যাংকিং",
    "Payment Date *": "পেমেন্টের তারিখ *",
    "Method *": "মাধ্যম *",
    "Due Collection Receipt": "বকেয়া আদায় রসিদ",
    "Payment Date:": "পেমেন্টের তারিখ:",
    "Invoice No:": "ইনভয়েস নং:",
    "Customer Name:": "গ্রাহকের নাম:",
    "Mobile:": "মোবাইল:",
    "Total Invoice Bill:": "মোট ইনভয়েস বিল:",
    "Collected Amount:": "আদায়কৃত টাকা:",
    "Payment Method:": "পেমেন্ট মাধ্যম:",
    "Remaining Due:": "অবশিষ্ট বাকি:",
    "Reference / Trx:": "রেফারেন্স / লেনদেন:",
    "Remarks...": "মন্তব্য...",
    "Reset Filter": "ফিল্টার রিসেট",
    "Filter": "ফিল্টার",
    "FILTER": "ফিল্টার",
    "Reset": "রিসেট",
    "RESET": "রিসেট",
    "Close": "বন্ধ করুন",
    "CLOSE": "বন্ধ করুন",
    "Delete": "মুছুন",
    "DELETE": "মুছুন",
    "Select All": "সবগুলো নির্বাচন করুন",
    "Deselect All": "নির্বাচন বাতিল করুন",
    "Click to browse": "ফাইল বাছাই করতে ক্লিক করুন",
    "Drag and drop files here": "এখানে ফাইল টেনে এনে রাখুন",
    "Upload Photo": "ছবি আপলোড করুন",
    "Upload Attachment": "সংযুক্তি আপলোড করুন",
    "Confirm Action": "অ্যাকশন নিশ্চিত করুন",
    "Are you sure?": "আপনি কি নিশ্চিত?",
    "This action cannot be undone.": "এই কাজটি আর ফিরিয়ে আনা যাবে না।",
    "Operation successful": "অপারেশন সফল হয়েছে",
    "Data saved successfully": "তথ্য সফলভাবে সংরক্ষিত হয়েছে",
    "Record deleted successfully": "রেকর্ড সফলভাবে মুছে ফেলা হয়েছে",
    "Something went wrong": "কিছু ভুল হয়েছে",
    "Please check form inputs": "অনুগ্রহ করে ফর্মের তথ্য যাচাই করুন",
    "No notifications": "কোনো বিজ্ঞপ্তি নেই",
    "Mark as read": "পঠিত হিসেবে চিহ্নিত করুন",
    "Clear all notifications": "সকল বিজ্ঞপ্তি সাফ করুন"
};

// Lowercase map for case-insensitive exact phrase matching
export const EN_TO_BN_LOWER = Object.entries(EN_TO_BN_PHRASES).reduce((acc, [en, bn]) => {
    acc[en.toLowerCase().trim()] = bn;
    return acc;
}, {});

// Inverse map for converting Bengali back to English
export const BN_TO_EN_PHRASES = Object.entries(EN_TO_BN_PHRASES).reduce((acc, [en, bn]) => {
    acc[bn] = en;
    return acc;
}, {});

export const BN_TO_EN_LOWER = Object.entries(BN_TO_EN_PHRASES).reduce((acc, [bn, en]) => {
    acc[bn.trim()] = en;
    return acc;
}, {});

// Sorted arrays of keys for phrase translation
const SORTED_EN_KEYS = Object.keys(EN_TO_BN_PHRASES).sort((a, b) => b.length - a.length);
const SORTED_BN_KEYS = Object.keys(BN_TO_EN_PHRASES).sort((a, b) => b.length - a.length);

function shouldSkipElement(element) {
    if (!element || !element.tagName) return true;
    const tag = element.tagName.toUpperCase();
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE' || tag === 'SVG' || tag === 'PATH') {
        return true;
    }
    // Exclude form input fields so user typed text / numbers are never altered
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
        return true;
    }
    if (element.hasAttribute && element.hasAttribute('data-no-translate')) {
        return true;
    }
    if (element.isContentEditable) {
        return true;
    }
    return false;
}

function processDomTranslation(root, lang) {
    if (!root || typeof window === 'undefined') return;

    // 1. Process Text Nodes
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: (node) => {
                if (!node.parentElement || shouldSkipElement(node.parentElement)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (!node.nodeValue || !node.nodeValue.trim()) {
                    return NodeFilter.FILTER_SKIP;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
        let val = currentNode.nodeValue;

        if (lang === 'bn') {
            // Only process if there are ASCII characters or numbers to convert
            if (/[a-zA-Z0-9]/.test(val)) {
                const trimmed = val.trim();
                const lowerTrimmed = trimmed.toLowerCase();
                if (EN_TO_BN_PHRASES[trimmed]) {
                    val = val.replace(trimmed, EN_TO_BN_PHRASES[trimmed]);
                } else if (EN_TO_BN_LOWER[lowerTrimmed]) {
                    val = val.replace(trimmed, EN_TO_BN_LOWER[lowerTrimmed]);
                } else {
                    for (const enPhrase of SORTED_EN_KEYS) {
                        if (enPhrase.length > 2 && val.includes(enPhrase)) {
                            val = val.split(enPhrase).join(EN_TO_BN_PHRASES[enPhrase]);
                        }
                    }
                }
                // Convert digits 0-9 -> ০-৯
                if (/[0-9]/.test(val)) {
                    val = val.replace(/[0-9]/g, d => BN_DIGITS[d]);
                }
            }
        } else {
            // Only process if there are Bengali characters or numbers to convert
            if (/[\u0980-\u09FF]/.test(val)) {
                const trimmed = val.trim();
                if (BN_TO_EN_PHRASES[trimmed]) {
                    val = val.replace(trimmed, BN_TO_EN_PHRASES[trimmed]);
                } else if (BN_TO_EN_LOWER[trimmed]) {
                    val = val.replace(trimmed, BN_TO_EN_LOWER[trimmed]);
                } else {
                    for (const bnPhrase of SORTED_BN_KEYS) {
                        if (bnPhrase.length > 2 && val.includes(bnPhrase)) {
                            val = val.split(bnPhrase).join(BN_TO_EN_PHRASES[bnPhrase]);
                        }
                    }
                }
                // Convert digits ০-৯ -> 0-9
                if (/[০-৯]/.test(val)) {
                    val = val.replace(/[০-৯]/g, d => EN_DIGITS[d] || d);
                }
            }
        }

        if (currentNode.nodeValue !== val) {
            currentNode.nodeValue = val;
        }

        currentNode = walker.nextNode();
    }

    // 2. Process Input Placeholders
    const inputsWithPlaceholders = root.querySelectorAll ? root.querySelectorAll('input[placeholder], textarea[placeholder]') : [];
    inputsWithPlaceholders.forEach(el => {
        if (el.hasAttribute && el.hasAttribute('data-no-translate')) return;
        let currentPh = el.getAttribute('placeholder');
        if (!currentPh) return;

        if (lang === 'bn') {
            const trimmed = currentPh.trim();
            const lower = trimmed.toLowerCase();
            if (EN_TO_BN_PHRASES[trimmed]) {
                currentPh = EN_TO_BN_PHRASES[trimmed];
            } else if (EN_TO_BN_LOWER[lower]) {
                currentPh = EN_TO_BN_LOWER[lower];
            } else {
                for (const enPhrase of SORTED_EN_KEYS) {
                    if (enPhrase.length > 2 && currentPh.includes(enPhrase)) {
                        currentPh = currentPh.split(enPhrase).join(EN_TO_BN_PHRASES[enPhrase]);
                    }
                }
            }
            if (currentPh === '0.00' || currentPh === '0') {
                currentPh = '০';
            } else if (/[0-9]/.test(currentPh)) {
                currentPh = currentPh.replace(/[0-9]/g, d => BN_DIGITS[d]);
            }
        } else {
            const trimmed = currentPh.trim();
            if (BN_TO_EN_PHRASES[trimmed]) {
                currentPh = BN_TO_EN_PHRASES[trimmed];
            } else if (BN_TO_EN_LOWER[trimmed]) {
                currentPh = BN_TO_EN_LOWER[trimmed];
            } else {
                for (const bnPhrase of SORTED_BN_KEYS) {
                    if (bnPhrase.length > 2 && currentPh.includes(bnPhrase)) {
                        currentPh = currentPh.split(bnPhrase).join(BN_TO_EN_PHRASES[bnPhrase]);
                    }
                }
            }
            if (currentPh === '০' || currentPh === '০.০০') {
                currentPh = '0';
            } else if (/[০-৯]/.test(currentPh)) {
                currentPh = currentPh.replace(/[০-৯]/g, d => EN_DIGITS[d] || d);
            }
        }
        el.setAttribute('placeholder', currentPh);
    });
}

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('app_language') || 'en';
        }
        return 'en';
    });

    const isTranslatingRef = useRef(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('app_language', lang);
            document.documentElement.lang = lang;
        }
    }, [lang]);

    // DOM Text & Number Translation Engine
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const runTranslation = () => {
            if (isTranslatingRef.current) return;
            isTranslatingRef.current = true;
            try {
                processDomTranslation(document.body, lang);
            } catch (e) {
                console.error('Translation error:', e);
            } finally {
                isTranslatingRef.current = false;
            }
        };

        // Sweep on mount and lang change
        runTranslation();

        // Observe dynamic DOM updates
        let timeoutId = null;
        const observer = new MutationObserver(() => {
            if (isTranslatingRef.current) return;
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                runTranslation();
            }, 30);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        return () => {
            observer.disconnect();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [lang]);

    const toggleLang = () => {
        setLang(prev => prev === 'en' ? 'bn' : 'en');
    };

    /**
     * Smart translation function
     */
    const t = (keyOrText, fallback) => {
        if (!keyOrText) return fallback !== undefined ? fallback : '';

        // 1. Direct translation key match in translations dictionary
        if (translations[lang] && translations[lang][keyOrText] !== undefined) {
            return translations[lang][keyOrText];
        }

        // 2. Direct match in phrase dictionary
        if (lang === 'bn') {
            if (EN_TO_BN_PHRASES[keyOrText]) {
                return EN_TO_BN_PHRASES[keyOrText];
            }
            const trimmed = String(keyOrText).trim();
            if (EN_TO_BN_PHRASES[trimmed]) {
                return EN_TO_BN_PHRASES[trimmed];
            }
            const lower = trimmed.toLowerCase();
            if (EN_TO_BN_LOWER[lower]) {
                return EN_TO_BN_LOWER[lower];
            }
            return fallback !== undefined ? fallback : (translations.en?.[keyOrText] || keyOrText);
        } else {
            // English Mode
            if (BN_TO_EN_PHRASES[keyOrText]) {
                return BN_TO_EN_PHRASES[keyOrText];
            }
            const trimmed = String(keyOrText).trim();
            if (BN_TO_EN_PHRASES[trimmed]) {
                return BN_TO_EN_PHRASES[trimmed];
            }
            if (BN_TO_EN_LOWER[trimmed]) {
                return BN_TO_EN_LOWER[trimmed];
            }
            if (translations.en && translations.en[keyOrText] !== undefined) {
                return translations.en[keyOrText];
            }
            return fallback !== undefined ? fallback : keyOrText;
        }
    };

    const formatNumber = (val, options = {}) => {
        return formatNumberWithLang(val, lang, options);
    };

    const toBn = (val) => toBengaliNumber(val);
    const toEn = (val) => toEnglishNumber(val);

    return (
        <LanguageContext.Provider value={{ 
            lang, 
            setLang, 
            toggleLang, 
            t, 
            formatNumber, 
            toBn, 
            toEn,
            toBengaliNumber,
            toEnglishNumber
        }}>
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
