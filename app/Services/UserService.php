<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => Hash::make($data['password']),
                'branch_id' => $data['branch_id'] ?? null,
                'status' => $data['status'] ?? 'active',
            ]);

            if (isset($data['role'])) {
                $user->assignRole($data['role']);
            }

            return $user;
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $updateData = [
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'branch_id' => $data['branch_id'] ?? null,
                'status' => $data['status'] ?? 'active',
            ];

            if (!empty($data['password'])) {
                $updateData['password'] = Hash::make($data['password']);
            }

            $user->update($updateData);

            if (isset($data['role'])) {
                $user->syncRoles([$data['role']]);
            }

            return $user;
        });
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }
}
