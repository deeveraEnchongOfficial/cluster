<?php

namespace App\Console\Commands;

use App\Services\Core\LinkedAccount\LinkedAccount;
use App\Services\Core\User\User;
use Illuminate\Console\Command;

class TestLinkedAccount extends Command
{
    protected $signature = 'test:linked-account';
    protected $description = 'Test LinkedAccount MongoDB connection and data';

    public function handle()
    {
        $this->info('Testing LinkedAccount MongoDB connection...');

        try {
            // Test 1: Check if model can be instantiated
            $this->info('1. Testing model instantiation...');
            $model = new LinkedAccount();
            $this->info('   Model instantiated successfully');

            // Test 2: Check total count
            $this->info('2. Checking total LinkedAccount records...');
            try {
                $total = LinkedAccount::count();
                $this->info("   Total records: {$total}");
            } catch (\Exception $e) {
                $this->error("   Error counting records: {$e->getMessage()}");
                $total = 0;
            }

            // Test 3: Get all records (with try-catch)
            $this->info('3. Getting all LinkedAccount records...');
            try {
                $all = LinkedAccount::all();
                $this->info("   Found {$all->count()} records");

                if ($all->count() > 0) {
                    $this->info('   Sample record:');
                    $first = $all->first();
                    $this->info("   ID: {$first->_id}");
                    $this->info("   User ID: {$first->user_id}");
                    $this->info("   Provider: {$first->provider}");
                    $this->info("   Created: {$first->created_at}");
                }
            } catch (\Exception $e) {
                $this->error("   Error getting records: {$e->getMessage()}");
                $this->info("   Trying alternative method...");

                // Alternative: Use raw MongoDB query
                try {
                    $query = LinkedAccount::newQuery();
                    $records = $query->limit(5)->get();
                    $this->info("   Found {$records->count()} records using alternative method");
                } catch (\Exception $e2) {
                    $this->error("   Alternative method also failed: {$e2->getMessage()}");
                }
            }

            // Test 4: Check for specific user
            $this->info('4. Checking for user 19d54030027b767e3e61a...');
            try {
                $userRecords = LinkedAccount::where('user_id', '19d54030027b767e3e61a')->get();
                $this->info("   Found {$userRecords->count()} records for this user");
            } catch (\Exception $e) {
                $this->error("   Error querying user: {$e->getMessage()}");
            }

            // Test 5: Check all users
            $this->info('5. Checking all users...');
            $users = User::all();
            $this->info("   Found {$users->count()} users");

            foreach ($users as $user) {
                $userLinkedAccounts = LinkedAccount::where('user_id', $user->id)->get();
                $this->info("   User {$user->email} ({$user->id}): {$userLinkedAccounts->count()} linked accounts");
            }

            // Test 6: Create a test record if needed
            if ($users->count() > 0) {
                $this->info('6. Creating a test LinkedAccount...');
                $testUser = $users->first();

                try {
                    $linkedAccount = new LinkedAccount();
                    $linkedAccount->user_id = $testUser->id;
                    $linkedAccount->provider = 'google';
                    $linkedAccount->provider_user_id = 'test_' . uniqid();
                    $linkedAccount->access_token = 'test_token_' . uniqid();
                    $linkedAccount->refresh_token = 'test_refresh_' . uniqid();
                    $linkedAccount->expires_at = now()->addHour();
                    $linkedAccount->scopes = ['gmail.readonly', 'gmail.send'];
                    $linkedAccount->features = ['email'];
                    $linkedAccount->metadata = ['email' => 'test@example.com'];
                    $linkedAccount->save();

                    $this->info("   Created test LinkedAccount with ID: {$linkedAccount->_id}");
                } catch (\Exception $e) {
                    $this->error("   Error creating test record: {$e->getMessage()}");
                    $this->info("   This is expected due to MongoDB configuration issues.");
                    $this->info("   The Settings page should still work with empty data.");
                }
            }
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");
            $this->error("File: {$e->getFile()}:{$e->getLine()}");
            return 1;
        }

        $this->info('Test completed!');
        return 0;
    }
}
