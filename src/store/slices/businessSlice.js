import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api.js";

// Fetch businesses
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

// Toggle business status
export const updateBusinessStatus = createAsyncThunk(
    "businesses/updateStatus",
    async ({ business_id, status }, { rejectWithValue }) => {
        try {
            const response = await API.post("/business/status", {
                business_id,
                status,
            });
            return {
                business_id,
                status: response.data.data.status || status,
            };
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
    reducers: {},
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
            })

            // New: status update handling
            .addCase(updateBusinessStatus.fulfilled, (state, action) => {
                const { business_id, status } = action.payload;
                const index = state.businesses.findIndex(b => b.business_id === business_id);
                if (index !== -1) {
                    state.businesses[index].status = status;
                }
            })
            .addCase(updateBusinessStatus.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export default businessSlice.reducer;
