'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography, Card, CardMedia, CardContent, CardActions, Button, CircularProgress } from "@mui/material"
import { useAuth } from '../context/AuthContext'
import RecipeModal from '../components/RecipeModal'
import { useRouter } from 'next/navigation'
import FavoriteIcon from '@mui/icons-material/Favorite';

interface Recipe {
  id: number | string;
  title: string;
  image: string;
  isFavorite?: boolean;
}

export default function MyRecipes(){
    const { user } = useAuth();
    const router = useRouter();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [recipeModalOpen, setRecipeModalOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [recipesRes, favoritesRes] = await Promise.all([
                    fetch(`/api/users/${user.id}/recipes`),
                    fetch(`/api/users/${user.id}/favorites`)
                ]);
                
                if (!recipesRes.ok) throw new Error('API Failed');

                const recipesData = await recipesRes.json();
                const favoritesData = favoritesRes.ok ? await favoritesRes.json() : { favorites: [] };
                
                let fetchedRecipes: Recipe[] = [];
                if (recipesData.success && Array.isArray(recipesData.recipes)) {
                    fetchedRecipes = recipesData.recipes;
                }

                const favoriteIds = new Set(
                    favoritesData.favorites?.map((fav: any) => fav.recipeId) || []
                );

                const recipesWithFavs = fetchedRecipes.map(r => ({
                    ...r,
                    isFavorite: favoriteIds.has(r.id)
                }));

                // put favorites first
                recipesWithFavs.sort((a, b) => {
                    if (a.isFavorite && !b.isFavorite) return -1;
                    if (!a.isFavorite && b.isFavorite) return 1;
                    return 0;
                });

                setRecipes(recipesWithFavs);
            } catch (error) {
                console.error("Failed to fetch data", error);
                setRecipes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user])

    const handleOpenModal = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setRecipeModalOpen(true);
    };

    if (!user) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: '#120d36', p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ color: 'white' }}>
                    Please log in to view your recipes.
                </Typography>
            </Box>
        );
    }

    return(
        <>
        <Box sx={{ minHeight: "100vh", bgcolor: '#120d36', p: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#ffffffff', mb: 4 }}>
                    My Recipes
                </Typography>

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
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={recipe.image || '/placeholder.jpg'}
                                            alt={recipe.title}
                                        />
                                        {recipe.isFavorite && (
                                            <FavoriteIcon 
                                                sx={{ 
                                                    position: 'center', 
                                                    bottom: 8, 
                                                    right: 8, 
                                                    color: 'red',
                                                    mt: 2,
                                                    borderRadius: '50%',
                                                    p: 0.5,
                                                    
                                                }} 
                                            />
                                        )}
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
                        You haven't saved any recipes yet.
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
