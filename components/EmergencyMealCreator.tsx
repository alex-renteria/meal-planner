'use client';
import React, { useState } from 'react';
import { Zap, Plus, X, ChefHat, Clock, Users, Loader2 } from 'lucide-react';
import { generateEmergencyRecipes, GeneratedRecipe, RecipeGenerationResponse } from '../lib/ai-service';

const EmergencyMealCreator = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<RecipeGenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const generateRecipes = async () => {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedRecipes(null);

    try {
      const recipes = await generateEmergencyRecipes(ingredients);
      setGeneratedRecipes(recipes);
    } catch (err) {
      setError('Failed to generate recipes. Please try again.');
      console.error('Recipe generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRecipeCardStyles = (type: string) => {
    switch (type) {
      case 'main':
        return {
          border: 'border-blue-500',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800',
          headings: 'text-blue-700',
          numbers: 'text-blue-600'
        };
      case 'side':
        return {
          border: 'border-green-500',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800',
          headings: 'text-green-700',
          numbers: 'text-green-600'
        };
      case 'dessert':
        return {
          border: 'border-purple-500',
          icon: 'text-purple-600',
          badge: 'bg-purple-100 text-purple-800',
          headings: 'text-purple-700',
          numbers: 'text-purple-600'
        };
      default:
        return {
          border: 'border-gray-500',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800',
          headings: 'text-gray-700',
          numbers: 'text-gray-600'
        };
    }
  };

  const RecipeCard = ({ recipe }: { recipe: GeneratedRecipe }) => {
    const styles = getRecipeCardStyles(recipe.type);
    
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${styles.border}`}>
        <div className="flex items-center mb-4">
          <ChefHat className={`mr-2 ${styles.icon}`} size={20} />
          <h3 className="text-xl font-bold text-gray-800">{recipe.name}</h3>
          <span className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${styles.badge} uppercase`}>
            {recipe.type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Clock className="mr-2" size={16} />
            <span className="text-sm">{recipe.cookingTime}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users className="mr-2" size={16} />
            <span className="text-sm">{recipe.servings} servings</span>
          </div>
        </div>

        <div className="mb-4">
          <h4 className={`font-semibold ${styles.headings} mb-2`}>Ingredients:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={`font-semibold ${styles.headings} mb-2`}>Instructions:</h4>
          <ol className="text-sm text-gray-700 space-y-2">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="flex items-start">
                <span className={`mr-2 font-semibold ${styles.numbers}`}>{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Zap className="mr-3 text-yellow-600" size={40} />
            Emergency Meal Creator
          </h1>
          <p className="text-gray-600 mb-4">
            Enter your available ingredients and let AI create delicious recipes for you!
          </p>
        </header>

        {/* Ingredients Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Plus className="mr-2 text-green-600" size={20} />
            Add Your Available Ingredients
          </h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={currentIngredient}
              onChange={(e) => setCurrentIngredient(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter an ingredient (e.g., eggs, flour, milk)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
            <button
              onClick={addIngredient}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Ingredients List */}
          {ingredients.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Your Ingredients:</h3>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    <span>{ingredient}</span>
                    <button
                      onClick={() => removeIngredient(index)}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateRecipes}
            disabled={ingredients.length === 0 || isGenerating}
            className="w-full bg-yellow-600 text-white py-3 px-6 rounded-md hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Generating Recipes...
              </>
            ) : (
              <>
                <Zap className="mr-2" size={20} />
                Generate Emergency Recipes
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Generated Recipes */}
        {generatedRecipes && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
              Your AI-Generated Recipes
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {generatedRecipes.main && (
                <RecipeCard recipe={generatedRecipes.main} />
              )}
              
              {generatedRecipes.side && (
                <RecipeCard recipe={generatedRecipes.side} />
              )}
              
              {generatedRecipes.dessert && (
                <RecipeCard recipe={generatedRecipes.dessert} />
              )}
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Cooking Tips:</h3>
              <ul className="text-blue-700 space-y-2 text-sm">
                <li>• Always taste and adjust seasoning as you cook</li>
                <li>• Feel free to modify ingredients based on your preferences</li>
                <li>• Check that all ingredients are fresh before cooking</li>
                <li>• Don&apos;t hesitate to add herbs or spices you have available</li>
              </ul>
            </div>
          </div>
        )}

        <footer className="text-center mt-8 text-gray-500">
          <p>Powered by AI • Create amazing meals from whatever you have at home!</p>
        </footer>
      </div>
    </div>
  );
};

export default EmergencyMealCreator;