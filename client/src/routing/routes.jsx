import { createBrowserRouter } from "react-router-dom";
import LandingPage from "../components/LandingPage";
import { SignupForm } from "./components/SignUp/SignUp";
import { LoginForm } from "./components/Login/Login";
import { BrowseAnimals } from "./components/animals/BrowseAnimals";
import { PostAnimalForm } from "./components/postanimals/PostAnimals";
import { UserProfile } from "./components/profile/Profile";
import { PetDetails } from "./components/animals/animalInfo/PetInfo";
import AuthWrapper from "./authWrapper/AuthWrapper";
import Layout from "../components/Layout";


const router = createBrowserRouter([
    {path:"/", element: <LandingPage/>},
    {path:"/signup", element:(<AuthWrapper> <SignupForm/></AuthWrapper>)},
    {path:"/login", element:(<AuthWrapper><LoginForm/></AuthWrapper>)},

    {path:"/" ,element:<Layout/>,
        children:[
       {path:"/post-animal", element:(<AuthWrapper><PostAnimalForm/></AuthWrapper>)},
      {path:"/userprofile", element:(<AuthWrapper><UserProfile/></AuthWrapper>)},
       {path:"/petinfo", element:(<AuthWrapper><PetDetails/></AuthWrapper>)},
       {path:"/home", element:(<AuthWrapper><BrowseAnimals/></AuthWrapper>)}
    ]
    }
  
    
])


export default router;