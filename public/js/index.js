/* eslint-disable */
import { login, logout } from './login'
import { updateSettings } from './updateSettings'
import '@babel/polyfill'

const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-settings')

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

        updateSettings({name, email}, 'data')
    })
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', e => {
        e.preventDefault()

        const curPassword = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfirm  = document.getElementById('password-confirm').value

        updateSettings({curPassword, password, passwordConfirm}, 'password')
            .then( (res) => {
                document.getElementById('password-current').value = ''
                document.getElementById('password').value = ''
                document.getElementById('password-confirm').value = ''
            })
    })
}