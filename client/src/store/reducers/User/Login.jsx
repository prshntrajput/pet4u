import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loginData:{
        email:"",
        password:"",
    },

    error:null,
    loading:false,
    message:null,
}


export const loginUserSlice = createSlice({
    name: 'loginData',
    initialState,
    reducers: {

         setLoginUser: (state, action) => {
            state.loginData={
                ...state.loginUser,
                [action.payload.name]:action.payload.value,
            }
        },

        setMessage:(state, action)=>{
            state.message=action.payload;
        },

        setError:(state, action)=>{
            state.error=action.payload;
        },

        setLoading:(state, action)=>{
            state.loading=action.payload;
        },      

    }
});

export default loginUserSlice.reducer;
export const { setLoginUser,setError,setLoading, setMessage}= loginUserSlice.actions;