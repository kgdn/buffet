/*
* AccountsAPI.jsx - API functions for user accounts.
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


import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_BASE_PORT = import.meta.env.VITE_BASE_PORT;

export default class AccountsAPI {
    // Log the user in
    static async login(username, password, code) {
        try {
            const response = await axios.post(`${API_BASE_URL}:${API_BASE_PORT}/api/user/login/`, {
                username: username,
                password: password,
                code: code
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Register a new user
    static async register(username, email, password) {
        try {
            const response = await axios.post(`${API_BASE_URL}:${API_BASE_PORT}/api/user/register/`, {
                username: username,
                email: email,
                password: password
            });
            return { status: response.status, message: response.data.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Verify the user's registration by checking the unique code
    static async verifyRegistration(username, unique_code) {
        try {
            const response = await axios.post(`${API_BASE_URL}:${API_BASE_PORT}/api/user/verify/`, {
                username: username,
                unique_code: unique_code
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Log the user out
    static async logout() {
        try {
            const response = await axios.post(`${API_BASE_URL}:${API_BASE_PORT}/api/user/logout/`, {
                withCredentials: true,
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Delete the currently logged in user
    static async deleteAccount(password) {
        try {
            const response = await axios.delete(`${API_BASE_URL}:${API_BASE_PORT}/api/user/delete/`, {
                data: {
                    password: password
                },
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': cookies.get('csrf_access_token')
                }
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Get the details of the currently logged in user
    static async getUserDetails() {
        try {
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/user/`, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': cookies.get('csrf_access_token')
                }
            });
            return { status: response.status, message: response.message, data: response.data }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Allow the user to change their username
    static async changeUsername(username, password) {
        try {
            const response = await axios.put(`${API_BASE_URL}:${API_BASE_PORT}/api/user/username/`, {
                username: username,
                password: password
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': cookies.get('csrf_access_token')
                }
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // User must supply their old password to change their password, as well as their new password and authentication token
    static async changePassword(current_password, new_password) {
        try {
            const response = await axios.put(`${API_BASE_URL}:${API_BASE_PORT}/api/user/password/`, {
                current_password: current_password,
                new_password: new_password
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': cookies.get('csrf_access_token')
                }
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // User must supply their password to change their email
    static async changeEmail(email, password) {
        try {
            const response = await axios.put(`${API_BASE_URL}:${API_BASE_PORT}/api/user/email/`, {
                email: email,
                password: password
            }, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': cookies.get('csrf_access_token')
                }
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Allow the user to enable two-factor authentication
    static async enableTwoFactorAuth() {
        try {
            const response = await axios.post(`${API_BASE_URL}:${API_BASE_PORT}/api/user/2fa/`, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': cookies.get('csrf_access_token')
                }
            });
            return { status: response.status, message: response.message, data: response.data }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Verify the user's two-factor authentication code to enable it
    static async verifyTwoFactorAuth(token) {
        try {
            const response = await axios.post(`${API_BASE_URL}:${API_BASE_PORT}/api/user/2fa/verify/`, {
                token: token,
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': cookies.get('csrf_access_token')
                }
            });
            return { status: response.status, message: response.message, data: response.data }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Disable two-factor authentication
    static async disableTwoFactorAuth(password) {
        try {
            const response = await axios.post(`${API_BASE_URL}:${API_BASE_PORT}/api/user/2fa/disable/`, {
                password: password,
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': cookies.get('csrf_access_token')
                }
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }
}