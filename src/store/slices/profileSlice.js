import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

// Async thunks
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });

      const response = await API.post('/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success === false) {
        return rejectWithValue(response.data.message || "Failed to update profile");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'profile/updatePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await API.post('/profile/update-password', passwordData);
      if (response.data.success === false) {
        return rejectWithValue(response.data.message || "Failed to update password");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update password');
    }
  }
);

export const updateProfilePicture = createAsyncThunk(
  'profile/updateProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('profile_pic', file);

      const response = await API.post('/profile/update-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success === false) {
        return rejectWithValue(response.data.message || "Failed to update profile picture");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile picture');
    }
  }
);

export const removeProfilePicture = createAsyncThunk(
  'profile/removeProfilePicture',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.delete('/profile/remove-picture');
      if (response.data.success === false) {
        return rejectWithValue(response.data.message || "Failed to remove profile picture");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove profile picture');
    }
  }
);

export const sendMobileOtp = createAsyncThunk(
  'profile/sendMobileOtp',
  async (mobileData, { rejectWithValue }) => {
    try {
      const response = await API.post('/profile/send-mobile-otp', mobileData);
      if (response.data.success === false) {
        return rejectWithValue(response.data.message || "Failed to send OTP");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyMobileOtp = createAsyncThunk(
  'profile/verifyMobileOtp',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await API.post('/profile/verify-mobile-otp', otpData);
      if (response.data.success === false) {
        return rejectWithValue(response.data.message || "Failed to verify OTP");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP');
    }
  }
);

export const resendMobileOtp = createAsyncThunk(
  'profile/resendMobileOtp',
  async (mobileData, { rejectWithValue }) => {
    try {
      const response = await API.post('/profile/resend-mobile-otp', mobileData);
      if (response.data.success === false) {
        return rejectWithValue(response.data.message || "Failed to resend OTP");
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resend OTP');
    }
  }
);

// Initial state
const initialState = {
  profile: null,
  loading: false,
  updating: false,
  updatingPassword: false,
  updatingPicture: false,
  sendingOtp: false,
  verifyingOtp: false,
  resendingOtp: false,
  error: null,
  updateError: null,
  passwordError: null,
  pictureError: null,
  mobileOtpError: null,
  updateSuccess: false,
  passwordUpdateSuccess: false,
  pictureUpdateSuccess: false,
  pictureRemoveSuccess: false,
  otpSentSuccess: false,
  mobileVerifiedSuccess: false,
};

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.updateError = null;
      state.passwordError = null;
      state.pictureError = null;
      state.mobileOtpError = null;
    },
    clearSuccessStates: (state) => {
      state.updateSuccess = false;
      state.passwordUpdateSuccess = false;
      state.pictureUpdateSuccess = false;
      state.pictureRemoveSuccess = false;
      state.otpSentSuccess = false;
      state.mobileVerifiedSuccess = false;
    },
    resetProfileState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.profile = action.payload.data;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload.success) {
          state.profile = action.payload.data;
          state.updateSuccess = true;
        } else {
          state.updateError = action.payload.message;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      })

      // Update password
      .addCase(updatePassword.pending, (state) => {
        state.updatingPassword = true;
        state.passwordError = null;
        state.passwordUpdateSuccess = false;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.updatingPassword = false;
        state.passwordUpdateSuccess = true;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.updatingPassword = false;
        state.passwordError = action.payload;
      })

      // Update profile picture
      .addCase(updateProfilePicture.pending, (state) => {
        state.updatingPicture = true;
        state.pictureError = null;
        state.pictureUpdateSuccess = false;
      })
      .addCase(updateProfilePicture.fulfilled, (state, action) => {
        state.updatingPicture = false;
        if (action.payload.success) {
          state.profile = { ...state.profile, profile_pic: action.payload.data.profile_pic };
          state.pictureUpdateSuccess = true;
        } else {
          state.pictureError = action.payload.message;
        }
      })
      .addCase(updateProfilePicture.rejected, (state, action) => {
        state.updatingPicture = false;
        state.pictureError = action.payload;
      })

      // Remove profile picture
      .addCase(removeProfilePicture.pending, (state) => {
        state.updatingPicture = true;
        state.pictureError = null;
        state.pictureRemoveSuccess = false;
      })
      .addCase(removeProfilePicture.fulfilled, (state, action) => {
        state.updatingPicture = false;
        if (action.payload.success) {
          state.profile = { ...state.profile, profile_pic: null };
          state.pictureRemoveSuccess = true;
        } else {
          state.pictureError = action.payload.message;
        }
      })
      .addCase(removeProfilePicture.rejected, (state, action) => {
        state.updatingPicture = false;
        state.pictureError = action.payload;
      })

      // Send mobile OTP
      .addCase(sendMobileOtp.pending, (state) => {
        state.sendingOtp = true;
        state.mobileOtpError = null;
        state.otpSentSuccess = false;
      })
      .addCase(sendMobileOtp.fulfilled, (state, action) => {
        state.sendingOtp = false;
        if (action.payload.success) {
          state.otpSentSuccess = true;
        } else {
          state.mobileOtpError = action.payload.message;
        }
      })
      .addCase(sendMobileOtp.rejected, (state, action) => {
        state.sendingOtp = false;
        state.mobileOtpError = action.payload;
      })

      // Verify mobile OTP
      .addCase(verifyMobileOtp.pending, (state) => {
        state.verifyingOtp = true;
        state.mobileOtpError = null;
        state.mobileVerifiedSuccess = false;
      })
      .addCase(verifyMobileOtp.fulfilled, (state, action) => {
        state.verifyingOtp = false;
        if (action.payload.success) {
          state.profile = { 
            ...state.profile, 
            mobile_country_code: action.payload.data.mobile_country_code,
            mobile_number: action.payload.data.mobile_number 
          };
          state.mobileVerifiedSuccess = true;
        } else {
          state.mobileOtpError = action.payload.message;
        }
      })
      .addCase(verifyMobileOtp.rejected, (state, action) => {
        state.verifyingOtp = false;
        state.mobileOtpError = action.payload;
      })

      // Resend mobile OTP
      .addCase(resendMobileOtp.pending, (state) => {
        state.resendingOtp = true;
        state.mobileOtpError = null;
      })
      .addCase(resendMobileOtp.fulfilled, (state, action) => {
        state.resendingOtp = false;
        if (action.payload.success) {
          state.otpSentSuccess = true;
        } else {
          state.mobileOtpError = action.payload.message;
        }
      })
      .addCase(resendMobileOtp.rejected, (state, action) => {
        state.resendingOtp = false;
        state.mobileOtpError = action.payload;
      });
  },
});

export const { clearErrors, clearSuccessStates, resetProfileState } = profileSlice.actions;

export default profileSlice.reducer;
