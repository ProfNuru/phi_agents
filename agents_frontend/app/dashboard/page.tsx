"use client";

import { getAgents } from "@/actions/agents";
import { Agent } from "@/lib/types";
import { useEffect, useState, useTransition } from "react";
import { BeatLoader } from "react-spinners";
import SelectAgentCard from "./_components/select-agent-card";
import AgentForm from "./_components/agent-form";
import DashboardWelcomeSection from "./_components/dashboard-welcome-section";

const DashboardPage = () => {
    const [refresh, setRefresh] = useState(true);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isPending, startTransition] = useTransition();

    useEffect(()=>{
        if(refresh){
            startTransition(()=>{
                getAgents().then((response)=>{
                    if(response.success){
                        console.log(response.data);
                        setAgents(response.data.agents)
                    }
                })
            });
            setRefresh(false);
        }
    },[refresh]);

    return <div className="flex flex-col gap-6 px-4">
        <DashboardWelcomeSection />
        <h1 className="w-full text-center text-2xl font-bold">AGENTS</h1>

        <div className="flex items-center justify-end">
            <AgentForm reload={()=>setRefresh(true)} />
        </div>
        {isPending ? <div className="w-full min-h-[300px] flex flex-col items-center justify-center">
        <BeatLoader size={30} />
    </div> : agents.length > 0 ? (
        <div className="flex flex-wrap items-center gap-6">
            {agents.map((agent)=><SelectAgentCard reload={()=>setRefresh(true)} key={agent.id} agent={agent} />)}
        </div>
      ) : <div className="w-full min-h-[300px] flex flex-col items-center justify-center">
        <h6 className="text-center text-red-800 italic">You have not created any agents yet</h6>
      </div>}
    </div>
}

export default DashboardPage
