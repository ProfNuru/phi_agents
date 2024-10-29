"use server";

import { createSession, deleteSession, getCurrentUser } from "@/lib/session";
import axios from "axios";

export const register = async (values:{
    email:string;
    password:string;
    password2:string;
}) => {
    if(values.password.trim().length === 0 || values.password!==values.password2){
        return {error:"Password mismatch"}
    }
    const url = `${process.env.BASE_API_ROUTE}/register`;
    try {
        const response = await axios.post(
            url,
            {
                email:values.email,
                password:values.password
            }
        )
        if(!response){
            return {error:"Something went wrong"}
        }
        return {success:"Account created!", data:response.data}
    } catch (error) {
        console.error("Something went wrong:", error);
        return {error:"Something went wrong"}
    }
}

export const login = async (values:{
    email:string;
    password:string;
}) => {
    const url = `${process.env.BASE_API_ROUTE}/login`;
    try {
        const response = await axios.post(
            url,
            {
                email:values.email,
                password:values.password
            }
        )
        if(!response){
            return {error:"Login failed"}
        }
        console.log({data:response.data})

        const sessionCreated = await createSession(response.data)

        if(sessionCreated){
            return {success:"Login successful", data:response.data}
        }
        return {error:"Something went wrong"}

    } catch (error) {
        console.error("Something went wrong:", {error});
        if(axios.isAxiosError(error)){
            return {error: error.response?.data.detail}
        }
        return {error:"Something went wrong"}
    }
}

export const fetchCurrentUser = async () => {
    try {
        const user = await getCurrentUser();
        if(!user){
            throw new Error("Session expired");
        }
        return {success:"User fetched", data:user};
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log("Axios error");
        }
        await deleteSession();
        return {error:"Something went wrong"}
    }
}

export const logout = async () => {
    try {
        const sessionDeleted = await deleteSession();
        if(!sessionDeleted){
            return {error: "Failed to logout"}
        }
        return {success:"You are logged out"}
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log("Request failed")
        }
        return {error:"Something went wrong"}
    }
}
