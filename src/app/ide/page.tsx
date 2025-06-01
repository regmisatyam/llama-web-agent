'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import IDELayout from '../components/IDELayout';

export default function IDEPage() {
  const searchParams = useSearchParams();
  const [initialHtml, setInitialHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if there's a code parameter (base64 encoded HTML)
    const encodedHtml = searchParams.get('code');
    if (encodedHtml) {
      try {
        const decodedHtml = atob(encodedHtml);
        setInitialHtml(decodedHtml);
      } catch (error) {
        console.error('Failed to decode HTML:', error);
      }
    } else {
      // Default template
      setInitialHtml(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Project</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-4">Welcome to the IDE</h1>
    <p class="mb-4">Start editing this file or chat with the AI assistant to help you build your website.</p>
    <p class="text-gray-600">This is a default template. You can modify it or create new files.</p>
  </div>
</body>
</html>`);
    }
    setIsLoading(false);
  }, [searchParams]);
  
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-3">Loading IDE...</span>
      </div>
    );
  }
  
  return <IDELayout initialHtml={initialHtml} />;
} 