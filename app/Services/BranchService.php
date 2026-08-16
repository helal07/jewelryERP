<?php

namespace App\Services;

use App\Models\Branch;

class BranchService
{
    public function createBranch(array $data): Branch
    {
        return Branch::create($data);
    }

    public function updateBranch(Branch $branch, array $data): Branch
    {
        $branch->update($data);
        return $branch;
    }

    public function deleteBranch(Branch $branch): bool
    {
        return $branch->delete();
    }
}
