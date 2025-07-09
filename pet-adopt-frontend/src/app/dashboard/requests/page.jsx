import React from 'react'
import SellerRequests from '../_components/SellerRequests'
import SellerRequestDashboard from '../_components/SellerRequests'
import ProtectedRoute from '@/app/_components/ProtectedRoutes'

const Page = () => {
  return (
    <ProtectedRoute>
    <div>
        <SellerRequestDashboard/>
    </div>
    </ProtectedRoute>
  )
}

export default Page