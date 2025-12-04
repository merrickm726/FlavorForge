'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
    Box, 
    Container, 
    Typography, 
    IconButton, 
    CircularProgress,
    Chip
} from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { MaterialReactTable, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import styles from './admin.module.css'

interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
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

        fetchUsers();
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
        } finally {
            setLoading(false);
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
                        className={`${styles.roleChip} ${cell.getValue<string>() === 'ADMIN' ? styles.roleAdmin : styles.roleUser}`}
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

    const table = useMaterialReactTable({
        columns,
        data: users,
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
            <Box>
                <IconButton 
                    onClick={() => handleDeleteUser(row.original.id)}
                    className={styles.deleteButton}
                    disabled={row.original.id === user?.id}
                >
                    <DeleteIcon />
                </IconButton>
            </Box>
        ),
        muiTablePaperProps: {
            className: styles.tablePaper
        },
        muiTableBodyRowProps: {
            className: styles.tableRow
        },
        muiTableHeadCellProps: {
            className: styles.tableHeadCell
        },
        muiTableBodyCellProps: {
            className: styles.tableBodyCell
        },
        muiTopToolbarProps: {
            className: styles.topToolbar
        },
        muiBottomToolbarProps: {
            className: styles.bottomToolbar
        },
        state: {
            isLoading: loading,
        }
    });

    if (loading && users.length === 0) {
        return (
            <Box className={styles.loadingContainer}>
                <CircularProgress sx={{ color: 'orange' }} />
            </Box>
        );
    }

    return (
        <Box className={styles.container}>
            <Container maxWidth="lg">
                <Typography variant="h4" component="h1" gutterBottom className={styles.title}>
                    Admin Dashboard
                </Typography>

                <MaterialReactTable table={table} />
            </Container>
        </Box>
    )
}

