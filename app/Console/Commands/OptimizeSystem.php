<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class OptimizeSystem extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:optimize';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Optimize database performance, clean storage WAL checkpoints, and rebuild Laravel application cache';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting automated database & system performance optimization...');

        $driver = DB::connection()->getDriverName();

        // 1. Database Optimization
        $this->info("1. Optimizing Database ({$driver})...");
        try {
            if ($driver === 'sqlite') {
                DB::statement('PRAGMA journal_mode = WAL;');
                DB::statement('PRAGMA synchronous = NORMAL;');
                DB::statement('PRAGMA busy_timeout = 5000;');
                DB::statement('PRAGMA optimize;');
                DB::statement('VACUUM;');
                DB::statement('PRAGMA wal_checkpoint(TRUNCATE);');
                $this->info('  ✓ SQLite WAL mode enabled, database vacuumed & optimized.');
            } elseif (in_array($driver, ['mysql', 'mariadb'])) {
                $tables = DB::select('SHOW TABLES');
                $dbName = config('database.connections.mysql.database');
                $prop = "Tables_in_" . $dbName;

                foreach ($tables as $t) {
                    $tableName = $t->$prop ?? reset($t);
                    if ($tableName) {
                        DB::statement("OPTIMIZE TABLE `{$tableName}`");
                    }
                }
                $this->info('  ✓ MySQL/MariaDB tables optimized.');
            }
        } catch (\Throwable $e) {
            $this->error('  ✗ Database optimization warning: ' . $e->getMessage());
        }

        // 2. Cache Clearing & Re-building
        $this->info('2. Clearing & Rebuilding Application Cache...');
        try {
            Artisan::call('cache:clear');
            $this->info('  ✓ Application cache cleared.');

            Artisan::call('config:cache');
            $this->info('  ✓ Configuration cached.');

            Artisan::call('route:cache');
            $this->info('  ✓ Routes cached.');

            Artisan::call('view:cache');
            $this->info('  ✓ Compiled views cached.');

            Artisan::call('event:cache');
            $this->info('  ✓ Events cached.');
        } catch (\Throwable $e) {
            $this->error('  ✗ Cache rebuilding warning: ' . $e->getMessage());
        }

        $this->info('=====================================================');
        $this->info('🚀 SYSTEM OPTIMIZATION COMPLETED! Software is now super fast.');
        $this->info('=====================================================');

        return Command::SUCCESS;
    }
}
