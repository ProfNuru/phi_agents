"use server";

import { getCurrentToken } from "@/lib/session";
import axios from "axios";

export const getAgents = async () => {
    try {
        const token = getCurrentToken();
        const url = `${process.env.BASE_API_ROUTE}/agents/`
        const response = await axios.get(
            url,
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );
        if(!response || !response.data){
            return {error:"Something went wrong"}
        }
        return {success:"Agents fetched", data:response.data}

    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log("Request failed!", error);
        }
        return {error:"Something went wrong"}
    }
}

export const createAgent = async (values:{
    name:string;
    model:string;
    api_key:string;
    instructions:string[];
    tools:string[];
    show_tool_calls:boolean;
    markdown:boolean;
}) => {
    try {
        const token = getCurrentToken();
        const url = `${process.env.BASE_API_ROUTE}/agents`
        const response = await axios.post(
            url,
            values,
            {
                headers:{
                    Authorization:`Bearer ${token}`
                }
            }
        );
        // console.log({response:response.data});
        if(!response || !response.data){
            return {error:"Something went wrong"}
        }
        return {success:"Agent created"}
    } catch (error) {
        if(axios.isAxiosError(error)){
            console.log("Request error");
            return {error:error.response?.data}
        }
        return {error:"Something went wrong"}
    }
}

export const deleteAgent = async (agent_id:number) => {
    try {
        const token = getCurrentToken();
        const url = `${process.env.BASE_API_ROUTE}/agents/${agent_id}/`;
        const response = await axios.delete(url, {
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        if(!response || !response.data){
            return {error:"Something went wrong"}
        }
        return {success:"Agent deleted"}
    } catch (error) {
        if(axios.isAxiosError(error)){
            return {error:error.response?.data}
        }
        return {error:"something went wrong"}
    }
}

export const getSingleAgent = async (agent_id:string) => {
    try {
        const token = getCurrentToken();
        const url = `${process.env.BASE_API_ROUTE}/agents/${agent_id}/`;
        const response = await axios.get(url, {
            headers:{
                Authorization:`Bearer ${token}`
            }
        });
        if(!response || !response.data){
            return {error:"Something went wrong"}
        }
        console.log({agent:response.data.agent});
        return {success:"Agent fetched", data:response.data.agent}
    } catch (error) {
        if(axios.isAxiosError(error)){
            return {error:error.response?.data}
        }
        return {error:"something went wrong"}
    }
}

export const sendPrompt = async (prompt:string, agent_id:string) => {
    try {
        const url = `${process.env.BASE_API_ROUTE}/prompt/${agent_id}/`
        const response = await axios.post(url, {
            prompt
        })
        if(!response || !response.data){
            return {error:"Something went wrong"}
        }
        return {success:"Prompt submitted!", data:response.data.response}
    } catch (error) {
        if(axios.isAxiosError(error)){
            return {error:error.response?.data}
        }
        return {error:"Something went wrong"}
    }
}
