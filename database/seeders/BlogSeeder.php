<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Services\Portfolio\Blog\Blog;
use App\Services\Core\User\User;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run()
    {
        $user = User::first() ?: User::factory()->create();

        $sampleBlogs = [
            [
                'title' => 'Getting Started with Laravel',
                'category' => ['Development', 'Tutorial'],
                'excerpt' => 'Learn the basics of Laravel framework and build your first application.',
                'content' => 'Laravel is a powerful PHP framework that makes web development easier and more enjoyable. In this tutorial, we\'ll cover the fundamentals of Laravel including routing, controllers, models, and views. By the end of this guide, you\'ll have a solid understanding of how to build modern web applications using Laravel\'s elegant syntax and comprehensive feature set.',
                'tags' => ['laravel', 'php', 'web development', 'tutorial'],
                'readTime' => '5 min read',
                'order' => 1,
                'is_published' => true,
            ],
            [
                'title' => 'Building RESTful APIs with Node.js',
                'category' => ['Development', 'API'],
                'excerpt' => 'Create scalable and efficient REST APIs using Node.js and Express framework.',
                'content' => 'Node.js has revolutionized backend development with its event-driven, non-blocking I/O model. This comprehensive guide will teach you how to design and implement RESTful APIs that are both performant and maintainable. We\'ll cover everything from basic routing to advanced concepts like authentication, middleware, and error handling.',
                'tags' => ['nodejs', 'api', 'javascript', 'express'],
                'readTime' => '8 min read',
                'order' => 2,
                'is_published' => true,
            ],
            [
                'title' => 'Modern CSS Techniques for Responsive Design',
                'category' => ['Design', 'Frontend'],
                'excerpt' => 'Master the latest CSS features to create beautiful, responsive web layouts.',
                'content' => 'CSS has evolved significantly over the years, introducing powerful features like Grid, Flexbox, and Custom Properties. This article explores modern CSS techniques that will help you create stunning responsive designs without relying on complex frameworks. We\'ll dive into practical examples and best practices for implementing these features in real-world projects.',
                'tags' => ['css', 'responsive', 'frontend', 'design'],
                'readTime' => '6 min read',
                'order' => 3,
                'is_published' => true,
            ],
            [
                'title' => 'Database Design Best Practices',
                'category' => ['Development', 'Database'],
                'excerpt' => 'Learn essential principles for designing efficient and scalable database schemas.',
                'content' => 'A well-designed database is the foundation of any successful application. This guide covers fundamental database design principles including normalization, indexing strategies, relationship modeling, and performance optimization. We\'ll also explore common pitfalls and how to avoid them when designing databases for production applications.',
                'tags' => ['database', 'sql', 'design', 'optimization'],
                'readTime' => '7 min read',
                'order' => 4,
                'is_published' => true,
            ],
            [
                'title' => 'Introduction to Machine Learning',
                'category' => ['Technology', 'AI'],
                'excerpt' => 'Explore the fundamentals of machine learning and its practical applications.',
                'content' => 'Machine learning is transforming industries across the globe, from healthcare to finance. This beginner-friendly introduction covers the core concepts of ML, including supervised and unsupervised learning, neural networks, and common algorithms. We\'ll also discuss real-world applications and how you can get started with your first ML project.',
                'tags' => ['machine learning', 'ai', 'python', 'data science'],
                'readTime' => '10 min read',
                'order' => 5,
                'is_published' => true,
            ],
            [
                'title' => 'Effective Team Collaboration Strategies',
                'category' => ['Business', 'Management'],
                'excerpt' => 'Discover proven methods for improving team productivity and communication.',
                'content' => 'Successful teams don\'t happen by accident – they require intentional effort and the right strategies. This article explores proven techniques for fostering effective team collaboration, including communication best practices, conflict resolution, and tools that enhance productivity. Learn how to build a culture of collaboration that drives results.',
                'tags' => ['teamwork', 'management', 'collaboration', 'productivity'],
                'readTime' => '4 min read',
                'order' => 6,
                'is_published' => false, // Draft
            ],
            [
                'title' => 'Security Best Practices for Web Applications',
                'category' => ['Development', 'Security'],
                'excerpt' => 'Essential security measures every developer should implement in their web applications.',
                'content' => 'Web application security is more important than ever in today\'s digital landscape. This comprehensive guide covers essential security practices including authentication, authorization, data validation, encryption, and protection against common vulnerabilities like XSS and CSRF. Learn how to build secure applications that protect your users and their data.',
                'tags' => ['security', 'web development', 'authentication', 'best practices'],
                'readTime' => '9 min read',
                'order' => 7,
                'is_published' => true,
            ],
            [
                'title' => 'The Future of Remote Work',
                'category' => ['Business', 'Technology'],
                'excerpt' => 'How remote work is reshaping the modern workplace and what it means for the future.',
                'content' => 'The shift to remote work has accelerated dramatically in recent years, fundamentally changing how we think about work, collaboration, and company culture. This article explores the trends driving remote work adoption, the challenges and opportunities it presents, and predictions for how the workplace will continue to evolve. Discover tools and strategies for thriving in a remote-first world.',
                'tags' => ['remote work', 'future of work', 'business', 'technology'],
                'readTime' => '6 min read',
                'order' => 8,
                'is_published' => true,
            ],
        ];

        foreach ($sampleBlogs as $blogData) {
            $blog = new Blog([
                'title' => $blogData['title'],
                'category' => $blogData['category'],
                'excerpt' => $blogData['excerpt'],
                'tags' => $blogData['tags'],
                'readTime' => $blogData['readTime'],
                'order' => $blogData['order'],
                'slug' => Str::slug($blogData['title']),
                'created_at' => now()->subDays(rand(1, 30)), // Random dates over last 30 days
                'updated_at' => now()->subDays(rand(0, 7)),
            ]);

            // Set metadata for content and publication status
            $blog->replaceMetadata([
                'content' => $blogData['content'],
                'is_published' => $blogData['is_published'],
            ]);

            // Set relationships using traits
            $blog->ownedBy()->associate($user);
            $blog->createdBy()->associate($user);

            $blog->save();
        }
    }
}
