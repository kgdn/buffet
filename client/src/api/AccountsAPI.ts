/*
 * AccountsAPI.ts - API functions for user accounts.
 * Copyright (C) 2024, Kieran Gordon
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import axios, { AxiosResponse } from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

/**
 * Log in to the application
 * @param {string} username - The username of the user
 * @param {string} password - The password of the user
 * @param {string} code - The two-factor authentication code
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function logIn(
  username: string,
  password: string,
  code: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/user/login/`,
      {
        username,
        password,
        code,
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Register a new user
 * @param {string} username - The username of the user
 * @param {string} email - The email address of the user
 * @param {string} password - The password of the user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function register(
  username: string,
  email: string,
  password: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/user/register/`,
      {
        username,
        email,
        password,
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Resend the verification email
 * @param {string} username - The username of the user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function resendVerificationEmail(
  username: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/user/verify/resend/`,
      {
        username,
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Verify the registration of a new user
 * @param {string} username - The username of the user
 * @param {string} unique_code - The unique code sent to the user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function verifyRegistration(
  username: string,
  unique_code: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/user/verify/`,
      {
        username,
        unique_code,
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Log out of the application
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function logOut(): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/user/logout/`,
      {},
      {
        withCredentials: true,
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Delete the user's account
 * @param {string} password - The password of the user
 * @param {string} code - The two-factor authentication code
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function deleteAccount(
  password: string,
  code: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.delete(
      `${API_BASE_URL}/api/user/delete/`,
      {
        data: { password, code },
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": cookies.get("csrf_access_token"),
        },
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Get the details of the currently logged in user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getUserDetails(): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.get(
      `${API_BASE_URL}/api/user/`,
      {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": cookies.get("csrf_access_token"),
        },
      }
    );
    return {
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Change the username of the currently logged in user
 * @param {string} username - The new username
 * @param {string} password - The password of the user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function changeUsername(
  username: string,
  password: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.put(
      `${API_BASE_URL}/api/user/username/`,
      {
        username,
        password,
      },
      {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": cookies.get("csrf_access_token"),
        },
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Change the password of the currently logged in user
 * @param {string} current_password - The current password of the user
 * @param {string} new_password - The new password of the user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function changePassword(
  current_password: string,
  new_password: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.put(
      `${API_BASE_URL}/api/user/password/`,
      {
        current_password,
        new_password,
      },
      {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": cookies.get("csrf_access_token"),
        },
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Change the email address of the currently logged in user
 * @param {string} email - The new email address
 * @param {string} password - The password of the user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function changeEmail(
  email: string,
  password: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.put(
      `${API_BASE_URL}/api/user/email/`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": cookies.get("csrf_access_token"),
        },
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Enable two-factor authentication for the currently logged in user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function enableTwoFactorAuth(): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/user/2fa/`,
      {},
      {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": cookies.get("csrf_access_token"),
        },
      }
    );
    return {
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Verify the two-factor authentication code
 * @param {string} token - The two-factor authentication code
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function verifyTwoFactorAuth(token: string): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/user/2fa/verify/`,
      {
        token,
      },
      {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": cookies.get("csrf_access_token"),
        },
      }
    );
    return {
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Disable two-factor authentication for the currently logged in user
 * @param {string} password - The password of the user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function disableTwoFactorAuth(
  password: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/user/2fa/disable/`,
      {
        password,
      },
      {
        withCredentials: true,
        headers: {
          "X-CSRF-TOKEN": cookies.get("csrf_access_token"),
        },
      }
    );
    return { status: response.status, message: response.data.message };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}
