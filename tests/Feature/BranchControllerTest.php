<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Branch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class BranchControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $unauthorizedUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Reset permission cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create all permissions that BranchPolicy uses
        Permission::firstOrCreate(['name' => 'branches.view']);
        Permission::firstOrCreate(['name' => 'branches.create']);
        Permission::firstOrCreate(['name' => 'branches.edit']);
        Permission::firstOrCreate(['name' => 'branches.delete']);

        $this->adminUser = User::factory()->create();
        $this->adminUser->givePermissionTo(['branches.view', 'branches.create', 'branches.edit', 'branches.delete']);

        $this->unauthorizedUser = User::factory()->create();
    }

    public function test_index_loads_for_authorized_user(): void
    {
        $response = $this->actingAs($this->adminUser)->get(route('branches.index'));
        $response->assertStatus(200);
    }

    public function test_index_returns_403_for_unauthorized_user(): void
    {
        $response = $this->actingAs($this->unauthorizedUser)->get(route('branches.index'));
        $response->assertStatus(403);
    }

    public function test_store_creates_branch(): void
    {
        $response = $this->actingAs($this->adminUser)->post(route('branches.store'), [
            'name' => 'Test Branch',
            'code' => 'TB-01',
            'status' => 'active',
            'is_head_office' => false,
        ]);

        $response->assertRedirect(route('branches.index'));
        $this->assertDatabaseHas('branches', [
            'code' => 'TB-01',
        ]);
    }

    public function test_sub_branch_user_cannot_create_branch(): void
    {
        $subBranch = Branch::create([
            'name' => 'Sub Branch 1',
            'code' => 'SB-01',
            'status' => 'active',
            'is_head_office' => false,
        ]);

        $subBranchUser = User::factory()->create([
            'branch_id' => $subBranch->id,
        ]);
        $subBranchUser->givePermissionTo(['branches.view', 'branches.create']);

        $response = $this->actingAs($subBranchUser)->post(route('branches.store'), [
            'name' => 'Attempted Branch',
            'code' => 'ATT-01',
            'status' => 'active',
        ]);

        $response->assertRedirect(route('branches.index'));
        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('branches', [
            'code' => 'ATT-01',
        ]);
    }
}
