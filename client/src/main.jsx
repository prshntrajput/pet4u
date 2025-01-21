import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from 'react-router-dom'
import {Provider} from "react-redux"
import router from './routing/routes.jsx'

import {store}  from "./store/store.jsx"
import { Navbar } from './components/NavBar.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Provider store={store}>
   <RouterProvider router={router}/>
   </Provider>
  </StrictMode>,
)
