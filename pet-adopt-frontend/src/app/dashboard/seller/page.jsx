import React from 'react'
import SellerDashboard from '../_components/SellerDashboard'
import ProtectedRoute from '@/app/_components/ProtectedRoutes'

const Page = () => {
  return (
    <ProtectedRoute>
    <div>
        <SellerDashboard/>
    </div>
    </ProtectedRoute>
  )
}

export default Page