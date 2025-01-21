import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  signupData: {
    name: "",
    email: "",
    password: "",
    role: "user", // Default role
  },
  isAuthenticated: false,
  error: null,
  loading: false,
  message: null,
};

const SignupUserSlice = createSlice({
  name: "signupData",
  initialState,
  reducers: {
    setSignupData: (state, action) => {
      state.signupData = {
        ...state.signupData,
        [action.payload.name]: action.payload.value,
      };
    },
    setAuthentication: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    resetUserState: (state) => {
      return initialState; // Resets state to initial values
    },
  },
});

export const {
  setSignupData,
  setAuthentication,
  setError,
  setLoading,
  setMessage,
  resetUserState,
} = SignupUserSlice.actions;

export default SignupUserSlice.reducer;
