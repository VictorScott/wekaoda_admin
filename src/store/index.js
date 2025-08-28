import { configureStore } from "@reduxjs/toolkit";
import businessReducer from "./slices/businessSlice";

export const store = configureStore({
    reducer: {
        businesses: businessReducer,
        // ... add other reducers here
    },
});
