import { API_URL } from '../constants.js'

export const LOGIN_ROUTES = {
    sendOtp: `${API_URL}/auth/send-otp`,
    login: `${API_URL}/auth/login`,
}