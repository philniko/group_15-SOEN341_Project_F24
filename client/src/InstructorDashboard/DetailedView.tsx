import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./DetailedView.css";
import { Card, ListGroup, Table } from "react-bootstrap";

function DetailedView() {
  const { groupId, studentId } = useParams();
  const [teamName, setTeamName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token") || "";
      let student = null;

      try {
        // Fetch group data to get the team name and members
        const groupResponse = await fetch("http://localhost:3001/getGroup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({ id: groupId }),
        });

        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          const group = groupData.group;

          setTeamName(group.name);

          // Find the student in the group
          student = group.students.find((s) => s._id === studentId);

          if (student) {
            setStudentName(`${student.firstName} ${student.lastName}`);
          } else {
            console.error("Student not found in group");
          }
        } else {
          console.error("Failed to fetch group data");
        }

        if (student) {
          // Fetch individual ratings for the student
          const ratingsResponse = await fetch(
            "http://localhost:3001/getStudentRatings",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": token,
              },
              body: JSON.stringify({ groupId, studentId }),
            }
          );

          if (ratingsResponse.ok) {
            const ratingsData = await ratingsResponse.json();
            setRatings(ratingsData.ratings);
          } else {
            console.error("Failed to fetch student ratings");
          }
        } else {
          console.error("Student is null; cannot fetch ratings data.");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      }
    };

    fetchData();
  }, [groupId, studentId]);

  return (
    <div className="container detailed-view">
      <h2 className="mt-5">Detailed View</h2>
      <div className="student-info mb-4">
        <p>
          <strong>Team Name:</strong> {teamName}
        </p>
        <p>
          <strong>Student Name:</strong> {studentName}
        </p>
      </div>

      {/* Ratings Table */}
      <Table responsive bordered hover className="mb-4">
        <thead>
          <tr>
            <th>Rater</th>
            <th>Cooperation</th>
            <th>Conceptual</th>
            <th>Practical</th>
            <th>Work Ethic</th>
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          {ratings.length > 0 ? (
            ratings.map((rating, index) => {
              const average =
                (rating.CooperationRating +
                  rating.ConceptualContributionRating +
                  rating.PracticalContributionRating +
                  rating.WorkEthicRating) /
                4;

              return (
                <tr key={index}>
                  <td>{`${rating.rater.firstName} ${rating.rater.lastName}`}</td>
                  <td>{rating.CooperationRating}</td>
                  <td>{rating.ConceptualContributionRating}</td>
                  <td>{rating.PracticalContributionRating}</td>
                  <td>{rating.WorkEthicRating}</td>
                  <td>{average.toFixed(2)}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6">No ratings available.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Comments Section */}
      <h3 className="mb-4">Comments</h3>
      {ratings.length > 0 ? (
        ratings.map((rating, index) => (
          <Card key={index} className="mb-3 comment-card">
            <Card.Header>
              <h5 className="mb-0">{`${rating.rater.firstName} ${rating.rater.lastName}`}</h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {rating.CooperationFeedback && (
                  <ListGroup.Item>
                    <strong>Cooperation:</strong> {rating.CooperationFeedback}
                  </ListGroup.Item>
                )}
                {rating.ConceptualContributionFeedback && (
                  <ListGroup.Item>
                    <strong>Conceptual Contribution:</strong>{" "}
                    {rating.ConceptualContributionFeedback}
                  </ListGroup.Item>
                )}
                {rating.PracticalContributionFeedback && (
                  <ListGroup.Item>
                    <strong>Practical Contribution:</strong>{" "}
                    {rating.PracticalContributionFeedback}
                  </ListGroup.Item>
                )}
                {rating.WorkEthicFeedback && (
                  <ListGroup.Item>
                    <strong>Work Ethic:</strong> {rating.WorkEthicFeedback}
                  </ListGroup.Item>
                )}
                {!rating.CooperationFeedback &&
                  !rating.ConceptualContributionFeedback &&
                  !rating.PracticalContributionFeedback &&
                  !rating.WorkEthicFeedback && (
                    <ListGroup.Item>(No comments)</ListGroup.Item>
                  )}
              </ListGroup>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>No comments available.</p>
      )}
    </div>
  );
}

export default DetailedView;
