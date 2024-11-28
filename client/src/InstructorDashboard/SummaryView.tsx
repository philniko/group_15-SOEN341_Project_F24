import React, { useEffect, useMemo, useState } from "react";
import CourseSummaryView from "./CourseSummaryView";
import "./SummaryView.css"; // Import the CSS file

// Define the structure for each student's data
export interface StudentData {
  email: string;
  firstName: string;
  lastName: string;
  courseName: string;
  courseId: string;
  team: string;
  teamId: string;
  avgCooperation: number;
  avgConceptualContribution: number;
  avgPracticalContribution: number;
  avgWorkEthic: number;
  overallAverage: number;
  peersResponded: number;
}

function SummaryView() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [expandedCourses, setExpandedCourses] = useState<{
    [courseId: string]: boolean;
  }>({});

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem("token") || "";
      try {
        const response = await fetch("http://localhost:3001/getSummaryView", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStudentsData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  console.log("studentsData", studentsData);

  // Group students by course
  const coursesData = useMemo(() => {
    const coursesMap: {
      [courseId: string]: { courseName: string; students: StudentData[] };
    } = {};
    studentsData.forEach((student) => {
      // Only include students with valid email and firstName
      if (student.email && student.firstName && student.lastName) {
        const courseId = student.courseId;
        if (!coursesMap[courseId]) {
          coursesMap[courseId] = {
            courseName: student.courseName,
            students: [],
          };
        }
        coursesMap[courseId].students.push(student);
      }
    });
    return coursesMap;
  }, [studentsData]);

  // Function to toggle course expansion
  const toggleCourseExpansion = (courseId: string) => {
    setExpandedCourses((prevState) => ({
      ...prevState,
      [courseId]: !prevState[courseId],
    }));
  };

  // Initialize expandedCourses to expand all courses by default
  useEffect(() => {
    const initialExpandedCourses: { [courseId: string]: boolean } = {};
    for (const courseId in coursesData) {
      initialExpandedCourses[courseId] = false; // Set to false to collapse all courses by default
    }
    setExpandedCourses(initialExpandedCourses);
  }, [coursesData]);

  return (
    <div className="sum">
      <div className="container-sum">
        {Object.entries(coursesData).map(([courseId, course]) => (
          <div key={courseId} className="course-section">
            {/* Collapsible header */}
            <div
              className="course-header"
              onClick={() => toggleCourseExpansion(courseId)}
            >
              {course.courseName}
              <span>{expandedCourses[courseId] ? "-" : "+"}</span>
            </div>
            {/* If course is expanded, show the content */}
            {expandedCourses[courseId] && (
              <div className="course-content">
                {course.students.length > 0 ? (
                  <CourseSummaryView students={course.students} />
                ) : (
                  <div>No students available for this course.</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SummaryView;
