import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter, Route, Routes } from "react-router-dom";
import DetailedView from "../../src/InstructorDashboard/DetailedView";
import { describe, it, vi, expect, beforeEach } from "vitest";
import React from "react";
import '@testing-library/jest-dom'; 

const mockResponse = (status: number, data: object) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

describe("DetailedView Component", () => {
  const groupId = "group123";
  const studentId = "student123";

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("token", "mock-token");

    vi.spyOn(window, "fetch").mockImplementation(async (url: string, options: any) => {
      if (url.includes("/getGroup")) {
        return mockResponse(200, {
          group: {
            name: "Test Team",
            students: [{ _id: "student123", firstName: "John", lastName: "Doe" }],
          },
        });
      } else if (url.includes("/getStudentRatings")) {
        return mockResponse(200, {
          ratings: [], 
        });
      } else {
        return mockResponse(404, {});
      }
    });
  });


  it("renders the detailed view with no ratings", async () => {
    render(
      <MemoryRouter initialEntries={[`/group/${groupId}/student/${studentId}`]}>
        <Routes>
          <Route
            path="/group/:groupId/student/:studentId"
            element={<DetailedView />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const teamNameLabel = screen.getByText('Team Name:', { selector: 'strong' });
      const studentNameLabel = screen.getByText('Student Name:', { selector: 'strong' });

      expect(teamNameLabel).toBeInTheDocument();
      expect(studentNameLabel).toBeInTheDocument();

      const teamNameElement = teamNameLabel.parentElement;
      const studentNameElement = studentNameLabel.parentElement;

      expect(teamNameElement).toHaveTextContent(/^Team Name:\s*Test Team$/);
      expect(studentNameElement).toHaveTextContent(/^Student Name:\s*John Doe$/);

      expect(screen.getByText(/No ratings available/i)).toBeInTheDocument();
      expect(screen.getByText(/No comments available/i)).toBeInTheDocument();
    });
  });

  it("handles fetch errors gracefully", async () => {
    (fetch as vi.Mock)
      .mockImplementationOnce(() => mockResponse(500, {})) 
      .mockImplementationOnce(() => mockResponse(500, {})); 

    render(
      <BrowserRouter>
        <DetailedView />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Detailed View/i)).toBeInTheDocument();
      expect(screen.getByText(/No ratings available./i)).toBeInTheDocument();
      expect(screen.getByText(/No comments available./i)).toBeInTheDocument();
    });
  });
  
  it("fetches and displays ratings and comments", async () => {
    vi.spyOn(window, "fetch").mockImplementation(async (url: string, options: any) => {
      if (url.includes("/getGroup")) {
        return mockResponse(200, {
          group: {
            name: "Test Team",
            students: [{ _id: "student123", firstName: "John", lastName: "Doe" }],
          },
        });
      } else if (url.includes("/getStudentRatings")) {
        return mockResponse(200, {
          ratings: [
            {
              CooperationRating: 4,
              ConceptualContributionRating: 5,
              PracticalContributionRating: 3,
              WorkEthicRating: 4,
              CooperationFeedback: "Great teamwork",
              ConceptualContributionFeedback: "Creative ideas",
              PracticalContributionFeedback: "Good hands-on skills",
              WorkEthicFeedback: "Always on time",
              rater: { firstName: "Alice", lastName: "Smith" },
            },
          ],
        });
      } else {
        return mockResponse(404, {});
      }
    });

    render(
      <MemoryRouter initialEntries={[`/group/${groupId}/student/${studentId}`]}>
        <Routes>
          <Route
            path="/group/:groupId/student/:studentId"
            element={<DetailedView />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const teamNameLabel = screen.getByText('Team Name:', { selector: 'strong' });
      const studentNameLabel = screen.getByText('Student Name:', { selector: 'strong' });

      expect(teamNameLabel).toBeInTheDocument();
      expect(studentNameLabel).toBeInTheDocument();

      const teamNameElement = teamNameLabel.parentElement;
      const studentNameElement = studentNameLabel.parentElement;

      expect(teamNameElement).toHaveTextContent(/^Team Name:\s*Test Team$/);
      expect(studentNameElement).toHaveTextContent(/^Student Name:\s*John Doe$/);

      // Adjusted assertions for "Alice Smith"
      const aliceTableCell = screen.getByRole('cell', { name: /Alice Smith/i });
      expect(aliceTableCell).toBeInTheDocument();

      const aliceCardHeader = screen.getByRole('heading', { name: /Alice Smith/i });
      expect(aliceCardHeader).toBeInTheDocument();

      expect(screen.getByText("4.00")).toBeInTheDocument();
      expect(screen.getByText(/Great teamwork/i)).toBeInTheDocument();
      expect(screen.getByText(/Creative ideas/i)).toBeInTheDocument();
      expect(screen.getByText(/Good hands-on skills/i)).toBeInTheDocument();
      expect(screen.getByText(/Always on time/i)).toBeInTheDocument();
    });
  });

  it("displays a message if the student is not found", async () => {
    vi.spyOn(window, "fetch").mockImplementation(async (url: string, options: any) => {
      if (url.includes("/getGroup")) {
        return mockResponse(200, {
          group: {
            name: "Test Team",
            students: [{ _id: "student456", firstName: "Jane", lastName: "Doe" }],
          },
        });
      } else if (url.includes("/getStudentRatings")) {
        return mockResponse(200, {
          ratings: [],
        });
      } else {
        return mockResponse(404, {});
      }
    });

    render(
      <MemoryRouter initialEntries={[`/group/${groupId}/student/${studentId}`]}>
        <Routes>
          <Route
            path="/group/:groupId/student/:studentId"
            element={<DetailedView />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const teamNameLabel = screen.getByText('Team Name:', { selector: 'strong' });
      expect(teamNameLabel).toBeInTheDocument();

      const teamNameElement = teamNameLabel.parentElement;
      expect(teamNameElement).toHaveTextContent(/^Team Name:\s*Test Team$/);

      const studentNameLabel = screen.getByText('Student Name:', { selector: 'strong' });
      expect(studentNameLabel).toBeInTheDocument();

      const studentNameElement = studentNameLabel.parentElement;
      expect(studentNameElement).toHaveTextContent(/^Student Name:\s*$/);

      expect(screen.getByText(/No ratings available/i)).toBeInTheDocument();
      expect(screen.getByText(/No comments available/i)).toBeInTheDocument();
    });
  });
});