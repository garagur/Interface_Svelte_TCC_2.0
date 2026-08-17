import { goto } from '$app/navigation';
import { API_URL } from './constants.js';

function logout(motivo) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    goto(`/login?sessao=${motivo}`);
}

export async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    let response;
    try {
        response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });
    } catch (err) {
        // backend fora do ar, sem rede, CORS bloqueado, etc.
        logout('desconectado');
        throw err; // quem chamou apiFetch sabe que a requisição falhou
    }

    if (response.status === 401) {
        logout('expirada');
        return;
    }
    if ([502, 503, 504].includes(response.status)) {
        logout('desconectado');
        return;
    }

    return response;
}