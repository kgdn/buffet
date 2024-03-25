import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-CSRF-TOKEN'] = cookies.get('csrf_access_token');

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

export default class VirtualMachineAPI {
    // Get all virtual machines from the database
    static async getIsoFiles() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/vm/iso/`, {
                withCredentials: true,
            });
            return { status: response.status, message: response.message, data: response.data };
        } catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Use iso as a parameter to get a specific virtual machine
    static async createVirtualMachine(iso) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/vm/create/`, {
                iso: iso
            });
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Use vm_id as a parameter to delete a specific virtual machine
    static async deleteVirtualMachine(vm_id) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/vm/delete/`, {
                data: {
                    vm_id: vm_id
                }
            });
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Use user_id as a parameter to get a specific virtual machine
    static async getVirtualMachineByUser(user_id) {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/vm/user/`, {
                params: {
                    user_id: user_id
                }
            });
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }

    // Get number of running virtual machines
    static async getRunningVMs() {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/vm/count/`);
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }
}