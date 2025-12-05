'use client'

import { useState, useEffect, useMemo } from 'react'
import { Box, Container, Typography, IconButton, CircularProgress, Chip } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete'
import Divider from '@mui/material/Divider'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
}

interface RecipeData {
    id: string;
    title: string;
    image: string | null;
    creator: {
        name: string | null;
        email: string;
    } | null;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [recipes, setRecipes] = useState<RecipeData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Protect the route
        if (!user) {
            router.push('/');
            return;
        }
        if (user.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchUsers(), fetchRecipes()]);
            setLoading(false);
        };
        fetchData();
    }, [user, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchRecipes = async () => {
        try {
            const res = await fetch('/api/db');
            const data = await res.json();
            if (data.success) {
                setRecipes(data.recipes);
            }
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setUsers(users.filter(u => u.id !== userId));
                alert('User deleted successfully');
            } else {
                alert('Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    };

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

    if (loading && users.length === 0) {
        return (
            <Box sx={{ minHeight: "100vh", bgcolor: '#120d36', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress sx={{ color: 'orange' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: '#120d36', p: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'white', mb: 4 }}>
                    Admin Dashboard
                </Typography>

                <Divider sx={{ my: 4, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'white', mb: 4 }}>
                    All Users
                </Typography>

                <MaterialReactTable table={table} />

                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'white', mt: 8, mb: 4 }}>
                    All Recipes
                </Typography>
                <MaterialReactTable table={recipeTable} />
            </Container>
        </Box>
    )
}
