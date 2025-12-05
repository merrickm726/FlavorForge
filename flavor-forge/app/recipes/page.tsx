'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography, Card, CardMedia, CardContent, CardActions, Button, CircularProgress, TextField, Tabs, Tab, Stack } from "@mui/material"
import RecipeModal from '../components/RecipeModal'
import NewRecipeModal from '../components/NewRecipeModal'
import { useAuth } from '../context/AuthContext'
import AddIcon from '@mui/icons-material/Add'

interface Recipe {
  id: number
  title: string
  image: string
}

export default function Recipes(){
    const { user } = useAuth()
    const [recipes, setRecipes] = useState<Recipe[]>([]) // recipe array
    const [loading, setLoading] = useState(true)
    const [recipeModalOpen, setRecipeModalOpen] = useState(false)
    const [newRecipeModalOpen, setNewRecipeModalOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [tabValue, setTabValue] = useState(0)

    const fetchRecipes = async () => {
        setLoading(true)
        try {
            let data;
            if (tabValue === 0) {
                // api search
                // default to thai :D
                const query = searchTerm || 'thai'
                const res = await fetch(`/api/recipes/search?query=${query}`)
                if (!res.ok) throw new Error('API Failed')
                data = await res.json()
            } else {
                // database fetch
                const res = await fetch('/api/db')
                if (!res.ok) throw new Error('DB Failed')
                data = await res.json();
            }
            
            // console.log("api Response:", data);

            // if recipes exists/is array
            if (Array.isArray(data.recipes)) {
                let fetchedRecipes = data.recipes
                // if terms exists then search db
                if (tabValue === 1 && searchTerm) {
                    fetchedRecipes = fetchedRecipes.filter((r: Recipe) => 
                        r.title.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                }
                setRecipes(fetchedRecipes)

            } else {
                setRecipes([])
            }

        } catch (error) {
            console.error("Failed to fetch recipes", error)
            setRecipes([])
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        // set timeout (.5 seconds) because dont wanna overwhelm api calls
        // default to thai food :)
        // live updates when searchTerm changes (which is the search box)
        const delayApiCall = setTimeout(() => {
            fetchRecipes();
        }, 500);

        return () => clearTimeout(delayApiCall)
    }, [searchTerm, tabValue]) // resets when searchterm/tabvalue changes (type or switch tabs)

    const handleOpenModal = (recipe: Recipe) => {
        setSelectedRecipe(recipe)
        setRecipeModalOpen(true)
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
        setSearchTerm('') // clear search when switching tabs
    };

    // keep styling in one place to make html more clean
    const styles = {
        pageContainer: { minHeight: "100vh", bgcolor: '#120d36', p: 4 },
        header: { fontWeight: 'bold', color: '#ffffffff' },
        postButton: { bgcolor: 'orange', color: 'white', '&:hover': { bgcolor: 'darkorange' } },
        tabs: { 
            mb: 4,
            '& .MuiTab-root': { color: 'white' },
            '& .Mui-selected': { color: 'orange !important' },
            '& .MuiTabs-indicator': { bgcolor: 'orange' }
        },
        searchField: { mb: 4, bgcolor: 'white', borderRadius: 1 },
        loadingBox: { display: 'flex', justifyContent: 'center', mt: 8 },
        grid: { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 4 },
        card: { bgcolor: '#4334b5ff', height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', justifyContent: 'space-between', textAlign: 'center', '&:hover': { transform: 'scale(1.02)' } },
        cardContent: { flexGrow: 1 },
        whiteText: { color: 'white' },
        cardActions: { justifyContent: 'center', pb: 2 },
        viewButton: { color: 'orange', '&:hover': { bgcolor: '#6754f7ff' } },
        noRecipes: { color: 'white', textAlign: 'center', mt: 4 }
    };

    return(
        <>
        <Box sx={styles.pageContainer}>
            <Container maxWidth="lg">
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Typography variant="h4" component="h1" sx={styles.header}>
                        Explore Recipes
                    </Typography>
                    
                    {/** if on db recipe mode show add button */}
                    {user && tabValue === 1 && (
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />}
                            onClick={() => setNewRecipeModalOpen(true)}
                            sx={styles.postButton}
                        >
                            Post Recipe
                        </Button>
                    )}

                </Stack>

                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} // switch between api response/database response
                    sx={styles.tabs}
                >
                    <Tab label="All Recipes" />
                    <Tab label="User Recipes" />
                </Tabs>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={styles.searchField}
                />

                {loading ? (
                    <Box sx={styles.loadingBox}>
                        <CircularProgress />
                    </Box>
                ) : recipes.length > 0 ? (
                    <Box sx={styles.grid}>
                        {recipes.map((recipe) => (
                            <Box key={recipe.id}>
                                <Card sx={styles.card}>
                                    <Box>
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={recipe.image}
                                            alt={recipe.title}
                                        />
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
        <NewRecipeModal 
            newRecipeModalOpen={newRecipeModalOpen} 
            setNewRecipeModalOpen={setNewRecipeModalOpen} 
            onRecipeCreated={fetchRecipes}
        />
        </>
    )
}