<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = \Illuminate\Support\Facades\DB::select('SHOW TABLES');
$tableNames = [];
foreach ($tables as $table) {
    $tableNames[] = (array) $table;
}
$tableNames = array_map(function($t) { return array_values($t)[0]; }, $tableNames);

echo implode("\n", $tableNames);
