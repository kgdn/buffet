import axios from 'axios';

axios.defaults.withCredentials = true;

export default class VirtualMachineAPI {
    // Get all virtual machines from the database
    static async getAllImages() {
        try {
            const response = await axios.get('http://localhost:5000/api/vm/iso/', {
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
            const response = await axios.post('http://localhost:5000/api/vm/create/', {
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
            const response = await axios.delete('http://localhost:5000/api/vm/delete/', {
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
            const response = await axios.get('http://localhost:5000/api/vm/user/', {
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
}