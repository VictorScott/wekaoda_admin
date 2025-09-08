import { configureStore } from "@reduxjs/toolkit";
import businessReducer from "./slices/businessSlice";
import usersReducer from "./slices/usersSlice";

export const store = configureStore({
    reducer: {
        businesses: businessReducer,
        users: usersReducer,
        // ... add other reducers here
    },
});
