import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';

// Define a Student interface
interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  rated?: boolean; // Optional property to track if rated
}

function StudentGroup() {
  const { groupId } = useParams<{ groupId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [ratings, setRatings] = useState({
    Cooperation: 0,
    ConceptualContribution: 0,
    PracticalContribution: 0,
    WorkEthic: 0
  });
  const [feedback, setFeedback] = useState({
    CooperationFeedback: "",
    ConceptualContributionFeedback: "",
    PracticalContributionFeedback: "",
    WorkEthicFeedback: ""
  });

  const fetchGroupData = async () => {
    const token = localStorage.getItem('token') || '';
    const response = await fetch("http://localhost:3001/getGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      },
      body: JSON.stringify({ id: groupId })
    });

    if (response.ok) {
      const data = await response.json();
      setStudents(data.group.students || []);
    }
  };

  // Group fetching logic
  useEffect(() => {
    fetchGroupData();
  }, []);

  const handleRateStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleRatingChange = (attribute: string, value: number) => {
    setRatings({ ...ratings, [attribute]: value });
  };

  const handleSubmitRating = async () => {
    if (selectedStudent) {
      const token = localStorage.getItem('token') || '';
      const ratingData = {
        groupId: groupId,
        rateeId: selectedStudent._id,
        ...ratings,
        ...feedback
      };

      const response = await fetch('http://localhost:3001/saveRating', {
        method: 'POST',
        headers: {
          'Content-Type': "application/json",
          'x-access-token': token
        },
        body: JSON.stringify(ratingData)
      });

      if (response.status === 200) {
        setShowModal(false);
        // Update students to reflect that the selected student has been rated
        setStudents(students.map(student => {
          if (student._id === selectedStudent._id) {
            student.rated = true; // Adjust this logic based on your implementation
          }
          return student;
        }));
      }
    }
  };

  return (
    <div className="home">
      <table className="table">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student: Student) => (
            <tr key={student._id}>
              <td>{student.firstName}</td>
              <td>{student.lastName}</td>
              <td>{student.email}</td>
              <td>
                <button onClick={() => handleRateStudent(student)}>
                  {student.rated ? 'Change Rating' : 'Not Rated Yet'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>


      {/* Modal for rating */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Rate {selectedStudent?.firstName} {selectedStudent?.lastName} {selectedStudent?.email}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="rating-section">
            <div>
              <strong>Cooperation</strong>
              {[1, 2, 3, 4, 5].map(value => (
                <label key={value}>
                  <input
                    type="radio"
                    name="Cooperation"
                    value={value}
                    checked={ratings.Cooperation === value}
                    onChange={() => handleRatingChange('Cooperation', value)}
                  />
                  {value}
                </label>
              ))}
              <textarea
                placeholder="Optional feedback"
                value={feedback.CooperationFeedback}
                onChange={(e) => setFeedback({ ...feedback, CooperationFeedback: e.target.value })}
              />
            </div>
            <div>
              <strong>Conceptual Contribution</strong>
              {[1, 2, 3, 4, 5].map(value => (
                <label key={value}>
                  <input
                    type="radio"
                    name="Conceptual Contribution"
                    value={value}
                    checked={ratings.ConceptualContribution === value}
                    onChange={() => handleRatingChange('ConceptualContribution', value)}
                  />
                  {value}
                </label>
              ))}
              <textarea
                placeholder="Optional feedback"
                value={feedback.ConceptualContributionFeedback}
                onChange={(e) => setFeedback({
                  ...feedback,
                  ConceptualContributionFeedback: e.target.value
                })}
              />
            </div>
            <div>
              <strong>Practical Contribution</strong>
              {[1, 2, 3, 4, 5].map(value => (
                <label key={value}>
                  <input
                    type="radio"
                    name="Practical Contribution"
                    value={value}
                    checked={ratings.PracticalContribution === value}
                    onChange={() => handleRatingChange('PracticalContribution', value)}
                  />
                  {value}
                </label>
              ))}
              <textarea
                placeholder="Optional feedback"
                value={feedback.PracticalContributionFeedback}
                onChange={(e) => setFeedback({
                  ...feedback,
                  PracticalContributionFeedback: e.target.value
                })}
              />
            </div>
          </div>
          <div>
            <strong>Work Ethic</strong>
            {[1, 2, 3, 4, 5].map(value => (
              <label key={value}>
                <input
                  type="radio"
                  name="Work Ethic"
                  value={value}
                  checked={ratings.WorkEthic === value}
                  onChange={() => handleRatingChange('WorkEthic', value)}
                />
                {value}
              </label>
            ))}
            <textarea
              placeholder="Optional feedback"
              value={feedback.WorkEthicFeedback}
              onChange={(e) => setFeedback({ ...feedback, WorkEthicFeedback: e.target.value })}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitRating}>
            Confirm Selection
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default StudentGroup;
