import React, { useState, useEffect } from "react";
import { StudentData } from "./SummaryView";
import "./SummaryView.css"; // Import the CSS file

interface SortConfig {
  key: keyof StudentData | "lastName";
  direction: "ascending" | "descending";
}

interface CourseSummaryViewProps {
  students: StudentData[];
}

function CourseSummaryView({ students }: CourseSummaryViewProps) {
  // Create a mapping of normalized team names to original team names
  const teamNameMap = students.reduce((acc, student) => {
    const normalizedTeam = student.team?.trim().toLowerCase();
    if (normalizedTeam && !acc[normalizedTeam]) {
      acc[normalizedTeam] = student.team?.trim();
    }
    return acc;
  }, {} as { [key: string]: string });

  // Get unique normalized team names
  const uniqueTeams = Object.keys(teamNameMap);

  // Initialize selectedTeam to the first team
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    uniqueTeams.length > 0 ? uniqueTeams[0] : null
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "lastName",
    direction: "ascending",
  });

  // Update selectedTeam when uniqueTeams change
  useEffect(() => {
    if (uniqueTeams.length > 0) {
      setSelectedTeam(uniqueTeams[0]);
    } else {
      setSelectedTeam(null);
    }
  }, [uniqueTeams]);

  // Handle sorting key and direction change
  const handleSortKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortConfig({ ...sortConfig, key: e.target.value as keyof StudentData });
  };

  const handleSortDirectionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSortConfig({
      ...sortConfig,
      direction: e.target.value as "ascending" | "descending",
    });
  };

  // Sort students based on the current sort configuration
  const sortedStudents = [...students].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? "";
    const bValue = b[sortConfig.key] ?? "";

    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Filter students by the selected team
  const filteredStudents = sortedStudents.filter((student) => {
    const studentTeam = student.team?.trim().toLowerCase();
    return studentTeam === selectedTeam;
  });

  return (
    <div className="course-summary">
      {/* Tabs for each team */}
      <div className="tab-container">
        {uniqueTeams.map((team) => (
          <button
            key={team}
            onClick={() => setSelectedTeam(team)}
            className={`tab-button ${selectedTeam === team ? "active" : ""}`}
          >
            {teamNameMap[team]}
          </button>
        ))}
      </div>

      {/* Sorting controls */}
      <div className="sort-controls">
        <label>Sort by:</label>
        <select onChange={handleSortKeyChange} value={sortConfig.key}>
          <option value="lastName">Last Name</option>
          <option value="firstName">First Name</option>
          <option value="team">Team</option>
          <option value="avgCooperation">Cooperation</option>
          <option value="avgConceptualContribution">
            Conceptual Contribution
          </option>
          <option value="avgPracticalContribution">
            Practical Contribution
          </option>
          <option value="avgWorkEthic">Work Ethic</option>
          <option value="overallAverage">Average</option>
          <option value="peersResponded">Peers who responded</option>
        </select>

        <label>Order:</label>
        <select
          onChange={handleSortDirectionChange}
          value={sortConfig.direction}
        >
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
      </div>

      {/* Table for the selected team */}
      <table>
        <thead>
          <tr>
            {[
              "Student Email",
              "First Name",
              "Last Name",
              "Team",
              "Cooperation",
              "Conceptual Contribution",
              "Practical Contribution",
              "Work Ethic",
              "Average",
              "Peers who responded",
            ].map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((student, index) => (
            <tr key={`${student.email}-${student.teamId}-${index}`}>
              <td>{student.email || "N/A"}</td>
              <td>{student.firstName || "N/A"}</td>
              <td>{student.lastName || "N/A"}</td>
              <td>{student.team || "N/A"}</td>
              <td>
                {student.avgCooperation !== null
                  ? student.avgCooperation.toFixed(2)
                  : "N/A"}
              </td>
              <td>
                {student.avgConceptualContribution !== null
                  ? student.avgConceptualContribution.toFixed(2)
                  : "N/A"}
              </td>
              <td>
                {student.avgPracticalContribution !== null
                  ? student.avgPracticalContribution.toFixed(2)
                  : "N/A"}
              </td>
              <td>
                {student.avgWorkEthic !== null
                  ? student.avgWorkEthic.toFixed(2)
                  : "N/A"}
              </td>
              <td>
                {student.overallAverage !== null
                  ? student.overallAverage.toFixed(2)
                  : "N/A"}
              </td>
              <td>
                {student.peersResponded !== null
                  ? student.peersResponded
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CourseSummaryView;
