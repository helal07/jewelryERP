<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_sales_report_page_loads()
    {
        $response = $this->actingAs($this->user)->get(route('reports.sales'));
        $response->assertStatus(200);
    }

    public function test_purchase_report_page_loads()
    {
        $response = $this->actingAs($this->user)->get(route('reports.purchase'));
        $response->assertStatus(200);
    }

    public function test_inventory_report_page_loads()
    {
        $response = $this->actingAs($this->user)->get(route('reports.inventory'));
        $response->assertStatus(200);
    }

    public function test_accounts_report_page_loads()
    {
        $response = $this->actingAs($this->user)->get(route('reports.accounts'));
        $response->assertStatus(200);
    }
}
