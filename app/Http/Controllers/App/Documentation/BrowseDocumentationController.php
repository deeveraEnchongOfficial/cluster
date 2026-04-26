<?php

namespace App\Http\Controllers\App\Documentation;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Controllers\Controller;

class BrowseDocumentationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Display the documentation editor with all pages.
     */
    public function show(Request $request): Response
    {
        return Inertia::render('Documentation/Index');
    }
}
