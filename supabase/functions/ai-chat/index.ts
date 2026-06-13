import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface Source {
  name: string;
  type: string;
  content: string | null;
  file_url: string | null;
}

interface ChatRequest {
  question: string;
  sources: Source[];
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function fetchWebContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract text content from HTML
    let text = html
      // Remove scripts and styles
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      // Remove HTML tags
      .replace(/<[^>]+>/g, ' ')
      // Decode common HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Limit content length
    if (text.length > 10000) {
      text = text.substring(0, 10000) + '...';
    }

    return text;
  } catch (error) {
    console.error('Error fetching URL:', error);
    return `[Could not fetch content from URL: ${url}]`;
  }
}

async function generateAIResponse(question: string, context: string): Promise<{ answer: string; citations: Array<{ source: string; text: string }> }> {
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!anthropicApiKey) {
    // Fallback to basic keyword matching if no API key
    return generateBasicResponse(question, context);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: `You are NotebookLM, a helpful AI research assistant. You ONLY answer questions based on the provided sources. You never use outside knowledge. You provide accurate, grounded answers with citations.

When answering:
1. Only use information from the provided sources
2. If the sources don't contain the answer, say so clearly
3. Always cite which source(s) you used for each part of your answer
4. Be concise but thorough
5. If asked to summarize, create a clear summary of key points
6. If asked to compare, highlight similarities and differences found in sources

Format your response naturally but reference sources like [Source Name] when citing.`,
        messages: [
          {
            role: 'user',
            content: `Here are my sources:\n\n${context}\n\n---\n\nQuestion: ${question}\n\nPlease answer based ONLY on these sources. If the sources don't contain relevant information, say so.`
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return generateBasicResponse(question, context);
    }

    const data = await response.json();
    const answer = data.content[0]?.text || 'Unable to generate response.';

    // Extract citations from the answer
    const citations: Array<{ source: string; text: string }> = [];
    const sourceMatches = answer.match(/\[([^\]]+)\]/g);
    if (sourceMatches) {
      const uniqueSources = [...new Set(sourceMatches.map(m => m.slice(1, -1)))];
      uniqueSources.forEach(source => {
        citations.push({ source, text: `Referenced in response` });
      });
    }

    return { answer, citations };
  } catch (error) {
    console.error('AI generation error:', error);
    return generateBasicResponse(question, context);
  }
}

function generateBasicResponse(question: string, context: string): { answer: string; citations: Array<{ source: string; text: string }> } {
  const lowerQuestion = question.toLowerCase();
  const citations: Array<{ source: string; text: string }> = [];

  // Check for summary request
  if (lowerQuestion.includes('summarize') || lowerQuestion.includes('summary')) {
    return {
      answer: `Based on your sources, here's a summary:\n\n${context.split('\n\n').slice(0, 5).join('\n\n')}\n\nNote: For more intelligent summarization, add an ANTHROPIC_API_KEY to enable AI-powered analysis.`,
      citations: []
    };
  }

  // Check what question type
  if (lowerQuestion.includes('what is') || lowerQuestion.includes('what are') || lowerQuestion.includes('explain')) {
    const relevantParts = context.split('\n\n').filter(part =>
      part.toLowerCase().includes(lowerQuestion.replace('what is ', '').replace('what are ', '').replace('explain ', '').split(' ')[0])
    );

    if (relevantParts.length > 0) {
      return {
        answer: `Based on your sources:\n\n${relevantParts.slice(0, 3).join('\n\n')}\n\nFor more accurate answers, add an ANTHROPIC_API_KEY to enable AI-powered analysis.`,
        citations: []
      };
    }
  }

  // Check if question keywords appear in context
  const questionWords = lowerQuestion.split(' ').filter(w => w.length > 3);
  const matchingContexts: string[] = [];

  context.split('\n---\n').forEach(section => {
    if (questionWords.some(word => section.toLowerCase().includes(word))) {
      matchingContexts.push(section);
    }
  });

  if (matchingContexts.length > 0) {
    return {
      answer: `Based on your sources, I found this relevant information:\n\n${matchingContexts.slice(0, 2).join('\n\n')}\n\nFor more intelligent analysis, add an ANTHROPIC_API_KEY to enable AI-powered Q&A.`,
      citations: []
    };
  }

  return {
    answer: `I searched through your sources but couldn't find specific information to answer "${question}". Try uploading more relevant sources or asking a different question.\n\nFor AI-powered intelligent answers, add an ANTHROPIC_API_KEY.`,
    citations: []
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    const { question, sources } = await req.json() as ChatRequest;

    if (!question || !sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ error: "Question and sources are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Build context from sources
    let contextParts: string[] = [];

    for (const source of sources) {
      let sourceContent = '';

      if (source.type === 'link' && source.content) {
        // Try to fetch web content for links
        const webContent = await fetchWebContent(source.content);
        sourceContent = `[${source.name}] (${source.content}):\n${webContent}`;
      } else if (source.type === 'link' && source.file_url) {
        const webContent = await fetchWebContent(source.file_url);
        sourceContent = `[${source.name}] (${source.file_url}):\n${webContent}`;
      } else if (source.content) {
        // Use provided content
        sourceContent = `[${source.name}]:\n${source.content}`;
      } else if (source.type === 'image' && source.file_url) {
        // For images, we can't process them directly, but we note their presence
        sourceContent = `[${source.name}]:\n[Image uploaded - cannot process image content directly. The user has uploaded an image named "${source.name}".]`;
      } else if (source.file_url && (source.type === 'text' || source.type === 'doc' || source.type === 'pdf' || source.type === 'file')) {
        // Try to fetch file content if it's a text-based file
        if (source.file_url.endsWith('.txt') || source.file_url.endsWith('.md')) {
          try {
            const response = await fetch(source.file_url);
            if (response.ok) {
              const text = await response.text();
              sourceContent = `[${source.name}]:\n${text.substring(0, 5000)}`;
            }
          } catch (e) {
            sourceContent = `[${source.name}]:\n[File: ${source.file_url}]`;
          }
        } else if (source.file_url.endsWith('.pdf')) {
          sourceContent = `[${source.name}]:\n[PDF document uploaded: ${source.file_url}. Note: PDF text extraction requires additional processing.]`;
        } else {
          sourceContent = `[${source.name}]:\n[Uploaded file: ${source.file_url}]`;
        }
      } else {
        sourceContent = `[${source.name}]:\n[No content available]`;
      }

      if (sourceContent) {
        contextParts.push(sourceContent);
      }
    }

    const context = contextParts.join('\n\n---\n\n');

    // Generate AI response
    const { answer, citations } = await generateAIResponse(question, context);

    return new Response(
      JSON.stringify({
        answer,
        citations,
        sourcesUsed: sources.map(s => s.name)
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
