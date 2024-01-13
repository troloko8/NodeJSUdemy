// const axios = require('axios')
// import axios from 'axios'

/* eslint-disable */
const  login = async (email, password) => {
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
        console.log(res)

        if (res.data.status == "succes") {
            alert('Logged in successfully!')
            location.assign('/')

            // window.setTimeout(() => {

            // }, 1500)
        }
    } catch (error) {
        alert(error.response.data.message)
        console.error(error.response.data)
    }
}

document.querySelector('.form').addEventListener('submit', e => {
    e.preventDefault()

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    login(email, password)
})