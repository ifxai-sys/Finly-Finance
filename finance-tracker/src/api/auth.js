import { AUTH_API_BASE_URL } from "../config/apiConfig";
import { apiRequest } from "./client";

export async function signupRequest({ name, email, password }) {
  // No token yet — signup now just triggers an OTP email.
  return apiRequest(`${AUTH_API_BASE_URL}/signup`, {
    method: "POST",
    auth: false,
    body: { name, email, password },
  }); // { message, email }
}

export async function verifySignupOtpRequest({ email, code }) {
  const data = await apiRequest(`${AUTH_API_BASE_URL}/verify-signup-otp`, {
    method: "POST",
    auth: false,
    body: { email, code },
  });
  return data; // { access_token, token_type, user }
}

export async function resendOtpRequest({ email }) {
  return apiRequest(`${AUTH_API_BASE_URL}/resend-otp`, {
    method: "POST",
    auth: false,
    body: { email },
  }); // { message, email }
}

export async function loginRequest({ email, password }) {
  const data = await apiRequest(`${AUTH_API_BASE_URL}/login`, {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  return data; // { access_token, token_type, user }
}

export async function forgotPasswordRequest({ email }) {
  return apiRequest(`${AUTH_API_BASE_URL}/forgot-password`, {
    method: "POST",
    auth: false,
    body: { email },
  }); // { message, email }
}

export async function resetPasswordRequest({ email, code, newPassword }) {
  return apiRequest(`${AUTH_API_BASE_URL}/reset-password`, {
    method: "POST",
    auth: false,
    body: { email, code, new_password: newPassword },
  }); // { message, email }
}

export async function fetchCurrentUser() {
  return apiRequest(`${AUTH_API_BASE_URL}/me`);
}

export async function updateProfileRequest(changes) {
  return apiRequest(`${AUTH_API_BASE_URL}/me`, { method: "PATCH", body: changes });
}
