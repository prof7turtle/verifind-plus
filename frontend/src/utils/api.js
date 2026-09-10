/**
 * @file api.js
 * @description Axios HTTP client for Phase 3 REST API queries.
 * @phase Phase 4 (Frontend UI/UX)
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Identity Endpoints
export const fetchIdentities = (params) => apiClient.get("/identity", { params });
export const fetchIdentityByAddress = (address) => apiClient.get(`/identity/${address}`);

// Asset Endpoints
export const fetchAssets = (params) => apiClient.get("/assets", { params });
export const fetchAssetByTokenId = (tokenId) => apiClient.get(`/assets/${tokenId}`);

// Audit Endpoints
export const fetchAuditLogs = (params) => apiClient.get("/audit", { params });
export const fetchAuditByAddress = (address) => apiClient.get(`/audit/${address}`);

// Health Endpoint
export const fetchSystemHealth = () => apiClient.get("/health");
