import { PhoneIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { 
  EnvelopeIcon, 
  UserIcon, 
  BriefcaseIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { HiPencil } from "react-icons/hi";
import { toast } from "sonner";
import { PreviewImg } from "components/shared/PreviewImg";
import { Avatar, Button, Input, Upload, GhostSpinner } from "components/ui";
import { 
  fetchProfile, 
  updateProfile, 
  updatePassword,
  updateProfilePicture,
  removeProfilePicture,
  sendMobileOtp,
  clearErrors,
  clearSuccessStates
} from "store/slices/profileSlice";
import { MobileOtpModal } from "../components/MobileOtpModal";
import { PhoneDialCode } from "components/shared/form/PhoneDialCode";
import { PROFILE_URL } from "configs/auth.config";
import { useAuthContext } from "app/contexts/auth/context";

// Validation schemas
const profileSchema = yup.object().shape({
  name: yup.string().required("Name is required").max(255, "Name is too long"),
  occupation: yup.string().nullable().max(255, "Occupation is too long"),
  designation: yup.string().nullable().max(255, "Designation is too long"),
});

const passwordSchema = yup.object().shape({
  current_password: yup.string().required("Current password is required"),
  new_password: yup.string().required("New password is required").min(8, "Password must be at least 8 characters"),
  new_password_confirmation: yup.string()
    .required("Password confirmation is required")
    .oneOf([yup.ref('new_password')], "Passwords must match"),
});

const mobileSchema = yup.object().shape({
  mobile_country_code: yup.string().required("Country code is required").max(10, "Country code is too long"),
  mobile_number: yup.string().required("Mobile number is required").max(20, "Mobile number is too long"),
});

export default function General() {
  const dispatch = useDispatch();
  const { updateUser } = useAuthContext();
  const { 
    profile, 
    loading, 
    updating, 
    updatingPassword, 
    updatingPicture,
    sendingOtp,
    updateError,
    passwordError,
    pictureError,
    mobileOtpError,
    updateSuccess,
    passwordUpdateSuccess,
    pictureUpdateSuccess,
    pictureRemoveSuccess,
    otpSentSuccess,
    mobileVerifiedSuccess
  } = useSelector((state) => state.profile);

  const [avatar, setAvatar] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [pendingMobileData, setPendingMobileData] = useState(null);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
    setValue: setProfileValue
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: "",
      occupation: "",
      designation: "",
    }
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    }
  });

  // Mobile form
  const {
    register: registerMobile,
    handleSubmit: handleSubmitMobile,
    formState: { errors: mobileErrors },
    reset: resetMobile,
    control: mobileControl
  } = useForm({
    resolver: yupResolver(mobileSchema),
    defaultValues: {
      mobile_country_code: "",
      mobile_number: "",
    }
  });

  // Fetch profile on component mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      setProfileValue("name", profile.name || "");
      setProfileValue("occupation", profile.occupation || "");
      setProfileValue("designation", profile.designation || "");
    }
  }, [profile, setProfileValue]);

  // Handle success states
  useEffect(() => {
    if (updateSuccess && profile) {
      toast.success("Profile updated successfully");
      // Update auth context and local storage
      updateUser({
        name: profile.name,
        email: profile.email,
        mobile_country_code: profile.mobile_country_code,
        mobile_number: profile.mobile_number,
        profile_pic: profile.profile_pic,
        occupation: profile.occupation,
        designation: profile.designation,
        avatar_color: profile.avatar_color,
      });
      dispatch(clearSuccessStates());
    }
    if (passwordUpdateSuccess) {
      toast.success("Password updated successfully");
      resetPassword();
      setShowPasswordForm(false);
      dispatch(clearSuccessStates());
    }
    if (pictureUpdateSuccess && profile) {
      toast.success("Profile picture updated successfully");
      setAvatar(null);
      // Update auth context with new profile picture
      updateUser({
        profile_pic: profile.profile_pic,
      });
      dispatch(clearSuccessStates());
    }
    if (pictureRemoveSuccess) {
      toast.success("Profile picture removed successfully");
      setAvatar(null);
      // Update auth context to remove profile picture
      updateUser({
        profile_pic: null,
      });
      dispatch(clearSuccessStates());
    }
    if (otpSentSuccess && !showOtpModal) {
      setShowOtpModal(true);
      dispatch(clearSuccessStates());
    }
    if (mobileVerifiedSuccess && profile) {
      toast.success("Mobile number verified successfully");
      resetMobile();
      setShowOtpModal(false);
      setShowMobileForm(false);
      setPendingMobileData(null);
      // Update auth context with verified mobile number
      updateUser({
        mobile_country_code: profile.mobile_country_code,
        mobile_number: profile.mobile_number,
      });
      dispatch(clearSuccessStates());
    }
  }, [updateSuccess, passwordUpdateSuccess, pictureUpdateSuccess, pictureRemoveSuccess, otpSentSuccess, mobileVerifiedSuccess, showOtpModal, dispatch, resetPassword, resetMobile, profile, updateUser]);

  // Handle error states
  useEffect(() => {
    if (updateError) {
      toast.error(updateError);
      dispatch(clearErrors());
    }
    if (passwordError) {
      toast.error(passwordError);
      dispatch(clearErrors());
    }
    if (pictureError) {
      toast.error(pictureError);
      dispatch(clearErrors());
    }
    if (mobileOtpError) {
      toast.error(mobileOtpError);
      dispatch(clearErrors());
    }
  }, [updateError, passwordError, pictureError, mobileOtpError, dispatch]);

  const onSubmitProfile = (data) => {
    // Filter out empty values and only send fields that have content
    const formData = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (value !== null && value !== undefined && value !== '') {
        formData[key] = value;
      }
    });
    
    // Add avatar if selected
    if (avatar) {
      formData.profile_pic = avatar;
    }
    
    // Only dispatch if there's data to update
    if (Object.keys(formData).length > 0) {
      dispatch(updateProfile(formData));
    }
  };

  const onSubmitPassword = (data) => {
    dispatch(updatePassword(data));
  };

  const onSubmitMobile = (data) => {
    setPendingMobileData(data);
    dispatch(sendMobileOtp(data));
  };

  const handleAvatarUpload = (file) => {
    setAvatar(file);
    dispatch(updateProfilePicture(file));
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    dispatch(removeProfilePicture());
  };

  const getProfilePictureUrl = () => {
    if (avatar) {
      return URL.createObjectURL(avatar);
    }
    if (profile?.profile_pic) {
      // Use PROFILE_URL from auth.config.js
      return `${PROFILE_URL}/${profile.profile_pic}`;
    }
    return null;
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || "?";
  
  const isHexColor = (color) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

  const avatarColor = !profile?.profile_pic && isHexColor(profile?.avatar_color)
    ? profile.avatar_color
    : undefined;

  const handleOtpModalClose = (success) => {
    setShowOtpModal(false);
    if (!success) {
      setPendingMobileData(null);
    }
  };

  const isMobileVerified = profile?.mobile_number && profile?.mobile_country_code;

  if (loading) {
    return (
      <div className="w-full max-w-3xl 2xl:max-w-5xl">
        <div className="flex items-center justify-center py-12">
          <GhostSpinner className="size-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl 2xl:max-w-5xl">
      <h5 className="text-lg font-medium text-gray-800 dark:text-dark-50">
        General
      </h5>
      <p className="mt-0.5 text-balance text-sm text-gray-500 dark:text-dark-200">
        Update your account settings and profile information.
      </p>
      <div className="my-5 h-px bg-gray-200 dark:bg-dark-500" />
      
      {/* Profile Picture Section */}
      <div className="mt-4 flex flex-col space-y-4">
        <span className="text-base font-medium text-gray-800 dark:text-dark-100 text-center">
          Profile Picture
        </span>
        <div className="flex justify-center">
          <div className="relative">
            <Avatar
              size={20}
              imgComponent={PreviewImg}
              imgProps={{ file: avatar }}
              src={getProfilePictureUrl()}
              name={profile?.name || "User"}
              initialColor={avatarColor}
              alt={profile?.name || "User"}
              classNames={{
                root: "rounded-xl ring-primary-600 ring-offset-[3px] ring-offset-white transition-all hover:ring-3 dark:ring-primary-500 dark:ring-offset-dark-700",
                display: "rounded-xl",
              }}
              indicator={
                <div className="absolute bottom-0 right-0 -m-1 flex items-center justify-center rounded-full bg-white dark:bg-dark-700">
                  {updatingPicture ? (
                    <div className="flex size-6 items-center justify-center rounded-full bg-primary-600 text-white">
                      <GhostSpinner className="size-4" />
                    </div>
                  ) : (avatar || profile?.profile_pic) ? (
                    <Button
                      onClick={handleRemoveAvatar}
                      isIcon
                      className="size-6 rounded-full"
                      color="error"
                      disabled={updatingPicture}
                    >
                      <XMarkIcon className="size-4" />
                    </Button>
                  ) : (
                    <Upload name="avatar" onChange={handleAvatarUpload} accept="image/*">
                      {({ ...props }) => (
                        <Button isIcon className="size-6 rounded-full" {...props} disabled={updatingPicture}>
                          <HiPencil className="size-3.5" />
                        </Button>
                      )}
                    </Upload>
                  )}
                </div>
              }
            >
              {!profile?.profile_pic && !avatar && getInitial(profile?.name || "User")}
            </Avatar>
            
            {/* Loading overlay for the entire avatar */}
            {updatingPicture && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2 text-white">
                  <GhostSpinner className="size-6" />
                  <span className="text-xs font-medium">
                    {avatar ? 'Uploading...' : 'Removing...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 [&_.prefix]:pointer-events-none">
        <Input
            {...registerProfile("name")}
            placeholder="Enter full name"
            label="Full Name"
          className="rounded-xl"
          prefix={<UserIcon className="size-4.5" />}
            error={profileErrors.name?.message}
            required
        />
        <Input
            value={profile?.email || ""}
            placeholder="Email address"
          label="Email"
          className="rounded-xl"
          prefix={<EnvelopeIcon className="size-4.5" />}
            disabled
            readOnly
          />
          <Input
            {...registerProfile("occupation")}
            placeholder="Enter occupation"
            label="Occupation"
            className="rounded-xl"
            prefix={<BriefcaseIcon className="size-4.5" />}
            error={profileErrors.occupation?.message}
        />
        <Input
            {...registerProfile("designation")}
            placeholder="Enter designation"
            label="Designation"
          className="rounded-xl"
            prefix={<BriefcaseIcon className="size-4.5" />}
            error={profileErrors.designation?.message}
        />
      </div>
      <div className="mt-8 flex justify-end space-x-3">
        <Button 
          type="button" 
          className="min-w-[7rem]"
          onClick={() => resetProfile()}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="min-w-[7rem]" 
          color="primary"
          disabled={updating}
        >
          {updating ? <GhostSpinner className="size-4" /> : "Save Changes"}
        </Button>
      </div>
      </form>

      {/* Mobile Number Section */}
      <div className="my-7 h-px bg-gray-200 dark:bg-dark-500" />
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
              Mobile Number
            </h6>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-dark-200">
              {isMobileVerified 
                ? "Your mobile number is verified and secure." 
                : "Add and verify your mobile number for enhanced security."}
            </p>
          </div>
          {!isMobileVerified && (
            <Button
              onClick={() => setShowMobileForm(!showMobileForm)}
              variant="outlined"
              className="min-w-[7rem]"
            >
              {showMobileForm ? "Cancel" : "Add Mobile Number"}
            </Button>
          )}
        </div>

        {isMobileVerified && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PhoneIcon className="size-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    {profile.mobile_country_code} {profile.mobile_number}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Mobile number verified and active
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Verified</span>
              </div>
            </div>
          </div>
        )}

        {showMobileForm && !isMobileVerified && (
          <form onSubmit={handleSubmitMobile(onSubmitMobile)} className="mt-4">
            <div className="flex gap-2">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-50 mb-1.5">
                  Country Code
                </label>
                <Controller
                  name="mobile_country_code"
                  control={mobileControl}
                  render={({ field }) => (
                    <PhoneDialCode
                      value={field.value}
                      onChange={field.onChange}
                      name={field.name}
                      error={!!mobileErrors.mobile_country_code}
                    />
                  )}
                />
                {mobileErrors.mobile_country_code && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {mobileErrors.mobile_country_code.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  {...registerMobile("mobile_number")}
                  placeholder="Enter mobile number"
                  label="Mobile Number"
                  className="rounded-xl ltr:rounded-l-none rtl:rounded-r-none"
                  error={mobileErrors.mobile_number?.message}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                type="button" 
                className="min-w-[7rem]"
                onClick={() => {
                  resetMobile();
                  setShowMobileForm(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="min-w-[7rem]" 
                color="primary"
                disabled={sendingOtp}
              >
                {sendingOtp ? <GhostSpinner className="size-4" /> : "Send OTP"}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Password Section */}
      <div className="my-7 h-px bg-gray-200 dark:bg-dark-500" />
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h6 className="text-base font-medium text-gray-800 dark:text-dark-100">
              Change Password
            </h6>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-dark-200">
              Update your password to keep your account secure.
            </p>
          </div>
          <Button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            variant="outlined"
            className="min-w-[7rem]"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </Button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  {...registerPassword("current_password")}
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  label="Current Password"
                  className="rounded-xl"
                  prefix={<LockClosedIcon className="size-4.5" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="size-4.5" />
                      ) : (
                        <EyeIcon className="size-4.5" />
                      )}
                    </button>
                  }
                  error={passwordErrors.current_password?.message}
                  required
                />
              </div>
              <div className="relative">
                <Input
                  {...registerPassword("new_password")}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  label="New Password"
                  className="rounded-xl"
                  prefix={<LockClosedIcon className="size-4.5" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="size-4.5" />
                      ) : (
                        <EyeIcon className="size-4.5" />
                      )}
                    </button>
                  }
                  error={passwordErrors.new_password?.message}
                  required
                />
              </div>
              <div className="relative">
                <Input
                  {...registerPassword("new_password_confirmation")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  label="Confirm New Password"
                  className="rounded-xl"
                  prefix={<LockClosedIcon className="size-4.5" />}
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="size-4.5" />
                      ) : (
                        <EyeIcon className="size-4.5" />
                      )}
                    </button>
                  }
                  error={passwordErrors.new_password_confirmation?.message}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                className="min-w-[7rem]"
                onClick={() => {
                  resetPassword();
                  setShowPasswordForm(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="min-w-[7rem]"
                color="primary"
                disabled={updatingPassword}
              >
                {updatingPassword ? <GhostSpinner className="size-4" /> : "Update Password"}
        </Button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile OTP Modal */}
      {showOtpModal && pendingMobileData && (
        <MobileOtpModal
          open={showOtpModal}
          onClose={handleOtpModalClose}
          mobileData={pendingMobileData}
        />
      )}
    </div>
  );
}