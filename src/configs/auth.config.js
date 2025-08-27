export const JWT_HOST_API = "https://jwt-api-node.vercel.app";
export const FILE_HOST_LOCAL = "http://localhost:8105/storage/kyc_docs";
export const FILE_HOST_PRODUCTION = "https://wekaoda.little.africa/storage/kyc_docs";
export const FILE_URL = window.location.hostname === 'localhost' ? FILE_HOST_LOCAL : FILE_HOST_PRODUCTION;