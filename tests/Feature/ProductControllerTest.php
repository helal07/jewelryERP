<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Purity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $unauthorizedUser;
    protected Branch $branch;
    protected ProductCategory $category;
    protected Purity $purity;

    protected function setUp(): void
    {
        parent::setUp();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::create(['name' => 'products.view']);
        Permission::create(['name' => 'products.create']);
        Permission::create(['name' => 'products.edit']);
        Permission::create(['name' => 'products.delete']);
        Permission::create(['name' => 'products.print']);

        $this->branch = Branch::factory()->create();
        $this->purity = Purity::factory()->create(['metal_type' => 'gold', 'name' => '22K', 'percentage' => 91.67]);
        $this->category = ProductCategory::factory()->create(['metal_type' => 'gold']);

        $this->adminUser = User::factory()->create(['branch_id' => $this->branch->id]);
        $this->adminUser->givePermissionTo(['products.view', 'products.create', 'products.edit', 'products.delete', 'products.print']);

        $this->unauthorizedUser = User::factory()->create();
    }

    public function test_index_loads_for_authorized_user(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('products.index'));
        $response->assertStatus(200);
    }

    public function test_index_returns_403_for_unauthorized_user(): void
    {
        $response = $this->actingAs($this->unauthorizedUser)->get(route('products.index'));
        $response->assertStatus(403);
    }

    public function test_create_page_loads_for_authorized_user(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('products.create'));
        $response->assertStatus(200);
    }

    public function test_store_creates_product(): void
    {
        $response = $this->actingAs($this->adminUser)->post(route('products.store'), [
            'products' => [
                [
                    'name' => 'Test Gold Necklace',
                    'category_id' => $this->category->id,
                    'metal_type' => 'gold',
                    'purity_id' => $this->purity->id,
                    'gross_weight' => 10.500,
                    'stone_weight' => 0.500,
                    'making_charge_type' => 'fixed',
                    'making_charge_value' => 2000.00,
                    'stone_charge' => 500.00,
                    'wastage_percentage' => 2.00,
                    'unit' => 'piece',
                    'status' => 'active',
                ]
            ]
        ]);

        $response->assertRedirect(route('products.index'));
        $this->assertDatabaseHas('products', [
            'name' => 'Test Gold Necklace',
            'metal_type' => 'gold',
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $response = $this->actingAs($this->adminUser)->post(route('products.store'), [
            'products' => [
                [] // empty product
            ]
        ]);

        $response->assertSessionHasErrors([
            'products.0.name', 
            'products.0.category_id', 
            'products.0.metal_type', 
            'products.0.gross_weight', 
            'products.0.making_charge_type', 
            'products.0.making_charge_value', 
            'products.0.unit', 
            'products.0.status'
        ]);
    }

    public function test_net_weight_computed_correctly_on_store(): void
    {
        $this->actingAs($this->adminUser)->post(route('products.store'), [
            'products' => [
                [
                    'name' => 'Weight Test Product',
                    'category_id' => $this->category->id,
                    'metal_type' => 'gold',
                    'purity_id' => $this->purity->id,
                    'gross_weight' => 15.750,
                    'stone_weight' => 2.250,
                    'making_charge_type' => 'per_gram',
                    'making_charge_value' => 500.00,
                    'stone_charge' => 0,
                    'wastage_percentage' => 0,
                    'unit' => 'piece',
                    'status' => 'active',
                ]
            ]
        ]);

        $product = Product::where('name', 'Weight Test Product')->first();
        $this->assertNotNull($product);
        // Server-side net_weight = 15.750 - 2.250 = 13.500
        $this->assertEquals(13.500, (float) $product->net_weight);
    }

    public function test_show_displays_product(): void
    {
        $product = Product::factory()->create([
            'branch_id' => $this->branch->id,
            'category_id' => $this->category->id,
            'purity_id' => $this->purity->id,
        ]);

        $response = $this->actingAs($this->adminUser)->get(route('products.show', $product));
        $response->assertStatus(200);
    }

    public function test_destroy_soft_deletes_product(): void
    {
        $product = Product::factory()->create([
            'branch_id' => $this->branch->id,
            'category_id' => $this->category->id,
            'purity_id' => $this->purity->id,
        ]);

        $response = $this->actingAs($this->adminUser)->delete(route('products.destroy', $product));

        $response->assertRedirect(route('products.index'));
        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_unauthorized_user_cannot_create_product(): void
    {
        $response = $this->actingAs($this->unauthorizedUser)->post(route('products.store'), [
            'products' => [
                [
                    'name' => 'Unauthorized Product',
                    'category_id' => $this->category->id,
                    'metal_type' => 'gold',
                    'purity_id' => $this->purity->id,
                    'gross_weight' => 5.000,
                    'stone_weight' => 0,
                    'making_charge_type' => 'fixed',
                    'making_charge_value' => 1000,
                    'unit' => 'piece',
                    'status' => 'active',
                ]
            ]
        ]);

        $response->assertStatus(403);
        $this->assertDatabaseMissing('products', ['name' => 'Unauthorized Product']);
    }

    public function test_print_labels_index_loads(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('products.print-labels'));
        $response->assertStatus(200);
    }

    public function test_search_for_labels_returns_json(): void
    {
        $product = Product::factory()->create([
            'name' => 'Searchable Gold Ring',
            'sku' => 'SRING-01',
            'category_id' => $this->category->id,
            'purity_id' => $this->purity->id,
        ]);

        $response = $this->actingAs($this->adminUser)->get(route('products.print-labels.search', ['search' => 'Searchable']));
        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Searchable Gold Ring']);
    }

    public function test_print_labels_preview_loads_with_batch_ids(): void
    {
        $product1 = Product::factory()->create([
            'category_id' => $this->category->id,
            'purity_id' => $this->purity->id,
        ]);
        $product2 = Product::factory()->create([
            'category_id' => $this->category->id,
            'purity_id' => $this->purity->id,
        ]);

        $response = $this->actingAs($this->adminUser)->get(route('products.print-labels.preview', [
            'product_ids' => [$product1->id, $product2->id],
        ]));
        $response->assertStatus(200);
    }

    public function test_single_product_print_label_loads(): void
    {
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'purity_id' => $this->purity->id,
        ]);

        $response = $this->actingAs($this->adminUser)->get(route('products.print-label', $product));
        $response->assertStatus(200);
    }
}
