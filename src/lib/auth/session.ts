import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  sub: string;
  email: string;
  name: string;
}

export const sessionService = {
  // Store token in localStorage
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  // Check if token is valid and not expired
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  // Get user info from token
  getUserInfo(): { id: string; email: string; name: string } | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name
      };
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isTokenValid();
  }
}; 