import { NextRequest, NextResponse } from 'next/server';

// API Key for Spoonacular API
const apiKey = process.env.SPOONACULAR_API_KEY;

/*
 * GET Route for Spoonacular API (by recipe ID)
 * Returns recipe results in a json
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Recipe ID is required' }, { status: 400 });
    }

    // Spoonacular API URL for a single recipe
    const url = `https://api.spoonacular.com/recipes/${encodeURIComponent(id)}/information?apiKey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: response.status });
    }

    const recipe = await response.json();

    return NextResponse.json({ success: true, recipe }, { status: 200 });
  }
  catch (error) {
    console.error('Error fetching recipe by ID:', error);
    return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
  }
}
