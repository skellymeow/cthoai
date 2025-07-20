import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, systemPrompt, model } = await req.json();
  console.log('Received request with model:', model);
  
  if (!Array.isArray(messages) || !model) {
    return new Response('Invalid request', { status: 400 });
  }

  // Only support Grok 4
  if (model !== 'grok-4') {
    console.log('Unsupported model:', model);
    return new Response('Only Grok 4 is supported', { status: 400 });
  }

  console.log('Routing to Grok');
  return handleGrokRequest(messages, systemPrompt);
}

async function handleGrokRequest(messages: any[], systemPrompt: string) {
  const grokKey = process.env.GROK_API_KEY;
  console.log('Grok API Key exists:', !!grokKey);
  
  if (!grokKey) {
    console.log('No Grok API key found');
    return new Response('Service temporarily unavailable', { status: 503 });
  }

  const requestBody = {
    model: 'grok-4',
    messages: [
      ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
      ...messages.map((m: any) => ({ role: m.role, content: m.content })),
    ],
    stream: true,
  };
  
  console.log('Grok request body:', JSON.stringify(requestBody, null, 2));

  const grokRes = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${grokKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Grok response status:', grokRes.status);
  
  if (!grokRes.ok || !grokRes.body) {
    const text = await grokRes.text();
    console.log('Grok error response:', text);
    return new Response(text, { status: grokRes.status });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = grokRes.body!.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop()!;
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.replace('data: ', '');
          if (data === '[DONE]') {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          } catch (e) {
            // ignore malformed JSON
          }
        }
      }
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 