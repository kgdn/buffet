import axios from 'axios';

export default class AccountsAPI {
    static async login(username, password) {
        try {
            const response = await axios.post('http://localhost:5000/api/user/login/', {
                username: username,
                password: password
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async register(username, email, password) {
        try {
            const response = await axios.post('http://localhost:5000/api/user/register/', {
                username: username,
                email: email,
                password: password
            });
            return { status: response.status, message: response.data.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }


    static async verifyRegistration(id) {
        try {
            const response = await axios.get('http://localhost:5000/api/user/verify/' + id);
            return { status: response.status, message: response.data.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async logout() {
        try {
            const response = await axios.post('http://localhost:5000/api/user/logout/', {
                withCredentials: true,
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async deleteAccount(password) {
        try {
            const response = await axios.delete('http://localhost:5000/api/user/delete/', {
                data: {
                    password: password
                },
                withCredentials: true,
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    static async isAuthenticated() {
        try {
            const response = await axios.get('http://localhost:5000/api/user/verify/', {
                withCredentials: true,
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Get the details of the currently logged in user
    static async getUserDetails() {
        // Authenticate against http://localhost:5000/api/user/ which responds with the username
        try {
            const response = await axios.get('http://localhost:5000/api/user/', {
                withCredentials: true,
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
            const response = await axios.put('http://localhost:5000/api/user/username/', {
                username: username,
                password: password
            }, {
                withCredentials: true,
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // User must supply their old password to change their password, as well as their new password and authentication token
    static async changePassword(current_password, new_password) {
        try {
            const response = await axios.put('http://localhost:5000/api/user/password/', {
                current_password: current_password,
                new_password: new_password
            }, {
                withCredentials: true,
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // User must supply their password to change their email
    static async changeEmail(email, password) {
        try {
            const response = await axios.put('http://localhost:5000/api/user/email/', {
                email: email,
                password: password
            }, {
                withCredentials: true,
            });
            return { status: response.status, message: response.message }
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }
}