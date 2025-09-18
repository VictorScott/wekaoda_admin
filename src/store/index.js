import { configureStore } from "@reduxjs/toolkit";
import businessReducer from "./slices/businessSlice";
import usersReducer from "./slices/usersSlice";
import profileReducer from "./slices/profileSlice";

export const store = configureStore({
    reducer: {
        businesses: businessReducer,
        users: usersReducer,
        profile: profileReducer,
        // ... add other reducers here
    },
});
