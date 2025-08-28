import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api.js";

export const fetchBusinesses = createAsyncThunk(
    "businesses/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.post("/business/list", {});
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const businessSlice = createSlice({
    name: "businesses",
    initialState: {
        businesses: [],
        loading: false,
        error: null,
    },
    reducers: {
        // No remove actions here
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBusinesses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBusinesses.fulfilled, (state, action) => {
                state.loading = false;
                state.businesses = action.payload;
            })
            .addCase(fetchBusinesses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default businessSlice.reducer;
