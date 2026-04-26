<?php

namespace Database\Seeders;

use App\Services\Portfolio\Project\Project;
use App\Services\Core\User\User;
use App\Services\Portfolio\Project\Actions\UpsertProject;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            $this->command->warn('No user found. Please create a user first.');
            return;
        }

        $projects = [
            [
                'name' => 'E-Commerce Platform',
                'description' => 'A full-featured e-commerce platform with product management, cart functionality, and payment integration.',
                'status' => 'active',
                'start_date' => '2024-01-01',
                'end_date' => '2024-06-30',
                'budget' => 50000.00,
            ],
            [
                'name' => 'Mobile Banking App',
                'description' => 'Secure mobile banking application with biometric authentication and real-time transaction tracking.',
                'status' => 'completed',
                'start_date' => '2023-06-01',
                'end_date' => '2023-12-31',
                'budget' => 75000.00,
            ],
            [
                'name' => 'AI Content Generator',
                'description' => 'Machine learning powered content generation tool for marketing teams.',
                'status' => 'active',
                'start_date' => '2024-03-01',
                'end_date' => null,
                'budget' => 100000.00,
            ],
            [
                'name' => 'CRM System',
                'description' => 'Customer relationship management system with analytics and automation features.',
                'status' => 'on_hold',
                'start_date' => '2024-02-01',
                'end_date' => '2024-08-31',
                'budget' => 60000.00,
            ],
        ];

        $upsertProject = new UpsertProject();

        foreach ($projects as $projectData) {
            $project = new Project();
            $upsertProject->execute(
                $project,
                $user,
                $projectData['name'],
                $projectData['description'],
                $projectData['status'],
                $projectData['start_date'],
                $projectData['end_date'],
                $projectData['budget']
            );
        }

        $this->command->info('Projects seeded successfully.');
    }
}
