import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

export interface GeneratedRecipe {
  name: string;
  type: 'main' | 'side' | 'dessert';
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: number;
}

export interface RecipeGenerationResponse {
  main?: GeneratedRecipe;
  side?: GeneratedRecipe;
  dessert?: GeneratedRecipe;
}

export async function generateEmergencyRecipes(availableIngredients: string[]): Promise<RecipeGenerationResponse> {
  const ingredientsList = availableIngredients.join(', ');
  
  const prompt = `Create recipes using these ingredients: ${ingredientsList}

Return ONLY valid JSON in this exact format:
{
  "main": {
    "name": "Simple Recipe Name",
    "type": "main",
    "ingredients": ["${availableIngredients[0]}", "${availableIngredients[1] || availableIngredients[0]}"],
    "instructions": ["Mix ingredients", "Cook for 10 minutes", "Serve hot"],
    "cookingTime": "15 minutes",
    "servings": 2
  }
}

Requirements:
- Return ONLY the JSON, no other text
- Use only the provided ingredients
- Keep recipes simple and practical
- Include main dish only if limited ingredients`;

  try {
    // Try chat completion API first
    const response = await hf.chatCompletion({
      model: 'HuggingFaceTB/SmolLM3-3B',
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    // Parse the response and extract JSON
    const text = response.choices[0].message.content;
    console.log('AI Response:', text); // Debug log
    
    // Clean the text and try to parse JSON
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find and parse JSON from the response
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log('No JSON found in response, using fallback');
      throw new Error('No valid JSON found in AI response');
    }

    let recipes: RecipeGenerationResponse;
    try {
      recipes = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.log('JSON parse error:', parseError);
      throw new Error('Invalid JSON format in AI response');
    }
    
    // Validate and clean up the response
    const cleanedRecipes: RecipeGenerationResponse = {};
    
    if (recipes.main) {
      cleanedRecipes.main = {
        ...recipes.main,
        type: 'main' as const,
        ingredients: recipes.main.ingredients.filter(ing => 
          availableIngredients.some(available => 
            available.toLowerCase().includes(ing.toLowerCase()) || 
            ing.toLowerCase().includes(available.toLowerCase())
          )
        )
      };
    }
    
    if (recipes.side) {
      cleanedRecipes.side = {
        ...recipes.side,
        type: 'side' as const,
        ingredients: recipes.side.ingredients.filter(ing => 
          availableIngredients.some(available => 
            available.toLowerCase().includes(ing.toLowerCase()) || 
            ing.toLowerCase().includes(available.toLowerCase())
          )
        )
      };
    }
    
    if (recipes.dessert) {
      cleanedRecipes.dessert = {
        ...recipes.dessert,
        type: 'dessert' as const,
        ingredients: recipes.dessert.ingredients.filter(ing => 
          availableIngredients.some(available => 
            available.toLowerCase().includes(ing.toLowerCase()) || 
            ing.toLowerCase().includes(available.toLowerCase())
          )
        )
      };
    }

    return cleanedRecipes;
    
  } catch (error) {
    console.error('Error generating recipes:', error);
    console.log('Using fallback recipe generation...');
    
    // Fallback with simple recipes based on common ingredients
    return generateFallbackRecipes(availableIngredients);
  }
}

function generateFallbackRecipes(ingredients: string[]): RecipeGenerationResponse {
  const lowerIngredients = ingredients.map(i => i.toLowerCase());
  
  const recipes: RecipeGenerationResponse = {};
  
  // Main dish options (prioritized)
  if (lowerIngredients.some(i => i.includes('pasta')) && lowerIngredients.some(i => i.includes('tomato'))) {
    recipes.main = {
      name: 'Simple Tomato Pasta',
      type: 'main',
      ingredients: ingredients.filter(i => 
        i.toLowerCase().includes('pasta') || 
        i.toLowerCase().includes('tomato') || 
        i.toLowerCase().includes('garlic') ||
        i.toLowerCase().includes('oil')
      ),
      instructions: [
        'Boil pasta according to package instructions',
        'Heat oil in a pan, add garlic if available',
        'Add tomatoes and simmer for 10 minutes',
        'Mix with drained pasta and serve'
      ],
      cookingTime: '20 minutes',
      servings: 3
    };
  } else if (lowerIngredients.some(i => i.includes('rice')) && lowerIngredients.some(i => i.includes('egg'))) {
    recipes.main = {
      name: 'Simple Fried Rice',
      type: 'main',
      ingredients: ingredients.filter(i => 
        i.toLowerCase().includes('rice') || 
        i.toLowerCase().includes('egg') || 
        i.toLowerCase().includes('oil') ||
        i.toLowerCase().includes('soy')
      ),
      instructions: [
        'Cook rice and let cool',
        'Heat oil in pan, scramble eggs',
        'Add rice and mix well',
        'Add soy sauce if available, stir-fry for 5 minutes'
      ],
      cookingTime: '15 minutes',
      servings: 2
    };
  } else if (lowerIngredients.some(i => i.includes('egg'))) {
    recipes.main = {
      name: 'Scrambled Eggs',
      type: 'main',
      ingredients: ingredients.filter(i => 
        i.toLowerCase().includes('egg') || 
        i.toLowerCase().includes('oil') ||
        i.toLowerCase().includes('butter')
      ),
      instructions: [
        'Heat oil or butter in a pan over medium heat',
        'Crack eggs into the pan',
        'Scramble eggs until cooked through',
        'Season with salt and pepper if available'
      ],
      cookingTime: '5 minutes',
      servings: 2
    };
  } else if (lowerIngredients.some(i => i.includes('bread'))) {
    recipes.main = {
      name: 'Toast with Toppings',
      type: 'main',
      ingredients: ingredients.filter(i => 
        i.toLowerCase().includes('bread') || 
        i.toLowerCase().includes('butter') ||
        i.toLowerCase().includes('cheese') ||
        i.toLowerCase().includes('tomato')
      ),
      instructions: [
        'Toast bread until golden',
        'Add butter if available',
        'Top with cheese or tomato if available',
        'Serve immediately'
      ],
      cookingTime: '3 minutes',
      servings: 1
    };
  }
  
  // Side dish options
  if (lowerIngredients.some(i => i.includes('potato'))) {
    recipes.side = {
      name: 'Simple Roasted Potatoes',
      type: 'side',
      ingredients: ingredients.filter(i => 
        i.toLowerCase().includes('potato') || 
        i.toLowerCase().includes('oil')
      ),
      instructions: [
        'Wash and cube potatoes',
        'Toss with oil if available',
        'Season with salt and pepper',
        'Bake at 200°C for 25-30 minutes or pan-fry until golden'
      ],
      cookingTime: '30 minutes',
      servings: 4
    };
  } else if (lowerIngredients.some(i => i.includes('carrot'))) {
    recipes.side = {
      name: 'Simple Steamed Carrots',
      type: 'side',
      ingredients: ingredients.filter(i => i.toLowerCase().includes('carrot')),
      instructions: [
        'Peel and slice carrots',
        'Steam for 10-15 minutes until tender',
        'Season with salt if available',
        'Serve hot'
      ],
      cookingTime: '15 minutes',
      servings: 3
    };
  }
  
  // Dessert options
  if (lowerIngredients.some(i => i.includes('flour')) && lowerIngredients.some(i => i.includes('sugar')) && lowerIngredients.some(i => i.includes('egg'))) {
    recipes.dessert = {
      name: 'Simple Pancakes',
      type: 'dessert',
      ingredients: ingredients.filter(i => 
        i.toLowerCase().includes('flour') || 
        i.toLowerCase().includes('sugar') || 
        i.toLowerCase().includes('egg') ||
        i.toLowerCase().includes('milk')
      ),
      instructions: [
        'Mix flour, sugar, and egg',
        'Add milk if available to make batter',
        'Heat pan and cook small pancakes',
        'Serve warm'
      ],
      cookingTime: '10 minutes',
      servings: 4
    };
  } else if (lowerIngredients.some(i => i.includes('banana'))) {
    recipes.dessert = {
      name: 'Sliced Banana',
      type: 'dessert',
      ingredients: ingredients.filter(i => 
        i.toLowerCase().includes('banana') || 
        i.toLowerCase().includes('sugar')
      ),
      instructions: [
        'Peel and slice banana',
        'Sprinkle with sugar if available',
        'Serve fresh',
        'Optional: drizzle with honey if available'
      ],
      cookingTime: '2 minutes',
      servings: 1
    };
  }
  
  // Ensure we always have at least a main dish
  if (!recipes.main) {
    recipes.main = {
      name: 'Ingredient Mix',
      type: 'main',
      ingredients: ingredients.slice(0, 3),
      instructions: [
        'Combine your available ingredients creatively',
        'Cook together in a pan with oil if available',
        'Season with salt and pepper',
        'Cook until heated through and serve'
      ],
      cookingTime: '10 minutes',
      servings: 2
    };
  }
  
  return recipes;
}