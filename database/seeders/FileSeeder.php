<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\Core\File\File;
use App\Services\Core\User\User;
use Illuminate\Support\Str;

class FileSeeder extends Seeder
{
    public function run()
    {
        $user = User::first() ?: User::factory()->create();

        $sampleFiles = [
            [
                'name' => 'project-proposal.pdf',
                'original_name' => 'Project Proposal 2024.pdf',
                'mime_type' => 'application/pdf',
                'size' => 2048576,
                'path' => 'files/' . Str::uuid() . '.pdf',
                'disk' => 'public',
                'hash' => 'abc123def456',
                'description' => 'Q1 project proposal document',
                'is_public' => false,
            ],
            [
                'name' => 'meeting-notes.docx',
                'original_name' => 'Team Meeting Notes.docx',
                'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'size' => 524288,
                'path' => 'files/' . Str::uuid() . '.docx',
                'disk' => 'public',
                'hash' => 'def789ghi012',
                'description' => 'Weekly team meeting notes',
                'is_public' => false,
            ],
            [
                'name' => 'budget-2024.xlsx',
                'original_name' => 'Annual Budget 2024.xlsx',
                'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'size' => 1048576,
                'path' => 'files/' . Str::uuid() . '.xlsx',
                'disk' => 'public',
                'hash' => 'ghi345jkl678',
                'description' => 'Annual budget spreadsheet',
                'is_public' => true,
            ],
            [
                'name' => 'presentation.pptx',
                'original_name' => 'Product Launch Presentation.pptx',
                'mime_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'size' => 3145728,
                'path' => 'files/' . Str::uuid() . '.pptx',
                'disk' => 'public',
                'hash' => 'jkl901mno234',
                'description' => 'Product launch presentation slides',
                'is_public' => false,
            ],
            [
                'name' => 'logo.png',
                'original_name' => 'Company Logo.png',
                'mime_type' => 'image/png',
                'size' => 262144,
                'path' => 'files/' . Str::uuid() . '.png',
                'disk' => 'public',
                'hash' => 'mno567pqr890',
                'description' => 'Company logo image',
                'is_public' => true,
            ],
            [
                'name' => 'report.pdf',
                'original_name' => 'Monthly Report March 2024.pdf',
                'mime_type' => 'application/pdf',
                'size' => 1572864,
                'path' => 'files/' . Str::uuid() . '.pdf',
                'disk' => 'public',
                'hash' => 'pqr123stu456',
                'description' => 'Monthly performance report',
                'is_public' => false,
            ],
            [
                'name' => 'data.csv',
                'original_name' => 'Sales Data Q1 2024.csv',
                'mime_type' => 'text/csv',
                'size' => 131072,
                'path' => 'files/' . Str::uuid() . '.csv',
                'disk' => 'public',
                'hash' => 'stu789vwx012',
                'description' => 'Q1 sales data in CSV format',
                'is_public' => true,
            ],
            [
                'name' => 'contract.pdf',
                'original_name' => 'Service Agreement Contract.pdf',
                'mime_type' => 'application/pdf',
                'size' => 2621440,
                'path' => 'files/' . Str::uuid() . '.pdf',
                'disk' => 'public',
                'hash' => 'vwx345yz678',
                'description' => 'Service agreement contract document',
                'is_public' => false,
            ],
        ];

        foreach ($sampleFiles as $fileData) {
            $file = new File([
                'name' => $fileData['name'],
                'original_name' => $fileData['original_name'],
                'mime_type' => $fileData['mime_type'],
                'size' => $fileData['size'],
                'path' => $fileData['path'],
                'disk' => $fileData['disk'],
                'hash' => $fileData['hash'],
                'is_public' => $fileData['is_public'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Set metadata for description
            if (isset($fileData['description'])) {
                $file->replaceMetadata(['description' => $fileData['description']]);
            }

            // Set relationships using traits
            $file->ownedBy()->associate($user);
            $file->createdBy()->associate($user);

            $file->save();
        }
    }
}
