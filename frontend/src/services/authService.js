import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const registerUser = async(username, email, phone, password) =>{
    const response = await axios.post(`${API_URL}/auth/register`, {username,email,phone,password,});
    return response.data;
};

export const loginUser= async(email, password)=>{
    const response = await axios.post(`${API_URL}/auth/login`,{
        email,
        password,
    });
    return response.data;
}