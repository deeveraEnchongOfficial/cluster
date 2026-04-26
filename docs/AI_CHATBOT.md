# AI Chatbot

## Overview
The AI Chatbot is a floating assistant integrated into the Cluster application that provides intelligent assistance using OpenRouter's AI models through the Prism PHP library.

## Features
- **Floating Chat Interface**: A chat button in the bottom-right corner of the screen that opens a chat dialog
- **Real-time AI Responses**: Powered by OpenRouter's `openrouter/free` model
- **System Context Awareness**: The AI is aware of the Cluster application's features and tech stack
- **Message History**: Maintains conversation context within the current session
- **Responsive Design**: Works seamlessly across different screen sizes

## Architecture

### Frontend Components
- **Location**: `resources/js/Components/AiChatbot.jsx`
- **Tech Stack**: React with Shadcn UI components
- **Key Features**:
  - Floating button with MessageSquare icon
  - Chat dialog with message history
  - Auto-scroll to latest messages
  - Loading state during AI responses
  - Enter key to send messages

### Backend API
- **Controller**: `app/Http/Controllers/App/AiChatController.php`
- **Route**: `POST /api/ai/chat`
- **Tech Stack**: Laravel with Prism PHP library
- **AI Provider**: OpenRouter via Prism
- **Model**: `openrouter/free`

### Configuration
- **Config File**: `config/prism.php`
- **Environment Variables**:
  ```
  OPENROUTER_API_KEY=your_api_key_here
  OPENROUTER_URL=https://openrouter.ai/api/v1
  ```

## System Context
The AI assistant is configured with knowledge about the Cluster application:

### Application Features
- Portfolio management (Projects, Blogs, Documentation)
- File management system
- Google integrations (Mail, Drive, Calendar)
- User authentication and profiles
- Dashboard with analytics
- AI-powered assistance

### Tech Stack
- **Backend**: Laravel 13.3.0, PHP 8.4.3
- **Frontend**: React with Inertia.js, Tailwind CSS, Shadcn UI components
- **Database**: MongoDB
- **AI Integration**: Prism PHP with OpenRouter API

## Usage

### For Users
1. Click the floating chat button in the bottom-right corner
2. Type your question in the input field
3. Press Enter or click the Send button
4. View the AI's response in the chat interface

### For Developers

#### Testing the AI
```bash
php artisan app:test-prism
```
This command tests the Prism configuration and API connectivity.

#### Modifying System Context
Edit the `$systemPrompt` variable in `app/Http/Controllers/App/AiChatController.php` to change what the AI knows about your system.

#### Changing AI Model
Modify the model in `AiChatController.php`:
```php
->using(Provider::OpenRouter, 'your-model-name')
```

## Integration Points

### AdminLayout
The chatbot is integrated into `resources/js/Layouts/AdminLayout.jsx` and appears on all pages that use this layout.

### API Endpoint
```php
Route::post('/api/ai/chat', [AiChatController::class, 'chat'])->name('ai.chat');
```

## Troubleshooting

### AI Not Responding
1. Check that `OPENROUTER_API_KEY` is set in `.env`
2. Verify the API key is valid
3. Run `php artisan config:clear` to clear configuration cache
4. Check Laravel logs: `tail -f storage/logs/laravel.log`

### Chatbot Not Showing
1. Clear browser cache
2. Run `npm run build` to rebuild frontend assets
3. Check browser console for JavaScript errors

### API Errors
1. Ensure Prism is properly installed: `composer show prism-php/prism`
2. Check Prism configuration in `config/prism.php`
3. Verify OpenRouter API status

## Future Enhancements
- [ ] Add conversation history persistence
- [ ] Support for multiple AI models
- [ ] File upload capability
- [ ] Voice input/output
- [ ] Customizable system prompts per user
- [ ] Analytics dashboard for chatbot usage

## Security Notes
- The AI chat endpoint requires authentication (uses `auth` middleware)
- CSRF protection is enabled for all API requests
- API keys should never be exposed in frontend code
- Rate limiting should be considered for production use

## Dependencies
- `prism-php/prism`: PHP library for AI API interactions
- OpenRouter API key for AI model access
- React for frontend UI
- Shadcn UI components for chat interface
