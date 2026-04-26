<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\App\Portfolio\Project\BrowseProjectController;
use App\Http\Controllers\App\Portfolio\Project\UpsertProjectController;
use App\Http\Controllers\App\Core\File\BrowseFilesController;
use App\Http\Controllers\App\Core\File\UpsertFilesController;
use App\Http\Controllers\App\Portfolio\Blog\BrowseBlogController;
use App\Http\Controllers\App\Portfolio\Blog\UpsertBlogController;
use App\Http\Controllers\App\Core\Integrations\GoogleMailIntegrationController;
use App\Http\Controllers\App\Core\Integrations\IntegrationsController;
use App\Http\Controllers\App\Core\Integrations\DisconnectGoogleMailController;
use App\Http\Controllers\App\Core\Integrations\GoogleDriveIntegrationController;
use App\Http\Controllers\App\Core\Integrations\DisconnectGoogleDriveController;
use App\Http\Controllers\App\Core\Integrations\GoogleCalendarIntegrationController;
use App\Http\Controllers\App\Core\Integrations\DisconnectGoogleCalendarController;
use App\Http\Controllers\App\Documentation\BrowseDocumentationController;
use App\Http\Controllers\App\Documentation\UpsertDocumentationController;
use App\Http\Controllers\App\Calendar\CalendarController;
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

    // Calendar route
    Route::get('/calendar', [CalendarController::class, 'show'])->name('calendar.index');
    Route::post('/calendar/sync', [CalendarController::class, 'sync'])->name('calendar.sync');

    // Project routes - Browse and Upsert pattern
    Route::get('/portfolio/projects', [BrowseProjectController::class, 'show'])->name('portfolio.projects.browse');
    Route::get('/portfolio/projects/create', [UpsertProjectController::class, 'show'])->name('portfolio.projects.create');
    Route::get('/portfolio/projects/{project}', [UpsertProjectController::class, 'show'])->name('portfolio.projects.show');
    Route::post('/portfolio/projects/handle', [UpsertProjectController::class, 'handle'])->name('portfolio.projects.handle');
    Route::patch('/portfolio/projects/{project}', [UpsertProjectController::class, 'handle'])->name('portfolio.projects.update');
    Route::delete('/portfolio/projects/{project}', [UpsertProjectController::class, 'destroy'])->name('portfolio.projects.destroy');

    // File routes - Browse and Upsert pattern
    Route::get('/files', [BrowseFilesController::class, 'show'])->name('files.browse');
    Route::get('/files/{file}', [UpsertFilesController::class, 'show'])->name('files.show');
    Route::post('/files/upload', [UpsertFilesController::class, 'upload'])->name('files.upload');
    Route::patch('/files/{file}', [UpsertFilesController::class, 'update'])->name('files.update');
    Route::delete('/files/{file}', [UpsertFilesController::class, 'destroy'])->name('files.destroy');
    Route::get('/files/{file}/download', [UpsertFilesController::class, 'download'])->name('files.download');
    Route::post('/files/bulk-delete', [UpsertFilesController::class, 'bulkDelete'])->name('files.bulk-delete');
    Route::post('/files/resync-drive', [UpsertFilesController::class, 'resyncFromDrive'])->name('files.resync-drive');

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

    // Google Calendar Integration routes
    Route::get('/settings/integrations/google-calendar/connect', [GoogleCalendarIntegrationController::class, 'connect'])->name('settings.integrations.google-calendar.connect');
    Route::get('/settings/integrations/google-calendar/callback', [GoogleCalendarIntegrationController::class, 'callback'])->name('settings.integrations.google-calendar.callback');
    Route::delete('/settings/integrations/google-calendar/{linkedAccount}', [DisconnectGoogleCalendarController::class, 'disconnect'])->name('settings.integrations.google-calendar.disconnect');

    // Documentation routes - Browse and Upsert pattern
    Route::get('/documentation', [BrowseDocumentationController::class, 'show'])->name('documentation.index');
    Route::get('/documentation/create', [UpsertDocumentationController::class, 'show'])->name('documentation.create');
    Route::get('/documentation/{page}', [UpsertDocumentationController::class, 'show'])->name('documentation.upsert');
    Route::post('/documentation/handle', [UpsertDocumentationController::class, 'handle'])->name('documentation.handle');
    Route::patch('/documentation/{page}', [UpsertDocumentationController::class, 'handle'])->name('documentation.update');
    Route::delete('/documentation/{page}', [UpsertDocumentationController::class, 'destroy'])->name('documentation.destroy');
});

require __DIR__ . '/auth.php';
