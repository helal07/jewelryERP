<?php

namespace Tests\Feature\Auth;

use App\Models\Branch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $branch = Branch::create([
            'name' => 'Main Showroom',
            'code' => 'MS01',
            'status' => 'active',
        ]);

        $response = $this->get('/login');

        $response->assertStatus(200);
        $response->assertSee('Main Showroom');
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_authenticate_with_selected_branch(): void
    {
        $branch = Branch::create([
            'name' => 'Gulshan Branch',
            'code' => 'GB01',
            'status' => 'active',
        ]);

        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'branch_id' => $branch->id,
        ]);

        $this->assertAuthenticated();
        $response->assertSessionHas('active_branch_id', $branch->id);
        $this->assertEquals($branch->id, $user->fresh()->branch_id);
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
