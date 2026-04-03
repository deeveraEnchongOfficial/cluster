<?php

namespace App\Services\Core\User\Actions;

use App\Services\Core\User\User;
use Illuminate\Database\Eloquent\Model;

class UpsertUser
{
    /**
     * Execute the action to update or create a user.
     */
    public function execute(
        User $user,
        Model $tenant,
        string $firstName,
        ?string $middleName,
        ?string $lastName,
        string $email,
        array $contactNumbers = [],
        array $socialMediaLinks = [],
        array $websites = [],
        ?string $addressLine1 = null,
        ?string $addressLine2 = null,
        ?string $city = null,
        ?string $state = null,
        ?string $postalCode = null,
        ?string $country = null,
        ?string $jobTitle = null,
        ?string $department = null,
        ?string $notes = null,
        ?string $avatarFileId = null,
        array $metadata = [],
        ?Model $createdBy = null,
        ?bool $isAdmin = null,
    ): User {
        // Update the user's information
        $userData = [
            'first_name' => $firstName,
            'middle_name' => $middleName,
            'last_name' => $lastName,
            'email' => $email,
            'contact_numbers' => $contactNumbers,
            'social_media_links' => $socialMediaLinks,
            'websites' => $websites,
            'address_line_1' => $addressLine1,
            'address_line_2' => $addressLine2,
            'city' => $city,
            'state' => $state,
            'postal_code' => $postalCode,
            'country' => $country,
            'job_title' => $jobTitle,
            'department' => $department,
            'notes' => $notes,
            'avatar_file_id' => $avatarFileId,
            '__metadata' => $metadata,
        ];

        // Only include is_admin if it's provided
        if ($isAdmin !== null) {
            $userData['is_admin'] = $isAdmin;
        }

        $user->forceFill($userData);

        // Associate the user with the tenant
        $user->tenant()->associate($tenant);

        // Set the created_by if this is a new user
        if ((! $user->exists || ! $user->createdBy) && $createdBy) {
            $user->createdBy()->associate($createdBy);
        }

        $user->save();

        return $user;
    }
}
