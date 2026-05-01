import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    } as Record<string, string>,
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
