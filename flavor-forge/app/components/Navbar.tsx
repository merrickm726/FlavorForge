"use client"

import Link from 'next/link'
import { AppBar, Toolbar, Typography, Button, Box, Stack, Menu, MenuItem } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import LoginModal from './LoginModal'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLoginOpen = () => setLoginModalOpen(true);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

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
                <Button
                  color="inherit"
                  onClick={handleMenuClick}
                  endIcon={<ArrowDropDownIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Hello, {user.name || user.email}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                >
                  <MenuItem component={Link} 
                            href="/my-recipes" 
                            onClick={handleMenuClose}>
                    My Recipes
                  </MenuItem>
                  <MenuItem onClick={handleLogout} 
                            sx={{ color: 'darkorange' }}>
                    <b>Sign Out</b>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" 
                      onClick={handleLoginOpen} 
                      sx={{ color: 'orange' }}>
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
