import axios  from "axios";
import { setError, setLoading ,setMessage } from "../../../store/reducers/User/Login";

export const loginUser = ( email, password ) => async (dispatch)=>{
    try {
        dispatch(setLoading(true));

        const response = await axios.post("http://localhost:3001/api/login", { email,password });

        dispatch(setMessage("Login Successfully"))

        localStorage.setItem("authToken", response.data.token);
        
        if (response.data.role === "admin") {
            window.location.href = "/admin-dashboard";
           }

        dispatch(setLoading(false));
    } catch (error) {
    dispatch(setLoading(false));
    dispatch(setError(error.response?.data || "Login failed"));
    }
}

