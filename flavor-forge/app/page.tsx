"use client";

import Link from "next/link"
import {useState } from 'react'
import { Box, Container, Typography, Button, Stack } from "@mui/material"
import LoginModal from './components/LoginModal'

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const handleLoginModalOpen = () =>{
    setLoginModalOpen(true)
  }



  return (
    <>
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: '#120d36',
        p: 4,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Typography variant="h2" component="h1" fontWeight="bold" color="white">
            Flavor<Box component="span" sx={{ color: "orange" }}>Forge</Box>
          </Typography>

          <Typography variant="h5" color="white" sx={{ maxWidth: "sm" }}>
            Discover, create, and share your favorite recipes. 
            Your culinary journey starts here.
          </Typography>

          <Stack direction="row" spacing={2} mt={4}>
            <Button
              component={Link}
              href="/recipes"
              variant="contained"
              size="large"
              sx={{
                borderRadius: 50,
                px: 4,
                py: 1.5,
                bgcolor: "orange",
                "&:hover": { bgcolor: "darkorange" },
              }}
            >
              <b>Find Recipes</b>
            </Button>
            <Button
              onClick={handleLoginModalOpen}
              variant="outlined"
              size="large"
              sx={{
                borderRadius: 50,
                px: 4,
                py: 1.5,
                borderColor: "divider",
                bgcolor: 'white',
                color: "orange",
                "&:hover": { bgcolor: '#ccccccff' },
              }}
            >
              <b>Login</b>
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
    <LoginModal loginModalOpen={loginModalOpen} setLoginModalOpen={setLoginModalOpen}/>
    </>
  );
}
