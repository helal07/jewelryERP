<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        if ($user) {
            $user->loadMissing('branch');
        }

        $activeBranch = null;
        if ($user && $user->branch) {
            $activeBranch = $user->branch;
        } elseif ($request->session()->has('active_branch_id')) {
            $activeBranch = \App\Models\Branch::find($request->session()->get('active_branch_id'));
        }

        $isMainBranch = $user ? $user->isMainBranch() : true;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'active_branch' => $activeBranch,
                'is_main_branch' => $isMainBranch,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
            ],
        ];
    }
}
