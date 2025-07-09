import React from 'react'
import PetList from './_components/PetList'
import ProtectedRoute from '../_components/ProtectedRoutes'

const Page = () => {
  return (
    <ProtectedRoute>
    <div>
        <PetList/>
    </div>
    </ProtectedRoute>
  )
}

export default Page