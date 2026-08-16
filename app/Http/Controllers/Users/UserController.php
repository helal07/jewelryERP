<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Branch;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Services\UserService;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(private UserService $userService)
    {
    }

    public function index(Request $request)
    {
        $this->authorize('users.view');

        $users = User::with(['roles', 'branch'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function create()
    {
        $this->authorize('users.create');

        return Inertia::render('Users/Create', [
            'branches' => Branch::all(['id', 'name']),
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function store(StoreUserRequest $request)
    {
        $this->userService->create($request->validated());

        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        $this->authorize('users.edit');

        $user->load(['roles', 'branch']);

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'branches' => Branch::all(['id', 'name']),
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $this->userService->update($user, $request->validated());

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $this->authorize('users.delete');

        $this->userService->delete($user);

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
