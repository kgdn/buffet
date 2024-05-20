/*
* AdminAPI.ts - API functions for the admin panel.
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

import axios, { AxiosResponse } from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-CSRF-TOKEN'] = cookies.get('csrf_access_token');

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface ApiResponse<T = any> {
    status: number;
    message: string;
    data?: T;
}

/**
 * Get a list of all virtual machines
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getAllVMs(): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.get(`${API_BASE_URL}/api/admin/vm/all/`);
        return { status: response.status, message: response.data.message, data: response.data };
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            return { status: error.response?.status ?? 500, message: error.response?.data?.message ?? 'An error occurred' };
        }
        return { status: 500, message: 'An unknown error occurred' };
    }
}

/**
 * Get a list of all users
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getAllUsers(): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.get(`${API_BASE_URL}/api/admin/user/all/`);
        return { status: response.status, message: response.data.message, data: response.data };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Get a list of all virtual machines owned by a user
 * @param {string} id - The user ID
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getAllVMsByUser(id: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.get(`${API_BASE_URL}/api/admin/user/vm/`, {
            params: {
                user_id: id
            }
        });
        return { status: response.status, message: response.data.message, data: response.data };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Get a list of all users who are admins
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function deleteUser(id: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.delete(`${API_BASE_URL}/api/admin/user/delete/`, {
            data: {
                user_id: id
            }
        });
        return { status: response.status, message: response.data.message };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Create a new virtual machine
 * @param {string} iso - The ISO file to use
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function deleteVM(id: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.delete(`${API_BASE_URL}/api/admin/vm/delete/`, {
            data: {
                vm_id: id
            }
        });
        return { status: response.status, message: response.data.message };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Change the username of a user
 * @param {string} user_id - The user ID
 * @param {string} username - The new username
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function changeUsername(user_id: string, username: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.put(`${API_BASE_URL}/api/admin/user/username/`, {
            user_id,
            username
        });
        return { status: response.status, message: response.data.message };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Change the email of a user
 * @param {string} user_id - The user ID
 * @param {string} email - The new email
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function changeEmail(user_id: string, email: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.put(`${API_BASE_URL}/api/admin/user/email/`, {
            user_id,
            email
        });
        return { status: response.status, message: response.data.message };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Change the role of a user
 * @param {string} user_id - The user ID
 * @param {string} role - The new role
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function banUser(user_id: string, reason: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.put(`${API_BASE_URL}/api/admin/user/ban/`, {
            user_id,
            ban_reason: reason
        });
        return { status: response.status, message: response.data.message };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Unban a user
 * @param {string} user_id - The user ID
 * @returns {Promise<ApiResponse>} - The response from the server
 * */
export async function unbanUser(user_id: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.put(`${API_BASE_URL}/api/admin/user/unban/`, {
            user_id
        });
        return { status: response.status, message: response.data.message };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Get a list of all banned users
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getBannedUsers(): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.get(`${API_BASE_URL}/api/admin/user/banned/`);
        return { status: response.status, message: response.data.message, data: response.data };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Get a list of all unverified users
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getUnverifiedUsers(): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.get(`${API_BASE_URL}/api/admin/user/unverified/`);
        return { status: response.status, message: response.data.message, data: response.data };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Delete an unverified user
 * @param {string} user_id - The user ID
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function deleteUnverifiedUser(user_id: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.delete(`${API_BASE_URL}/api/admin/user/unverified/delete/`, {
            data: { user_id }
        });
        return { status: response.status, message: response.data.message };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Verify an unverified user
 * @param {string} user_id - The user ID
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function verifyUser(user_id: string): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.put(`${API_BASE_URL}/api/admin/user/unverified/verify/`, {
            user_id
        });
        return { status: response.status, message: response.data.message };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}

/**
 * Get a list of all logs
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getLogs(): Promise<ApiResponse> {
    try {
        const response: AxiosResponse = await axios.get(`${API_BASE_URL}/api/admin/logs/`);
        return { status: response.status, message: response.data.message, data: response.data };
    } catch (error: any) {
        return { status: error.response.status, message: error.response.data.message };
    }
}
