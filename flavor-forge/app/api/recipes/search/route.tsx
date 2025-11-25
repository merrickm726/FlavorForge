import { NextRequest, NextResponse } from 'next/server';

// API Key for Spoonacular API
const apiKey = process.env.SPOONACULAR_API_KEY;

/*
 * GET Route for Spoonacular API
 * Handles complex search using query (ex. ?query=pizza)
 * Returns recipe results in a json
 */
export async function GET(req: NextRequest) {
    
    // Get Params
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    // No query provided, Bad Request, return error
    if(!query){
        return NextResponse.json({error: 'Bad request'}, {status: 400});
    }

    // API URL
    // Using encodeURIComponent() to properly create request format and handle some characters
    const spoonacularUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&apiKey=${apiKey}`;

    try{
        // Fetch response, return it
        const response = await fetch(spoonacularUrl);
        const data = await response.json();
        
        return NextResponse.json({recipes: data.results});
    }
    catch(err){
        console.error(error);
        return NextResponse.json({error: 'Failed to fetch recipes'}, {status: 500});
    }
}

