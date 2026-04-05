<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\App\Core\File\BrowseFilesController;
use App\Http\Controllers\App\Core\File\UpsertFilesController;
use App\Http\Controllers\App\Portfolio\Blog\BrowseBlogController;
use App\Http\Controllers\App\Portfolio\Blog\UpsertBlogController;
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
});

require __DIR__.'/auth.php';
