import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../components/LandingPage";
import { SignupForm } from "./components/SignUp/SignUp";
import { LoginForm } from "./components/Login/Login";
import { BrowseAnimals } from "./components/animals/BrowseAnimals";
import { PostAnimalForm } from "./components/postanimals/PostAnimals";


const router = createBrowserRouter([
    {path:"/", element: <LandingPage/>},
    {path:"/signup", element:<SignupForm/>},
    {path:"/login", element:<LoginForm/>},
    {path:"/home", element:<BrowseAnimals/>},
    {path:"/post-animal", element:<PostAnimalForm/>}
])


export default router;