import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../components/LandingPage";
import { SignupForm } from "./components/SignUp/SignUp";
import { LoginForm } from "./components/Login/Login";


const router = createBrowserRouter([
    {path:"/", element: <LandingPage/>},
    {path:"/signup", element:<SignupForm/>},
    {path:"/login", element:<LoginForm/>}
])


export default router;