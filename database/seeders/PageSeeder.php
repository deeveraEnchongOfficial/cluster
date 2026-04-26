<?php

namespace Database\Seeders;

use App\Services\Core\Page\Page;
use App\Services\Core\User\User;
use App\Services\Core\Page\Actions\UpsertPage;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
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

        $pages = [
            [
                'title' => 'Getting Started',
                'slug' => 'getting-started',
                'content' => '<h1>Getting Started</h1><p>Welcome to the documentation editor. This guide will help you get started with creating and managing your documentation pages.</p><h2>Creating a Page</h2><p>To create a new page, click the "+" button in the sidebar or the "+ New Page" link. This will create a new draft page with the title "Untitled".</p><h2>Editing Content</h2><p>Use the formatting toolbar to style your content. You can add headings, bold text, italic text, lists, links, code blocks, and more.</p>',
                'status' => 'published',
            ],
            [
                'title' => 'Formatting Guide',
                'slug' => 'formatting-guide',
                'content' => '<h1>Formatting Guide</h1><p>Learn how to format your documentation pages using the rich text editor.</p><h2>Text Styles</h2><p>You can use different text styles to emphasize important information:</p><ul><li><strong>Bold</strong> text for emphasis</li><li><em>Italic</em> text for subtle emphasis</li><li><u>Underline</u> for highlighting</li><li><s>Strikethrough</s> for deletions</li></ul><h2>Headings</h2><p>Use headings to structure your content. The editor supports H1, H2, and H3 headings.</p>',
                'status' => 'published',
            ],
            [
                'title' => 'Publishing Workflow',
                'slug' => 'publishing-workflow',
                'content' => '<h1>Publishing Workflow</h1><p>Understand how to manage the lifecycle of your documentation pages.</p><h2>Draft vs Published</h2><p>Pages can be in one of two states:</p><ul><li><strong>Draft:</strong> Work-in-progress pages that are not visible to others</li><li><strong>Published:</strong> Pages that are live and visible</li></ul><h2>Saving Drafts</h2><p>Click "Save Draft" to save your work without publishing. This is useful for work-in-progress content.</p><h2>Publishing</h2><p>Click "Save & Publish" to make your page live. This will update the page status to published and update the timestamp.</p>',
                'status' => 'published',
            ],
            [
                'title' => 'Code Examples',
                'slug' => 'code-examples',
                'content' => '<h1>Code Examples</h1><p>This page demonstrates how to include code blocks in your documentation.</p><h2>Inline Code</h2><p>You can use <code>inline code</code> for short code snippets within a paragraph.</p><h2>Code Blocks</h2><p>For longer code examples, use code blocks:</p><pre><code>function example() {\n    return "Hello, World!";\n}</code></pre><h2>Language Syntax</h2><p>Code blocks support syntax highlighting for various programming languages.</p>',
                'status' => 'draft',
            ],
            [
                'title' => 'Links and Images',
                'slug' => 'links-and-images',
                'content' => '<h1>Links and Images</h1><p>Learn how to add links and images to your documentation.</p><h2>Adding Links</h2><p>To add a link, select the text and click the link icon in the toolbar. Enter the URL when prompted.</p><h2>Adding Images</h2><p>To add an image, click the image icon in the toolbar and enter the image URL. Images will be displayed inline with your content.</p>',
                'status' => 'draft',
            ],
        ];

        $upsertPage = new UpsertPage();

        foreach ($pages as $pageData) {
            $page = new Page();
            $upsertPage->execute(
                $page,
                $user,
                $pageData['title'],
                $pageData['content'],
                $pageData['status'],
                $pageData['slug']
            );
        }

        $this->command->info('Pages seeded successfully.');
    }
}
