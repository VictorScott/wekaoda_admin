export const JWT_HOST_API = "https://jwt-api-node.vercel.app";
export const FILE_HOST_LOCAL = "http://localhost:8105/storage/kyc_docs";
export const FILE_HOST_PRODUCTION = "https://wekaoda.little.africa/storage/kyc_docs";
export const PROFILE_HOST_LOCAL = "http://localhost:8105/storage/profile_pics";
export const PROFILE_HOST_PRODUCTION = "https://wekaoda.little.africa/storage/profile_pics";
export const FILE_URL = window.location.hostname === 'localhost' ? FILE_HOST_LOCAL : FILE_HOST_PRODUCTION;
export const PROFILE_URL = window.location.hostname === 'localhost' ? PROFILE_HOST_LOCAL : PROFILE_HOST_PRODUCTION;