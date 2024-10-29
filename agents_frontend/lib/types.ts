export interface User {
    id:number;
    email:string;
    agents:Record<string, string>
}

export interface Agent {
    id: number;
    api_key: string;
    markdown: boolean;
    user_id: number;
    name: string;
    model: string;
    show_tool_calls: boolean
}

export interface ChatMessage {
    agent_id: number,
    id: number,
    prompt: string,
    author: "user"|"assistant"
}
