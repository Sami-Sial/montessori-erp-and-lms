import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    updateTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (action.payload.user) {
        state.user = action.payload.user;
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, updateTokens, clearAuth, setLoading } = authSlice.actions;

// Selectors
export const selectUser        = (s) => s.auth.user;
export const selectAccessToken = (s) => s.auth.accessToken;
export const selectPermissions = (s) => s.auth.user?.permissions ?? [];
export const selectRoles       = (s) => s.auth.user?.roles ?? [];
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated;

export default authSlice.reducer;
