import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-CSRF-TOKEN'] = cookies.get('csrf_access_token');

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

export default class AdminAPI {
    static async getAllVMs() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/vm/all/`);
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async getAllUsers() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/user/all/`);
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async getAllVMsByUser(id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/user/vm/`, {
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

    static async deleteUser(id) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/admin/user/delete/`, {
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

    static async deleteVM(id) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/admin/vm/delete/`, {
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

    static async changeUsername(user_id, username) {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/admin/user/username/`, {
                user_id: user_id,
                username: username
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async changeEmail(user_id, email) {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/admin/user/email/`, {
                user_id: user_id,
                email: email
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async changePassword(user_id, password) {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/admin/user/password/`, {
                user_id: user_id,
                password: password
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async banUser(user_id, reason) {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/admin/user/ban/`, {
                user_id: user_id,
                ban_reason: reason
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async unbanUser(user_id) {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/admin/user/unban/`, {
                user_id: user_id
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async getBannedUsers() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/user/banned/`);
            return { status: response.status, message: response.message, data: response.data }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async changeBanReason(user_id, reason) {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/admin/user/ban/reason/`, {
                user_id: user_id,
                ban_reason: reason
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async getUnverifiedUsers() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/user/unverified/`);
            return { status: response.status, message: response.message, data: response.data }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async deleteUnverifiedUser(user_id) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/admin/user/unverified/delete/`, {
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

    static async verifyUser(user_id) {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/admin/user/unverified/verify/`, {
                user_id: user_id
            });
            return { status: response.status, message: response.message }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message }
        }
    }

    static async getLogs() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/logs/`);
            return { status: response.status, message: response.message, data: response.data }
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message }
        }
    }
}