import axios from 'axios'
import config from '../../config'
import jwtDecode from 'jwt-decode'

export const signin = ({ username, password }, closeModal) => {
    return (dispatch) => {
        return axios({
            method: "post",
            url: `${config.SERVER_URL}/signin`,
            data: { username, password }
        }).then(response => {
            localStorage.setItem('token', response.data.token)
            const token = localStorage.getItem('token')
            dispatch({
                type: 'AUTH_USER',
                payload: jwtDecode(token)
            })
            closeModal()
        }).catch(() => {
            dispatch({ type: 'AUTH_ERROR', payload: "You have entered an invalid username or password." })
        })
    }
}

export const signout = () => {
    return (dispatch) => {
        localStorage.removeItem('token')
        dispatch({ type: 'UNAUTH_USER' })
    }
}