import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

// Runs on the server so ANTHROPIC_API_KEY never reaches the browser
const RecipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  cookingTime: z.string(),
  servings: z.number().int(),
});

const RecipesSchema = z.object({
  main: RecipeSchema,
  side: RecipeSchema.nullable(),
  dessert: RecipeSchema.nullable(),
});

const RequestSchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(100)).min(1).max(40),
  pantry: z.array(z.string().trim().min(1).max(100)).max(40).default([]),
});

const SYSTEM_PROMPT = `You are a practical home cook helping a family in Australia make dinner tonight from what they already have.

Build recipes around the ingredients the user lists. You may also use anything in their pantry list, plus water, salt, pepper and cooking oil. Do not rely on anything else; if a dish would really benefit from an extra ingredient, mention it as optional in the ingredient line.

Always return a main dish. Only include a side or dessert if the ingredients genuinely support one; otherwise set it to null.

Write ingredient lines with quantities in metric units (e.g. "400g chicken thighs, diced"). Keep instructions short, concrete and in order, with temperatures in °C and times where useful. Cooking time should be a short phrase like "25 minutes". Assume 4 servings unless the ingredients clearly make less.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'AI is not configured' }, { status: 503 });
  }

  const parsedRequest = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsedRequest.success) {
    return Response.json({ error: 'Please send between 1 and 40 ingredients' }, { status: 400 });
  }
  const { ingredients, pantry } = parsedRequest.data;

  const client = new Anthropic();

  try {
    const response = await client.messages.parse({
      model: 'claude-haiku-5-5',
      max_tokens: 16000,
      output_config: {
        effort: 'low',
        format: zodOutputFormat(RecipesSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Ingredients I have: ${ingredients.join(', ')}\n\nPantry staples: ${pantry.length > 0 ? pantry.join(', ') : 'none listed'}`,
        },
      ],
    });

    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return Response.json({ error: 'Could not create recipes from those ingredients' }, { status: 502 });
    }

    const { main, side, dessert } = response.parsed_output;
    return Response.json({
      recipes: {
        main: { ...main, type: 'main' },
        ...(side && { side: { ...side, type: 'side' } }),
        ...(dessert && { dessert: { ...dessert, type: 'dessert' } }),
      },
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: 'AI is busy, please try again in a minute' }, { status: 429 });
    } else if (error instanceof Anthropic.APIError) {
      console.error(`Anthropic API error ${error.status}:`, error.message);
    } else {
      console.error('Recipe generation error:', error);
    }
    return Response.json({ error: 'Recipe generation failed' }, { status: 502 });
  }
}
