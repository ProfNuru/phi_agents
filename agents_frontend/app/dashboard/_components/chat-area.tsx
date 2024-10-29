"use client";
import { getSingleAgent, sendPrompt } from '@/actions/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Agent, ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState, useTransition } from 'react'
import { CircleLoader } from 'react-spinners';
import { toast } from 'sonner';

interface ChatAreaProps {
    messages:ChatMessage[];
    agentId:string
}

const ChatArea:React.FC<ChatAreaProps> = ({messages, agentId}) => {
    const [isPending, startTransition] = useTransition();
    const [prompt, setPrompt] = useState("");
    const [agent,setAgent] = useState<Agent|null>(null)

    const messagesBoxRef = useRef<null | HTMLDivElement>(null);

    const router = useRouter();

    const sendMessage  = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!prompt || prompt.trim().length < 1){
            return;
        }
        startTransition(()=>{
            sendPrompt(prompt, agentId).then((response)=>{
                if(response.success){
                    setPrompt("");
                    scrollToBottom();
                    router.refresh();
                }else if(response.error){
                    toast.error(response.error);
                }
            })
        })
    }

    const scrollToBottom = () => {
        messagesBoxRef.current?.scrollIntoView({ behavior: 'smooth',
            block: 'end',
            inline: 'nearest' });
    }

    useEffect(()=>{
        startTransition(()=>{
            getSingleAgent(agentId).then((response)=>{
                if(response.success){
                    setAgent(response.data);
                }
            })
        })
    },[agentId]);

    useEffect(()=>{
        if(messagesBoxRef){
            scrollToBottom();
            console.log("Scrolled!")
        }
    },[messages, messagesBoxRef]);

  return (
    <div className='w-full h-full max-h-[90vh] flex-grow flex flex-col'>
        <h2 className='w-full text-center text-xl font-bold uppercase my-4'>{agent?.name}</h2>
        <div className='flex-grow flex flex-col gap-4 w-full bg-gray-300 overflow-auto p-6'>
            {messages.map((message)=><div key={message.id}
            className={cn("w-[60%] shadow-lg p-6 rounded-md", message.author==="user" ? "bg-green-800 text-white self-end" : "bg-yellow-200 text-black")}>
                {message.prompt}
            </div>)}
            <div ref={messagesBoxRef}></div>
        </div>
        <form onSubmit={sendMessage} className='w-[80%] mx-auto flex items-center'>
            <Input disabled={isPending} value={prompt} onChange={(e)=>setPrompt(e.target.value)} placeholder='Enter your prompt...' />
            <Button disabled={isPending} type='submit'>Send {isPending && <CircleLoader size={15} />}</Button>
        </form>
    </div>
  )
}

export default ChatArea
