import axios from 'axios';

export default class AccountsAPI {
    static async login(username, password) {
        try {
            const response = await axios.post('http://localhost:5000/api/user/login/', {
                username: username,
                password: password
            });
            localStorage.setItem('token', response.data.token);
            return { status: response.status, statusText: response.statusText }
        } catch (error) {
            console.error(error);
            return { statusText: 'Error logging in' };
        }
    }

    static async register(username, password) {
        try {
            const response = await axios.post('http://localhost:5000/api/user/register/', {
                username: username,
                password: password
            });
            return { status: response.status, statusText: response.statusText }
        } catch (error) {
            console.error(error);
            return { statusText: 'Error registering' };
        }
    }

    static async logout() {
        // Delete the local storage token
        try {
            localStorage.removeItem('token');
            return { statusText: 'Logged out' };
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error logging out' };
        }
    }

    static async checkLogin() {
        // Authenticate against http://localhost:5000/api/user/ which responds with the username
        // If the response is successful, dispatch the login action
        // If the response is unsuccessful, dispatch the logout action and delete the local storage token
        try {
            const response = await axios.get('http://localhost:5000/api/user/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return { status: response.status, statusText: response.statusText }
        }
        catch (error) {
            console.error(error);
            localStorage.removeItem('token');
            return { statusText: 'Error checking login' };
        }
    }

    static async getUserName() {
        try {
            // send JWT token to http://localhost:5000/api/user/ which responds with the username
            const response = await axios.get('http://localhost:5000/api/user/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // log the response
            console.log(response);
            return response.data.username;
        }
        catch (error) {
            // If error, the user is not logged in
            console.error(error);
            return null;
        }
    }

    static async getUserID() {
        try {
            // send JWT token to http://localhost:5000/api/user/ which responds with the username
            const response = await axios.get('http://localhost:5000/api/user/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // log the response
            console.log(response);
            return response.data.id;
        }
        catch (error) {
            // If error, the user is not logged in
            console.error(error);
            return null;
        }
    }

    static async changeUsername(username) {
        try {
            const response = await axios.put('http://localhost:5000/api/user/username/', {
                username: username
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return { status: response.status, statusText: response.statusText }
        } catch (error) {
            console.error(error);
            return { statusText: 'Error changing username' };
        }
    }

    // User must supply their old password to change their password, as well as their new password and authentication token
    static async changePassword(current_password, new_password) {
        try {
            const response = await axios.put('http://localhost:5000/api/user/password/', {
                current_password: current_password,
                new_password: new_password
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return { status: response.status, statusText: response.statusText }
        } catch (error) {
            console.error(error);
            return { statusText: 'Error changing password' };
        }
    }
}