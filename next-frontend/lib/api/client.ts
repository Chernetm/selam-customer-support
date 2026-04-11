const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8090/api';
const BASE_URL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;


const getAuthHeaders = (endpoint: string): Record<string, string> => {
  const headers: Record<string, string> = {};
  
  if (typeof window !== 'undefined') {
    const adminToken = localStorage.getItem('adminToken');
    const customerToken = localStorage.getItem('customerToken');
    
    let token = null;
    if (endpoint.startsWith('/customer')) {
      token = customerToken || adminToken;
    } else if (endpoint.startsWith('/admin')) {
      token = adminToken || customerToken;
    } else {
      token = adminToken || customerToken;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const client = {
  async post(endpoint: string, data: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(endpoint),
    };

    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    console.log(`[API] POST ${url}`, data);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !endpoint.includes('/login')) {
        localStorage.clear();
        window.location.href = '/login';
      }
      throw new Error('Session expired or Unauthorized. Please login again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return { data: responseData };
  },

  async get(endpoint: string) {
    const headers = getAuthHeaders(endpoint);
    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    console.log(`[API] GET ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return { data: responseData };
  },

  async put(endpoint: string, data: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(endpoint),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return { data: responseData };
  },

  async delete(endpoint: string) {
    const headers = getAuthHeaders(endpoint);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    try {
      const responseData = await response.json();
      return { data: responseData };
    } catch (e) {
      return { data: null };
    }
  },

  async patch(endpoint: string, data: any) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(endpoint),
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/';
      }
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'An error occurred';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return { data: responseData };
  }
};

export default client;
