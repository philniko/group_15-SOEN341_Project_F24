import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom'; // Ensure proper import
import Login from '../src/Login';
import { describe, expect, it, vi } from 'vitest';
import React from 'react';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
      ...actual,
      useNavigate: vi.fn(),
    };
  });
  
  describe('Login Component', () => {
    it('redirects to dashboard on successful login', async () => {
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate); 
  
      global.fetch = vi.fn(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve({ token: 'fake-token', role: 'instructor' }),
        })
      );
  
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );
  
      fireEvent.change(screen.getByPlaceholderText(/email/i), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
      await screen.findByRole('button', { name: /login/i });
      
      expect(mockNavigate).toHaveBeenCalledWith('/instructor/home'); 
    });
  });

  it('shows error message on invalid credentials', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid email or password' }),
      })
    );
  
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'invalid@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
  
    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('displays appropriate error messages from server response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        status: 400,
        json: () => Promise.resolve({ message: 'Email is required' }),
      })
    );
  
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  
    fireEvent.click(screen.getByRole('button', { name: /login/i })); 
  
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });