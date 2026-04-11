<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\App\Core\File\BrowseFilesController;
use App\Http\Controllers\App\Core\File\UpsertFilesController;
use App\Http\Controllers\App\Portfolio\Blog\BrowseBlogController;
use App\Http\Controllers\App\Portfolio\Blog\UpsertBlogController;
use App\Http\Controllers\App\Core\Integrations\GoogleMailIntegrationController;
use App\Http\Controllers\App\Core\Integrations\IntegrationsController;
use App\Http\Controllers\App\Core\Integrations\DisconnectGoogleMailController;
use App\Http\Controllers\App\Core\Integrations\GoogleDriveIntegrationController;
use App\Http\Controllers\App\Core\Integrations\DisconnectGoogleDriveController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('projects', ProjectController::class);

    // File routes - Browse and Upsert pattern
    Route::get('/files', [BrowseFilesController::class, 'show'])->name('files.browse');
    Route::get('/files/{file}', [UpsertFilesController::class, 'show'])->name('files.show');
    Route::post('/files/upload', [UpsertFilesController::class, 'upload'])->name('files.upload');
    Route::patch('/files/{file}', [UpsertFilesController::class, 'update'])->name('files.update');
    Route::delete('/files/{file}', [UpsertFilesController::class, 'destroy'])->name('files.destroy');
    Route::get('/files/{file}/download', [UpsertFilesController::class, 'download'])->name('files.download');
    Route::post('/files/bulk-delete', [UpsertFilesController::class, 'bulkDelete'])->name('files.bulk-delete');

    // Blog routes - Browse and Upsert pattern
    Route::get('/portfolio/blogs', [BrowseBlogController::class, 'show'])->name('portfolio.blogs.browse');
    Route::get('/portfolio/blogs/create', [UpsertBlogController::class, 'show'])->name('portfolio.blogs.create');
    Route::get('/portfolio/blogs/{blog}', [UpsertBlogController::class, 'show'])->name('portfolio.blogs.show');
    Route::post('/portfolio/blogs/handle', [UpsertBlogController::class, 'handle'])->name('portfolio.blogs.handle');
    Route::patch('/portfolio/blogs/{blog}', [UpsertBlogController::class, 'handle'])->name('portfolio.blogs.update');
    Route::delete('/portfolio/blogs/{blog}', [UpsertBlogController::class, 'destroy'])->name('portfolio.blogs.destroy');

    // Settings routes
    Route::get('/settings', [IntegrationsController::class, 'show'])->name('settings.integrations.show');

    // Google Integration routes
    Route::get('/settings/integrations/google-mail/connect', [GoogleMailIntegrationController::class, 'connect'])->name('settings.integrations.google-mail.connect');
    Route::get('/settings/integrations/google-mail/callback', [GoogleMailIntegrationController::class, 'callback'])->name('settings.integrations.google-mail.callback');
    Route::delete('/settings/integrations/google-mail/{linkedAccount}', [DisconnectGoogleMailController::class, 'disconnect'])->name('settings.integrations.google-mail.disconnect');

    // Google Drive Integration routes
    Route::get('/settings/integrations/google-drive/connect', [GoogleDriveIntegrationController::class, 'connect'])->name('settings.integrations.google-drive.connect');
    Route::get('/settings/integrations/google-drive/callback', [GoogleDriveIntegrationController::class, 'callback'])->name('settings.integrations.google-drive.callback');
    Route::delete('/settings/integrations/google-drive/{linkedAccount}', [DisconnectGoogleDriveController::class, 'disconnect'])->name('settings.integrations.google-drive.disconnect');
});

require __DIR__.'/auth.php';
