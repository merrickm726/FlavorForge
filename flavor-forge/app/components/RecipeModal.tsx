import {useState, useEffect} from 'react'
import {Button, Modal, Box, Typography, CircularProgress} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

interface Recipe {
    id: number | string;
    title: string;
    image: string;
}

interface RecipeModalProps {
    recipeModalOpen: boolean;
    setRecipeModalOpen: (open: boolean) => void;
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
            // If the recipe object already has details (e.g. from My Recipes), use them
            if ((recipe as any).instructions || (recipe as any).summary) {
                setDetails(recipe);
                setLoading(false);
            } else {
                setLoading(true);
                setDetails(null); // Reset details

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
    }, [recipeModalOpen, recipe]);
    
    const handleRecipeModalClose = () => {
        setRecipeModalOpen(false)
    }

    const handleFavorite = async () => {
        if (!user) {
            setLoginModalOpen(true);
            return;
        }

        if (!recipe) return;

        try {
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
        if (!user) {
            setLoginModalOpen(true);
            return;
        }
        if (!details) return;

        try {
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
                            <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ color: 'white' }}>
                                {recipe.title}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mt: 2 }}>
                                {/* Left: Recipe Text */}
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

                            {/* Bottom: Buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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
                                        color="error" 
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