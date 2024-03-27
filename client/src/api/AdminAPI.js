/*
* AdminAPI.js - API functions for the admin panel.
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

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-CSRF-TOKEN'] = cookies.get('csrf_access_token');

const API_BASE_URL = process.env.REACT_APP_BASE_URL;
const API_BASE_PORT = process.env.REACT_APP_BASE_PORT;

export default class AdminAPI {
    // Get all currently running VMs
    static async getAllVMs() {
        try {
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/vm/all/`);
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Get all users
    static async getAllUsers() {
        try {
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/all/`);
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Get all VMs by user
    static async getAllVMsByUser(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/vm/`, {
                params: {
                    user_id: id
                }
            });
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Delete user by ID
    static async deleteUser(id) {
        try {
            const response = await axios.delete(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/delete/`, {
                data: {
                    user_id: id
                }
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Delete VM by ID
    static async deleteVM(id) {
        try {
            const response = await axios.delete(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/vm/delete/`, {
                data: {
                    vm_id: id
                }
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Change a user's username
    static async changeUsername(user_id, username) {
        try {
            const response = await axios.put(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/username/`, {
                user_id: user_id,
                username: username
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Change a user's email
    static async changeEmail(user_id, email) {
        try {
            const response = await axios.put(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/email/`, {
                user_id: user_id,
                email: email
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Ban a user for a specific reason
    static async banUser(user_id, reason) {
        try {
            const response = await axios.put(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/ban/`, {
                user_id: user_id,
                ban_reason: reason
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Unban a user
    static async unbanUser(user_id) {
        try {
            const response = await axios.put(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/unban/`, {
                user_id: user_id
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Get all banned users
    static async getBannedUsers() {
        try {
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/banned/`);
            return { status: response.status, message: response.message, data: response.data }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Get all unverified users
    static async getUnverifiedUsers() {
        try {
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/unverified/`);
            return { status: response.status, message: response.message, data: response.data }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Delete an unverified user
    static async deleteUnverifiedUser(user_id) {
        try {
            const response = await axios.delete(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/unverified/delete/`, {
                data: {
                    user_id: user_id
                }
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Verify an unverified user
    static async verifyUser(user_id) {
        try {
            const response = await axios.put(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/user/unverified/verify/`, {
                user_id: user_id
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message }
        }
    }

    // Get all logs
    static async getLogs() {
        try {
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/admin/logs/`);
            return { status: response.status, message: response.message, data: response.data }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message }
        }
    }
}