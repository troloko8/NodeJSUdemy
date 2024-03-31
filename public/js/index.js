/* eslint-disable */
import { login, logout } from './login'
import { updateSettings } from './updateSettings'
import '@babel/polyfill'

const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')

if (loginForm)
loginForm.addEventListener('submit', e => {
    e.preventDefault()
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    login(email, password)
})

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout)
}

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault()

        const name = document.getElementById('name').value
        const email = document.getElementById('email').value

        updateSettings(name, email)
    })
}
