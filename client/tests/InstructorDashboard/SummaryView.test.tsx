import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import SummaryView from "../../src/InstructorDashboard/SummaryView";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import '@testing-library/jest-dom';

const mockStudentData = [
  {
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    team: "Team A",
    teamId: "teamA",
    avgCooperation: 4.5,
    avgConceptualContribution: 4.0,
    avgPracticalContribution: 3.5,
    avgWorkEthic: 5.0,
    overallAverage: 4.25,
    peersResponded: 3,
  },
  {
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    team: "Team B",
    teamId: "teamB",
    avgCooperation: 3.5,
    avgConceptualContribution: 4.5,
    avgPracticalContribution: 4.0,
    avgWorkEthic: 4.0,
    overallAverage: 4.0,
    peersResponded: 2,
  },
];

describe("SummaryView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "mock-token");

    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and displays students' data correctly", async () => {
    vi.spyOn(window, "fetch").mockImplementation(async () => {
      return Promise.resolve({
        ok: true,
        json: async () => mockStudentData,
      });
    });

    render(<SummaryView />);

    await waitFor(() => {

      expect(screen.getByRole('button', { name: 'Team A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Team B' })).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Team A' })).toHaveClass('active');

      // Check that student data for Team A is displayed
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Doe")).toBeInTheDocument();
      expect(screen.getAllByText("Team A").length).toBeGreaterThan(0);
      expect(screen.getByText("4.50")).toBeInTheDocument();
      expect(screen.getByText("4.00")).toBeInTheDocument();
      expect(screen.getByText("3.50")).toBeInTheDocument();
      expect(screen.getByText("5.00")).toBeInTheDocument();
      expect(screen.getByText("4.25")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  it("renders tabs for each unique team and switches between them", async () => {
    vi.spyOn(window, "fetch").mockImplementation(async () => {
      return Promise.resolve({
        ok: true,
        json: async () => mockStudentData,
      });
    });

    render(<SummaryView />);

    await waitFor(() => {

        expect(screen.getByRole('button', { name: 'Team A' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Team B' })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Team A' })).toHaveClass('active');

    fireEvent.click(screen.getByRole('button', { name: 'Team B' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Team B' })).toHaveClass('active');
    });

    await waitFor(() => {
      expect(screen.getByText("jane.smith@example.com")).toBeInTheDocument();
    });

    const janeRow = screen.getByText("jane.smith@example.com").closest('tr');
    expect(janeRow).toBeInTheDocument();

    const { getByText, getAllByText } = within(janeRow);

    expect(getByText("Jane")).toBeInTheDocument();
    expect(getByText("Smith")).toBeInTheDocument();
    expect(getByText("Team B")).toBeInTheDocument();
    expect(getByText("3.50")).toBeInTheDocument();
    expect(getByText("4.50")).toBeInTheDocument();

    const fourPointZeroElements = getAllByText("4.00");
    expect(fourPointZeroElements.length).toBe(3); 

    expect(getByText("2")).toBeInTheDocument();

    expect(screen.queryByText("john.doe@example.com")).not.toBeInTheDocument();
  });   

  it("handles sorting of student data based on selected criteria and direction", async () => {
    const extendedMockData = [
      ...mockStudentData,
      {
        email: "alice.wonderland@example.com",
        firstName: "Alice",
        lastName: "Wonderland",
        team: "Team A",
        teamId: "teamA",
        avgCooperation: 5.0,
        avgConceptualContribution: 4.5,
        avgPracticalContribution: 4.0,
        avgWorkEthic: 5.0,
        overallAverage: 4.625,
        peersResponded: 4,
      },
    ];

    vi.spyOn(window, "fetch").mockImplementation(async () => {
      return Promise.resolve({
        ok: true,
        json: async () => extendedMockData,
      });
    });

    render(<SummaryView />);

    await waitFor(() => {
      const rows = screen.getAllByRole('row');

      const dataRows = rows.slice(1);

      expect(within(dataRows[0]).getByText("john.doe@example.com")).toBeInTheDocument();
      expect(within(dataRows[1]).getByText("alice.wonderland@example.com")).toBeInTheDocument();
    });

    const selectElements = screen.getAllByRole('combobox');
    const sortBySelect = selectElements[0];
    const orderSelect = selectElements[1];

    fireEvent.change(sortBySelect, { target: { value: 'avgCooperation' } });

    fireEvent.change(orderSelect, { target: { value: 'descending' } });

    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      const dataRows = rows.slice(1);
      expect(within(dataRows[0]).getByText("alice.wonderland@example.com")).toBeInTheDocument();
      expect(within(dataRows[1]).getByText("john.doe@example.com")).toBeInTheDocument();
    });
  });

  it("displays appropriate message when there is no data", async () => {
    vi.spyOn(window, "fetch").mockImplementation(async () => {
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    });

    render(<SummaryView />);

    await waitFor(() => {
      const rowgroups = screen.getAllByRole('rowgroup');

      const tbody = rowgroups[1];

      expect(within(tbody).queryByRole('row')).not.toBeInTheDocument();
    });
  });

//   it("handles fetch errors gracefully", async () => {
//     vi.spyOn(window, "fetch").mockImplementation(async () => {
//       return Promise.reject(new Error("Network error"));
//     });

//     const unhandledRejectionHandler = (event) => {
//       event.preventDefault();
//     };
//     window.addEventListener('unhandledrejection', unhandledRejectionHandler);

//     render(<SummaryView />);

//     await waitFor(() => {
//       expect(screen.getByText("Sort by:")).toBeInTheDocument();
//       expect(screen.getByText("Order:")).toBeInTheDocument();
//     });

//     window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
//   });
});
