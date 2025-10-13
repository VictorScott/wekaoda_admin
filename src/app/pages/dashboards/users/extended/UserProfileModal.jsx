import {
    Dialog,
    DialogPanel,
    DialogTitle,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { 
    EnvelopeIcon, 
    UserIcon, 
    BriefcaseIcon,
    CalendarIcon,
    PhoneIcon,
    IdentificationIcon,
    ShieldCheckIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import { Fragment, useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import {Button, Badge, Avatar, Spinner} from "components/ui";
import { PreviewImg } from "components/shared/PreviewImg";
import { fetchUserProfile } from "store/slices/usersSlice";
import { PROFILE_URL } from "configs/auth.config";
import dayjs from "dayjs";

export default function UserProfileModal({ open, onClose, userId }) {
    const dispatch = useDispatch();
    const closeButtonRef = useRef(null);
    
    const [loading, setLoading] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [error, setError] = useState("");

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const result = await dispatch(fetchUserProfile({
                userId
            })).unwrap();
            
            if (result.success) {
                setUserProfile(result.data);
            } else {
                setError(result.message || "Failed to fetch user profile");
            }
        } catch (err) {
            setError(err.message || "Failed to fetch user profile");
        } finally {
            setLoading(false);
        }
    }, [dispatch, userId]);

    useEffect(() => {
        if (open && userId) {
            fetchProfile();
        }
    }, [open, userId, fetchProfile]);

    const handleClose = () => {
        setUserProfile(null);
        setError("");
        onClose();
    };

    const getProfilePictureUrl = (profile) => {
        if (profile?.profile_pic) {
            return `${PROFILE_URL}/${profile.profile_pic}`;
        }
        return undefined;
    };

    const getInitials = (profile) => {
        if (!profile?.name) return '?';
        const nameParts = profile.name.split(' ').filter(Boolean);
        if (nameParts.length >= 2) {
            return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
        }
        return nameParts[0]?.charAt(0).toUpperCase() || '?';
    };

    const getAvatarColor = (profile) => {
        return !profile?.profile_pic && profile?.avatar_color
            ? profile.avatar_color
            : undefined;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not available";
        return dayjs(dateString).format("MMM DD, YYYY [at] h:mm A");
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            active: { label: "Active", color: "success" },
            suspended: { label: "Suspended", color: "error" },
        };
        
        const config = statusConfig[status] || { label: status || "Unknown", color: "neutral" };
        
        return (
            <Badge color={config.color} size="sm">
                {config.label}
            </Badge>
        );
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                as="div"
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden px-4 py-6 sm:px-5"
                onClose={handleClose}
                initialFocus={closeButtonRef}
            >
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur transition-opacity dark:bg-black/30" />
                </TransitionChild>

                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <DialogPanel className="relative flex w-full max-w-4xl origin-top flex-col overflow-hidden rounded-lg bg-white transition-all duration-300 dark:bg-dark-700">
                        <div className="flex items-center justify-between rounded-t-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <DialogTitle className="text-base font-medium text-gray-800 dark:text-dark-100">
                                User Profile
                            </DialogTitle>
                            <Button
                                onClick={handleClose}
                                variant="flat"
                                isIcon
                                className="size-7 rounded-full ltr:-mr-1.5 rtl:-ml-1.5"
                                ref={closeButtonRef}
                            >
                                <XMarkIcon className="size-4.5" />
                            </Button>
                        </div>

                        <div className="flex flex-col overflow-y-auto px-4 py-4 sm:px-5">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Spinner color="primary" />
                                    <span className="ml-3 text-gray-600 dark:text-dark-300">Loading profile...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <div className="text-error dark:text-error-light mb-4">{error}</div>
                                    <Button onClick={fetchProfile} size="sm">
                                        Try Again
                                    </Button>
                                </div>
                            ) : userProfile ? (
                                        <div className="space-y-8">
                                            {/* Profile Header */}
                                            <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl p-6">
                                                <div className="flex items-start space-x-6">
                                                    <div className="flex-shrink-0">
                                                        <Avatar
                                                            size={20}
                                                            imgComponent={PreviewImg}
                                                            src={getProfilePictureUrl(userProfile)}
                                                            name={userProfile.name}
                                                            initialColor={getAvatarColor(userProfile)}
                                                            alt={userProfile.name}
                                                            classNames={{
                                                                root: "size-20 rounded-full border-4 border-white dark:border-dark-700 shadow-lg",
                                                                img: "rounded-full object-cover"
                                                            }}
                                                        >
                                                            {!userProfile.profile_pic && getInitials(userProfile)}
                                                        </Avatar>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                                                                    {userProfile.name}
                                                                </h2>
                                                                <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                                    <EnvelopeIcon className="size-5 mr-2" />
                                                                    <span>{userProfile.email}</span>
                                                                </div>
                                                                {userProfile.designation && (
                                                                    <div className="flex items-center mt-2 text-gray-600 dark:text-dark-300">
                                                                        <BriefcaseIcon className="size-5 mr-2" />
                                                                        <span>{userProfile.designation}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end space-y-2">
                                                                {getStatusBadge(userProfile.status)}
                                                                {userProfile.is_2fa_enabled && (
                                                                    <Badge color="primary" size="sm">
                                                                        <ShieldCheckIcon className="size-4 mr-1" />
                                                                        2FA Enabled
                                                                    </Badge>
                                                                )}
                                                                {userProfile.is_logged_in && (
                                                                    <Badge color="success" size="sm">
                                                                        <div className="size-2 bg-success rounded-full mr-2 animate-pulse"></div>
                                                                        Online
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                {/* Contact Information */}
                                                <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                                    <div className="flex items-center mb-6">
                                                        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg mr-3">
                                                            <PhoneIcon className="size-6 text-primary-600 dark:text-primary-400" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                            Contact Information
                                                        </h3>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-start">
                                                            <EnvelopeIcon className="size-5 text-gray-400 mt-0.5 mr-3" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Email Address</p>
                                                                <p className="text-gray-900 dark:text-dark-100">{userProfile.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <PhoneIcon className="size-5 text-gray-400 mt-0.5 mr-3" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Mobile Number</p>
                                                                <p className="text-gray-900 dark:text-dark-100">
                                                                    {userProfile.mobile_country_code && userProfile.mobile_number
                                                                        ? `${userProfile.mobile_country_code} ${userProfile.mobile_number}`
                                                                        : <span className="text-gray-500 dark:text-dark-300 italic">Not provided</span>
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Professional Information */}
                                                <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                                    <div className="flex items-center mb-6">
                                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3">
                                                            <BriefcaseIcon className="size-6 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                            Professional Information
                                                        </h3>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="flex items-start">
                                                            <UserIcon className="size-5 text-gray-400 mt-0.5 mr-3" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Occupation</p>
                                                                <p className="text-gray-900 dark:text-dark-100">
                                                                    {userProfile.occupation || <span className="text-gray-500 dark:text-dark-300 italic">Not specified</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <IdentificationIcon className="size-5 text-gray-400 mt-0.5 mr-3" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Designation</p>
                                                                <p className="text-gray-900 dark:text-dark-100">
                                                                    {userProfile.designation || <span className="text-gray-500 dark:text-dark-300 italic">Not specified</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Account Information */}
                                            <div className="bg-white dark:bg-dark-700 rounded-xl border border-gray-200 dark:border-dark-600 p-6">
                                                <div className="flex items-center mb-6">
                                                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
                                                        <ShieldCheckIcon className="size-6 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                                                        Account Information
                                                    </h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <div className="flex items-start">
                                                        <div className={`size-3 rounded-full mt-2 mr-3 ${userProfile.status === 'active' ? 'bg-success' : 'bg-error'}`} />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Account Status</p>
                                                            <div className="mt-1">{getStatusBadge(userProfile.status)}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <ShieldCheckIcon className="size-5 text-gray-400 mt-0.5 mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Email Verified</p>
                                                            <p className="text-gray-900 dark:text-dark-100">
                                                                {userProfile.email_verified_at ? (
                                                                    <span className="text-success dark:text-success-light">
                                                                        {formatDate(userProfile.email_verified_at)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-warning dark:text-warning-light">Not verified</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <ClockIcon className="size-5 text-gray-400 mt-0.5 mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Last Login</p>
                                                            <p className="text-gray-900 dark:text-dark-100">
                                                                {userProfile.last_login_at ? formatDate(userProfile.last_login_at) : "Never"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <div className={`size-3 rounded-full mt-2 mr-3 ${userProfile.is_logged_in ? 'bg-success animate-pulse' : 'bg-gray-300'}`} />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Currently Online</p>
                                                            <p className="text-gray-900 dark:text-dark-100">
                                                                {userProfile.is_logged_in ? (
                                                                    <span className="text-success dark:text-success-light font-medium">Yes</span>
                                                                ) : (
                                                                    <span className="text-gray-500 dark:text-dark-300">No</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <CalendarIcon className="size-5 text-gray-400 mt-0.5 mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Account Created</p>
                                                            <p className="text-gray-900 dark:text-dark-100">
                                                                {formatDate(userProfile.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start">
                                                        <ShieldCheckIcon className="size-5 text-gray-400 mt-0.5 mr-3" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-dark-200">Two-Factor Auth</p>
                                                            <p className="text-gray-900 dark:text-dark-100">
                                                                {userProfile.is_2fa_enabled ? (
                                                                    <span className="text-success dark:text-success-light font-medium">Enabled</span>
                                                                ) : (
                                                                    <span className="text-warning dark:text-warning-light">Disabled</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                        </div>

                        <div className="space-x-3 flex justify-end rounded-b-lg bg-gray-200 px-4 py-3 dark:bg-dark-800 sm:px-5">
                            <Button
                                onClick={handleClose}
                                variant="outlined"
                                className="min-w-[7rem]"
                            >
                                Close
                            </Button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}

UserProfileModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.number.isRequired,
};
