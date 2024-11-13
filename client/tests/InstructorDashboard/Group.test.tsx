import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Group from '../../src/InstructorDashboard/Group'; 
import { describe, it, vi, expect, beforeEach } from 'vitest';
import React from 'react';


global.fetch = vi.fn();

const mockResponse = (status: number, data: object) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

describe('Group Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the group management interface', async () => {
    (fetch as vi.Mock).mockImplementation(() =>
      mockResponse(200, { group: { students: [] } })
    );

    render(
      <BrowserRouter>
        <Group />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByText(/Number of Students: 0/i)).toBeInTheDocument());
    expect(screen.getByPlaceholderText(/Student Email/i)).toBeInTheDocument();
  });

  it('adds a student successfully', async () => {
    (fetch as vi.Mock)
      .mockImplementationOnce(() => mockResponse(200, { group: { students: [] } })) // Initial fetch
      .mockImplementationOnce(() => mockResponse(200, { message: 'Student successfully added!' })) // Add student
      .mockImplementationOnce(() => mockResponse(200, { group: { students: [{ _id: '1', firstName: 'John', lastName: 'Doe' }] } })); // Fetch updated list

    render(
      <BrowserRouter>
        <Group />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Student Email/i), { target: { value: 'test@student.com' } });
    fireEvent.click(screen.getByText(/Add Student/i));

    await waitFor(() => expect(screen.getByText(/Student successfully added!/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());
  });

  it('displays an error when adding a student fails', async () => {
    (fetch as vi.Mock)
      .mockImplementationOnce(() => mockResponse(200, { group: { students: [] } })) // Initial fetch
      .mockImplementationOnce(() => mockResponse(400, { type: 'error', message: 'Invalid email!' })); // Add student error

    render(
      <BrowserRouter>
        <Group />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Student Email/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByText(/Add Student/i));

    await waitFor(() => expect(screen.getByText(/Invalid email!/i)).toBeInTheDocument());
  });

  it('removes a student successfully', async () => {
    (fetch as vi.Mock)
      .mockImplementationOnce(() => mockResponse(200, { group: { students: [{ _id: '1', firstName: 'John', lastName: 'Doe' }] } })) // Initial fetch
      .mockImplementationOnce(() => mockResponse(200, { message: 'Student removed successfully!' })) // Remove student
      .mockImplementationOnce(() => mockResponse(200, { group: { students: [] } })); // Fetch updated list
  
    render(
      <BrowserRouter>
        <Group />
      </BrowserRouter>
    );
  
    await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());
  
    fireEvent.click(screen.getByText(/×/)); // Click the delete button
    
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i })); 
  
    await waitFor(() => expect(screen.getByText(/Student removed successfully!/i)).toBeInTheDocument());
    await waitFor(() => expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument());
  });
  
  it('displays an error when adding a student with an empty or invalid email', async () => {
    (fetch as vi.Mock)
      .mockImplementationOnce(() => mockResponse(200, { group: { students: [] } })) // Initial fetch
      .mockImplementationOnce(() => mockResponse(400, { type: 'error', message: 'Please enter a student email!' })); // Empty email error
  
    render(
      <BrowserRouter>
        <Group />
      </BrowserRouter>
    );
  
    // Simulate clicking Add Student without providing an email
    fireEvent.click(screen.getByText(/Add Student/i));
  
    await waitFor(() => {
      expect(screen.getByText(/Please enter a student email!/i)).toBeInTheDocument();
    });
  });

  
});
