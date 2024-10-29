// import "server only"

import axios from "axios";
import { JWTPayload, jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers";

const key = new TextEncoder().encode(process.env.SECRET_KEY);
const cookie = {
    name:'session',
    options:{httpOnly:true, secure:true, sameSite:'lax',path:'/'},
    duration: 30*60*1000
}

export async function encrypt(payload:JWTPayload){
    return new SignJWT(payload)
        .setProtectedHeader({alg:process.env.ALGORITHM||""})
        .setIssuedAt()
        .setExpirationTime('1day')
        .sign(key)
}

export const getCurrentToken = ()=>{
    const retrievedCookie = cookies().get(cookie.name)?.value
        if(!retrievedCookie){
            return false;
        }
    const token = JSON.parse(retrievedCookie);
    return token.access_token;
}

export async function decrypt(session:string){
    try {
        const { payload } = await jwtVerify(session,key,{
            algorithms:[process.env.ALGORITHM||""]
        });
        return payload
    } catch (error) {
        console.error("Decrypt session error:", error);
        return null;
    }
}

export async function createSession(tokens:{access_token:string; token_type:"bearer"}){
    const session = tokens
    cookies().set(cookie.name, JSON.stringify(session));
    return true
}

export async function verifySession(){
    try {
        const url = process.env.BASE_API_ROUTE
        const retrievedCookie = cookies().get(cookie.name)?.value
        if(!retrievedCookie){
            return false;
        }
        const token = JSON.parse(retrievedCookie);
        const response = await axios.get(`${url}/verify-token/${token?.access_token}`);
        // console.log("Verify token:", response.data);
        if(!response || !response.data.success){
            return false;
        }
        return true
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log("Axios error")
        }
        console.log("Token not verified");
        return false
    }
}

export async function deleteSession(){
    cookies().delete(cookie.name)
    return true
}

export async function getCurrentUser(){
    try {
        const retrievedCookie = cookies().get(cookie.name)?.value
        if(!retrievedCookie){
            return false;
        }
        const token = JSON.parse(retrievedCookie);
        const url = process.env.BASE_API_ROUTE
        const response = await axios.get(`${url}/me`, {
            headers:{
                Authorization: `Bearer ${token.access_token}`
            }
        });
        if(!response || !response.data){
            return null;
        }
        console.log({user:response.data});
        return response.data
    } catch (error) {
        if(axios.isAxiosError(error) && error.response?.status===401){
            console.log("Unauthorized!");
        }
        console.log("User not fetched")
        return null
    }
}
