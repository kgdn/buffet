import axios from 'axios';

export default class VirtualMachineAPI {
    // Get all virtual machines from the database
    static async getAllImages() {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/vm/iso/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return { status: response.status, statusText: response.statusText, data: response.data };
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error getting virtual machines' };
        }
    }

    // Use iso as a parameter to get a specific virtual machine
    static async createVirtualMachine(iso) {
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/vm/create/', {
                iso: iso
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response;
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error creating virtual machine' };
        }
    }

    // Use id as a parameter to delete a specific virtual machine
    // Scheme: http://127.0.0.1:5000/api/vm/delete/<vm_id>/
    static async deleteVirtualMachine(vm_id) {
        try {
            const response = await axios.delete('http://127.0.0.1:5000/api/vm/delete/' + vm_id + '/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return { status: response.status, statusText: response.statusText };
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error deleting virtual machine' };
        }
    }

    static async getVirtualMachineByUser(user_id) {
        try {
            const response = await axios.get('http://127.0.0.1:5000/api/vm/user/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    user_id: user_id
                }
            });
            return response;
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error getting virtual machine' };
        }
    }
}