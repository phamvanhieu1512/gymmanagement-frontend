import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  fullName: "",
  email: "",
  role: "",
  access_Token: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const { fullName, email, role, access_Token } = action.payload;
      state.fullName = fullName;
      state.email = email;
      state.role = role;
      state.access_Token = access_Token;
    },
    resetUser: (state) => {
      state.fullName = "";
      state.email = "";
      state.role = "";
      state.access_Token = "";
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateUser, resetUser } = userSlice.actions;

export default userSlice.reducer;
