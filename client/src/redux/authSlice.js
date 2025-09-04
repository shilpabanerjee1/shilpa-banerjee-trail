import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// to check if user is logged in
export const checkUserSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { getState }) => {
    const token = getState().auth.token || localStorage.getItem("token");

    if (token) {
      const response = await axios.get(`${BASE_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    }
  }
);

//signup user
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/auth/register`,
        userData
      );
      return response.data;
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Signup failed";
      return rejectWithValue(errorMessage);
    }
  }
);

//login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/auth/login`,
        userData
      );

      return response.data;
    } catch (error) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data ||
        error.message ||
        "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// logout user
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await axios.post(
        `${BASE_URL}/api/v1/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      return null;
    } catch (error) {
      return thunkAPI.rejectWithValue("Logout failed");
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  firstLoginQuestions: null,
};

//authSlice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.firstLoginQuestions = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = { message: action.payload || action.error.message };
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.firstLoginQuestions = action.payload.firstLoginQuestions;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = { message: action.payload || action.error.message };
      })
      .addCase(checkUserSession.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
