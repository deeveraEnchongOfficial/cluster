<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class RunSync extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync {--module=} {--file=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manually run synchronization for specific or all modules.';

    /**
     * Available modules to sync.
     *
     * @var array
     */
    protected array $modules = [
        'contact' => \App\Modules\Acumatica\Contact\ContactSync::class,
        // 'lead' => \App\Modules\Acumatica\Lead\LeadSync::class,
        'customer' => \App\Modules\Acumatica\Customer\CustomerSync::class,
        'warehouse' => \App\Modules\Acumatica\Warehouse\WarehouseSync::class,
        'stock_item' => \App\Modules\Acumatica\StockItem\StockItemSync::class,
        'non_stock_item' => \App\Modules\Acumatica\NonStockItem\NonStockItemSync::class,
        'sales_order' => \App\Modules\Acumatica\SalesOrder\SalesOrderSync::class,
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $module = $this->option('module');
        $file = $this->option('file');

        if ($module) {
            $this->syncModule($module, $file);
        } else {
            $this->syncAllModules();
        }
    }

    /**
     * Run a specific module sync.
     */
    private function syncModule(string $module, ?string $file = null): void
    {
        if (!isset($this->modules[$module])) {
            $this->error("Module '{$module}' not found.");
            return;
        }

        $this->info("Syncing module: {$module}");

        if ($module === 'sales_order' && $file) {
            app($this->modules[$module])->sync($file);
            $this->info("Sales Order sync completed for file: {$file}");
        } else {
            app($this->modules[$module])->sync();
            $this->info("Module '{$module}' sync completed.");
        }
    }

    /**
     * Run all modules sync.
     */
    private function syncAllModules(): void
    {
        $this->info('Running sync for all modules...');

        foreach ($this->modules as $module => $service) {
            $this->info("Syncing: {$module}");
            app($service)->sync();
            $this->info("Completed: {$module}");
        }

        $this->info('All modules sync completed.');
    }
}
