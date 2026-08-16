<?php

namespace Tests\Feature;

use App\Models\Branch;
use App\Models\ProductCategory;
use App\Models\Product;
use App\Models\Purity;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ProductCategoryControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::create(['name' => 'product_categories.view']);
        Permission::create(['name' => 'product_categories.create']);
        Permission::create(['name' => 'product_categories.edit']);
        Permission::create(['name' => 'product_categories.delete']);

        $this->adminUser = User::factory()->create();
        $this->adminUser->givePermissionTo(['product_categories.view', 'product_categories.create', 'product_categories.edit', 'product_categories.delete']);

        $this->unauthorizedUser = User::factory()->create();
    }

    public function test_index_loads_for_authorized_user(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('product-categories.index'));
        $response->assertStatus(200);
    }

    public function test_index_returns_403_for_unauthorized_user(): void
    {
        $response = $this->actingAs($this->unauthorizedUser)->get(route('product-categories.index'));
        $response->assertStatus(403);
    }

    public function test_store_creates_category_with_auto_generated_code(): void
    {
        $response = $this->actingAs($this->adminUser)->post(route('product-categories.store'), [
            'name' => 'Test Category',
            'metal_type' => 'gold',
            'parent_id' => null,
        ]);

        $response->assertRedirect(route('product-categories.index'));
        
        $category = ProductCategory::where('name', 'Test Category')->first();
        $this->assertNotNull($category);
        $this->assertStringStartsWith('CAT-', $category->code);
    }

    public function test_update_modifies_category(): void
    {
        $category = ProductCategory::factory()->create([
            'name' => 'Old Name',
            'metal_type' => 'gold'
        ]);

        $response = $this->actingAs($this->adminUser)->put(route('product-categories.update', $category), [
            'name' => 'New Name',
            'metal_type' => 'silver',
            'parent_id' => null,
        ]);

        $response->assertRedirect(route('product-categories.index'));
        $this->assertDatabaseHas('product_categories', [
            'id' => $category->id,
            'name' => 'New Name',
            'metal_type' => 'silver',
        ]);
    }

    public function test_destroy_soft_deletes_empty_category(): void
    {
        $category = ProductCategory::factory()->create();

        $response = $this->actingAs($this->adminUser)->delete(route('product-categories.destroy', $category));

        $response->assertRedirect(route('product-categories.index'));
        $this->assertSoftDeleted('product_categories', ['id' => $category->id]);
    }

    public function test_destroy_prevented_if_category_has_products(): void
    {
        $category = ProductCategory::factory()->create();
        
        // Add a product to the category
        Product::factory()->create([
            'category_id' => $category->id,
        ]);

        $response = $this->actingAs($this->adminUser)->delete(route('product-categories.destroy', $category));

        $response->assertRedirect(route('product-categories.index'));
        $response->assertSessionHas('error', 'Cannot delete category with existing products.');
        $this->assertDatabaseHas('product_categories', [
            'id' => $category->id,
            'deleted_at' => null, // Should not be soft deleted
        ]);
    }
}
