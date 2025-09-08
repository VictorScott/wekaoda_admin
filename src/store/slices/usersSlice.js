import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api";

export const fetchUsers = createAsyncThunk(
    "users/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.post("/users/list", {});
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const saveUser = createAsyncThunk(
    "users/save",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await API.post("/users/save", userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateUserStatus = createAsyncThunk(
    "users/updateStatus",
    async (statusData, { rejectWithValue }) => {
        try {
            const response = await API.post("/users/status", statusData);

            if (!response.data.success) {
                return rejectWithValue(response.data);
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const usersSlice = createSlice({
    name: "users",
    initialState: {
        users: [],
        // Separate loading states for better UX
        initialLoading: false,    // For initial table load
        refreshing: false,        // For table refresh operations
        actionLoading: {},        // For individual row actions (by user ID)
        error: null,
        successMessage: null,
    },
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        setActionLoading: (state, action) => {
            const { userId, loading } = action.payload;
            if (loading) {
                state.actionLoading[userId] = true;
            } else {
                delete state.actionLoading[userId];
            }
        },
        clearActionLoading: (state) => {
            state.actionLoading = {};
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users - Use initialLoading/refreshing based on whether users exist
            .addCase(fetchUsers.pending, (state) => {
                if (state.users.length === 0) {
                    state.initialLoading = true;
                } else {
                    state.refreshing = true;
                }
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, { payload }) => {
                state.initialLoading = false;
                state.refreshing = false;
                state.users = payload;
            })
            .addCase(fetchUsers.rejected, (state, { payload }) => {
                state.initialLoading = false;
                state.refreshing = false;
                state.error = payload || "An error occurred while fetching users.";
            })
            // Save User - No global loading, handled by form
            .addCase(saveUser.pending, (state) => {
                state.error = null;
                state.successMessage = null;
            })
            .addCase(saveUser.fulfilled, (state) => {
                state.successMessage = "User saved successfully.";
                // Don't push to array, let refetch handle updates
            })
            .addCase(saveUser.rejected, (state, { payload }) => {
                state.error = payload || "Failed to save user.";
            })
            // Update User Status - No global loading, handled by individual actions
            .addCase(updateUserStatus.pending, (state) => {
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateUserStatus.fulfilled, (state) => {
                state.successMessage = "User status updated.";
            })
            .addCase(updateUserStatus.rejected, (state, { payload }) => {
                state.error = payload || "Failed to update user status.";
            });
    },
});

export const { clearMessages, setActionLoading, clearActionLoading } = usersSlice.actions;

export default usersSlice.reducer;
