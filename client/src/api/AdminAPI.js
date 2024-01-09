import axios from 'axios';

axios.defaults.withCredentials = true;

export default class AdminAPI {
    static async getAllVMs() {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/vm/all/');
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async getAllUsers() {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/user/all/');
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async getAllVMsByUser(id) {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/user/vm/', {
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
            const response = await axios.delete('http://localhost:5000/api/admin/user/delete/', {
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
            const response = await axios.delete('http://localhost:5000/api/admin/vm/delete/', {
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
            const response = await axios.put('http://localhost:5000/api/admin/user/username/', {
                user_id: user_id,
                username: username
            });
            return response;
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async changeEmail(user_id, email) {
        try {
            const response = await axios.put('http://localhost:5000/api/admin/user/email/', {
                user_id: user_id,
                email: email
            });
            return response;
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async changePassword(user_id, password) {
        try {
            const response = await axios.put('http://localhost:5000/api/admin/user/password/', {
                user_id: user_id,
                password: password
            });
            return response;
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async banUser(user_id, reason) {
        try {
            const response = await axios.put('http://localhost:5000/api/admin/user/ban/', {
                user_id: user_id,
                ban_reason: reason
            });
            return response;
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async unbanUser(user_id) {
        try {
            const response = await axios.put('http://localhost:5000/api/admin/user/unban/', {
                user_id: user_id
            });
            return response;
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async getBannedUsers() {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/user/banned/');
            return response;
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }
}