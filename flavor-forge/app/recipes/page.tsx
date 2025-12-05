'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography, Card, CardMedia, CardContent, CardActions, Button, CircularProgress, TextField, Tabs, Tab } from "@mui/material"
import RecipeModal from '../components/RecipeModal'

interface Recipe {
  id: number;
  title: string;
  image: string;
}

export default function Recipes(){
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [recipeModalOpen, setRecipeModalOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        // set timeout (.5 seconds) because dont wanna overwhelm api calls
        // default to thai food :)
        // live updates when searchTerm changes (which is the search box)
        const delayDebounceFn = setTimeout(() => {
            const fetchRecipes = async () => {
                setLoading(true);
                try {
                    let data;
                    if (tabValue === 0) {
                        // API Search
                        const query = searchTerm || 'thai';
                        const res = await fetch(`/api/recipes/search?query=${query}`);
                        if (!res.ok) throw new Error('API Failed');
                        data = await res.json();
                    } else {
                        // DB Fetch
                        const res = await fetch('/api/db');
                        if (!res.ok) throw new Error('DB Failed');
                        data = await res.json();
                    }
                    
                    // Log the data to help debug
                    console.log("API Response:", data);

                    if (Array.isArray(data.recipes)) {
                        let fetchedRecipes = data.recipes;
                        // Client-side filter for DB recipes if search term exists
                        if (tabValue === 1 && searchTerm) {
                            fetchedRecipes = fetchedRecipes.filter((r: Recipe) => 
                                r.title.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                        }
                        setRecipes(fetchedRecipes);
                    } else {
                        setRecipes([]);
                    }
                } catch (error) {
                    console.error("Failed to fetch recipes", error);
                    setRecipes([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchRecipes();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, tabValue])

    const handleOpenModal = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setRecipeModalOpen(true);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setSearchTerm(''); // Optional: clear search when switching tabs
    };

    return(
        <>
        <Box sx={{ minHeight: "100vh", bgcolor: '#120d36', p: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffffff', mb: 4 }}>
                    Explore Recipes
                </Typography>

                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    sx={{ 
                        mb: 4,
                        '& .MuiTab-root': { color: 'white' },
                        '& .Mui-selected': { color: 'orange !important' },
                        '& .MuiTabs-indicator': { bgcolor: 'orange' }
                    }}
                >
                    <Tab label="API Recipes" />
                    <Tab label="User Recipes" />
                </Tabs>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 4, bgcolor: 'white', borderRadius: 1 }}
                />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : recipes.length > 0 ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 }}>
                        {recipes.map((recipe) => (
                            <Box key={recipe.id}>
                                <Card sx={{  bgcolor: '#4334b5ff', 
                                             height: '100%', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            transition: '0.3s', 
                                            justifyContent: 'space-between',
                                            textAlign: 'center',
                                            '&:hover': 
                                                { transform: 'scale(1.02)' } }}>
                                    <Box>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={recipe.image}
                                            alt={recipe.title}
                                        />
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{color:'white'}}>
                                                {recipe.title}
                                            </Typography>
                                        </CardContent>
                                    </Box>
                                    <CardActions sx={{justifyContent: 'center', pb: 2}}>
                                        <Button size="small" 
                                                onClick={() => handleOpenModal(recipe)}
                                                sx={{ color: 'orange',
                                                     '&:hover': 
                                                        { bgcolor: '#6754f7ff' }
                                                }}>
                                            View Recipe
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography variant="h6" sx={{ color: 'white', textAlign: 'center', mt: 4 }}>
                        No recipes found.
                    </Typography>
                )}
            </Container>
        </Box>
        <RecipeModal 
            recipeModalOpen={recipeModalOpen} 
            setRecipeModalOpen={setRecipeModalOpen} 
            recipe={selectedRecipe}
        />
        </>
    )
}