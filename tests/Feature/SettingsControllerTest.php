<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\ChartOfAccount;
use App\Models\OpeningBalance;
use App\Models\Purity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SettingsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::create([
            'name' => 'Head Office',
            'code' => 'HO',
            'status' => 'active',
            'is_head_office' => true,
        ]);

        $this->user = User::factory()->create([
            'branch_id' => $this->branch->id,
        ]);

        Role::firstOrCreate(['name' => 'sales_executive']);
    }

    public function test_roles_and_permissions_page_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('settings.roles.index'));

        $response->assertStatus(200);
    }

    public function test_user_permissions_can_be_updated()
    {
        $role = Role::where('name', 'sales_executive')->first();
        $targetUser = User::factory()->create(['branch_id' => $this->branch->id]);

        $response = $this->actingAs($this->user)
            ->put(route('settings.roles.update-user', $targetUser->id), [
                'role_id' => $role->id,
            ]);

        $response->assertRedirect(route('settings.roles.index'));
        $this->assertTrue($targetUser->fresh()->hasRole('sales_executive'));
    }

    public function test_metal_prices_page_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('settings.metal-prices.index'));

        $response->assertStatus(200);
    }

    public function test_purities_page_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('settings.purities.index'));

        $response->assertStatus(200);
    }

    public function test_purity_can_be_created()
    {
        $response = $this->actingAs($this->user)
            ->post(route('settings.purities.store'), [
                'metal_type' => 'gold',
                'name' => '22K (916)',
                'percentage' => 91.60,
                'is_active' => true,
            ]);

        $response->assertRedirect(route('settings.purities.index'));
        $this->assertDatabaseHas('purities', [
            'name' => '22K (916)',
            'metal_type' => 'gold',
        ]);
    }

    public function test_notification_settings_page_loads_and_updates()
    {
        $response = $this->actingAs($this->user)
            ->get(route('settings.notifications.index'));

        $response->assertStatus(200);

        $updateResponse = $this->actingAs($this->user)
            ->post(route('settings.notifications.update'), [
                'low_stock_threshold' => 10,
                'enable_low_stock_alerts' => true,
                'enable_payment_due_reminders' => true,
                'enable_daily_summary_email' => false,
                'summary_recipient_email' => 'admin@jewelry.com',
                'sms_gateway_active' => false,
                'sms_api_key' => '',
                'sms_sender_id' => 'JEWELRY',
                'customer_order_notification' => true,
                'sales_notification' => true,
                'payment_received_notification' => true,
                'sales_return_notification' => true,
            ]);

        $updateResponse->assertRedirect(route('settings.notifications.index'));
        $this->assertDatabaseHas('system_settings', [
            'key' => 'low_stock_threshold',
            'value' => '10',
        ]);
        $this->assertDatabaseHas('system_settings', [
            'key' => 'customer_order_notification',
            'value' => '1',
        ]);
    }

    public function test_opening_accounts_page_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('settings.opening-accounts.index'));

        $response->assertStatus(200);
    }

    public function test_opening_balance_can_be_stored_and_deleted()
    {
        $account = ChartOfAccount::create([
            'code' => '1010',
            'name' => 'Cash in Hand',
            'account_type' => 'asset',
            'is_system' => true,
        ]);

        $storeResponse = $this->actingAs($this->user)
            ->post(route('settings.opening-accounts.store-balance'), [
                'date' => '2026-08-11',
                'account_type' => 'asset',
                'chart_of_account_id' => $account->id,
                'amount' => 50000,
                'note' => 'Initial cash setup',
            ]);

        $storeResponse->assertRedirect(route('settings.opening-accounts.index'));
        $this->assertDatabaseHas('opening_balances', [
            'chart_of_account_id' => $account->id,
            'amount' => 50000,
        ]);

        $balance = OpeningBalance::first();

        $deleteResponse = $this->actingAs($this->user)
            ->delete(route('settings.opening-accounts.destroy-balance', $balance->id));

        $deleteResponse->assertRedirect(route('settings.opening-accounts.index'));
        $this->assertDatabaseMissing('opening_balances', [
            'id' => $balance->id,
        ]);
    }

    public function test_account_config_page_loads_and_updates()
    {
        $response = $this->actingAs($this->user)
            ->get(route('settings.account-config.index'));

        $response->assertStatus(200);

        $updateResponse = $this->actingAs($this->user)
            ->post(route('settings.account-config.update'), [
                'financial_year_start' => 1,
                'currency_code' => 'BDT',
                'currency_symbol' => 'BDT',
                'default_vat_rate' => 5.00,
                'invoice_prefix' => 'INV-',
                'purchase_prefix' => 'PUR-',
                'order_prefix' => 'ORD-',
                'mortgage_prefix' => 'MORT-',
                'receipt_footer_text' => 'Thank you for shopping.',
            ]);

        $updateResponse->assertRedirect(route('settings.account-config.index'));
        $this->assertDatabaseHas('system_settings', [
            'key' => 'currency_symbol',
            'value' => 'BDT',
        ]);
    }
}
