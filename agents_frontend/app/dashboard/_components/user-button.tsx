"use client";
import { logout } from '@/actions/auth';
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from '@/lib/types'
import { LogOut, User2 } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react'
import { BeatLoader } from 'react-spinners';

const UserButton = ({user}:{user:User|null}) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const logUserOut = () => {
        startTransition(()=>{
            logout().then((response)=>{
                if(response.success){
                    router.push("/");
                }
            })
        })
    }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className='rounded-full' size="icon">
            <User2 className='w-4 h-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User2 />
            <span>{user?.email}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logUserOut}>
          {isPending ? <BeatLoader size={20} /> : <LogOut />}
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserButton
