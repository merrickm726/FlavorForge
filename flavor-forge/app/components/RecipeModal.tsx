import {useState, useEffect} from 'react'
import {Button, Modal, Box, Typography, CircularProgress, List, ListItem, ListItemText} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import { useAuth } from '../context/AuthContext'
import LoginModal from './LoginModal'

// typescript stuff: define props 

interface Recipe {
    id: number | string; // api has number ids, database has string
    title: string;
    image: string;
}

interface RecipeModalProps {
    recipeModalOpen: boolean;
    setRecipeModalOpen: (open: boolean) => void; // boolean argument, returns nothing
    recipe: Recipe | null;
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    maxWidth: '90vw',
    bgcolor: '#120d36',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    color: 'white',
};

export default function RecipeModal({recipeModalOpen, setRecipeModalOpen, recipe}: RecipeModalProps){
    const { user } = useAuth();
    const [details, setDetails] = useState<any>(null); 
    const [loading, setLoading] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    useEffect(() => {
        if (recipeModalOpen && recipe) {
            // if the recipe object already has details (like my recipes), use them
            // (works without as any, but make typescript happy)

            // from database
            if ((recipe as any).instructions || (recipe as any).summary) {
                setDetails(recipe);
                setLoading(false);

            // from api
            } else {
                setLoading(true);
                setDetails(null); // reset details

                // get details of food from API
                fetch(`/api/recipes/${recipe.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setDetails(data.recipe);
                        }
                    })
                    .catch(err => console.error(err))
                    .finally(() => setLoading(false));
            }
        }
    }, [recipeModalOpen, recipe]); // reset after recipe modal opens
    
    const handleRecipeModalClose = () => {
        setRecipeModalOpen(false)
    }

    const handleFavorite = async () => {
        // if not signed in, can't favorite, trigger login
        if (!user) {
            setLoginModalOpen(true);
            return;
        }

        // edge case but if there's not recipe return
        if (!recipe) return;

        try {
            // post recipe to favorites list
            const res = await fetch(`/api/users/${user.id}/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipeId: recipe.id })
            });

            const data = await res.json();

            if (res.ok) {
                alert('Recipe added to favorites!');
            } else if (res.status === 409) {
                alert('Recipe is already in your favorites.');
            } else {
                alert(`Failed to add favorite: ${data.error}`);
            }
        } catch (error) {
            console.error('Error adding favorite:', error);
            alert('An error occurred while adding to favorites.');
        }
    };

    const handleSaveToMyRecipes = async () => {
        // have to be signed in
        if (!user) {
            setLoginModalOpen(true);
            return;
        }

        // need to have details
        if (!details) return;

        try {
            // map ingredients name to new JSON to post to users' recipes
            const ingredients = details.extendedIngredients?.map((ing: any) => ({
                name: ing.name,
                amount: ing.amount && ing.unit ? `${ing.amount} ${ing.unit}` : ing.original
            })) || [];

            const res = await fetch(`/api/users/${user.id}/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: details.title,
                    image: details.image,
                    instructions: details.instructions || details.summary,
                    ingredients
                })
            });

            if (res.ok) {
                alert('Recipe saved to My Recipes!');
            } else {
                const data = await res.json();
                alert(`Failed to save: ${data.error}`);
            }
        } catch (error) {
            console.error('Error saving recipe:', error);
            alert('Error saving recipe.');
        }
    };

    return(
        <>
            <Modal open={recipeModalOpen} onClose={handleRecipeModalClose}>
                <Box sx={style}>
                    {recipe && (
                        <>
                            <Typography variant="h4" component="h2" align="center" sx={{ color: 'white' }}>
                                {recipe.title}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
                                {/* left: recipe text and list of ingredients */}
                                <Box sx={{ flex: 1, maxHeight: '400px', overflowY: 'auto' }}>
                                    <Typography variant="h6" sx={{ color: 'orange' }}>Description</Typography>
                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                            <CircularProgress sx={{ color: 'orange' }} />
                                        </Box>
                                    ) : details ? (
                                        <Typography sx={{ mt: 2, color: '#ddd' }} dangerouslySetInnerHTML={{ __html: details.summary || details.instructions }} />
                                    ) : (
                                        <Typography sx={{ mt: 2, color: '#ddd' }}>
                                            Loading description...
                                        </Typography>
                                    )}
                                    
                                    {details && (
                                        <>
                                            <Typography variant="h6" sx={{ color: 'orange', mt: 2 }}>Ingredients</Typography>
                                            <List dense>
                                                {(details.extendedIngredients || details.ingredients || []).map((ing: any, index: number) => (
                                                    <ListItem key={index}>
                                                        <ListItemText 
                                                            primary={ing.original || (ing.amount ? `${ing.amount} ${ing.name}` : ing.name)}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </>
                                    )}
                                </Box>


                                {/* Right: Image */}
                                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'start' }}>
                                    <img 
                                        src={recipe.image} 
                                        alt={recipe.title} 
                                        style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }} 
                                    />
                                </Box>
                            </Box>

                            {/* bottom: buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                {/** the number ids are from the API, and the string Id's are from the database */}
                                {typeof recipe.id === 'number' ? (
                                    <Button 
                                        variant="contained" 
                                        color="primary" 
                                        startIcon={<SaveIcon />}
                                        onClick={handleSaveToMyRecipes}
                                        disabled={loading || !details}
                                    >
                                        Save to My Recipes
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="contained" 
                                        sx={{bgcolor:'red'}}
                                        startIcon={<FavoriteIcon />}
                                        onClick={handleFavorite}
                                    >
                                        Favorite
                                    </Button>
                                )}
                                <Button variant="outlined" onClick={handleRecipeModalClose} startIcon={<CloseIcon />} sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'orange', color: 'orange' } }}>
                                    Close
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>
            <LoginModal loginModalOpen={loginModalOpen} setLoginModalOpen={setLoginModalOpen} />
        </>
    )
}