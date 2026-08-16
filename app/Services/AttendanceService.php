<?php

namespace App\Services;

use App\Models\Attendance;

class AttendanceService
{
    public function createAttendance(array $data)
    {
        return Attendance::create($data);
    }

    public function updateAttendance(Attendance $attendance, array $data)
    {
        $attendance->update($data);
        return $attendance;
    }

    public function deleteAttendance(Attendance $attendance)
    {
        $attendance->delete();
    }
}
