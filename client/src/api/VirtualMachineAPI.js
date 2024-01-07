import axios from 'axios';

axios.defaults.withCredentials = true;

export default class VirtualMachineAPI {
    // Get all virtual machines from the database
    static async getAllImages() {
        try {
            const response = await axios.get('http://localhost:5000/api/vm/iso/', {
                withCredentials: true,
            });
            return response;
        } catch (error) {
            console.error(error);
            return { statusText: 'Error getting virtual machines' };
        }
    }

    // Use iso as a parameter to get a specific virtual machine
    static async createVirtualMachine(iso) {
        try {
            const response = await axios.post('http://localhost:5000/api/vm/create/', {
                iso: iso
            });
            return response;
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error creating virtual machine' };
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
            return response;
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error deleting virtual machine' };
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
            return response;
        }
        catch (error) {
            console.error(error);
            return { statusText: 'Error getting virtual machine' };
        }
    }
}