# Dynamic Pages Documentation

## Overview

The Dynamic Pages feature provides a full-featured documentation editor with rich text editing capabilities, page management, and publishing workflow. It allows users to create, edit, and publish documentation pages with a modern, intuitive interface.

## Data Model

### Page Model

The `Page` model (`app/Models/Page.php`) represents a documentation page with the following structure:

**Fields:**
- `id` - Unique identifier (MongoDB ObjectId)
- `title` - Page title (string, max 255 characters)
- `slug` - URL-friendly slug generated from title
- `content` - Rich text content (HTML/JSON from TipTap editor)
- `author` - Author name (string)
- `status` - Page status: `draft` or `published`
- `user_id` - Foreign key to the user who owns the page
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `deleted_at` - Soft delete timestamp (if deleted)

**Relationships:**
- `user()` - Belongs to User model

**Scopes:**
- `status($status)` - Filter by status
- `published()` - Get published pages
- `draft()` - Get draft pages

**Database:**
- Uses MongoDB via `mongodb/laravel-mongodb`
- Collection: `pages`
- Indexes: slug, status, user_id, created_at, updated_at

## Component Structure

### Frontend Components

#### 1. DocumentationEditor
**Path:** `resources/js/Components/Documentation/DocumentationEditor.jsx`

Main component that orchestrates the entire documentation editor interface. It manages:
- Page list and active page state
- Title and content editing
- Save and publish functionality
- Dirty state tracking for unsaved changes
- Navigation between pages

**Props:**
- `pages` - Array of all pages
- `page` - Currently active page (or null)

**Key Features:**
- Creates new pages via API
- Loads existing pages for editing
- Handles title changes with slug generation
- Manages content updates from rich text editor
- Provides save draft and save & publish actions
- Warns about unsaved changes when switching pages

#### 2. PagesSidebar
**Path:** `resources/js/Components/Documentation/PagesSidebar.jsx`

Left sidebar component displaying the page list and navigation controls.

**Props:**
- `pages` - Array of pages to display
- `activePageId` - ID of currently selected page
- `onPageCreate` - Callback for creating new page
- `onPageSelect` - Callback for selecting a page

**Features:**
- Displays "Pages" section title with "+" button
- Shows list of all pages with titles
- Highlights active page with blue border
- Shows "+ New Page" action when no pages exist
- Always shows "+ New Page" button at bottom
- Settings link at bottom of sidebar

#### 3. EditorToolbar
**Path:** `resources/js/Components/Documentation/EditorToolbar.jsx`

Formatting toolbar for the rich text editor with TipTap integration.

**Props:**
- `editor` - TipTap editor instance

**Toolbar Actions:**
- Text style dropdown (Paragraph, H1, H2, H3)
- Bold, Italic, Underline, Strikethrough
- Image insertion (via URL prompt)
- Clear formatting
- Bullet list, Numbered list
- Blockquote
- Link insertion (via URL prompt)
- Inline code, Code block

#### 4. PageEditor
**Path:** `resources/js/Components/Documentation/PageEditor.jsx`

Rich text editor component using TipTap.

**Props:**
- `page` - Current page object
- `onUpdate` - Callback when content changes

**TipTap Extensions:**
- StarterKit (basic formatting)
- Placeholder (shows "Write your page content here...")
- Link (clickable links)
- Image (embedded images)
- Underline (text underline)

**Features:**
- Prose styling for clean typography
- Auto-updates when page content changes
- Placeholder text for empty content

### Inertia Pages

#### 1. Documentation/Index
**Path:** `resources/js/Pages/Documentation/Index.jsx`

Entry page for documentation editor. Shows the editor with no active page.

**Route:** `/documentation`

#### 2. Documentation/Upsert
**Path:** `resources/js/Pages/Documentation/Upsert.jsx`

Editor page for creating or editing a specific page.

**Route:** `/documentation/{page}` or `/documentation/create`

## State Flow

### Page Creation Flow

1. User clicks "+" button or "+ New Page" in sidebar
2. `DocumentationEditor.handleCreatePage()` is called
3. POST request to `documentation.handle` route with:
   - title: "Untitled"
   - content: ""
   - status: "draft"
4. `UpsertDocumentationController.handle()` creates new Page
5. On success, redirects to `documentation.upsert` with new page ID
6. Page loads in editor with "Untitled" title and empty content

### Page Selection Flow

1. User clicks a page in sidebar
2. `DocumentationEditor.handleSelectPage()` is called
3. If there are unsaved changes, shows confirmation dialog
4. On confirmation, navigates to `documentation.upsert` route with page ID
5. `UpsertDocumentationController.show()` loads page and all pages
6. Page renders in editor with title and content populated

### Title Editing Flow

1. User types in title input
2. `DocumentationEditor.handleTitleChange()` updates local title state
3. Sets dirty state to true (unsaved changes)
4. Slug is generated on save via controller

### Content Editing Flow

1. User types in rich text editor
2. TipTap editor fires `onUpdate` callback
3. `PageEditor.onUpdate()` calls `DocumentationEditor.handleContentUpdate()`
4. Content state is updated
5. Dirty state is set to true

### Save & Publish Flow

1. User clicks "Save & Publish" button
2. `DocumentationEditor.handleSaveAndPublish()` is called
3. Validates that active page exists
4. PATCH request to `documentation.update` route with:
   - title: current title (or "Untitled" if empty)
   - content: current HTML content
   - status: "published"
5. `UpsertDocumentationController.handle()` updates page
6. On success, shows toast notification
7. Clears dirty state
8. Updates `updatedAt` timestamp

### Save Draft Flow

Same as Save & Publish, but with `status: "draft"`.

## API Endpoints

All endpoints require authentication (`auth` middleware).

### GET /documentation
**Controller:** `BrowseDocumentationController@show`
**Purpose:** Display documentation editor with all pages
**Response:** Inertia render with pages array

### GET /documentation/create
**Controller:** `UpsertDocumentationController@show`
**Purpose:** Display editor for creating new page
**Response:** Inertia render with page=null and pages array

### GET /documentation/{page}
**Controller:** `UpsertDocumentationController@show`
**Purpose:** Display editor for editing existing page
**Response:** Inertia render with page object and pages array

### POST /documentation/handle
**Controller:** `UpsertDocumentationController@handle`
**Purpose:** Create new page
**Request Body:**
- title (required, string, max 255)
- content (nullable, string)
- status (required, in: draft,published)
**Response:** Redirect to documentation.upsert with new page ID

### PATCH /documentation/{page}
**Controller:** `UpsertDocumentationController@handle`
**Purpose:** Update existing page
**Request Body:** Same as POST
**Response:** Redirect to documentation.upsert with page ID

### DELETE /documentation/{page}
**Controller:** `UpsertDocumentationController@destroy`
**Purpose:** Delete a page
**Response:** Redirect to documentation.index

## How Page Creation Works

1. **Frontend Trigger:** User clicks "+" in sidebar or "+ New Page" button
2. **API Call:** POST to `/documentation/handle` with minimal data
3. **Backend Processing:**
   - Controller validates input
   - Creates new Page model instance
   - Generates slug from title using `Str::slug()`
   - Sets author from authenticated user
   - Sets user_id from authenticated user
   - Saves to MongoDB
4. **Response:** Redirects to editor with new page ID
5. **Editor Load:** UpsertDocumentationController loads page and all pages
6. **Frontend Render:** DocumentationEditor displays new page ready for editing

## How Publishing Works

1. **User Action:** Clicks "Save & Publish" button
2. **Validation:** Checks that active page exists
3. **API Call:** PATCH to `/documentation/{page}` with status="published"
4. **Backend Processing:**
   - Controller validates input
   - Updates page fields (title, content, status)
   - Regenerates slug from title
   - Updates author if needed
   - Saves to MongoDB
   - Automatically updates `updatedAt` timestamp
5. **Response:** Redirects to editor with success message
6. **Feedback:** Toast notification shows success
7. **State Update:** Dirty flag cleared, page status updated

## How to Add New Toolbar Actions

To add a new formatting action to the toolbar:

1. **Install TipTap Extension:**
   ```bash
   npm install @tiptap/extension-your-extension
   ```

2. **Add Extension to PageEditor:**
   In `resources/js/Components/Documentation/PageEditor.jsx`:
   ```jsx
   import YourExtension from '@tiptap/extension-your-extension';

   const editor = useEditor({
       extensions: [
           // ... existing extensions
           YourExtension,
       ],
       // ... rest of config
   });
   ```

3. **Add Toolbar Button:**
   In `resources/js/Components/Documentation/EditorToolbar.jsx`:
   ```jsx
   import { YourIcon } from 'lucide-react';

   <ToolbarButton
       onClick={() => editor.chain().focus().toggleYourExtension().run()}
       isActive={editor.isActive('yourExtension')}
       title="Your Action"
   >
       <YourIcon className="w-4 h-4" />
   </ToolbarButton>
   ```

4. **Test:** Verify the button appears and functions correctly in the editor

## Known Limitations

1. **Image Upload:** Currently only supports image URLs. File upload functionality not implemented.
2. **Autosave:** No automatic autosave feature. Users must manually save drafts.
3. **Collaboration:** No real-time collaboration features.
4. **Version History:** No version history or rollback functionality.
5. **Page Reordering:** Pages are ordered by updated_at, cannot manually reorder.
6. **Page Deletion:** No confirmation dialog before deletion.
7. **Slug Conflicts:** No handling for duplicate slugs (MongoDB unique constraint needed).
8. **Rich Text Export:** Content stored as HTML, no export to Markdown or PDF.
9. **Search:** No search functionality across pages.
10. **Categories/Tags:** No categorization or tagging system.

## Future Improvements

1. **Image Upload:** Add file upload capability for images.
2. **Autosave:** Implement automatic draft saving with debouncing.
3. **Collaboration:** Add real-time collaboration using WebSockets.
4. **Version History:** Track page versions with rollback capability.
5. **Page Organization:** Add folders, categories, or tags.
6. **Search:** Implement full-text search across pages.
7. **Export:** Add export to Markdown, PDF, or HTML.
8. **Slug Management:** Handle slug conflicts automatically.
9. **Delete Confirmation:** Add confirmation dialog for page deletion.
10. **Page Templates:** Create reusable page templates.
11. **Keyboard Shortcuts:** Add keyboard shortcuts for common actions.
12. **Drag & Drop:** Enable drag-and-drop for page reordering.
13. **Preview Mode:** Add preview mode for published pages.
14. **Comments:** Add commenting system for collaboration.
15. **Analytics:** Track page views and engagement.

## Setup Instructions

### 1. Run Migration
```bash
php artisan migrate
```

### 2. Install Dependencies
Already installed:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-link @tiptap/extension-image @tiptap/extension-underline
```

### 3. Access Documentation Editor
Navigate to `/documentation` while authenticated.

### 4. Create First Page
Click the "+" button or "+ New Page" in the sidebar.

## Troubleshooting

### Pages Not Saving
- Check MongoDB connection in `.env`
- Verify authentication middleware is working
- Check browser console for JavaScript errors
- Review Laravel logs: `php artisan pail`

### Editor Not Loading
- Ensure TipTap packages are installed
- Check for React errors in browser console
- Verify Inertia props are being passed correctly

### Slug Generation Issues
- Ensure `Illuminate\Support\Str` is imported in controller
- Check that title is not null before generating slug

### MongoDB Connection Issues
- Verify `MONGODB_URI` in `.env`
- Check MongoDB service is running
- Ensure `mongodb/laravel-mongodb` is installed

## File Structure

```
app/
├── Models/
│   └── Page.php                          # MongoDB Page model
├── Http/Controllers/
│   └── App/Documentation/
│       ├── BrowseDocumentationController.php  # List pages
│       └── UpsertDocumentationController.php   # Create/edit pages
database/
└── migrations/
    └── 2026_04_25_000001_create_pages_collection.php  # MongoDB collection
resources/
├── js/
│   ├── Components/
│   │   └── Documentation/
│   │       ├── DocumentationEditor.jsx   # Main editor component
│   │       ├── PagesSidebar.jsx          # Page list sidebar
│   │       ├── EditorToolbar.jsx         # Formatting toolbar
│   │       └── PageEditor.jsx            # Rich text editor
│   └── Pages/
│       └── Documentation/
│           ├── Index.jsx                 # Documentation index page
│           └── Upsert.jsx                # Documentation editor page
routes/
└── web.php                               # Documentation routes
```

## Technology Stack

- **Backend:** Laravel 13, MongoDB, Inertia.js
- **Frontend:** React 19, TipTap, Tailwind CSS
- **UI Components:** Radix UI, Lucide Icons, shadcn/ui
- **State Management:** React hooks, Inertia props
- **Rich Text:** TipTap (headless editor framework)

## License

This feature is part of the cluster project and follows the project's license.
