<?php

namespace App\Services\Portfolio\Blog\Actions;

use Illuminate\Database\Eloquent\Model;
use App\Services\Portfolio\Blog\Blog;



class UpsertBlog
{

    public function execute(
        Model $blog,
        string $title = '',
        array $category = [],
        string $excerpt = '',
        array $images = [],
        array $videos = [],
        int $order = 0,
        string $readTime = '1 min read',
        string $slug = '',
        array $tags = [],
        ?Model $uploadedBy = null,
        array $metadata = [],
    ): Blog {

        $blog->forceFill([
            'title' => $title,
            'category' => $category,
            'excerpt' => $excerpt,
            'images' => $images,
            'videos' => $videos,
            'order' => $order,
            'readTime' => $readTime,
            'slug' => $slug,
            'tags' => $tags,
        ]);

        if ($uploadedBy && (! $blog->exists || ! $blog->ownedBy)) {
            $blog->ownedBy()->associate($uploadedBy);
        }

        if ((! $blog->exists || ! $blog->createdBy) && $uploadedBy) {
            $blog->createdBy()->associate($uploadedBy);
        }

        // Add metadata if provided
        if (!empty($metadata)) {
            $blog->replaceMetadata($metadata);
        }

        $blog->save();

        return $blog;
    }
}
