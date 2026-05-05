import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { restaurantData } = body;

    if (!restaurantData) {
      return NextResponse.json({ success: false, error: 'No data provided' }, { status: 400 });
    }

    const systemPrompt = `You are GrowthOS AI — an expert restaurant growth analyst with deep knowledge of Zomato and Swiggy metrics. You think exactly like a senior Key Accounts Manager who has managed 150+ restaurants in Delhi.

Your benchmarks:
- Restaurant Card CTR: Below 2% is bad, above 4% is strong
- Menu Conversion Rate (Orders divided by Page Opens x 100): Below 10% is bad, 15-20% is good
- Cancellation Rate: Above 1% is bad, 0% is ideal
- Returning User %: Below 15% means poor food or service, 30-40% is healthy
- ATV: Should be 20-30% higher than cheapest main course
- Recent Rating: Below 3.8 is critical, above 4.2 is strong

GMV Formula: CTR gets them in the door. Conversion gets the order. ATV makes the order valuable. Low Cancellations keeps the platform happy. Ratings ensures they come back.

For every leak provide: what the problem is, why it is happening, and the exact fix.

You MUST respond with ONLY a valid JSON object. No markdown, no backticks, no extra text. Just the raw JSON.

JSON structure:
{"overallScore":75,"summary":"2 sentence summary here","leaks":[{"severity":"critical","metric":"Restaurant Card CTR","current":"1.8%","benchmark":"Above 4%","impact":"Estimated 40% more orders if fixed","problem":"CTR is below benchmark","cause":"Cover photo is weak","fix":"Upload a new high contrast food photo as cover image"}],"topWins":["Quick win 1","Quick win 2","Quick win 3"],"weeklyPriority":"The single most important thing to do this week"}`;

    const userMessage = `Analyse this restaurant data and find all revenue leaks:

Restaurant: ${restaurantData.restaurantName}
Platform: ${restaurantData.platform}
Period: ${restaurantData.period}

METRICS:
- Impressions: ${restaurantData.impressions}
- CTR: ${restaurantData.ctr}%
- Page Opens: ${restaurantData.pageOpens}
- Orders: ${restaurantData.orders}
- GMV: Rs ${restaurantData.gmv}
- ATV: Rs ${restaurantData.atv}
- Cancellation Rate: ${restaurantData.cancellationRate}%
- Rating: ${restaurantData.rating}
- New Users: ${restaurantData.newUserPercent}%
- Returning Users: ${restaurantData.returningUserPercent}%
- Menu Conversion Rate: ${(parseFloat(restaurantData.orders) / parseFloat(restaurantData.pageOpens) * 100).toFixed(1)}%

Find all leaks and provide specific fixes. Return ONLY valid JSON.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      } as Record<string, string>,
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    const data = await response.json();

    if (!data.content || !data.content[0]?.text) {
      return NextResponse.json({ success: false, error: 'No response from AI', details: data });
    }

    const rawText = data.content[0].text.trim();

    let auditResult;
    try {
      auditResult = JSON.parse(rawText);
    } catch {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if
