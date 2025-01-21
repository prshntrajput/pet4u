import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  animalData: {
    name: '',
    age: '',
    animalCategory: '',
    breed: '',
    description: '',
    healthStatus: '',
    image: '',
  },
  message: null,
  loading: false,
  error: null,
};


export const animalDataSlice = ({
    name:"animalData",
    initialState,
    reducers:{
        setAnimalData:(state, action)=>{
            state.animalData={
                ...state.animalData,
                [action.payload.name]: action.payload.value
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
    },

});

export default animalDataSlice.reducer;
export const {setAnimalData,setLoading,setError,setMessage}= animalDataSlice.actions;

















































