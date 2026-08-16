<?php

namespace App\Services;

use App\Models\Staff;

class StaffService
{
    public function createStaff(array $data)
    {
        return Staff::create($data);
    }

    public function updateStaff(Staff $staff, array $data)
    {
        $staff->update($data);
        return $staff;
    }

    public function deleteStaff(Staff $staff)
    {
        $staff->delete();
    }
}
