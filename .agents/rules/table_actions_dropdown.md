# Table Actions Dropdown — Design & Behavioral Standard

## Overview
All data tables across the ERP application must strictly use the unified **Actions Dropdown** standard.

## 1. Action Trigger Button Specs
- **Style**: Pill Capsule (`rounded-full px-3 py-1 text-[13px] font-medium`)
- **Colors**: Border `#00b4d8`, Text `#00b4d8`, Background `bg-white`, Hover `hover:bg-[#00b4d8]/10`
- **Icon**: Right Chevron indicator (`<svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current">`)

```jsx
<Dropdown>
    <Dropdown.Trigger>
        <button
            type="button"
            className="inline-flex items-center px-3 py-1 border border-[#00b4d8] rounded-full text-[13px] font-medium text-[#00b4d8] bg-white hover:bg-[#00b4d8]/10 focus:outline-none transition ease-in-out duration-150"
        >
            Actions
            <svg className="ml-1.5 -mr-0.5 h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>
    </Dropdown.Trigger>
```

## 2. Dropdown Menu Items & Color Coding
- **View Details**: `Eye` icon (`text-indigo-500`)
- **Edit Record**: `Edit3` icon (`text-blue-500`)
- **Print Invoice / Label**: `Printer` icon (`text-emerald-500`)
- **Receive Payment / Financial Action**: `DollarSign` icon (`text-amber-500`)
- **Delete / Cancel**: `Trash2` / `XCircle` icon (`text-red-600`)

```jsx
    <Dropdown.Content align="right" width="48">
        <Dropdown.Link href={route('orders.show', order.id)} className="flex items-center text-gray-700">
            <Eye className="w-4 h-4 mr-2 text-indigo-500" /> View Details
        </Dropdown.Link>
        <Dropdown.Link href={route('orders.edit', order.id)} className="flex items-center text-gray-700">
            <Edit3 className="w-4 h-4 mr-2 text-blue-500" /> Edit Order
        </Dropdown.Link>
        <Dropdown.Link href={route('orders.show', order.id)} className="flex items-center text-gray-700">
            <Printer className="w-4 h-4 mr-2 text-emerald-500" /> Print Invoice
        </Dropdown.Link>
        <button onClick={() => openPaymentModal(order)} className="w-full text-left px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 flex items-center transition duration-150">
            <DollarSign className="w-4 h-4 mr-2 text-amber-500" /> Receive Payment
        </button>
        <div className="border-t border-gray-100"></div>
        <button onClick={() => handleCancelOrder(order)} className="w-full text-left px-4 py-2 text-sm leading-5 text-red-600 hover:bg-red-50 flex items-center transition duration-150">
            <XCircle className="w-4 h-4 mr-2" /> Cancel Order
        </button>
    </Dropdown.Content>
</Dropdown>
```

## 3. Table Container Rules
- Table wrapper element MUST include `min-h-[450px]` to ensure floating dropdown menus unfold without clipping.
