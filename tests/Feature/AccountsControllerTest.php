<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\ChartOfAccount;
use App\Models\Cheque;
use App\Models\ContraEntry;
use App\Models\OtherExpense;
use App\Models\OtherIncome;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Branch $branch;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::create([
            'name' => 'Main Branch',
            'code' => 'MAIN',
            'status' => 'active',
        ]);

        $this->user = User::factory()->create([
            'branch_id' => $this->branch->id,
        ]);
    }

    public function test_chart_of_accounts_index_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('accounts.chart-of-accounts.index'));

        $response->assertStatus(200);
    }

    public function test_chart_of_accounts_can_be_created()
    {
        $response = $this->actingAs($this->user)
            ->post(route('accounts.chart-of-accounts.store'), [
                'code' => '1010',
                'name' => 'Cash in Hand',
                'account_type' => 'asset',
                'opening_balance' => 50000,
                'description' => 'Main petty cash',
                'is_active' => true,
            ]);

        $response->assertRedirect(route('accounts.chart-of-accounts.index'));
        $this->assertDatabaseHas('chart_of_accounts', [
            'code' => '1010',
            'name' => 'Cash in Hand',
        ]);
    }

    public function test_contra_entry_index_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('accounts.contra.index'));

        $response->assertStatus(200);
    }

    public function test_other_income_index_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('accounts.other-incomes.index'));

        $response->assertStatus(200);
    }

    public function test_other_expense_index_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('accounts.other-expenses.index'));

        $response->assertStatus(200);
    }

    public function test_cheque_index_loads()
    {
        $response = $this->actingAs($this->user)
            ->get(route('accounts.cheques.index'));

        $response->assertStatus(200);
    }
}
