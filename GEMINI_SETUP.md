# Gemini API Setup for Kolam Symmetry Analysis

## Overview
The AI Symmetry Analysis feature uses Google's Gemini API to analyze uploaded Kolam images and provide detailed symmetry analysis.

## Setup Instructions

### 1. Get a Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure the API Key
Create a `.env` file in the project root with the following content:

```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you obtained from Google AI Studio.

### 3. Restart the Development Server
After adding the API key, restart your development server:

```bash
npm run dev
```

## Features
- **Image Upload**: Upload Kolam images (JPEG, PNG up to 10MB)
- **Symmetry Analysis**: AI-powered analysis of symmetry patterns
- **Cultural Context**: Information about cultural significance
- **Geometric Properties**: Detailed geometric analysis
- **Recommendations**: Suggestions for pattern improvements

## Supported Symmetry Types
- 8-way rotational symmetry
- 4-way mirror symmetry
- Vertical mirror symmetry
- Horizontal mirror symmetry
- Diagonal symmetry
- Recursive patterns
- Fractal patterns

## Usage
1. Click on the AI Analysis section in the header
2. Upload a Kolam image by clicking the upload area
3. Click "Analyze Symmetry" to get AI analysis
4. View detailed results including symmetry type, confidence, and cultural significance

## Troubleshooting
- Ensure your API key is correctly set in the `.env` file
- Check that the image file is under 10MB
- Verify the image format is supported (JPEG, PNG)
- Make sure you have an active internet connection

