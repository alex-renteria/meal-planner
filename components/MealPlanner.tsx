'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ShoppingCart, ChefHat, RotateCcw, Zap } from 'lucide-react';
import EmergencyMealCreator from './EmergencyMealCreator';

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
  const [showTodaysCooking, setShowTodaysCooking] = useState(false);
  const [showTomorrowsCooking, setShowTomorrowsCooking] = useState(false);
  const [showEmergencyMealCreator, setShowEmergencyMealCreator] = useState(false);
  
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

  const mealPlan = useMemo(() => ({
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
  }), []);

  // Meal-specific ingredients mapping (currently unused but kept for potential future use)
  /*
  const mealIngredients: { [key: string]: string[] } = {
    "Bolognese pancakes or pasta": ["Ground beef/mince", "Pasta or pancake mix", "Onions", "Garlic", "Canned tomatoes", "Tomato paste"],
    "Miriam's curry": ["Curry powder/paste", "Coconut milk", "Rice", "Onions", "Garlic"],
    "Chicken souvlaki": ["Chicken breast/thighs", "Greek yogurt", "Cucumber", "Pita bread"],
    "Broccoli / pumpkin soup and toast": ["Broccoli", "Pumpkin", "Vegetable stock", "Bread"],
    "Take away": [],
    "Lamb roast": ["Lamb leg/shoulder", "Potatoes", "Fresh herbs (rosemary, thyme)", "Carrots"],
    "Chilli con carne": ["Ground beef/mince", "Kidney beans", "Chilli powder", "Cumin", "Capsicum", "Onions", "Canned tomatoes"],
    "Butter chicken": ["Chicken breast/thighs", "Butter chicken sauce", "Basmati rice"],
    "Lentils soup": ["Red lentils", "Vegetable stock", "Onions", "Garlic", "Carrots"],
    "Stir fry noodles": ["Egg noodles", "Asian vegetables (bok choy, snow peas)", "Soy sauce", "Sesame oil", "Garlic"],
    "Mexican carne asada": ["Beef steak", "Lime", "Coriander", "Corn tortillas", "Onions"],
    "Mexican meatballs": ["Ground beef/mince", "Mexican seasoning", "Onions", "Garlic"],
    "Pesto ravioli": ["Fresh ravioli", "Pesto sauce", "Parmesan cheese"],
    "Pork and 3 veg": ["Pork chops/loin", "Mixed vegetables", "Potatoes"],
    "Chicken soup": ["Chicken breast/thighs", "Chicken stock", "Noodles", "Carrots", "Celery"],
    "Fried rice or doula ginger rice and dumplings": ["Jasmine rice", "Eggs", "Mixed vegetables for fried rice", "Frozen dumplings", "Fresh ginger", "Spring onions"],
    "Shepherd's pie": ["Ground lamb/beef", "Potatoes", "Frozen peas", "Carrots", "Onions"],
    "Minestrone soup": ["Mixed vegetables", "Canned tomatoes", "Vegetable stock", "Pasta (small shapes)"],
    "Chicken schnitzel and 3 veg": ["Chicken breast", "Breadcrumbs", "Eggs", "Mixed vegetables"],
    "Carbonara pasta": ["Pasta (spaghetti/fettuccine)", "Bacon", "Cream", "Parmesan cheese", "Eggs"],
    "Pulled pork tacos": ["Pork shoulder", "BBQ sauce", "Soft taco shells", "Coleslaw mix", "Avocado"]
  };
  */

  // Cooking methods with ingredients and instructions
  const cookingMethods: { [key: string]: { ingredients: string[]; instructions: string[] } } = {
    "Bolognese pancakes or pasta": {
      ingredients: ["500g ground beef/mince", "1 large onion, diced", "2 cloves garlic, minced", "400g can tomatoes", "2 tbsp tomato paste", "500g pasta or pancake mix"],
      instructions: [
        "Heat oil in a large pan over medium heat",
        "Cook onion and garlic until softened, about 3 minutes",
        "Add mince and cook until browned, breaking up lumps",
        "Stir in tomato paste and cook for 1 minute",
        "Add canned tomatoes, simmer for 20 minutes",
        "Season with salt and pepper. Serve with pasta or make pancakes"
      ]
    },
    "Miriam's curry": {
      ingredients: ["2 tbsp curry powder/paste", "400ml coconut milk", "1 cup basmati rice", "1 large onion, diced", "2 cloves garlic, minced"],
      instructions: [
        "Cook rice according to package instructions",
        "Heat oil in a large pan, cook onion until soft",
        "Add garlic and curry paste, cook for 1 minute",
        "Pour in coconut milk, bring to a gentle simmer",
        "Simmer for 15 minutes until thickened",
        "Serve over rice"
      ]
    },
    "Chicken souvlaki": {
      ingredients: ["600g chicken breast/thighs, cubed", "200g Greek yogurt", "1 cucumber, diced", "4 pita breads"],
      instructions: [
        "Marinate chicken in half the yogurt for 30 minutes",
        "Thread chicken onto skewers",
        "Grill or pan-fry for 12-15 minutes until cooked through",
        "Mix remaining yogurt with cucumber for tzatziki",
        "Warm pita bread and serve with chicken and tzatziki"
      ]
    },
    "Broccoli / pumpkin soup and toast": {
      ingredients: ["500g broccoli or pumpkin, chopped", "1L vegetable stock", "4 slices bread"],
      instructions: [
        "Boil vegetables in stock for 15-20 minutes until tender",
        "Blend soup until smooth (use stick blender or food processor)",
        "Season with salt and pepper",
        "Toast bread and serve alongside soup"
      ]
    },
    "Lamb roast": {
      ingredients: ["1.5kg lamb leg/shoulder", "1kg potatoes, quartered", "2 sprigs fresh rosemary", "3 carrots, chopped"],
      instructions: [
        "Preheat oven to 200°C",
        "Season lamb with salt, pepper and rosemary",
        "Roast for 20 minutes per 500g plus 20 minutes extra",
        "Add potatoes and carrots around lamb for last 45 minutes",
        "Rest meat for 10 minutes before carving"
      ]
    },
    "Chilli con carne": {
      ingredients: ["500g ground beef/mince", "400g kidney beans", "1 tsp chilli powder", "1 tsp cumin", "1 capsicum, diced", "1 onion, diced", "400g can tomatoes"],
      instructions: [
        "Cook onion and capsicum until soft",
        "Add mince, cook until browned",
        "Stir in spices and cook for 1 minute",
        "Add tomatoes and beans, bring to boil",
        "Simmer for 30 minutes, stirring occasionally",
        "Serve with rice or bread"
      ]
    },
    "Butter chicken": {
      ingredients: ["600g chicken breast/thighs, cubed", "400g jar butter chicken sauce", "1 cup basmati rice"],
      instructions: [
        "Cook rice according to package instructions",
        "Heat oil in large pan, cook chicken until golden",
        "Add butter chicken sauce to pan",
        "Simmer for 15 minutes until chicken is cooked through",
        "Serve over rice"
      ]
    },
    "Take away": {
      ingredients: [],
      instructions: ["Order from your favorite restaurant!", "Enjoy without cooking!"]
    },
    "Lentils soup": {
      ingredients: ["1 cup red lentils", "1L vegetable stock", "1 onion, diced", "2 cloves garlic, minced", "2 carrots, diced"],
      instructions: [
        "Heat oil in large pot, cook onion until soft",
        "Add garlic and carrots, cook for 2 minutes",
        "Add lentils and stock, bring to boil",
        "Simmer for 20-25 minutes until lentils are tender",
        "Season and serve hot"
      ]
    },
    "Stir fry noodles": {
      ingredients: ["300g egg noodles", "300g Asian vegetables (bok choy, snow peas)", "2 tbsp soy sauce", "1 tsp sesame oil", "2 cloves garlic, minced"],
      instructions: [
        "Cook noodles according to package instructions, drain",
        "Heat oil in wok or large pan over high heat",
        "Add garlic, cook for 30 seconds",
        "Add vegetables, stir-fry for 3-4 minutes",
        "Add noodles, soy sauce and sesame oil, toss to combine"
      ]
    },
    "Mexican carne asada": {
      ingredients: ["600g beef steak", "2 limes, juiced", "1/4 cup coriander, chopped", "8 corn tortillas", "1 onion, sliced"],
      instructions: [
        "Marinate steak in lime juice for 30 minutes",
        "Grill or pan-fry steak for 4-6 minutes each side",
        "Rest meat for 5 minutes, then slice thinly",
        "Warm tortillas, serve with meat, onion and coriander"
      ]
    },
    "Mexican meatballs": {
      ingredients: ["500g ground beef/mince", "2 tsp Mexican seasoning", "1 onion, diced", "2 cloves garlic, minced"],
      instructions: [
        "Mix mince with seasoning, form into meatballs",
        "Heat oil in pan, brown meatballs all over",
        "Add onion and garlic, cook until soft",
        "Simmer with a little water for 15 minutes until cooked through"
      ]
    },
    "Pesto ravioli": {
      ingredients: ["500g fresh ravioli", "1/2 cup pesto sauce", "1/4 cup Parmesan cheese, grated"],
      instructions: [
        "Cook ravioli according to package instructions",
        "Drain and return to pot",
        "Gently toss with pesto sauce",
        "Serve immediately with Parmesan cheese"
      ]
    },
    "Pork and 3 veg": {
      ingredients: ["4 pork chops/loin steaks", "500g mixed vegetables", "500g potatoes"],
      instructions: [
        "Season pork with salt and pepper",
        "Heat oil in pan, cook pork for 4-5 minutes each side",
        "Steam or boil vegetables and potatoes until tender",
        "Serve pork with vegetables and potatoes"
      ]
    },
    "Chicken soup": {
      ingredients: ["400g chicken breast/thighs", "1L chicken stock", "200g noodles", "2 carrots, sliced", "2 celery stalks, sliced"],
      instructions: [
        "Simmer chicken in stock for 20 minutes until cooked",
        "Remove chicken, shred when cool enough to handle",
        "Add vegetables to stock, simmer for 10 minutes",
        "Add noodles and shredded chicken, cook until noodles are tender"
      ]
    },
    "Fried rice or doula ginger rice and dumplings": {
      ingredients: ["2 cups cooked jasmine rice", "3 eggs, beaten", "300g mixed vegetables", "12 frozen dumplings", "2 tbsp fresh ginger, minced", "4 spring onions, sliced"],
      instructions: [
        "Steam dumplings according to package instructions",
        "Heat oil in wok, scramble eggs and set aside",
        "Stir-fry vegetables and ginger for 3 minutes",
        "Add rice, breaking up clumps, stir-fry for 5 minutes",
        "Add eggs and spring onions, serve with dumplings"
      ]
    },
    "Shepherd's pie": {
      ingredients: ["500g ground lamb/beef", "1kg potatoes", "1 cup frozen peas", "2 carrots, diced", "1 onion, diced"],
      instructions: [
        "Boil potatoes until tender, mash with butter",
        "Cook onion and carrots until soft",
        "Add mince, cook until browned",
        "Add peas, season and place in baking dish",
        "Top with mashed potato, bake at 200°C for 25 minutes"
      ]
    },
    "Minestrone soup": {
      ingredients: ["400g mixed vegetables", "400g can tomatoes", "1L vegetable stock", "100g small pasta shapes"],
      instructions: [
        "Heat oil in large pot, cook vegetables for 5 minutes",
        "Add tomatoes and stock, bring to boil",
        "Add pasta, simmer for 12-15 minutes until tender",
        "Season with salt and pepper"
      ]
    },
    "Chicken schnitzel and 3 veg": {
      ingredients: ["4 chicken breasts", "1 cup breadcrumbs", "2 eggs, beaten", "500g mixed vegetables"],
      instructions: [
        "Pound chicken to 1cm thickness",
        "Dip in egg, then coat with breadcrumbs",
        "Fry in oil for 4-5 minutes each side until golden",
        "Steam vegetables until tender, serve with schnitzel"
      ]
    },
    "Carbonara pasta": {
      ingredients: ["400g spaghetti/fettuccine", "200g bacon, diced", "300ml cream", "1/2 cup Parmesan cheese", "2 eggs"],
      instructions: [
        "Cook pasta according to package instructions",
        "Cook bacon until crispy",
        "Beat eggs with Parmesan cheese",
        "Drain pasta, add bacon and cream, toss",
        "Remove from heat, add egg mixture, toss quickly"
      ]
    },
    "Pulled pork tacos": {
      ingredients: ["1kg pork shoulder", "1/2 cup BBQ sauce", "8 soft taco shells", "300g coleslaw mix", "1 avocado, sliced"],
      instructions: [
        "Slow cook pork shoulder for 6-8 hours until tender",
        "Shred pork and mix with BBQ sauce",
        "Warm taco shells",
        "Fill with pork, coleslaw and avocado"
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
    // Only run on client side to prevent hydration mismatch
    if (typeof window !== 'undefined') {
      // Use a more stable date calculation that's consistent
      const calculateWeekData = () => {
        const startDate = new Date(2024, 7, 4); // August 4th, 2024 (month is 0-indexed)
        const now = new Date();
        // Reset hours to avoid timezone issues
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
        
        return { 
          weekNumber: todayWeekNumber, 
          currentDay, 
          todaysMeal,
          tomorrowWeekNumber,
          tomorrowDay,
          tomorrowsMeal
        };
      };

      // Add a small delay to ensure client-side rendering
      const timer = setTimeout(() => {
        setCurrentWeekData(calculateWeekData());
      }, 100);

      return () => clearTimeout(timer);
    }
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
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button
              onClick={() => setShowEmergencyMealCreator(!showEmergencyMealCreator)}
              className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition-colors flex items-center text-sm font-semibold"
            >
              <Zap className="mr-2" size={18} />
              Emergency Meal Creator
            </button>
            <button
              onClick={clearAllData}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center text-sm"
            >
              <RotateCcw className="mr-2" size={16} />
              Reset All Data
            </button>
          </div>
          
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
                    <p className="text-lg font-semibold text-gray-800 mb-4">
                      {currentWeekData.todaysMeal}
                    </p>
                    <button
                      onClick={() => setShowTodaysCooking(!showTodaysCooking)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm w-full"
                    >
                      <ChefHat className="mr-2" size={14} />
                      {showTodaysCooking ? 'Hide' : 'Show'} Ingredients & Cooking Method
                    </button>
                    {showTodaysCooking && cookingMethods[currentWeekData.todaysMeal] && (
                      <div className="mt-4 p-4 bg-green-50 rounded-md text-left">
                        <h4 className="font-bold text-green-800 mb-3 text-center">
                          How to cook {currentWeekData.todaysMeal}
                        </h4>
                        <div className="mb-3">
                          <h5 className="font-semibold text-green-700 mb-2">Ingredients:</h5>
                          <ul className="text-xs text-green-600 space-y-1">
                            {cookingMethods[currentWeekData.todaysMeal].ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-700 mb-2">Instructions:</h5>
                          <ol className="text-xs text-green-600 space-y-1">
                            {cookingMethods[currentWeekData.todaysMeal].instructions.map((step, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2 font-semibold">{index + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
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
                    <p className="text-lg font-semibold text-gray-800 mb-4">
                      {currentWeekData.tomorrowsMeal}
                    </p>
                    <button
                      onClick={() => setShowTomorrowsCooking(!showTomorrowsCooking)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm w-full"
                    >
                      <ChefHat className="mr-2" size={14} />
                      {showTomorrowsCooking ? 'Hide' : 'Show'} Ingredients & Cooking Method
                    </button>
                    {showTomorrowsCooking && cookingMethods[currentWeekData.tomorrowsMeal] && (
                      <div className="mt-4 p-4 bg-green-50 rounded-md text-left">
                        <h4 className="font-bold text-green-800 mb-3 text-center">
                          How to cook {currentWeekData.tomorrowsMeal}
                        </h4>
                        <div className="mb-3">
                          <h5 className="font-semibold text-green-700 mb-2">Ingredients:</h5>
                          <ul className="text-xs text-green-600 space-y-1">
                            {cookingMethods[currentWeekData.tomorrowsMeal].ingredients.map((ingredient, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{ingredient}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-green-700 mb-2">Instructions:</h5>
                          <ol className="text-xs text-green-600 space-y-1">
                            {cookingMethods[currentWeekData.tomorrowsMeal].instructions.map((step, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2 font-semibold">{index + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">Loading...</p>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Emergency Meal Creator Section */}
        {showEmergencyMealCreator && (
          <div className="mb-8">
            <EmergencyMealCreator />
          </div>
        )}
        
        {!showEmergencyMealCreator && (
          <>
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
        </>
        )}
      </div>
    </div>
  );
};

export default MealPlanner;