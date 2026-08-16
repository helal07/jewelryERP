<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Implicitly grant 'Super Administrator' role all permissions
        Gate::before(function ($user, $ability) {
            return ($user->hasRole('super_administrator') || $user->hasRole('super-admin')) ? true : null;
        });
    }
}
