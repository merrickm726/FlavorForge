import {useState} from 'react'
import { useAuth } from '../context/AuthContext'
import {Button, Modal, Box, TextField, Stack, IconButton, InputAdornment, Typography} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginModal({loginModalOpen, setLoginModalOpen }){

    const { login } = useAuth();

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
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
        '& .MuiSvgIcon-root': { color: 'white' }
    };

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [isLogin, setIsLogin] = useState(false);

    const handleLoginModalClose = () => {
        setLoginModalOpen(false)
    }

    const handleSubmit = async() => {
        
        if (!email || !password){
            alert('Please fill in all required fields')
            return
        }

        if (!isLogin && !name) {
            alert('Please enter your name')
            return
        }

        const endpoint = isLogin ? '/api/users/login' : '/api/users/create';
        const body = isLogin ? { email, password } : { email, password, name };

        try{
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (!res.ok) {
                alert(`Error: ${data.error}`)
                return
            }
            
            console.log('Auth success: ', data)
            
            // Log the user in using Context
            login(data.user);

            setLoginModalOpen(false)
            alert(isLogin ? 'Successfully logged in!' : 'Successfully created account!')
            
            // clear form
            setName('')
            setEmail('')
            setPassword('')

        }catch(err){
            console.log(`Auth error: ${err}`)
            alert('Authentication failed')
        }
    }

    return (
        <>
        <Modal open={loginModalOpen} onClose={handleLoginModalClose}>
            <Box sx={style}>
                <Typography variant="h5" mb={2} fontWeight="bold">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </Typography>

                <Stack spacing={2} sx={{textAlign: 'center'}}>

                    <TextField
                        required
                        label='Email'
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        sx={textFieldStyle}
                    />

                    <TextField
                        required
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        sx={textFieldStyle}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(p => !p)} edge="end" sx={{ color: 'white' }}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />

                    {!isLogin && (
                        <TextField
                            required
                            label='Name'
                            value={name}
                            onChange={event => setName(event.target.value)}
                            sx={textFieldStyle}
                        />
                    )}
                    
                    <Button variant='contained' 
                            onClick={handleSubmit} 
                            size="large"
                            sx={{color:'white', bgcolor: 'darkorange'}}>
                        {isLogin ? 'Login' : 'Create Account'}
                    </Button>

                    <Button onClick={() => setIsLogin(!isLogin)} 
                            sx={{textTransform: 'none'}}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </Button>

                </Stack>

            </Box>
        </Modal>
        </>
    )
}