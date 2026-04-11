<?php

namespace Database\Seeders;

use App\Services\Core\LinkedAccount\Enums\LinkedAccountFeature;
use App\Services\Core\LinkedAccount\Enums\LinkedAccountProvider;
use App\Services\Core\LinkedAccount\LinkedAccount;
use App\Services\Core\User\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class LinkedAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user (or create one for testing)
        $user = User::first();
        
        if (!$user) {
            $this->command->warn('No users found. Skipping LinkedAccount seeder.');
            return;
        }

        // Create sample Google Mail linked account
        LinkedAccount::create([
            'user_id' => $user->id,
            'provider' => LinkedAccountProvider::GOOGLE,
            'provider_user_id' => '123456789',
            'access_token' => 'sample_access_token_' . uniqid(),
            'refresh_token' => 'sample_refresh_token_' . uniqid(),
            'expires_at' => Carbon::now()->addHour(),
            'scopes' => [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.modify',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.compose',
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
            'features' => [
                LinkedAccountFeature::EMAIL,
            ],
            'metadata' => [
                'email' => 'sample.user@gmail.com',
                'name' => 'Sample User',
                'avatar' => 'https://lh3.googleusercontent.com/a/default-user',
                'verified' => true,
            ],
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // Create an expired linked account for testing
        LinkedAccount::create([
            'user_id' => $user->id,
            'provider' => LinkedAccountProvider::GOOGLE,
            'provider_user_id' => '987654321',
            'access_token' => 'expired_access_token_' . uniqid(),
            'refresh_token' => 'expired_refresh_token_' . uniqid(),
            'expires_at' => Carbon::now()->subHour(), // Expired
            'scopes' => [
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            'features' => [
                LinkedAccountFeature::EMAIL,
            ],
            'metadata' => [
                'email' => 'expired.user@gmail.com',
                'name' => 'Expired User',
                'avatar' => 'https://lh3.googleusercontent.com/a/expired-user',
                'verified' => true,
            ],
            'created_at' => Carbon::now()->subDays(2),
            'updated_at' => Carbon::now()->subDays(2),
        ]);

        $this->command->info('LinkedAccount seeder completed successfully!');
        $this->command->info('Created 2 sample linked accounts for user: ' . $user->email);
    }
}
