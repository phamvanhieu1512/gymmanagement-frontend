import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "./slides/counterSlice";
import userReducer from "./slides/userSlice";

export const store = configureStore({
  reducer: {
    counter: counterSlice,
    user: userReducer,
  },
});
