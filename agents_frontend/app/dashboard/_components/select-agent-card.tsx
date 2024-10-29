"use client";

import { deleteAgent } from "@/actions/agents";
import { Button } from "@/components/ui/button";
import { Agent } from "@/lib/types";
import { MessageSquareMore, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { CircleLoader } from "react-spinners";
import { toast } from "sonner";

const SelectAgentCard = ({agent, reload}:{agent:Agent; reload:()=>void}) => {
    const [isPending, startTransition] = useTransition();

    const removeAgent = () => {
        startTransition(()=>{
            deleteAgent(agent.id).then((response)=>{
                if(response.success){
                    reload();
                    toast.success(response.success);
                }else if(response.error){
                    toast.error(response.error);
                }
            })
        })
    }
  return (
    <div className="max-w-[280px] min-h-[200px] p-6 rounded-lg shadow-lg bg-gray-50 hover:bg-white flex flex-col gap-4 justify-between transition-all">
        <div className="flex flex-col gap-4">
            <h1 className="capitalize text-2xl font-bold">{agent.name}</h1>
            <h3>Model: {agent.model}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button variant="ghost" className="bg-green-700 hover:bg-green-600 text-white" asChild>
                <Link href={`/dashboard/chat/${agent.id}`}><MessageSquareMore  className="w-4 h-4" /></Link>
            </Button>

            <Button disabled={isPending} onClick={removeAgent} variant="destructive">
                {isPending ? <CircleLoader size={15} /> : <Trash2 className="w-4 h-4" />}
            </Button>
        </div>
    </div>
  )
}

export default SelectAgentCard
