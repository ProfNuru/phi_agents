"use client";
import { fetchCurrentUser } from '@/actions/auth';
import { User } from '@/lib/types';
import React, { useEffect, useState, useTransition } from 'react'
import UserButton from './user-button';
import Link from 'next/link';

const DashboardNavigation = () => {
    const [isPending, startTransition] = useTransition();
    const [user, setUser] = useState<User|null>(null);

    useEffect(()=>{
        startTransition(()=>{
            fetchCurrentUser().then((response)=>{
                if(response.success){
                    setUser(response.data);
                }
            })
        })
    },[])

  return (
    <nav className='w-full h-[48px] bg-gray-800 px-6 text-white flex flex-wrap items-center justify-between'>
        <Link href="/dashboard">Display Science Agents</Link>

        {!isPending ? <UserButton user={user} /> : null}
    </nav>
  )
}

export default DashboardNavigation
