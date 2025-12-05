'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography, Card, CardMedia, CardContent, CardActions, Button, CircularProgress } from "@mui/material"
import { useAuth } from '../context/AuthContext'
import RecipeModal from '../components/RecipeModal'
import FavoriteIcon from '@mui/icons-material/Favorite'

interface Recipe {
  id: number | string;
  title: string;
  image: string;
  isFavorite?: boolean;
}

export default function MyRecipes(){
    const { user } = useAuth()
    const [recipes, setRecipes] = useState<Recipe[]>([]) // array of recipes
    const [loading, setLoading] = useState(true)
    const [recipeModalOpen, setRecipeModalOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

    useEffect(() => {

        // if not signed in don't show loading (handled in html)
        if (!user) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // wait until all promises are done
                // both must work or promise fails
                const [recipesRes, favoritesRes] = await Promise.all([
                    fetch(`/api/users/${user.id}/recipes`),
                    fetch(`/api/users/${user.id}/favorites`)
                ]);
                
                if (!recipesRes.ok) throw new Error('API Failed');

                // data is json
                const recipesData = await recipesRes.json();
                const favoritesData = favoritesRes.ok ? await favoritesRes.json() : { favorites: [] };
                
                // extract recipes from api response
                // check if its sucessful and if its an array for safety
                let fetchedRecipes: Recipe[] = [];
                if (recipesData.success && Array.isArray(recipesData.recipes)) {
                    fetchedRecipes = recipesData.recipes;
                }

                // make a Set (lookup table)
                // checking Set is faster
                // just put ids in it to deal with later
                const favoriteIds = new Set(
                    favoritesData.favorites?.map((fav: any) => fav.recipeId) || []
                );

                // go thru all recipes, copy data, and see if they have an id in favorite
                const recipesWithFavs = fetchedRecipes.map(r => ({
                    ...r,
                    isFavorite: favoriteIds.has(r.id)
                }));

                // put favorites first
                // (negative comes before positive)
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
    }, [user]) // updates when user changes (since each user has their own favs/saved)

    const handleOpenModal = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setRecipeModalOpen(true);
    };

    // put all the styling here so that it's easier to read later
    // (making separate css file was annoying and not working, maybe because of MUI components?)
    const styles = {
        pageContainer: { minHeight: "100vh", bgcolor: '#120d36', p: 4 },
        loginContainer: { minHeight: "100vh", bgcolor: '#120d36', p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' },
        whiteText: { color: 'white' },
        header: { fontWeight: 'bold', color: 'white', mb: 4 },
        loadingBox: { display: 'flex', justifyContent: 'center', mt: 8 },
        grid: { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 },
        card: { bgcolor: '#4334b5ff', height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', justifyContent: 'space-between', textAlign: 'center', '&:hover': { transform: 'scale(1.02)' } },
        cardMediaWrapper: { position: 'relative' },
        favoriteIcon: { position: 'absolute', bottom: 8, right: 8, color: 'red', mt: 2, borderRadius: '50%', p: 0.5 },
        cardContent: { flexGrow: 1 },
        cardActions: { justifyContent: 'center', pb: 2 },
        viewButton: { color: 'orange', '&:hover': { bgcolor: '#6754f7ff' } },
        noRecipes: { color: 'white', textAlign: 'center', mt: 4 }
    };

    // told u it was handled later
    // if not signed in tell user to log in
    if (!user) {
        return (
            <Box sx={styles.loginContainer}>
                <Typography variant="h5" sx={styles.whiteText}>
                    Please log in to view your recipes.
                </Typography>
            </Box>
        );
    }

    return(
        <>
        <Box sx={styles.pageContainer}>
            <Container maxWidth="lg">

                <Typography variant="h4" component="h1" sx={styles.header}>
                    My Recipes
                </Typography>

                {loading ? (
                    <Box sx={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                ) : recipes.length > 0 ? (
                    <Box sx={styles.grid}>
                        {recipes.map((recipe) => (
                            <Box key={recipe.id}>
                                <Card sx={styles.card}>
                                    <Box sx={styles.cardMediaWrapper}>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={recipe.image || '/placeholder.jpg'}
                                            alt={recipe.title}
                                        />
                                        {recipe.isFavorite && (
                                            <FavoriteIcon 
                                                sx={styles.favoriteIcon} 
                                            />
                                        )}
                                        <CardContent sx={styles.cardContent}>
                                            <Typography variant="h6" sx={styles.whiteText}>
                                                {recipe.title}
                                            </Typography>
                                        </CardContent>
                                    </Box>
                                    <CardActions sx={styles.cardActions}>
                                        <Button size="small" 
                                                onClick={() => handleOpenModal(recipe)}
                                                sx={styles.viewButton}>
                                            View Recipe
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Typography variant="h6" sx={styles.noRecipes}>
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
