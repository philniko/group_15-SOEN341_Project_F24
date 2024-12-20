import { useEffect, useState } from 'react';

// Define the structure for each student's data
interface StudentData {
  email: string;
  firstName: string;
  lastName: string;
  team: string;
  teamId: string;
  avgCooperation: number;
  avgConceptualContribution: number;
  avgPracticalContribution: number;
  avgWorkEthic: number;
  overallAverage: number;
  peersResponded: number;
}

// Define the structure for sorting configuration
interface SortConfig {
  key: keyof StudentData | 'lastName';
  direction: 'ascending' | 'descending';
}

function SummaryView() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'lastName', direction: 'ascending' });
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token') || "";
      const response = await fetch('http://localhost:3001/getSummaryView', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token
        },
      });
      const data = await response.json();
      setStudentsData(data);
      if (data.length > 0) setSelectedTeam(data[0].team); // Set the initial team tab to the first team
    }

    fetchData();
  }, []);

  // Handle sorting key and direction change
  const handleSortKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortConfig({ ...sortConfig, key: e.target.value as keyof StudentData });
  };

  const handleSortDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortConfig({ ...sortConfig, direction: e.target.value as 'ascending' | 'descending' });
  };

  // Sort students based on the current sort configuration
  const sortedStudents = [...studentsData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Get unique teams
  const uniqueTeams = Array.from(new Set(studentsData.map(student => student.team)));

  // Filter students by the selected team
  const filteredStudents = sortedStudents.filter(student => student.team === selectedTeam);

  return (
    <div className="sum">
      <div className="container-sum">
        {/* Tabs for each team */}
        {/* Tabs for each team */}
        <div className="tab-container">
          {uniqueTeams.map(team => (
            <button
              key={team}
              onClick={() => setSelectedTeam(team)}
              className={`tab-button ${selectedTeam === team ? 'active' : ''}`}
            >
              {team}
            </button>
          ))}
        </div>

        {/* Sorting dropdowns */}
        <div className="sort-controls">
          <label>Sort by: </label>
          <select onChange={handleSortKeyChange} value={sortConfig.key}>
            <option value="lastName">Last Name</option>
            <option value="firstName">First Name</option>
            <option value="team">Team</option>
            <option value="avgCooperation">Cooperation</option>
            <option value="avgConceptualContribution">Conceptual Contribution</option>
            <option value="avgPracticalContribution">Practical Contribution</option>
            <option value="avgWorkEthic">Work Ethic</option>
            <option value="overallAverage">Average</option>
            <option value="peersResponded">Peers who responded</option>
          </select>

          <label>Order: </label>
          <select onChange={handleSortDirectionChange} value={sortConfig.direction}>
            <option value="ascending">Ascending</option>
            <option value="descending">Descending</option>
          </select>
        </div>

        {/* Table for the selected team */}
        <table>
          <thead>
            <tr>
              {['Student Email', 'First Name', 'Last Name', 'Team', 'Cooperation', 'Conceptual Contribution', 'Practical Contribution', 'Work Ethic', 'Average', 'Peers who responded'].map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr key={`${student.email}-${student.teamId}-${index}`}>
                <td>{student.email}</td>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                <td>{student.team}</td>
                <td>{student.avgCooperation.toFixed(2)}</td>
                <td>{student.avgConceptualContribution.toFixed(2)}</td>
                <td>{student.avgPracticalContribution.toFixed(2)}</td>
                <td>{student.avgWorkEthic.toFixed(2)}</td>
                <td>{student.overallAverage.toFixed(2)}</td>
                <td>{student.peersResponded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryView;
