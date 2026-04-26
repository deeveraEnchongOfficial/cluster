<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Prism\Prism;
use Prism\Prism\Enums\Provider;
use Prism\Prism\ValueObjects\Messages\AssistantMessage;
use Prism\Prism\ValueObjects\Messages\UserMessage;

class AiChatController extends Controller
{
    public function chat(Request $request): JsonResponse
    {
        $request->validate([
            'messages' => 'required|array',
            'messages.*.role' => 'required|in:user,assistant,system',
            'messages.*.content' => 'required|string',
        ]);

        try {
            // Read system prompt from markdown file
            $systemPromptFile = base_path('docs/AI_CHATBOT.md');
            $systemPrompt = file_exists($systemPromptFile)
                ? file_get_contents($systemPromptFile)
                : "You are an AI assistant for the Cluster application.";

            // Get the last user message for the prompt
            $lastMessage = collect($request->messages)->where('role', 'user')->last();
            $prompt = $lastMessage ? $lastMessage['content'] : 'Hello';

            $response = prism()->text()
                ->using(Provider::OpenRouter, 'openrouter/free')
                ->withSystemPrompt($systemPrompt)
                ->withPrompt($prompt)
                ->generate();

            return response()->json([
                'message' => $response->text,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate AI response: ' . $e->getMessage(),
            ], 500);
        }
    }
}
