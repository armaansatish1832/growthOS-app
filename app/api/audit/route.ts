import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { restaurantData } = await req.json();

  if (!restaurantData) {
    return NextResponse.json({ error: 'No data provided' }, { status: 400 });
  }

  const systemPrompt = `You are GrowthOS AI — an expert restaurant growth analyst with deep knowledge of Zomato and Swiggy metrics. You think and analyse exactly like a senior Key Accounts Manager who has managed 150+ restaurants in Delhi.

Your job is to analyse a restaurant's performance data and produce a clear, actionable audit report.

You know these benchmarks from experience:
- Restaurant Card CTR: Below 2% is bad, above 4% is strong
- Menu Conversion Rate (Orders/Page Opens): Below 10% is bad, 15-20% is good
- Cancellation Rate: Above 1% is bad, 0% is ideal
- Returning User %: Below 15% means poor food/service, 30-40% is healthy
- ATV: Should be 20-30% higher than cheapest main course
- Recent Rating: Below 3.8 is critical, above 4.2 is strong

You follow this GMV formula:
CTR gets them in the door → Conversion gets the order → ATV makes the order valuable → Low Cancellations keeps the platform happy → Ratings ensures they come back

For every leak you find, you must provide:
1. What the problem is
2. Why it is happening
3. The exact fix — specific, actionable, copy-paste ready

Format your response as a JSON object with this structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2 sentence overall assessment>",
  "leaks": [
    {
      "severity": "critical" | "warning" | "opportunity",
      "metric": "<metric name>",
      "current": "<current value>",
      "benchmark": "<what it should be>",
      "impact": "<estimated GMV impact>",
      "problem": "<what is wrong>",
      "cause": "<why it is happening>",
      "fix": "<exact actionable fix>"
    }
  ],
  "topWins": ["<quick win 1>", "<quick win 2>", "<quick win 3>"],
  "weeklyPriority": "<the single most important thing to do this week>"
}

Only return valid JSON. No extra text.`;

  const userMessage = `Please analyse this restaurant's performance data and identify all revenue leaks:

Restaurant: ${restaurantData.restaurantName}
Platform: ${restaurantData.platform}
Period: ${restaurantData.period}

KEY METRICS:
- Restaurant Card Impressions: ${restaurantData.impressions}
- Restaurant Card CTR: ${restaurantData.ctr}%
- Total Page Opens: ${restaurantData.pageOpens}
- Total Orders/Transactions: ${restaurantData.orders}
- GMV: ₹${restaurantData.gmv}
- Average Transaction Value (ATV): ₹${restaurantData.atv}
- Cancellation Rate: ${restaurantData.cancellationRate}%
- Current Rating: ${restaurantData.rating}
- New Users %: ${restaurantData.newUserPercent}%
- Returning Users %: ${restaurantData.returningUserPercent}%

Calculate the Menu Conversion Rate as: ${restaurantData.orders} ÷ ${restaurantData.pageOpens} × 100

Identify all leaks, compare every metric against benchmarks, and provide specific fixes.`;

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

  if (data.content && data.content[0]?.text) {
    try {
      const auditResult = JSON.parse(data.content[0].text);
      return NextResponse.json({ success: true, audit: auditResult });
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to parse audit results' });
    }
  }

  return NextResponse.json({ success: false, error: 'No response from AI' });
}
