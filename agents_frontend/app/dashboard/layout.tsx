import React from 'react'
import DashboardNavigation from './_components/dashboard-navigation';

const DashboardLayout = ({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) => {
  return (
    <div className='w-full min-h-screen flex flex-col bg-gray-200'>
        <DashboardNavigation />
        {children}
    </div>
  )
}

export default DashboardLayout
