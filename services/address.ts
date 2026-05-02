import { Address } from '../types';
import { getApiBaseUrl } from '../constants';

const AUTH_API_BASE = getApiBaseUrl();

const parseResponse = async (res: Response) => {
  let data: any = {};
  try {
    data = await res.json();
  } catch (parseError) {
    console.error('Failed to parse response:', parseError);
  }
  if (!res.ok) {
    console.error('HTTP Error:', res.status, res.statusText, data);
    const error = new Error(data.error || `Request failed with status ${res.status}`);
    (error as any).status = res.status;
    throw error;
  }
  return data;
};

export const getAddresses = async (userId: string): Promise<Address[]> => {
  const res = await fetch(`${AUTH_API_BASE}/api/address/${userId}`);
  return parseResponse(res);
};

export const addAddress = async (userId: string, address: Omit<Address, 'id'>): Promise<Address> => {
  const res = await fetch(`${AUTH_API_BASE}/api/address/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(address)
  });
  return parseResponse(res);
};

export const updateAddress = async (userId: string, addressId: string, updates: Partial<Address>): Promise<Address> => {
  const res = await fetch(`${AUTH_API_BASE}/api/address/${userId}/${addressId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return parseResponse(res);
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
  const res = await fetch(`${AUTH_API_BASE}/api/address/${userId}/${addressId}`, {
    method: 'DELETE'
  });
  return parseResponse(res);
};
