import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const apiKey = process.env.SPOONACULAR_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { count = 10, query } = body;

    // Fetch recipes from Spoonacular
    let url: string;
    if (query) {
      // Search for specific recipes
      url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=${count}&apiKey=${apiKey}&addRecipeInformation=true&instructionsRequired=true`;
    } else {
      // Get random recipes
      url = `https://api.spoonacular.com/recipes/random?number=${count}&apiKey=${apiKey}&instructionsRequired=true`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch from Spoonacular');
    }

    const data = await response.json();
    const recipes = query ? data.results : data.recipes;

    if (!recipes || recipes.length === 0) {
      return NextResponse.json(
        { error: 'No recipes found' },
        { status: 404 }
      );
    }

    const createdRecipes = [];
    const skippedRecipes = [];

    for (const recipe of recipes) {
      const spoonacularId = recipe.id.toString();

      // Check if recipe already exists by Spoonacular ID
      const existing = await prisma.recipe.findFirst({
        where: { 
          id: spoonacularId,
        },
      });

      if (existing) {
        console.log(`Recipe "${recipe.title}" (ID: ${spoonacularId}) already exists, skipping...`);
        skippedRecipes.push({ id: spoonacularId, title: recipe.title });
        continue;
      }

      // Fetch full recipe details if not already included
      let fullRecipe = recipe;
      if (!recipe.extendedIngredients || !recipe.instructions) {
        const detailResponse = await fetch(
          `https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`
        );
        if (detailResponse.ok) {
          fullRecipe = await detailResponse.json();
        }
      }

      // Skip if no instructions available
      if (!fullRecipe.instructions && !fullRecipe.summary) {
        console.log(`Recipe "${recipe.title}" has no instructions, skipping...`);
        skippedRecipes.push({ id: spoonacularId, title: recipe.title, reason: 'No instructions' });
        continue;
      }

      // Create recipe in database
      const dbRecipe = await prisma.recipe.create({
        data: {
          id: spoonacularId,
          title: fullRecipe.title,
          instructions: fullRecipe.instructions || fullRecipe.summary || '',
          image: fullRecipe.image,
          isFromAPI: true,
          creatorId: null, // No creator for seeded recipes
          ingredients: {
            create: fullRecipe.extendedIngredients?.map((ing: any) => ({
              name: ing.name,
              amount: ing.amount && ing.unit 
                ? `${ing.amount} ${ing.unit}` 
                : ing.original || ing.name,
            })) || [],
          },
        },
        include: {
          ingredients: true,
        },
      });

      createdRecipes.push(dbRecipe);
    }

    return NextResponse.json(
      {
        success: true,
        created: createdRecipes.length,
        skipped: skippedRecipes.length,
        recipes: createdRecipes.map(r => ({
          id: r.id,
          title: r.title,
          ingredientCount: r.ingredients.length
        })),
        skippedRecipes,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed recipes', details: error.message },
      { status: 500 }
    );
  }
}