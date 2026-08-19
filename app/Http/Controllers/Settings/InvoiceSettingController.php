<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SystemSetting;
use Illuminate\Support\Facades\Storage;

class InvoiceSettingController extends Controller
{
    public function index()
    {
        $settings = SystemSetting::where('group', 'invoice')->pluck('value', 'key')->toArray();

        return Inertia::render('Settings/InvoiceSettings/Index', [
            'settings' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'invoice_terms' => 'nullable|string',
            'invoice_show_qr' => 'nullable|boolean',
            'invoice_use_letterhead' => 'nullable|boolean',
            'invoice_use_footer' => 'nullable|boolean',
            'whatsapp_template' => 'nullable|string',
            'invoice_letterhead' => 'nullable|image|max:2048',
            'invoice_footer' => 'nullable|image|max:2048',
        ]);

        $keys = [
            'invoice_terms', 
            'invoice_show_qr', 
            'invoice_use_letterhead', 
            'invoice_use_footer', 
            'whatsapp_template'
        ];

        foreach ($keys as $key) {
            SystemSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $request->boolean($key) ? '1' : ($request->has($key) && $request->input($key) !== false ? $request->input($key) : '0'), 'group' => 'invoice']
            );
            
            // Re-handle strings specially if they are not boolean toggles
            if (in_array($key, ['invoice_terms', 'whatsapp_template'])) {
                SystemSetting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $request->input($key), 'group' => 'invoice']
                );
            }
        }

        if ($request->hasFile('invoice_letterhead')) {
            $path = $request->file('invoice_letterhead')->store('invoices', 'public');
            SystemSetting::updateOrCreate(
                ['key' => 'invoice_letterhead'],
                ['value' => $path, 'group' => 'invoice']
            );
        }

        if ($request->hasFile('invoice_footer')) {
            $path = $request->file('invoice_footer')->store('invoices', 'public');
            SystemSetting::updateOrCreate(
                ['key' => 'invoice_footer'],
                ['value' => $path, 'group' => 'invoice']
            );
        }

        return redirect()->back()->with('success', 'Invoice settings updated successfully.');
    }
}
