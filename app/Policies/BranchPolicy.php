<?php

namespace App\Policies;

use App\Models\Branch;
use App\Models\User;

class BranchPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('branches.view');
    }

    public function view(User $user, Branch $branch): bool
    {
        return $user->hasPermissionTo('branches.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('branches.create') && $user->isMainBranch();
    }

    public function update(User $user, Branch $branch): bool
    {
        return $user->hasPermissionTo('branches.edit') && $user->isMainBranch();
    }

    public function delete(User $user, Branch $branch): bool
    {
        return $user->hasPermissionTo('branches.delete') && $user->isMainBranch();
    }

    public function restore(User $user, Branch $branch): bool
    {
        return false;
    }

    public function forceDelete(User $user, Branch $branch): bool
    {
        return false;
    }
}
