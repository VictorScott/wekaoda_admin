import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api";

export const fetchKYCDocTypes = createAsyncThunk(
    "kycDocTypes/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.post("/kyc-doc-types/list", {});
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const saveKYCDocType = createAsyncThunk(
    "kycDocTypes/save",
    async (kycDocTypeData, { rejectWithValue }) => {
        try {
            const response = await API.post("/kyc-doc-types/save", kycDocTypeData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteKYCDocType = createAsyncThunk(
    "kycDocTypes/delete",
    async (kycDocTypeId, { rejectWithValue }) => {
        try {
            const response = await API.post("/kyc-doc-types/delete", {
                kyc_doc_type_id: kycDocTypeId
            });

            if (!response.data.success) {
                return rejectWithValue(response.data);
            }

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchBusinessTypes = createAsyncThunk(
    "kycDocTypes/fetchBusinessTypes",
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get("/kyc-doc-types/business-types");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const kycDocTypesSlice = createSlice({
    name: "kycDocTypes",
    initialState: {
        kycDocTypes: [],
        businessTypes: [],
        // Separate loading states for better UX
        initialLoading: false,    // For initial table load
        refreshing: false,        // For table refresh operations
        actionLoading: {},        // For individual row actions (by doc type ID)
        businessTypesLoading: false, // For business types dropdown
        error: null,
        successMessage: null,
    },
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        setActionLoading: (state, action) => {
            const { docTypeId, loading } = action.payload;
            if (loading) {
                state.actionLoading[docTypeId] = true;
            } else {
                delete state.actionLoading[docTypeId];
            }
        },
        clearActionLoading: (state) => {
            state.actionLoading = {};
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch KYC Doc Types - Use initialLoading/refreshing based on whether data exists
            .addCase(fetchKYCDocTypes.pending, (state) => {
                if (state.kycDocTypes.length === 0) {
                    state.initialLoading = true;
                } else {
                    state.refreshing = true;
                }
                state.error = null;
            })
            .addCase(fetchKYCDocTypes.fulfilled, (state, { payload }) => {
                state.initialLoading = false;
                state.refreshing = false;
                state.kycDocTypes = payload;
            })
            .addCase(fetchKYCDocTypes.rejected, (state, { payload }) => {
                state.initialLoading = false;
                state.refreshing = false;
                state.error = payload || "An error occurred while fetching KYC document types.";
            })
            // Save KYC Doc Type - No global loading, handled by form
            .addCase(saveKYCDocType.pending, (state) => {
                state.error = null;
                state.successMessage = null;
            })
            .addCase(saveKYCDocType.fulfilled, (state) => {
                state.successMessage = "KYC document type saved successfully.";
                // Don't push to array, let refetch handle updates
            })
            .addCase(saveKYCDocType.rejected, (state, { payload }) => {
                state.error = payload || "Failed to save KYC document type.";
            })
            // Delete KYC Doc Type - No global loading, handled by individual actions
            .addCase(deleteKYCDocType.pending, (state) => {
                state.error = null;
                state.successMessage = null;
            })
            .addCase(deleteKYCDocType.fulfilled, (state) => {
                state.successMessage = "KYC document type deleted successfully.";
            })
            .addCase(deleteKYCDocType.rejected, (state, { payload }) => {
                state.error = payload || "Failed to delete KYC document type.";
            })
            // Fetch Business Types
            .addCase(fetchBusinessTypes.pending, (state) => {
                state.businessTypesLoading = true;
                state.error = null;
            })
            .addCase(fetchBusinessTypes.fulfilled, (state, { payload }) => {
                state.businessTypesLoading = false;
                state.businessTypes = payload.data || [];
            })
            .addCase(fetchBusinessTypes.rejected, (state, { payload }) => {
                state.businessTypesLoading = false;
                state.error = payload || "Failed to fetch business types.";
            });
    },
});

export const { clearMessages, setActionLoading, clearActionLoading } = kycDocTypesSlice.actions;

export default kycDocTypesSlice.reducer;
