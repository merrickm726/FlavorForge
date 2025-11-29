"use client"

import Link from 'next/link'
import { AppBar, Toolbar, Typography, Button, Box, Stack } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import LoginModal from './LoginModal'

export default function Navbar() {
  const { user, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLoginOpen = () => setLoginModalOpen(true);

  return (
    <>
      <AppBar position="static" sx={{ bgcolor: '#120d36' }}>
        <Toolbar>
          {/* logo and home link */}
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
          >
            Flavor<Box component="span" sx={{ color: 'orange' }}>Forge</Box>
          </Typography>

          {/* nav links */}
          <Stack direction="row" spacing={2}>
            <Button color="inherit" component={Link} href="/recipes">
              Find Recipes
            </Button>

            {/** if the're signed in then it says login, if not then  */}
            {user ? (
              <>
                <Typography variant="body1" sx={{ alignSelf: 'center', mr: 2 }}>
                  Hello, {user.name || user.email}
                </Typography>
                <Button color="inherit" onClick={logout} sx={{ color: 'orange' }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button color="inherit" onClick={handleLoginOpen} sx={{ color: 'orange' }}>
                Login
              </Button>
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <LoginModal loginModalOpen={loginModalOpen} setLoginModalOpen={setLoginModalOpen} />
    </>
  );
}
