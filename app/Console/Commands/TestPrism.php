<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Prism\Prism;
use Prism\Prism\Enums\Provider;

#[Signature('app:test-prism')]
#[Description('Test Prism configuration and connectivity')]
class TestPrism extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing Prism Configuration...');
        $this->newLine();

        $config = config('prism');

        // Test Prism Server
        $this->info('Prism Server:');
        $this->table(
            ['Setting', 'Value'],
            [
                ['Enabled', $config['prism_server']['enabled'] ? 'Yes' : 'No'],
                ['Middleware', empty($config['prism_server']['middleware']) ? 'None' : implode(', ', $config['prism_server']['middleware'])],
            ]
        );
        $this->newLine();

        // Test Providers
        $this->info('AI Providers:');
        $providerData = [];
        foreach ($config['providers'] as $provider => $settings) {
            $hasApiKey = !empty($settings['api_key']);
            $hasUrl = !empty($settings['url']);
            $status = ($hasApiKey || $hasUrl) ? '✓ Configured' : '✗ Missing credentials';

            $providerData[] = [
                ucfirst($provider),
                $settings['url'] ?? 'N/A',
                $hasApiKey ? 'Set' : 'Not set',
                $status,
            ];
        }

        $this->table(
            ['Provider', 'URL', 'API Key', 'Status'],
            $providerData
        );
        $this->newLine();

        // Test actual Prism API call
        $this->info('Testing Prism API Call...');
        $this->newLine();

        try {
            $response = prism()->text()
                ->using(Provider::OpenRouter, 'openrouter/free')
                ->withPrompt('Say "Hello from Prism!" in one sentence.')
                ->generate();

            $this->info('✓ Prism API call successful!');
            $this->newLine();
            $this->info('Response:');
            $this->line($response->text);
            $this->newLine();
        } catch (\Exception $e) {
            $this->error('✗ Prism API call failed:');
            $this->error($e->getMessage());
            $this->newLine();
            $this->warn('This is expected if you have not configured API keys in your .env file.');
        }

        $this->info('Prism configuration test completed.');
        $this->warn('Note: Actual API connectivity requires valid credentials in your .env file.');

        return Command::SUCCESS;
    }
}
