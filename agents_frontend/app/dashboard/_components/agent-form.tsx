"use client";

import { createAgent } from '@/actions/agents';
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Agent } from '@/lib/types'
import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState, useTransition } from 'react'
import { toast } from 'sonner';

const AgentForm = ({agent, reload}:{agent?:Agent|null; reload:()=>void}) => {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [model, setModel] = useState("");
    const [apikey, setApikey] = useState("");
    const [tools, setTools] = React.useState<string[]>([]);
    const [instructions, setInstructions] = React.useState<{
        id:number,
        text:string
    }[]>([{
        id:1,
        text:""
    }]);
    const [showToolCalls, setShowToolCalls] = useState(true);
    const [markdown, setMarkdown] = useState(true);

    const handleSetValue = (val: string) => {
        if (tools.includes(val)) {
            tools.splice(tools.indexOf(val), 1);
            setTools(tools.filter((item) => item !== val));
        } else {
            setTools(prevValue => [...prevValue, val]);
        }
    }

    const addInstructionField = () => {
        const lastInstruction = instructions[instructions.length-1]
        setInstructions((prev)=>[...prev, {id:lastInstruction.id+1, text:""}]);
    }

    const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const data = {
            name,
            model,
            api_key:apikey,
            tools,
            show_tool_calls:showToolCalls,
            markdown,
            instructions:instructions.filter((obj)=>obj.text.length>0).map((instr)=>instr.text)
        }

        startTransition(()=>{
            if(agent){
                console.log("Edit agent");
            }else{
                createAgent(data).then((response)=>{
                    if(response.success){
                        reload();
                        toast.success(response.success)
                        setOpen(false);
                    }else if(response.error){
                        toast.error(response.error)
                    }
                })
            }
        })
    }

  return (
    <Dialog open={open} onOpenChange={(v)=>setOpen(v)}>
      <DialogTrigger asChild>
            {agent ? <Button>edit</Button> : <Button>
                <PlusIcon className="w-4 h-4" />
                Create agent
            </Button>}
      </DialogTrigger>
      <DialogContent className='flex flex-col items-center justify-center'>
        <form onSubmit={handleSubmitForm} className='flex flex-col gap-4 w-full p-2'>
            <DialogHeader>
            <DialogTitle>{agent ? "Edit" : "Create"} agent</DialogTitle>
            <DialogDescription>
                {" "}
            </DialogDescription>
            </DialogHeader>

            <div className='flex flex-col gap-4 w-full'>
                <div className='flex flex-col w-full gap-2'>
                    <Label htmlFor='agent-name'>Name</Label>
                    <Input disabled={isPending} value={name}
                        onChange={(e)=>setName(e.target.value)}
                        id="agent-name"
                        placeholder='Agent name'
                        className='w-full'
                    />
                </div>

                <div className='flex flex-col w-full gap-2'>
                    <Label htmlFor='agent-model'>Model</Label>
                    <Select disabled={isPending} value={model} onValueChange={(v)=>setModel(v)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent id='agent-modal'>
                            <SelectGroup>
                            <SelectLabel>Models</SelectLabel>
                            <SelectItem value="openai-gpt-4o">openai-gpt-4o</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className='flex flex-col w-full gap-2'>
                    <Label>Tools</Label>
                    <MultiSelect
                    handleSetValue={handleSetValue}
                    value={tools}
                    options={[
                        {
                            label:"Search",
                            value:"search"
                        },
                        {
                            label:"Finance",
                            value:"finance"
                        }
                    ]} />
                </div>

                <div className='flex flex-col w-full gap-2'>
                    <Label htmlFor='model-apikey'>API Key</Label>
                    <Input disabled={isPending} value={apikey} onChange={(e)=>setApikey(e.target.value)} id="model-apikey" placeholder='sk-***' className='w-full' />
                </div>

                <div className='flex flex-col w-full gap-2'>
                    <Label htmlFor='instructions'>Instructions</Label>
                    {instructions.map((instruction)=><Input key={instruction.id} disabled={isPending} value={instruction.text} onChange={(e)=>setInstructions((prev)=>prev.map((instr)=>instr.id===instruction.id ? {...instr, text:e.target.value} : instr))} placeholder='Instruction' className='w-full' />)}
                    <div className='w-full flex items-center justify-end'>
                        <Button type="button" onClick={addInstructionField} size="sm" variant="outline"><PlusIcon className='w-3 h-3' /> Add instruction</Button>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox disabled={isPending} checked={showToolCalls} onCheckedChange={(e)=>{
                        setShowToolCalls(!!e);
                    }} id="show-tool-calls" />
                    <Label
                        htmlFor="show-tool-calls"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Show tool calls
                    </Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox disabled={isPending} checked={markdown} onCheckedChange={(e)=>{
                        setMarkdown(!!e);
                    }} id="response-in-markdown" />
                    <Label
                        htmlFor="response-in-markdown"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Response in markdown format
                    </Label>
                </div>

            </div>

            <DialogFooter>
                <Button disabled={isPending} type="submit">{agent ? isPending ? "Saving..." : "Save" : isPending ? "Creating..." : "Create"}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AgentForm
