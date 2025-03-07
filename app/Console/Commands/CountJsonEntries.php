<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CountJsonEntries extends Command
{
    protected $signature = 'json:count {file}';
    protected $description = 'Count the number of entries in a JSON file';

    public function handle()
    {
        $filePath = $this->argument('file');

        if (!file_exists($filePath)) {
            $this->error("File not found: $filePath");
            return 1;
        }

        $jsonContent = file_get_contents($filePath);
        $data = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->error("Invalid JSON format.");
            return 1;
        }

        $count = count($data);
        $this->info("Total entries: $count");

        return 0;
    }
}
