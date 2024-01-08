import axios from 'axios';

axios.defaults.withCredentials = true;

export default class AdminAPI {
    static async getAllVMs() {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/vm/all/');
            return response;
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error getting virtual machines' };
        }
    }

    static async getAllUsers() {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/user/all/');
            return response;
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error getting users' };
        }
    }
}