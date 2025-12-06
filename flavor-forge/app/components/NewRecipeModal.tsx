import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button, Modal, Box, TextField, Stack, Typography, IconButton, List, ListItem, ListItemText } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

// have to define prop types

interface NewRecipeModalProps {
    newRecipeModalOpen: boolean;
    setNewRecipeModalOpen: (open: boolean) => void;
    onRecipeCreated?: () => void;
}

export default function NewRecipeModal({ newRecipeModalOpen, setNewRecipeModalOpen, onRecipeCreated }: NewRecipeModalProps) {
    const { user } = useAuth()

    // same modal style for all modals
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        maxHeight: '90vh',
        overflowY: 'auto',
        bgcolor: '#120d36',
        boxShadow: 24,
        textAlign: 'center',
        p: 4,
        borderRadius: 2,
        color: 'white'
    }

    const textFieldStyle = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'white' },
            '&:hover fieldset': { borderColor: 'orange' },
            '&.Mui-focused fieldset': { borderColor: 'orange' },
            color: 'white',
        },
        '& .MuiInputLabel-root': { color: 'white' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'orange' },
        '& .MuiSvgIcon-root': { color: 'white' },
        '& .MuiInputBase-input': { color: 'white' }
    };

    const [title, setTitle] = useState('')
    const [instructions, setInstructions] = useState('')
    const [image, setImage] = useState('')
    const [ingredients, setIngredients] = useState<{ name: string, amount: string }[]>([])
    const [currentIngredient, setCurrentIngredient] = useState({ name: '', amount: '' })

    const handleClose = () => {
        setNewRecipeModalOpen(false)
        // reset form
        setTitle('')
        setInstructions('')
        setImage('')
        setIngredients([])
        setCurrentIngredient({ name: '', amount: '' })
    }

    const handleAddIngredient = () => {
        if (currentIngredient.name) {
            setIngredients([...ingredients, currentIngredient])
            setCurrentIngredient({ name: '', amount: '' })
        }
    }

    const handleDeleteIngredient = (index: number) => {
        // set the ingredient list to all items except for the index that has deleted item
        setIngredients(ingredients.filter((_, i) => i !== index))
    }

    const handleSubmit = async () => {

        // input validation
        if (!title) {
            alert('Title is required')
            return
        }

        if (!user) {
            alert('You must be logged in to post a recipe')
            return
        }

        try {
            const res = await fetch(`/api/users/${user.id}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    instructions,
                    image,
                    ingredients
                })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(`Error: ${data.error}`)
                return
            }

            alert('Recipe created successfully!')
            if (onRecipeCreated) onRecipeCreated() // recipes page refreshes so new recipe appears
                    
            handleClose();

        } catch (err) {
            console.error('Error creating recipe:', err)
            alert('Failed to create recipe')
        }
    }

    return (
        <Modal open={newRecipeModalOpen} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h5" mb={2} fontWeight="bold">
                    Post New Recipe
                </Typography>

                <Stack spacing={2}>
                    <TextField
                        required
                        label='Recipe Title'
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        sx={textFieldStyle}
                    />

                    <TextField
                        label='Image URL'
                        value={image}
                        onChange={e => setImage(e.target.value)}
                        sx={textFieldStyle}
                    />

                    <TextField
                        label='Instructions'
                        multiline
                        rows={4}
                        value={instructions}
                        onChange={e => setInstructions(e.target.value)}
                        sx={textFieldStyle}
                    />

                    <Box sx={{ border: '1px solid #5a5a5aff', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle1" align="left" sx={{mb:2}}>
                            Ingredients
                        </Typography>
                        
                        <Stack direction="row" spacing={1} mb={2}>
                            <TextField
                                label='Ingredient Name'
                                value={currentIngredient.name}
                                onChange={e => setCurrentIngredient({ ...currentIngredient, name: e.target.value })}
                                sx={{ ...textFieldStyle, flex: 2}}
                                size="small"
                            />
                            <TextField
                                label='Amount'
                                value={currentIngredient.amount}
                                onChange={e => setCurrentIngredient({ ...currentIngredient, amount: e.target.value })}
                                sx={{ ...textFieldStyle, flex: 1 }}
                                size="small"
                            />
                            <IconButton onClick={handleAddIngredient} sx={{ color: 'orange' }}>
                                <AddIcon />
                            </IconButton>
                        </Stack>

                        {/** List looks weird without dense */}
                        <List dense sx={{ maxHeight: 150, overflow: 'auto' }}>
                            {ingredients.map((ing, index) => (
                                <ListItem
                                    key={index}
                                    secondaryAction={
                                        <IconButton edge="end" onClick={() => handleDeleteIngredient(index)} sx={{ color: '#ff4444' }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText 
                                        primary={ing.name} 
                                        secondary={ing.amount}
                                        secondaryTypographyProps={{ color: 'gray' }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    <Button 
                        variant='contained' 
                        onClick={handleSubmit} 
                        size="large"
                        sx={{ color: 'white', bgcolor: 'darkorange', mt: 2 }}
                    >
                        Post Recipe
                    </Button>
                </Stack>
            </Box>
        </Modal>
    )
}