import { configureStore } from "@reduxjs/toolkit";
import businessReducer from "./slices/businessSlice";
import usersReducer from "./slices/usersSlice";
import profileReducer from "./slices/profileSlice";
import kycDocTypesReducer from "./slices/kycDocTypesSlice";

export const store = configureStore({
    reducer: {
        businesses: businessReducer,
        users: usersReducer,
        profile: profileReducer,
        kycDocTypes: kycDocTypesReducer,
        // ... add other reducers here
    },
});
