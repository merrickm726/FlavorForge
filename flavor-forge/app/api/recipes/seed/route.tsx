import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

// POST route to fetch random recipes from spoonacular and add them to the database. 
export async function POST(req: NextRequest) {
    try {

        const body = await req.json()
        const { count } = body;

        // Fetch random recipes from Spoonacular
        const url = `https://api.spoonacular.com/recipes/random?number=${count}&apiKey=${SPOONACULAR_API_KEY}&instructionsRequired=true`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch from Spoonacular');
        }
        const data = await response.json();
        const recipes = data.recipes;

        // Use a set to get rid of duplicate entries
        // Map recipe ids
        const recipeIds = recipes.map((r: any) => r.id.toString());
        // Query the database to see if any ID's already exist
        const existingRecipes = await prisma.recipe.findMany({
            where: { id: { in: recipeIds } },
            select: { id: true }
        });
        // Puts the duplicate ID's in a set
        const existingIds = new Set(existingRecipes.map(r => r.id));

        // Filter out existingRecipes 
        const newRecipes = recipes.filter((r: any) => !existingIds.has(r.id.toString()));
        
        // Create recipes one by one
        const createdRecipes = [];
        for (const recipe of newRecipes) {
            // Skip recipes without instructions
            if (!recipe.instructions && !recipe.summary) continue;

            // create a new recipe 
            const createdRecipe = await prisma.recipe.create({
                data: {
                    id: recipe.id.toString(),
                    title: recipe.title,
                    instructions: recipe.instructions || recipe.summary || '',
                    image: recipe.image,
                    creatorId: null,
                    ingredients: {
                        create: recipe.extendedIngredients?.map((ing: any) => ({
                            name: ing.name,
                            amount: ing.amount && ing.unit 
                                ? `${ing.amount} ${ing.unit}` 
                                : ing.original || ing.name,
                        })) || []
                    }
                },
                include: { ingredients: true }
            });
            
            // Append to createdRecipes
            createdRecipes.push(createdRecipe);
        }

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}