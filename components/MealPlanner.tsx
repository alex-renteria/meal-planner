'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, ShoppingCart, ChefHat, RotateCcw } from 'lucide-react';

interface Week {
  title: string;
  meals: {
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
    Sunday: string;
  };
  ingredients: string[];
}

const MealPlanner = () => {
  // Load saved data from localStorage
  const loadSavedData = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mealPlannerData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Error loading saved data:', error);
        }
      }
    }
    return null;
  };

  const savedData = loadSavedData();
  
  const [selectedWeek, setSelectedWeek] = useState<string | null>(savedData?.selectedWeek || null);
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>(savedData?.checkedItems || {});
  const [showSaturdayMeals, setShowSaturdayMeals] = useState(savedData?.showSaturdayMeals || false);
  const [showStaples, setShowStaples] = useState(savedData?.showStaples || false);
  const [selectedSaturdayMeal, setSelectedSaturdayMeal] = useState<string | null>(savedData?.selectedSaturdayMeal || null);
  
  // Initialize staples as all checked (or from saved data)
  const [staplesChecked, setStaplesChecked] = useState<{ [key: string]: boolean }>(() => {
    if (savedData?.staplesChecked) {
      return savedData.staplesChecked;
    }
    
    const staples = [
      "🥛 Milk", "🥚 Eggs", "🍦 Yogurt", "🧀 Cheese", "🍶 Sour Cream", "🧈 Butter", "🌾 Flour", 
      "🧄 Garlic", "🍚 Rice", "🫘 Lentils", "🥕 Vegetables - Potatoes, Carrots, Onion", 
      "🍅 Tomato Cans", "🫛 Chickpeas", "🫘 Beans", "🌮 Tortillas"
    ];
    const initialState: { [key: string]: boolean } = {};
    staples.forEach(item => {
      initialState[`staples-${item}`] = true;
    });
    return initialState;
  });

  const saturdayMeals: { [key: string]: string[] } = {
    "Make at home Sushi": ["Sushi rice", "Nori sheets", "Soy sauce", "Wasabi", "Pickled ginger", "Cucumber", "Avocado", "Smoked salmon", "Tuna", "Crab sticks"],
    "Make at home pizzas": ["Pizza dough/bases", "Tomato paste", "Mozzarella cheese", "Pepperoni", "Mushrooms", "Capsicum", "Olives", "Basil"],
    "Lasagna with wedges": ["Lasagna sheets", "Ground beef/mince", "Bechamel sauce", "Mozzarella cheese", "Parmesan cheese", "Potatoes", "Olive oil"],
    "Chicken or mince burgers": ["Burger buns", "Chicken breast/mince", "Lettuce", "Tomato", "Onion", "Cheese slices", "Mayonnaise"],
    "Nachos": ["Corn chips", "Ground beef/mince", "Canned beans", "Cheese", "Sour cream", "Guacamole", "Salsa", "Jalapeños"],
    "Recipe tin eats mince Asian dish": ["Ground mince", "Soy sauce", "Sesame oil", "Garlic", "Ginger", "Asian vegetables", "Rice noodles"],
    "Ottolenghi cauliflower patties": ["Cauliflower", "Eggs", "Flour", "Parmesan cheese", "Fresh herbs", "Breadcrumbs"],
    "Katsu don": ["Chicken breast", "Panko breadcrumbs", "Eggs", "Flour", "Rice", "Onion", "Soy sauce", "Mirin"],
    "Holly's miso chicken": ["Chicken thighs", "Miso paste", "Mirin", "Sake/cooking wine", "Sugar", "Ginger"],
    "Enchiladas": ["Corn tortillas", "Chicken", "Enchilada sauce", "Cheese", "Onion", "Sour cream", "Coriander"],
    "Chicken cashew stirfry": ["Chicken breast", "Cashews", "Asian vegetables", "Soy sauce", "Oyster sauce", "Garlic", "Ginger"],
    "Abuela's Mexican chicken": ["Chicken pieces", "Mexican spices", "Tomatoes", "Onion", "Capsicum", "Rice"],
    "Vietnamese noodle salad": ["Rice noodles", "Fresh herbs", "Cucumber", "Carrots", "Bean sprouts", "Fish sauce", "Lime", "Chilli"],
    "Enfrijoladas": ["Corn tortillas", "Black beans", "Mexican cheese", "Onion", "Avocado", "Sour cream"],
    "Musamun curry": ["Beef/chicken", "Musamun curry paste", "Coconut milk", "Potatoes", "Peanuts", "Fish sauce"],
    "Thai green curry": ["Chicken/beef", "Green curry paste", "Coconut milk", "Thai basil", "Eggplant", "Fish sauce"],
    "Lamb cous cous": ["Lamb", "Couscous", "Dried fruits", "Almonds", "Cinnamon", "Stock"],
    "Pesto chicken": ["Chicken breast", "Pesto sauce", "Cherry tomatoes", "Mozzarella", "Pine nuts"],
    "Jamie Oliver Salmon": ["Salmon fillets", "Lemon", "Herbs", "Olive oil", "Vegetables"],
    "Slow cooker meals": ["Meat (beef/chicken/pork)", "Vegetables", "Stock", "Herbs", "Potatoes"],
    "Quinoa dish": ["Quinoa", "Vegetables", "Feta cheese", "Olive oil", "Lemon", "Fresh herbs"],
    "Shepherd's pie": ["Ground lamb/beef", "Potatoes", "Peas", "Carrots", "Stock", "Worcestershire sauce"]
  };

  const staplesList = [
    "🥛 Milk", 
    "🥚 Eggs", 
    "🍦 Yogurt", 
    "🧀 Cheese", 
    "🍶 Sour Cream", 
    "🧈 Butter", 
    "🌾 Flour", 
    "🧄 Garlic", 
    "🍚 Rice", 
    "🫘 Lentils", 
    "🥕 Vegetables - Potatoes, Carrots, Onion", 
    "🍅 Tomato Cans", 
    "🫛 Chickpeas", 
    "🫘 Beans", 
    "🌮 Tortillas"
  ];

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dataToSave = {
        selectedWeek,
        checkedItems,
        showSaturdayMeals,
        showStaples,
        selectedSaturdayMeal,
        staplesChecked
      };
      localStorage.setItem('mealPlannerData', JSON.stringify(dataToSave));
    }
  }, [selectedWeek, checkedItems, showSaturdayMeals, showStaples, selectedSaturdayMeal, staplesChecked]);

  // Function to clear all saved data
  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mealPlannerData');
      
      // Reset all states to default
      setSelectedWeek(null);
      setCheckedItems({});
      setShowSaturdayMeals(false);
      setShowStaples(false);
      setSelectedSaturdayMeal(null);
      
      // Reset staples to all checked
      const initialStaples: { [key: string]: boolean } = {};
      staplesList.forEach(item => {
        initialStaples[`staples-${item}`] = true;
      });
      setStaplesChecked(initialStaples);
    }
  };

  const toggleIngredient = (weekKey: string, ingredient: string) => {
    const key = `${weekKey}-${ingredient}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleStaple = (item: string) => {
    const key = `staples-${item}`;
    setStaplesChecked(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSortedIngredients = (weekKey: string, ingredients: string[]) => {
    const sortedIngredients = [...ingredients].sort((a, b) => {
      const aKey = `${weekKey}-${a}`;
      const bKey = `${weekKey}-${b}`;
      const aChecked = checkedItems[aKey];
      const bChecked = checkedItems[bKey];
      
      if (aChecked && !bChecked) return 1;
      if (!aChecked && bChecked) return -1;
      return 0;
    });
    return sortedIngredients;
  };

  const getSortedStaples = () => {
    return [...staplesList].sort((a, b) => {
      const aKey = `staples-${a}`;
      const bKey = `staples-${b}`;
      const aChecked = staplesChecked[aKey];
      const bChecked = staplesChecked[bKey];
      
      if (aChecked && !bChecked) return 1;
      if (!aChecked && bChecked) return -1;
      return 0;
    });
  };

  const getSortedSaturdayIngredients = (mealName: string, ingredients: string[]) => {
    return [...ingredients].sort((a, b) => {
      const aKey = `saturday-${mealName}-${a}`;
      const bKey = `saturday-${mealName}-${b}`;
      const aChecked = checkedItems[aKey];
      const bChecked = checkedItems[bKey];
      
      if (aChecked && !bChecked) return 1;
      if (!aChecked && bChecked) return -1;
      return 0;
    });
  };

  const mealPlan = {
    week1: {
      title: "Week 1",
      meals: {
        Monday: "Bolognese pancakes or pasta",
        Tuesday: "Miriam's curry",
        Wednesday: "Chicken souvlaki",
        Thursday: "Broccoli / pumpkin soup and toast",
        Friday: "Take away",
        Saturday: "",
        Sunday: "Lamb roast"
      },
      ingredients: [
        "Ground beef/mince",
        "Pasta or pancake mix",
        "Onions",
        "Garlic",
        "Canned tomatoes",
        "Tomato paste",
        "Carrots",
        "Celery",
        "Curry powder/paste",
        "Coconut milk",
        "Rice",
        "Chicken breast/thighs",
        "Greek yogurt",
        "Cucumber",
        "Pita bread",
        "Broccoli",
        "Pumpkin",
        "Vegetable stock",
        "Bread",
        "Lamb leg/shoulder",
        "Potatoes",
        "Fresh herbs (rosemary, thyme)"
      ]
    },
    week2: {
      title: "Week 2",
      meals: {
        Monday: "Chilli con carne",
        Tuesday: "Butter chicken",
        Wednesday: "Lentils soup",
        Thursday: "Stir fry noodles",
        Friday: "Take away",
        Saturday: "",
        Sunday: "Mexican carne asada"
      },
      ingredients: [
        "Ground beef/mince",
        "Kidney beans",
        "Chilli powder",
        "Cumin",
        "Capsicum",
        "Chicken breast/thighs",
        "Butter chicken sauce",
        "Basmati rice",
        "Red lentils",
        "Vegetable stock",
        "Egg noodles",
        "Asian vegetables (bok choy, snow peas)",
        "Soy sauce",
        "Sesame oil",
        "Beef steak",
        "Lime",
        "Coriander",
        "Corn tortillas"
      ]
    },
    week3: {
      title: "Week 3",
      meals: {
        Monday: "Mexican meatballs",
        Tuesday: "Pesto ravioli",
        Wednesday: "Pork and 3 veg",
        Thursday: "Chicken soup",
        Friday: "Take away",
        Saturday: "",
        Sunday: "Fried rice or doula ginger rice and dumplings"
      },
      ingredients: [
        "Ground beef/mince",
        "Mexican seasoning",
        "Fresh ravioli",
        "Pesto sauce",
        "Parmesan cheese",
        "Pork chops/loin",
        "Mixed vegetables",
        "Chicken breast/thighs",
        "Chicken stock",
        "Noodles",
        "Jasmine rice",
        "Eggs",
        "Mixed vegetables for fried rice",
        "Frozen dumplings",
        "Fresh ginger",
        "Spring onions"
      ]
    },
    week4: {
      title: "Week 4",
      meals: {
        Monday: "Shepherd's pie",
        Tuesday: "Minestrone soup",
        Wednesday: "Chicken schnitzel and 3 veg",
        Thursday: "Carbonara pasta",
        Friday: "Take away",
        Saturday: "",
        Sunday: "Pulled pork tacos"
      },
      ingredients: [
        "Ground lamb/beef",
        "Potatoes",
        "Frozen peas",
        "Mixed vegetables",
        "Canned tomatoes",
        "Vegetable stock",
        "Pasta (small shapes)",
        "Chicken breast",
        "Breadcrumbs",
        "Eggs",
        "Pasta (spaghetti/fettuccine)",
        "Bacon",
        "Cream",
        "Parmesan cheese",
        "Pork shoulder",
        "BBQ sauce",
        "Soft taco shells",
        "Coleslaw mix",
        "Avocado"
      ]
    }
  };

  // Calculate current week and day (client-side only to avoid hydration mismatch)
  const [currentWeekData, setCurrentWeekData] = useState<{
    weekNumber: number;
    currentDay: string;
    todaysMeal: string;
    tomorrowWeekNumber: number;
    tomorrowDay: string;
    tomorrowsMeal: string;
  } | null>(null);

  useEffect(() => {
    const startDate = new Date(2024, 7, 4); // August 4th, 2024 (month is 0-indexed)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Today's calculation
    const todayDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const todayWeekNumber = Math.floor(todayDiff / 7) % 4 + 1;
    const currentDay = dayNames[today.getDay()];
    const todayWeekKey = `week${todayWeekNumber}`;
    const todaysMeal = mealPlan[todayWeekKey as keyof typeof mealPlan]?.meals[currentDay as keyof typeof mealPlan.week1.meals] || "No meal planned";
    
    // Tomorrow's calculation
    const tomorrowDiff = Math.floor((tomorrow.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const tomorrowWeekNumber = Math.floor(tomorrowDiff / 7) % 4 + 1;
    const tomorrowDay = dayNames[tomorrow.getDay()];
    const tomorrowWeekKey = `week${tomorrowWeekNumber}`;
    const tomorrowsMeal = mealPlan[tomorrowWeekKey as keyof typeof mealPlan]?.meals[tomorrowDay as keyof typeof mealPlan.week1.meals] || "No meal planned";
    
    setCurrentWeekData({ 
      weekNumber: todayWeekNumber, 
      currentDay, 
      todaysMeal,
      tomorrowWeekNumber,
      tomorrowDay,
      tomorrowsMeal
    });
  }, [mealPlan]);

  const WeekCard = ({ weekKey, week }: { weekKey: string; week: Week }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Calendar className="mr-2 text-blue-600" size={20} />
        {week.title}
      </h3>
      
      <div className="space-y-2 mb-4">
        {Object.entries(week.meals).map(([day, meal]) => {
          const mealStr = meal as string;
          return mealStr && (
            <div key={day} className="flex">
              <span className="font-medium text-gray-600 w-20">{day.slice(0, 3)}:</span>
              <span className="text-gray-800">{mealStr}</span>
            </div>
          );
        })}
      </div>
      
      <button
        onClick={() => setSelectedWeek(selectedWeek === weekKey ? null : weekKey)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <ShoppingCart className="mr-2" size={16} />
        {selectedWeek === weekKey ? 'Hide' : 'Show'} Shopping List
      </button>
      
      {selectedWeek === weekKey && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <h4 className="font-bold text-green-800 mb-3 flex items-center">
            <ShoppingCart className="mr-2" size={16} />
            Woolworths Shopping List
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {getSortedIngredients(weekKey, week.ingredients).map((ingredient, index) => {
              const itemKey = `${weekKey}-${ingredient}`;
              const isChecked = checkedItems[itemKey];
              
              return (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={itemKey}
                    checked={isChecked || false}
                    onChange={() => toggleIngredient(weekKey, ingredient)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mr-3"
                  />
                  <label
                    htmlFor={itemKey}
                    className={`text-green-700 cursor-pointer select-none ${
                      isChecked ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {ingredient}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <ChefHat className="mr-3 text-blue-600" size={40} />
            4-Week Meal Planner
          </h1>
          <p className="text-gray-600 mb-4">Click on any week to see your Woolworths shopping list</p>
          <button
            onClick={clearAllData}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center mx-auto text-sm"
          >
            <RotateCcw className="mr-2" size={16} />
            Reset All Data
          </button>
          
          {/* Today's and Tomorrow's Menu Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Today's Menu */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-center">
                <Calendar className="mr-2 text-green-600" size={20} />
                Today&apos;s Menu
              </h3>
              <div className="text-center">
                {currentWeekData ? (
                  <>
                    <p className="text-sm text-gray-600 mb-1">
                      {currentWeekData.currentDay} - Week {currentWeekData.weekNumber}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {currentWeekData.todaysMeal}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">Loading...</p>
                )}
              </div>
            </div>

            {/* Tomorrow's Menu */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-center">
                <Calendar className="mr-2 text-green-600" size={20} />
                Tomorrow&apos;s Menu
              </h3>
              <div className="text-center">
                {currentWeekData ? (
                  <>
                    <p className="text-sm text-gray-600 mb-1">
                      {currentWeekData.tomorrowDay} - Week {currentWeekData.tomorrowWeekNumber}
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {currentWeekData.tomorrowsMeal}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">Loading...</p>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(mealPlan).map(([weekKey, week]) => (
            <WeekCard key={weekKey} weekKey={weekKey} week={week} />
          ))}
        </div>

        {/* Saturday Meals Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <ChefHat className="mr-2 text-purple-600" size={20} />
            Saturday Night Options
          </h3>
          
          <button
            onClick={() => setShowSaturdayMeals(!showSaturdayMeals)}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center mb-4"
          >
            <Calendar className="mr-2" size={16} />
            {showSaturdayMeals ? 'Hide' : 'Show'} Saturday Meal Options
          </button>

          {showSaturdayMeals && (
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(saturdayMeals).map((meal) => (
                <button
                  key={meal}
                  onClick={() => setSelectedSaturdayMeal(selectedSaturdayMeal === meal ? null : meal)}
                  className={`p-3 rounded-md border-2 transition-colors text-left text-sm ${
                    selectedSaturdayMeal === meal
                      ? 'border-purple-600 bg-purple-50 text-purple-800'
                      : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          )}

          {selectedSaturdayMeal && (
            <div className="mt-4 p-4 bg-purple-50 rounded-md">
              <h4 className="font-bold text-purple-800 mb-3">
                Ingredients for {selectedSaturdayMeal}:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {selectedSaturdayMeal && getSortedSaturdayIngredients(selectedSaturdayMeal, saturdayMeals[selectedSaturdayMeal] || []).map((ingredient, index) => {
                  const itemKey = `saturday-${selectedSaturdayMeal}-${ingredient}`;
                  const isChecked = checkedItems[itemKey];
                  
                  return (
                    <div key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        id={itemKey}
                        checked={isChecked || false}
                        onChange={() => {
                          const key = itemKey;
                          setCheckedItems(prev => ({
                            ...prev,
                            [key]: !prev[key]
                          }));
                        }}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mr-3"
                      />
                      <label
                        htmlFor={itemKey}
                        className={`text-purple-700 cursor-pointer select-none ${
                          isChecked ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {ingredient}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Staples Checklist Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <ShoppingCart className="mr-2 text-orange-600" size={20} />
            Staples Check List
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Keep these ticked when you have them. Untick when you run out - they will move to the top.
          </p>
          
          <button
            onClick={() => setShowStaples(!showStaples)}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center mb-4"
          >
            <ShoppingCart className="mr-2" size={16} />
            {showStaples ? 'Hide' : 'Show'} Staples List
          </button>

          {showStaples && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {getSortedStaples().map((item, index) => {
                const itemKey = `staples-${item}`;
                const isChecked = staplesChecked[itemKey];
                
                return (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={itemKey}
                      checked={isChecked || false}
                      onChange={() => toggleStaple(item)}
                      className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mr-3"
                    />
                    <label
                      htmlFor={itemKey}
                      className={`text-orange-700 cursor-pointer select-none ${
                        isChecked ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {item}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <footer className="text-center mt-8 text-gray-500">
          <p>Share this link with your partner to plan meals together!</p>
        </footer>
      </div>
    </div>
  );
};

export default MealPlanner;