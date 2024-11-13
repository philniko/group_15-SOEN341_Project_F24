import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Register from '../src/Register'; 
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import React from 'react';

vi.mock('axios'); 

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
      ...actual,
      useNavigate: vi.fn(), 
    };
  });


describe('Register Component', () => {
    it('renders the registration form', () => {
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );
  
      expect(screen.getByPlaceholderText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
    });
  
    it('submits the form successfully and navigates to login', async () => {
      const mockNavigate = vi.fn();
      vi.mocked(useNavigate).mockReturnValue(mockNavigate); 
  
      vi.mocked(axios.post).mockResolvedValueOnce({ data: { message: 'Success' } });
  
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );
  
      fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'johndoe@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByLabelText(/Student/i));
  
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
  
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  
    it('displays an error message on failed submission', async () => {
      vi.mocked(axios.post).mockRejectedValueOnce({
        response: { data: { type: 'email', message: 'Email is already in use' } },
      });
  
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );
  
      fireEvent.change(screen.getByPlaceholderText(/First Name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByPlaceholderText(/Last Name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'janedoe@example.com' } });
      fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByLabelText(/Instructor/i));
  
      fireEvent.click(screen.getByRole('button', { name: /Register/i }));
  
      await waitFor(() => {
        expect(screen.getByText(/Email is already in use/i)).toBeInTheDocument();
      });
    });
  
    it('displays appropriate error messages from server response', async () => {
        vi.mocked(axios.post).mockImplementation((url, data) => {
          if (data.email === 'duplicate@example.com') {
            return Promise.reject({
              response: { data: { type: 'email', message: 'Email already exists' } },
            });
          }
          return Promise.resolve();
        });
      
        render(
          <BrowserRouter>
            <Register />
          </BrowserRouter>
        );
      
        // Enter duplicate email
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'duplicate@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
        // Wait for the error message
        await waitFor(() =>
          expect(
            screen.getByText((content, element) =>
              content.includes('Email already exists')
            )
          ).toBeInTheDocument()
        );
      });
  });