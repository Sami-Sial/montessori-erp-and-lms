import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light',
    locale: 'en',
    toasts: [],
    aiChatOpen: false,
  },
  reducers: {
    setTheme: (state, action) => { state.theme = action.payload; },
    setLocale: (state, action) => { state.locale = action.payload; },
    addToast: (state, action) => {
      state.toasts.push({ id: Date.now(), ...action.payload });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleAIChat: (state) => { state.aiChatOpen = !state.aiChatOpen; },
    closeAIChat: (state) => { state.aiChatOpen = false; },
  },
});

export const { setTheme, setLocale, addToast, removeToast, toggleAIChat, closeAIChat } = uiSlice.actions;
export default uiSlice.reducer;
