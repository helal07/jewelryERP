# Workspace Rules & Conventions

## 1. UI & Table Action Dropdowns
- **Table Container Overflow**: All table containers rendering absolute-positioned Action dropdown menus MUST use `overflow-x-visible pb-24` instead of `overflow-x-auto`. This prevents dropdown menus from being clipped or cut off by the table container.
- **Action Buttons**: Every table list action button MUST use the standard system `<Dropdown>` component with the signature pill trigger:
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
      <Dropdown.Content align="right" width="48">
          <button
              type="button"
              onClick={(e) => {
                  e.stopPropagation();
                  // action handler
              }}
              className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none flex items-center cursor-pointer"
          >
              Action Label
          </button>
      </Dropdown.Content>
  </Dropdown>
  ```
- **Event Propagation**: Explicitly call `e.stopPropagation()` on all click handlers inside `<Dropdown.Content>` to prevent event bubbling issues.

## 2. Currency Formatting
- Standard currency for all display amounts in the software is **BDT** (e.g. `BDT 1,000.00`). Never hardcode dollar signs (`$`).

## 3. Required Imports
- Always verify all page components include required imports:
  - `import React, { useState } from 'react';`
  - `import { Head, Link, router, useForm } from '@inertiajs/react';`
  - `import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';`
  - `import Pagination from '@/Components/Pagination';`
  - `import Dropdown from '@/Components/Dropdown';`

## 4. Pagination Standard
- All index list pages across the application MUST use **10 items per page** (`paginate(10)` or `paginate(10)->withQueryString()`).
- All list views must include the `<Pagination />` component at the bottom of the table card.

## 5. Quality & Build Verification
- Always execute `npm run build` to confirm zero compilation errors before declaring any task complete.

## 6. Modal / Dialog Pattern — ALWAYS use React Portal
- **Problem**: `AuthenticatedLayout` wraps content in `<div className="flex h-screen overflow-hidden">` and `<main className="flex-1 overflow-y-auto">`. These `overflow` properties create a containing block that clips `position: fixed` children, causing modals to appear cut off or incorrectly positioned.
- **Rule**: ALL modal/dialog components MUST be rendered via `createPortal` into `document.body` so they escape the layout's overflow context.
- **Template**:
  ```jsx
  import { createPortal } from 'react-dom';

  // Inside the component return:
  {modalOpen && createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
           style={{ background: 'rgba(15,23,42,0.55)' }}>
          <div className="bg-white rounded-3xl w-full shadow-2xl flex flex-col"
               style={{ maxWidth: '660px', maxHeight: '90vh' }}>
              {/* sticky header */}
              <div className="flex-shrink-0 px-6 py-4 border-b ...">...</div>
              {/* scrollable body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">...</div>
              {/* sticky footer */}
              <div className="flex-shrink-0 px-6 py-4 border-t ...">...</div>
          </div>
      </div>,
      document.body
  )}
  ```

## 7. Brand Color
- The primary brand color for this application is **`rgb(177, 118, 51)`** — a warm gold/amber.
- All primary action buttons (Add New, Save, Submit, Confirm) MUST use `style={{ backgroundColor: 'rgb(177,118,51)' }}` with `text-white`.
- Hover state: use `style={{ backgroundColor: 'rgb(155,100,40)' }}` (slightly darker).
- Do NOT use Tailwind `bg-teal-*`, `bg-blue-*`, or `bg-indigo-*` for primary action buttons.
