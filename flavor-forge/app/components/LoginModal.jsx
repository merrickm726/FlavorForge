import {useState} from 'react'
import { useAuth } from '../context/AuthContext'
import {Button, Modal, Box, TextField, Stack} from '@mui/material'

export default function LoginModal({loginModalOpen, setLoginModalOpen }){

    const { login } = useAuth();

    const style = {
    position: 'absolute',
    color: 'black',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'white',
    boxShadow: 24,
    textAlign: 'center',
    p: 4,
    }

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLoginModalClose = () => {
        setLoginModalOpen(false)
    }

    const addUser = async() => {
        
        if (!name || !email || !password){
            alert('Please fill in all required fields')
            return
        }

        const newUser = {
            email: email,
            password: password,
            name: name,
        }

        try{
            const res = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            })

            const data = await res.json()

            if (!res.ok) {
                alert(`Error: ${data.error}`)
                return
            }
            
            console.log('User created: ', data)
            
            // Log the user in using Context
            login(data.user);

            setLoginModalOpen(false)
            alert('Successfully created account!')
            
            // clear form
            setName('')
            setEmail('')
            setPassword('')

        }catch(err){
            console.log(`error adding user: ${err}`)
            alert('Failed to create account')
        }
    }

    return (
        <>
        <Modal open={loginModalOpen} onClose={handleLoginModalClose}>
            <Box sx={style}>
                <h3>Enter Login Details:</h3>

                <Stack spacing={2} sx={{textAlign: 'center'}}>

                    <TextField
                        required
                        label='Email'
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        error={!email}
                        helperText={!email ? 'Email is required' : ''}/>

                    <TextField
                        required
                        label='Password'
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        error={!password}
                        helperText={!password ? 'Password is required' : ''}/>

                    <TextField
                        required
                        label='Name'
                        value={name}
                        onChange={event => setName(event.target.value)}
                        error={!name}
                        helperText={!name ? 'name is required' : ''}/>
                    
                    <Button variant='contained' onClick={addUser}>
                        Create Account
                    </Button>

                </Stack>

            </Box>
        </Modal>
        </>
    )
}