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

export interface EmergencyRecipesResult {
  recipes: RecipeGenerationResponse;
  // Set when the AI couldn't be reached and basic built-in recipes were used instead
  fallbackReason?: string;
}

export async function generateEmergencyRecipes(
  availableIngredients: string[],
  pantryStaples: string[] = []
): Promise<EmergencyRecipesResult> {
  try {
    const response = await fetch('/api/emergency-recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: availableIngredients, pantry: pantryStaples }),
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        recipes: generateFallbackRecipes(availableIngredients),
        fallbackReason: data.error || 'AI is unavailable right now',
      };
    }
    return { recipes: data.recipes };
  } catch (error) {
    console.error('Error generating recipes:', error);
    return {
      recipes: generateFallbackRecipes(availableIngredients),
      fallbackReason: 'Could not reach the recipe service',
    };
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