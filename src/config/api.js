
import { goto } from '$app/navigation';
import { API_URL } from './constants.js';

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        goto('/login?sessao=expirada');
        return;
    }

    return response;
}