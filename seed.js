const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.cookedRecipe.deleteMany();
  await prisma.favoriteRecipe.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  console.log('Cleared existing data');

  // Seed ingredients
  const ingredients = [
    { name: 'Tomato', category: 'vegetables', quantity: 5, unit: 'pcs', location: 'counter' },
    { name: 'Egg', category: 'dairy', quantity: 12, unit: 'pcs', location: 'fridge' },
    { name: 'Rice', category: 'grains', quantity: 2, unit: 'kg', location: 'pantry' },
    { name: 'Chicken breast', category: 'meat', quantity: 800, unit: 'g', location: 'freezer' },
    { name: 'Soy sauce', category: 'condiments', quantity: 500, unit: 'ml', location: 'pantry' },
    { name: 'Garlic', category: 'vegetables', quantity: 10, unit: 'pcs', location: 'pantry' },
    { name: 'Onion', category: 'vegetables', quantity: 4, unit: 'pcs', location: 'counter' },
    { name: 'Salmon', category: 'seafood', quantity: 600, unit: 'g', location: 'freezer' },
    { name: 'Pasta', category: 'grains', quantity: 500, unit: 'g', location: 'pantry' },
    { name: 'Mushroom', category: 'vegetables', quantity: 300, unit: 'g', location: 'fridge' },
    { name: 'Beef', category: 'meat', quantity: 1000, unit: 'g', location: 'freezer' },
    { name: 'Noodles', category: 'grains', quantity: 500, unit: 'g', location: 'pantry' },
    { name: 'Oil', category: 'condiments', quantity: 1, unit: 'L', location: 'pantry' },
    { name: 'Salt', category: 'condiments', quantity: 500, unit: 'g', location: 'pantry' },
    { name: 'Pepper', category: 'condiments', quantity: 50, unit: 'g', location: 'pantry' },
    { name: 'Sugar', category: 'condiments', quantity: 500, unit: 'g', location: 'pantry' },
    { name: 'Milk', category: 'dairy', quantity: 1, unit: 'L', location: 'fridge' },
    { name: 'Cheese', category: 'dairy', quantity: 200, unit: 'g', location: 'fridge' },
    { name: 'Broccoli', category: 'vegetables', quantity: 2, unit: 'pcs', location: 'fridge' },
    { name: 'Carrot', category: 'vegetables', quantity: 6, unit: 'pcs', location: 'counter' },
    { name: 'Green pepper', category: 'vegetables', quantity: 2, unit: 'pcs', location: 'fridge' },
    { name: 'Ginger', category: 'vegetables', quantity: 50, unit: 'g', location: 'pantry' },
  ];

  const createdIngredients = await Promise.all(
    ingredients.map((ing) =>
      prisma.ingredient.create({
        data: {
          name: ing.name,
          normalizedName: ing.name.toLowerCase(),
          category: ing.category,
          quantity: ing.quantity,
          unit: ing.unit,
          location: ing.location,
        },
      })
    )
  );
  console.log(`Created ${createdIngredients.length} ingredients`);

  // Seed recipes
  const recipes = [
    {
      title: 'Tomato Egg',
      description: 'Quick stir-fried tomato and egg dish',
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      totalTimeMinutes: 15,
      steps: JSON.stringify(['Heat oil in wok', 'Add beaten eggs, scramble', 'Add diced tomatoes', 'Stir fry until cooked', 'Season with salt and pepper']),
      tags: 'quick,vegetarian',
      ingredients: [
        { ingredientName: 'Tomato', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Egg', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Salt', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Fried Rice',
      description: 'Classic stir-fried rice with eggs and vegetables',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      totalTimeMinutes: 25,
      steps: JSON.stringify(['Heat oil in wok', 'Add diced vegetables', 'Add cooked rice', 'Push to side, scramble eggs', 'Mix everything together', 'Season with soy sauce']),
      tags: 'quick,classic',
      ingredients: [
        { ingredientName: 'Rice', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Egg', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Carrot', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Soy sauce', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Pasta Carbonara',
      description: 'Creamy Italian pasta with eggs and cheese',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      totalTimeMinutes: 30,
      steps: JSON.stringify(['Boil water and cook pasta', 'Fry pancetta or bacon', 'Mix eggs and cheese', 'Toss hot pasta with egg mixture', 'Season with salt and pepper']),
      tags: 'italian,creamy',
      ingredients: [
        { ingredientName: 'Pasta', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Egg', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Cheese', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Salt', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Pepper', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Chicken Soup',
      description: 'Warm and comforting chicken soup',
      prepTimeMinutes: 15,
      cookTimeMinutes: 45,
      totalTimeMinutes: 60,
      steps: JSON.stringify(['Boil water', 'Add chicken and vegetables', 'Simmer for 30 minutes', 'Season with salt and soy sauce', 'Serve hot']),
      tags: 'comfort,healthy',
      ingredients: [
        { ingredientName: 'Chicken breast', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Carrot', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Onion', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Ginger', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Salt', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Stir Fry Vegetables',
      description: 'Mixed stir-fried vegetables',
      prepTimeMinutes: 10,
      cookTimeMinutes: 10,
      totalTimeMinutes: 20,
      steps: JSON.stringify(['Heat oil in wok', 'Add garlic and ginger', 'Add vegetables', 'Stir fry until tender', 'Season with soy sauce']),
      tags: 'vegetarian,quick,healthy',
      ingredients: [
        { ingredientName: 'Broccoli', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Carrot', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Green pepper', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Garlic', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Soy sauce', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Beef Noodles',
      description: 'Stir-fried beef with noodles',
      prepTimeMinutes: 15,
      cookTimeMinutes: 20,
      totalTimeMinutes: 35,
      steps: JSON.stringify(['Cook noodles, drain and set aside', 'Stir fry beef until cooked', 'Add garlic and ginger', 'Add cooked noodles', 'Season with soy sauce']),
      tags: 'asian,quick',
      ingredients: [
        { ingredientName: 'Beef', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Noodles', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Garlic', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Ginger', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Soy sauce', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Omelette',
      description: 'Fluffy vegetable omelette',
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      totalTimeMinutes: 15,
      steps: JSON.stringify(['Beat eggs with salt', 'Heat oil in pan', 'Pour eggs and fold when cooked', 'Add fillings', 'Fold and serve']),
      tags: 'breakfast,quick,vegetarian',
      ingredients: [
        { ingredientName: 'Egg', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Salt', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Onion', isOptional: true, isKeyIngredient: false },
      ],
    },
    {
      title: 'Salmon Rice Bowl',
      description: 'Fresh salmon served over rice',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      totalTimeMinutes: 25,
      steps: JSON.stringify(['Cook rice', 'Pan-sear salmon', 'Serve salmon on rice', 'Drizzle with soy sauce', 'Add vegetables']),
      tags: 'healthy,seafood,quick',
      ingredients: [
        { ingredientName: 'Salmon', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Rice', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Soy sauce', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Ginger', isOptional: true, isKeyIngredient: false },
      ],
    },
    {
      title: 'Mushroom Pasta',
      description: 'Creamy mushroom sauce pasta',
      prepTimeMinutes: 10,
      cookTimeMinutes: 25,
      totalTimeMinutes: 35,
      steps: JSON.stringify(['Boil water and cook pasta', 'Sauté garlic and mushrooms', 'Add cream or milk', 'Combine with pasta', 'Season and serve']),
      tags: 'vegetarian,creamy',
      ingredients: [
        { ingredientName: 'Pasta', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Mushroom', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Garlic', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Milk', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Salt', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Simple Fried Chicken',
      description: 'Crispy fried chicken pieces',
      prepTimeMinutes: 20,
      cookTimeMinutes: 25,
      totalTimeMinutes: 45,
      steps: JSON.stringify(['Season chicken with salt and pepper', 'Heat oil in pan', 'Fry chicken until golden', 'Drain on paper towels', 'Serve hot']),
      tags: 'fried,quick',
      ingredients: [
        { ingredientName: 'Chicken breast', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Salt', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Pepper', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Garlic Egg Rice',
      description: 'Garlic-infused rice with eggs',
      prepTimeMinutes: 5,
      cookTimeMinutes: 15,
      totalTimeMinutes: 20,
      steps: JSON.stringify(['Heat oil and fry garlic', 'Add rice', 'Push to side and scramble eggs', 'Mix everything together']),
      tags: 'quick,asian',
      ingredients: [
        { ingredientName: 'Rice', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Egg', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Garlic', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Vegetable Soup',
      description: 'Healthy mixed vegetable soup',
      prepTimeMinutes: 10,
      cookTimeMinutes: 30,
      totalTimeMinutes: 40,
      steps: JSON.stringify(['Boil water', 'Add chopped vegetables', 'Simmer until soft', 'Season with salt']),
      tags: 'healthy,vegetarian,comfort',
      ingredients: [
        { ingredientName: 'Carrot', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Onion', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Broccoli', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Salt', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Egg Fried Rice with Vegetables',
      description: 'Classic fried rice with mixed vegetables and eggs',
      prepTimeMinutes: 10,
      cookTimeMinutes: 15,
      totalTimeMinutes: 25,
      steps: JSON.stringify(['Heat wok', 'Scramble eggs', 'Add rice and vegetables', 'Stir fry and season']),
      tags: 'quick,classic,asian',
      ingredients: [
        { ingredientName: 'Rice', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Egg', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Carrot', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Onion', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Garlic Mushroom',
      description: 'Sautéed mushrooms with garlic',
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      totalTimeMinutes: 15,
      steps: JSON.stringify(['Heat oil', 'Add sliced garlic', 'Add mushroom slices', 'Stir fry until golden', 'Season with salt']),
      tags: 'vegetarian,quick,side',
      ingredients: [
        { ingredientName: 'Mushroom', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Garlic', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Salt', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Scrambled Eggs with Tomato',
      description: 'Soft scrambled eggs with fresh tomato',
      prepTimeMinutes: 5,
      cookTimeMinutes: 8,
      totalTimeMinutes: 13,
      steps: JSON.stringify(['Heat oil', 'Add diced tomato', 'Add beaten eggs', 'Scramble until cooked', 'Season to taste']),
      tags: 'breakfast,quick,easy',
      ingredients: [
        { ingredientName: 'Egg', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Tomato', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Beef Fried Rice',
      description: 'Stir-fried rice with beef pieces',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      totalTimeMinutes: 30,
      steps: JSON.stringify(['Heat oil and cook beef', 'Add rice', 'Add vegetables', 'Season with soy sauce']),
      tags: 'quick,asian,filling',
      ingredients: [
        { ingredientName: 'Beef', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Rice', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Egg', isOptional: true, isKeyIngredient: false },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Soy sauce', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Chicken Rice Bowl',
      description: 'Seasoned chicken over fluffy rice',
      prepTimeMinutes: 10,
      cookTimeMinutes: 25,
      totalTimeMinutes: 35,
      steps: JSON.stringify(['Cook rice', 'Pan-fry chicken with garlic', 'Serve chicken on rice', 'Drizzle with soy sauce']),
      tags: 'quick,asian,filling',
      ingredients: [
        { ingredientName: 'Chicken breast', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Rice', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Garlic', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Soy sauce', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Pasta with Tomato Sauce',
      description: 'Simple tomato pasta',
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      totalTimeMinutes: 30,
      steps: JSON.stringify(['Boil water and cook pasta', 'Sauté garlic', 'Add tomatoes', 'Simmer sauce', 'Combine with pasta']),
      tags: 'italian,vegetarian,simple',
      ingredients: [
        { ingredientName: 'Pasta', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Tomato', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Garlic', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
      ],
    },
    {
      title: 'Spicy Noodles',
      description: 'Quick noodles with spicy flavor',
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      totalTimeMinutes: 15,
      steps: JSON.stringify(['Boil noodles', 'Drain and set aside', 'Mix with soy sauce and spices', 'Add garlic and vegetables']),
      tags: 'quick,asian,spicy',
      ingredients: [
        { ingredientName: 'Noodles', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Garlic', isOptional: false, isKeyIngredient: true },
        { ingredientName: 'Soy sauce', isOptional: false, isKeyIngredient: false },
        { ingredientName: 'Oil', isOptional: false, isKeyIngredient: false },
      ],
    },
  ];

  for (const recipe of recipes) {
    const { ingredients: recipeIngredients, ...recipeData } = recipe;
    await prisma.recipe.create({
      data: {
        ...recipeData,
        ingredients: {
          create: recipeIngredients.map((ing) => ({
            ingredientName: ing.ingredientName,
            normalizedName: ing.ingredientName.toLowerCase(),
            quantity: 1,
            unit: 'serving',
            isOptional: ing.isOptional,
            isKeyIngredient: ing.isKeyIngredient,
          })),
        },
      },
    });
  }

  console.log(`✅ Created ${recipes.length} recipes`);
  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
