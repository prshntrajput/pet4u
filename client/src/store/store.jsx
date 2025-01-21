import { configureStore } from "@reduxjs/toolkit";
import loginUserReducer from "../store/reducers/User/Login"
import SignupUserReducer from "../store/reducers/User/Signup"

export const store = configureStore({

    reducer:{
        loginUserReducer:loginUserReducer,
        SignupUserReducer:SignupUserReducer
    }
})