<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLOUD_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLOUD_CLIENT_SECRET'),
        'redirect' => env('APP_URL').'/settings/integrations/google-drive/callback',
        // 'application_credentials_contents' => base64_decode(env('GOOGLE_CLOUD_APPLICATION_CREDENTIALS_CONTENTS')),
        'auth_cache_store' => env('GOOGLE_CLOUD_AUTH_CACHE_STORE', 'database'),
        'location' => env('GOOGLE_CLOUD_PROJECT_LOCATION', 'global'),
        'project_id' => env('GOOGLE_CLOUD_PROJECT_ID'),
        'token_expiration_default' => env('GOOGLE_TOKEN_EXPIRATION_DEFAULT', 3600), // 1 hour in seconds
        'drive_folder_path' => env('GOOGLE_DRIVE_FOLDER_PATH'),
        'drive_folder_url' => env('GOOGLE_DRIVE_FOLDER_URL'),
    ],

];
