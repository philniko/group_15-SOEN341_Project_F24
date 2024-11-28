import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StudentGroup from "../../src/StudentDashboard/StudentGroup";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";

// Mock jwt-decode
vi.mock("jwt-decode", () => ({
  default: vi.fn(() => ({ id: "123", firstName: "Test", lastName: "User" })),
}));

describe("StudentGroup Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.setItem("token", "mock.token.payload"); // A placeholder mock token
  });

  it("renders the component correctly", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ group: { students: [], name: "Test Group" } }),
      })
    );

    render(
      <BrowserRouter>
        <StudentGroup />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Group")).toBeInTheDocument();
    });

    expect(screen.getByText("Chat")).toBeInTheDocument();
  });

  it("fetches and displays students", async () => {
    const mockStudents = [
      { _id: "1", firstName: "John", lastName: "Doe", email: "john@example.com" },
      { _id: "2", firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
    ];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ group: { students: mockStudents, name: "Test Group" } }),
      })
    );

    render(
      <BrowserRouter>
        <StudentGroup />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();

      expect(screen.getByText("Jane")).toBeInTheDocument();
      expect(screen.getByText("Smith")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });
  });

  it("handles student rating", async () => {
    const mockStudents = [
      { _id: "1", firstName: "John", lastName: "Doe", email: "john@example.com", rated: false },
    ];

    global.fetch = vi.fn((url) => {
      if (url.includes("getGroup")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ group: { students: mockStudents, name: "Test Group" } }),
        });
      }
      if (url.includes("saveRating")) {
        return Promise.resolve({ status: 200 });
      }
      return Promise.resolve({ ok: true });
    });

    render(
      <BrowserRouter>
        <StudentGroup />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Not Rated Yet")).toBeInTheDocument();
    });

    const rateButton = screen.getByText("Not Rated Yet");
    fireEvent.click(rateButton);

    expect(screen.getByText("Rate John Doe")).toBeInTheDocument();

    const confirmButton = screen.getByText("Confirm Selection");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText("Change Rating")).toBeInTheDocument();
    });
  });
});
