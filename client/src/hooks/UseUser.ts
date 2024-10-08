// src/hooks/useUser.ts
import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';

export const useUser = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || '';
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setUser(decodedToken);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  return user;
};
