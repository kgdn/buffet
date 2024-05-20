/*
 * VirtualMachineAPI.ts - API functions for virtual machines.
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

import axios, { AxiosResponse } from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies(null, { path: "/" });

axios.defaults.withCredentials = true;
axios.defaults.headers.common["X-CSRF-TOKEN"] =
  cookies.get("csrf_access_token");

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}

/**
 * Get a list of available ISO files
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getIsoFiles(): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.get(
      `${API_BASE_URL}/api/vm/iso/`,
      {
        withCredentials: true,
      }
    );
    return {
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Create a new virtual machine
 * @param {string} iso - The ISO file to use
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function createVirtualMachine(iso: string): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.post(
      `${API_BASE_URL}/api/vm/create/`,
      {
        iso,
      }
    );
    return {
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Delete a virtual machine
 * @param {string} vm_id - The ID of the virtual machine to delete
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function deleteVirtualMachine(
  vm_id: string
): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.delete(
      `${API_BASE_URL}/api/vm/delete/`,
      {
        data: {
          vm_id,
        },
      }
    );
    return {
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Get the virtual machine details for the current user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getVirtualMachineByUser(): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.get(
      `${API_BASE_URL}/api/vm/user/`
    );
    return {
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}

/**
 * Get the virtual machine details for the current user
 * @returns {Promise<ApiResponse>} - The response from the server
 */
export async function getRunningVMs(): Promise<ApiResponse> {
  try {
    const response: AxiosResponse = await axios.get(
      `${API_BASE_URL}/api/vm/count/`
    );
    return {
      status: response.status,
      message: response.data.message,
      data: response.data,
    };
  } catch (error: any) {
    return {
      status: error.response.status,
      message: error.response.data.message,
    };
  }
}
