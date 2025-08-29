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

const businessSlice = createSlice({
    name: "businesses",
    initialState: {
        businesses: [],
        loading: false,
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
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBusinesses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBusinesses.fulfilled, (state, { payload }) => {
                state.loading = false;
                state.businesses = payload;
            })
            .addCase(fetchBusinesses.rejected, (state, { payload }) => {
                state.loading = false;
                state.error = payload;
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
                const { business_id, status: reviewStatus } = payload;
                const biz = state.businesses.find((b) => b.business_id === business_id);
                if (biz) biz.status = reviewStatus;
            })
            .addMatcher((action) => action.type.endsWith("/rejected"), (state, { payload }) => {
                state.error = payload || "An error occurred";
            });
    },
});

export const { updateDocumentStatusInStore } = businessSlice.actions;
export default businessSlice.reducer;
