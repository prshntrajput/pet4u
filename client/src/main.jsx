import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from 'react-router-dom'
import router from './routing/routes.jsx'
import { Navbar } from './components/NavBar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Navbar/>
   <RouterProvider router={router}/>
  </StrictMode>,
)
