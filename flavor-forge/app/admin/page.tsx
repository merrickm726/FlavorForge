'use client'

import { useState, useEffect, useMemo } from 'react'
import { Box, Container, Typography, IconButton, CircularProgress, Chip } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete'
import Divider from '@mui/material/Divider'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table'

// inteface for typescript

interface UserData {
    id: string
    name: string | null
    email: string
    role: string
    createdAt: string
}

interface RecipeData {
    id: string
    title: string
    image: string | null
    creator: {
        name: string | null
        email: string
    } | null
}

export default function AdminDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<UserData[]>([])
    const [recipes, setRecipes] = useState<RecipeData[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // only admin can go to route
        if (!user) {
            router.push('/')
            return
        }
        if (user.role !== 'ADMIN') {
            router.push('/')
            return
        }

        const fetchData = async () => {
            setLoading(true)
            // fetch both users and recipes, promise all
            await Promise.all([fetchUsers(), fetchRecipes()])
            setLoading(false)
        };
        fetchData()
    }, [user, router]) // updates when router/user changes

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users')
            const data = await res.json()
            if (data.success) {
                setUsers(data.users)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        }
    };

    const fetchRecipes = async () => {
        try {
            const res = await fetch('/api/db')
            const data = await res.json()
            if (data.success) {
                setRecipes(data.recipes)
            }
        } catch (error) {
            console.error('Failed to fetch recipes:', error)
        }
    };


    // handle deleting recipes and users from table

    const handleDeleteUser = async (userId: string) => {
        // confirm deletion
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId))
                alert('User deleted successfully');
            } else {
                alert('Failed to delete user')
            }
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Error deleting user')
        }
    };

    const handleDeleteRecipe = async (recipeId: string) => {
        if (!confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) return;

        try {
            const res = await fetch('/api/db', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ recipeID: recipeId }),
            });

            if (res.ok) {
                setRecipes(recipes.filter(r => r.id !== recipeId));
                alert('Recipe deleted successfully')
            } else {
                alert('Failed to delete recipe')
            }
        } catch (error) {
            console.error('Error deleting recipe:', error)
            alert('Error deleting recipe')
        }
    };

    // Material React Table (from P10)
    const columns = useMemo<MRT_ColumnDef<UserData>[]>(
        () => [
            {
                header: 'Name',
                accessorKey: 'name',
                Cell: ({ cell }) => cell.getValue<string>() || 'N/A',
            },
            {
                header: 'Email',
                accessorKey: 'email',
            },
            {
                header: 'Role',
                accessorKey: 'role',
                Cell: ({ cell }) => (
                    <Chip 
                        label={cell.getValue<string>()} 
                        size="small" 
                        sx={{ 
                            bgcolor: cell.getValue<string>() === 'ADMIN' ? 'orange' : '#4334b5',
                            color: cell.getValue<string>() === 'ADMIN' ? 'black' : 'black',
                            fontWeight: 'bold'
                        }} 
                    />
                ),
            },
            {
                header: 'Joined',
                accessorKey: 'createdAt',
                Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
            },
        ],
        [],
    );

    const recipeColumns = useMemo<MRT_ColumnDef<RecipeData>[]>(
        () => [
            {
                header: 'Title',
                accessorKey: 'title',
            },
            {
                header: 'Creator',
                accessorKey: 'creator.name',
                Cell: ({ row }) => row.original.creator?.name || row.original.creator?.email || 'Unknown',
            },
             {
                header: 'Image',
                accessorKey: 'image',
                Cell: ({ cell }) => cell.getValue<string>() ? <img src={cell.getValue<string>()!} alt="recipe" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} /> : 'No Image',
            },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data: users,
        enableRowActions: true,
        positionActionsColumn: 'last',
        // delete user if button pressed
        renderRowActions: ({ row }) => (
            <Box>
                <IconButton 
                    onClick={() => handleDeleteUser(row.original.id)}
                    sx={{ color: '#ff4444' }}
                    disabled={row.original.id === user?.id}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ),
        muiTablePaperProps: {
            sx: {
                bgcolor: '#1e1a4a',
                color: 'black',
                border: '1px solid #2d2663',
            }
        },
        muiTableBodyRowProps: {
            sx: {
                '&:hover': { bgcolor: '#2d2663 !important' },
            }
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: '#2d2663',
                color: 'orange',
                fontWeight: 'bold',
            }
        },
        muiTableBodyCellProps: {
            sx: {
                color: 'black',
            }
        },
        muiTopToolbarProps: {
            sx: {
                bgcolor: '#1e1a4a',
                color: 'black',
            }
        },
        muiBottomToolbarProps: {
            sx: {
                bgcolor: '#1e1a4a',
                color: 'black',
                '& .MuiTablePagination-root': {
                    color: 'black',
                },
                '& .MuiIconButton-root': {
                    color: 'black',
                },
                '& .MuiSelect-icon': {
                    color: 'black',
                }
            }
        },
        state: {
            isLoading: loading,
        }
    });

    const recipeTable = useMaterialReactTable({
        columns: recipeColumns,
        data: recipes,
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
            <Box>
                <IconButton 
                    onClick={() => handleDeleteRecipe(row.original.id)}
                    sx={{ color: '#ff4444' }}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ),
        muiTablePaperProps: {
            sx: {
                bgcolor: '#1e1a4a',
                color: 'black',
                border: '1px solid #2d2663',
                mt: 4
            }
        },
        muiTableBodyRowProps: {
            sx: {
                '&:hover': { bgcolor: '#2d2663 !important' },
            }
        },
        muiTableHeadCellProps: {
            sx: {
                bgcolor: '#2d2663',
                color: 'orange',
                fontWeight: 'bold',
            }
        },
        muiTableBodyCellProps: {
            sx: {
                color: 'black',
            }
        },
        muiTopToolbarProps: {
            sx: {
                bgcolor: '#1e1a4a',
                color: 'black',
            }
        },
        muiBottomToolbarProps: {
            sx: {
                bgcolor: '#1e1a4a',
                color: 'black',
                '& .MuiTablePagination-root': {
                    color: 'black',
                },
                '& .MuiIconButton-root': {
                    color: 'black',
                },
                '& .MuiSelect-icon': {
                    color: 'black',
                }
            }
        },
        state: {
            isLoading: loading,
        }
    });

    // loading
    if (loading && users.length === 0) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: '#120d36', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        )
    }

    // return 2 tables

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: '#120d36', p: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 4 }}>
                    Admin Dashboard
                </Typography>

                <Divider sx={{ mb:5, bgcolor: 'grey' }} />

                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 4 }}>
                    All Users
                </Typography>

                <MaterialReactTable table={table} />

                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'white', mt: 8, mb: 4 }}>
                    All Recipes
                </Typography>
                <MaterialReactTable table={recipeTable} />
            </Container>
        </Box>
    )
}
