import axios from 'axios';

axios.defaults.withCredentials = true;

export default class AdminAPI {
    static async getAllVMs() {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/vm/all/');
            return { status: response.status, statusText: response.statusText, data: response.data };
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error getting virtual machines' };
        }
    }

    static async getAllUsers() {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/user/all/');
            return { status: response.status, statusText: response.statusText, data: response.data };
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error getting users' };
        }
    }

    static async getAllVMsByUser(id) {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/user/vm/', {
                params: {
                    user_id: id
                }
            });
            return { status: response.status, statusText: response.statusText, data: response.data };
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error getting virtual machines' };
        }
    }

    static async deleteUser(id) {
        try {
            const response = await axios.delete('http://localhost:5000/api/admin/user/delete/', {
                data: {
                    user_id: id
                }
            });
            return { status: response.status, statusText: response.statusText }
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error deleting user' };
        }
    }

    static async deleteVM(id) {
        try {
            const response = await axios.delete('http://localhost:5000/api/admin/vm/delete/', {
                data: {
                    vm_id: id
                }
            });
            return { status: response.status, statusText: response.statusText }
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error deleting virtual machine' };
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
            console.error(error);
            return { statusText: 'Error changing username' };
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
            console.error(error);
            return { statusText: 'Error changing email' };
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
            console.error(error);
            return { statusText: 'Error changing password' };
        }
    }
}