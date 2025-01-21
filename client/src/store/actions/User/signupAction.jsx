import { setLoading, setError, setMessage } from "../../reducers/User/Signup";

export const registerUser = (signupData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await axios.post("http://localhost:3001/api/users", {signupData}, { withCredentials: true });

    dispatch(setMessage("Registration successful! Please log in."));
    dispatch(setError(null));
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      "Registration failed. Please check your details.";
    dispatch(setError(errorMessage));
  } finally {
    dispatch(setLoading(false));
  }
};
