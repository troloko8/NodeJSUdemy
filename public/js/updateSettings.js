import axios from 'axios'
import {showAlert} from './alerts'

export const updateSettings = async (name, email ) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: 'http://localhost:3000/api/v1/users/updateMe',
            data: {
                name,
                email
            }
        })

        if ( res.data.status === 'success' || res.data.status === 'succes') {
            showAlert('success', 'Data updated successfully') 
        }
    } catch(err) {
        showAlert('error', err.response.data.message)
    }
}