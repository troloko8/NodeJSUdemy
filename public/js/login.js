import axios from 'axios'
import {showAlert} from './alerts'

export const  login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            // url: 'http://127.0.0.1:3000/api/v1/users/login',
            url: 'http://localhost:3000/api/v1/users/login',
            data: {
                email,
                password
            }
        })

        if (res?.data?.status == "succes") { 
            showAlert('success', 'Logged in successfully!')

            window.setTimeout(() => {
                location.assign('/')
            }, 1500)
        }
    } catch (error) {
        showAlert('error', error.response.data.message)
        console.error(error.response.data.message)
    }
}

export const logout = async () => {
    try {
        const res = await axios({
            mathod: 'GET',
            url: 'http://localhost:3000/api/v1/users/logout',
        })

        if(res.data.status === 'success') {
            location.assign('/')
        }
    } catch (error) {
        showAlert('error', 'Erorr logging out, pls try again')
    }
}

// document.querySelector('.form').addEventListener('submit', e => {
//     e.preventDefault()

//     const email = document.getElementById('email').value
//     const password = document.getElementById('password').value

//     login(email, password)
// })