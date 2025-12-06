"use client"

import Link from 'next/link'
import { AppBar, Toolbar, Typography, Button, Box, Stack, Menu, MenuItem } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import LoginModal from './LoginModal'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function Navbar() {
  const { user, logout } = useAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  // MUI Menu must be anchored to an element, which is either null or an element (closed or button)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleLoginOpen = () => setLoginModalOpen(true)

  // sets menu anchor to a button (which will be t)
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
  }

  // stype for parts in navbar
  const styles = {
    appBar: { bgcolor: '#120d36' },
    logo: { flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 'bold' },
    logoSpan: { color: 'orange' },
    userButton: { textTransform: 'none' },
    signOut: { color: 'darkorange' },
    loginButton: { color: 'orange' }
  }

  return (
    <>
      <AppBar position="static" sx={styles.appBar}>
        <Toolbar>
          {/* logo and home link */}
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={styles.logo}
          >
            Flavor<Box component="span" sx={styles.logoSpan}>Forge</Box>
          </Typography>

          {/* nav links */}
          <Stack direction="row" spacing={2}>
            <Button color="inherit" component={Link} href="/recipes">
              Find Recipes
            </Button>

            {/** if the're signed in then it says login, if not then it becomes a Menu */}
            {/** If it's a menu and they're admin, show admin dashboard */}
            {user ? (
              <>
                <Button
                  color="inherit"
                  onClick={handleMenuClick}
                  endIcon={<ArrowDropDownIcon />}
                  sx={styles.userButton}
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
                  {user.role === 'ADMIN' && (
                    <MenuItem component={Link} 
                              href="/admin" 
                              onClick={handleMenuClose}
                    >
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout} 
                            sx={styles.signOut}>
                    <b>Sign Out</b>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" 
                      onClick={handleLoginOpen} 
                      sx={styles.loginButton}>
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
