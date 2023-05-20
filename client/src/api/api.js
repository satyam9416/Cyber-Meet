import axios from 'axios'
axios.defaults.withCredentials = true

const API = axios.create({
    baseURL: import.meta.VITE_SERVER_URL
})

export default API;