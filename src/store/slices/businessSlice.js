import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../utils/api.js";

// Fetch businesses list
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

// Update business status
export const updateBusinessStatus = createAsyncThunk(
    "businesses/updateStatus",
    async ({ business_id, status }, { rejectWithValue }) => {
        try {
            const response = await API.post("/business/status", { business_id, status });
            return { business_id, status: response.data.data.status || status };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// KYC document status update
export const updateKYCStatus = createAsyncThunk(
    "businesses/updateKYCStatus",
    async ({ doc_id, action, comments }, { rejectWithValue }) => {
        try {
            const response = await API.post("/business/kyc-doc-action", { doc_id, action, comments });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Business final review action
export const submitBusinessReview = createAsyncThunk(
    "businesses/submitReview",
    async ({ business_id, action, comments }, { rejectWithValue }) => {
        try {
            const response = await API.post("/business/action", { business_id, action, comments });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Send business back for corrections
export const sendBackForCorrection = createAsyncThunk(
    "businesses/sendBackForCorrection",
    async ({ business_id, correction_comments, admin_name }, { rejectWithValue }) => {
        try {
            const response = await API.post("/business/send-back-for-correction", {
                business_id,
                correction_comments,
                admin_name,
            });
            return { business_id, ...response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const businessSlice = createSlice({
    name: "businesses",
    initialState: {
        businesses: [],
        // Separate loading states for better UX
        initialLoading: false,    // For initial table load
        refreshing: false,        // For table refresh operations
        actionLoading: {},        // For individual row actions (by business ID)
        error: null,
    },
    reducers: {
        updateDocumentStatusInStore: (state, action) => {
            const { businessId, docId, status } = action.payload;
            const business = state.businesses.find((b) => b.business_id === businessId);
            if (!business) {
                console.warn(`Business not found: ${businessId}`);
                return;
            }
            const doc = business.kyc_docs.find((d) => d.id === docId);
            if (!doc) {
                console.warn(`Document not found: ${docId}`);
                return;
            }
            doc.approval_status = status;
        },
        clearError: (state) => {
            state.error = null;
        },
        setActionLoading: (state, action) => {
            const { businessId, loading } = action.payload;
            if (loading) {
                state.actionLoading[businessId] = true;
            } else {
                delete state.actionLoading[businessId];
            }
        },
        clearActionLoading: (state) => {
            state.actionLoading = {};
        },
        setRefreshing: (state, action) => {
            state.refreshing = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Businesses - Use initialLoading/refreshing based on whether businesses exist
            .addCase(fetchBusinesses.pending, (state) => {
                if (state.businesses.length === 0) {
                    state.initialLoading = true;
                } else {
                    state.refreshing = true;
                }
                state.error = null;
            })
            .addCase(fetchBusinesses.fulfilled, (state, { payload }) => {
                state.initialLoading = false;
                state.refreshing = false;
                state.businesses = payload;
            })
            .addCase(fetchBusinesses.rejected, (state, { payload }) => {
                state.initialLoading = false;
                state.refreshing = false;
                state.error = payload || "An error occurred while fetching businesses.";
            })

            .addCase(updateBusinessStatus.fulfilled, (state, { payload }) => {
                const { business_id, status } = payload;
                const biz = state.businesses.find((b) => b.business_id === business_id);
                if (biz) biz.status = status;
            })

            .addCase(updateKYCStatus.fulfilled, (state, { payload }) => {
                const updatedDoc = payload;
                const biz = state.businesses.find((b) =>
                    b.kyc_docs.some((doc) => doc.doc_id === updatedDoc.doc_id)
                );
                if (biz) {
                    const idx = biz.kyc_docs.findIndex((doc) => doc.doc_id === updatedDoc.doc_id);
                    if (idx !== -1) biz.kyc_docs[idx] = updatedDoc;
                }
            })

            .addCase(submitBusinessReview.fulfilled, (state, { payload }) => {
                const { business_id, verification_status } = payload;
                const biz = state.businesses.find((b) => b.business_id === business_id);
                if (biz) {
                    biz.verification_status = verification_status;
                    // Update status based on verification
                    biz.status = verification_status === 'verified' ? 'active' : 'suspended';
                }
            })

            .addCase(sendBackForCorrection.fulfilled, (state, { payload }) => {
                const { business_id } = payload;
                const biz = state.businesses.find((b) => b.business_id === business_id);
                if (biz) {
                    biz.verification_status = 'sent_for_corrections';
                    biz.kyc_status = 'sent_for_corrections';
                }
            })
            .addMatcher((action) => action.type.endsWith("/rejected"), (state, { payload }) => {
                // Ensure error is always a string
                if (typeof payload === 'string') {
                    state.error = payload;
                } else if (payload?.message) {
                    state.error = payload.message;
                } else if (typeof payload === 'object') {
                    state.error = JSON.stringify(payload);
                } else {
                    state.error = "An error occurred";
                }
            });
    },
});

export const { updateDocumentStatusInStore, clearError, setActionLoading, clearActionLoading, setRefreshing } = businessSlice.actions;

// Selectors
export const selectBusinesses = (state) => state.businesses.businesses;
export const selectBusinessLoading = (state) => state.businesses.initialLoading;
export const selectBusinessRefreshing = (state) => state.businesses.refreshing;
export const selectBusinessError = (state) => state.businesses.error;

// Helper function to check if a business is declared
export const isBusinessDeclared = (business) => {
    return business?.declared_by && business?.declared_on;
};

// Helper function to check if suspend/activate actions should be shown
export const canShowStatusActions = (business) => {
    const isDeclared = isBusinessDeclared(business);
    const isVerified = business?.verification_status === 'verified';
    
    if (isDeclared) {
        // For declared businesses, only show suspend/activate if verified
        return isVerified;
    } else {
        // For non-declared businesses, show suspend/activate only if not pending
        return business?.verification_status !== 'pending';
    }
};

// Helper function to check if verification actions should be shown in modal
export const canShowVerificationActions = (business) => {
    const isDeclared = isBusinessDeclared(business);
    const isVerified = business?.verification_status === 'verified';
    
    if (isDeclared) {
        // For declared businesses, only show verification if not yet verified
        return !isVerified;
    } else {
        // For non-declared businesses, always show verification options
        return true;
    }
};

export default businessSlice.reducer;
