# AI Daily Planner Setup Guide

## Overview
The AI Daily Planner uses Google Gemini AI to generate optimized daily schedules based on your tasks and mood.

## Setup Instructions

### 1. Get Your Gemini API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (it will look like: `AIza...`)

### 2. Add API Key to Environment

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add the following line:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key
4. Save the file
5. Restart your development server (`npm run dev`)

## How It Works

### Step 1: Log Your Mood
- Before generating a schedule, you need to log your mood for today
- Go to **Mood Check-in** page and select how you're feeling
- Or, when you click "Generate Schedule" in Day Planner, you'll be prompted to log mood first

### Step 2: Add Tasks
- Go to **Task Manager** and add tasks with:
  - Title
  - Priority (high, medium, low)
  - Time estimate
  - Due date (optional)
  - Category (optional)

### Step 3: Generate Schedule
- Go to **Day Planner** page
- Click **"Generate Schedule"** button
- The AI will:
  - Analyze your tasks
  - Consider your mood
  - Create an optimized schedule from 9 AM to 6 PM
  - Include breaks and buffer time
  - Prioritize high-priority tasks during peak hours

### Step 4: Review & Accept
- Review the generated schedule
- Click **"Regenerate"** if you want a different plan
- Click **"Accept Schedule"** to save it

## Features

- **Mood-Aware Scheduling**: Adapts schedule based on your energy levels
- **Smart Task Prioritization**: High-priority tasks scheduled during peak focus hours
- **Break Management**: Automatically includes breaks every 60-90 minutes
- **Task Batching**: Groups similar tasks together to minimize context switching
- **Due Date Awareness**: Tasks with due dates scheduled earlier
- **Fallback System**: If AI fails, falls back to basic rule-based scheduling

## Troubleshooting

### "No schedule could be generated"
- Make sure you have incomplete tasks
- Check that your Gemini API key is correctly set
- Verify your internet connection

### "Failed to generate schedule"
- Check browser console for detailed error messages
- Verify your API key is valid
- Make sure you're not exceeding rate limits (60 requests/minute)

### Schedule seems off
- Try regenerating - AI may produce different results each time
- Make sure your tasks have realistic time estimates
- Check that your mood is accurately logged

## API Limits

- **Free Tier**: 60 requests per minute
- **Rate Limiting**: If you exceed limits, wait a minute before trying again
- **Cost**: Free tier is generous for personal use

## Tips for Best Results

1. **Be Specific**: Add detailed task titles and accurate time estimates
2. **Set Priorities**: Mark important tasks as "high" priority
3. **Log Mood Accurately**: Your mood affects the schedule recommendations
4. **Use Due Dates**: Tasks with due dates get prioritized
5. **Regenerate**: Don't hesitate to regenerate if the first schedule doesn't fit


