/*
* VirtualMachineAPI.js - API functions for virtual machines.
* Copyright (C) 2024, Kieran Gordon
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
* 
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies(null, { path: '/' });

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-CSRF-TOKEN'] = cookies.get('csrf_access_token');

const API_BASE_URL = process.env.REACT_APP_BASE_URL;
const API_BASE_PORT = process.env.REACT_APP_BASE_PORT;

export default class VirtualMachineAPI {
    // Get all virtual machines from the database
    static async getIsoFiles() {
        try {
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/vm/iso/`, {
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
            const response = await axios.post(`${API_BASE_URL}:${API_BASE_PORT}/api/vm/create/`, {
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
            const response = await axios.delete(`${API_BASE_URL}:${API_BASE_PORT}/api/vm/delete/`, {
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
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/vm/user/`, {
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
            const response = await axios.get(`${API_BASE_URL}:${API_BASE_PORT}/api/vm/count/`);
            return { status: response.status, message: response.message, data: response.data };
        }
        catch (error) {
            return { status: error.response.status, message: error.response.data.message };
        }
    }
}