import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

// Define a Student interface
interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  rated?: boolean; // Optional property to track if rated
}

// Decode the token to get the current user's ID
const token = localStorage.getItem("token");
const currentUserId = token ? (jwtDecode(token)).id : null;

function StudentGroup() {
  const { groupId } = useParams<{ groupId: string }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [groupName, setGroupName] = useState<string>(""); // New state for group name
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
  const [existGrade, setExistGrade] = useState(false);
  const [totalGrade, setTotalGrade] = useState(-1);
  const [cooperationGrade, setCooperationGrade] = useState(-1);
  const [conceptualGrade, setConceptualGrade] = useState(-1);
  const [practicalGrade, setPracticalGrade] = useState(-1);
  const [workEthicGrade, setWorkEthicGrade] = useState(-1);

  // Update currentUserId whenever the token changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = token ? jwtDecode<{ id: string }>(token) : null;
    setCurrentUserId(decoded ? decoded.id : null);
  }, [localStorage.getItem("token")]); // Ensures re-running when token changes

  useEffect(() => {
  }, [groupId]);

  function fetchGrade() {
    const getGrade = async () => {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/getGrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token
        },
        body: JSON.stringify({ groupId: groupId })
      });

      if (response.ok) {
        const data = await response.json();
        setTotalGrade(data.totalGrade);
        setCooperationGrade(data.cooperationGrade);
        setConceptualGrade(data.conceptualGrade);
        setPracticalGrade(data.practicalGrade);
        setWorkEthicGrade(data.workEthicGrade);
        setExistGrade(true);
      }
    }

    getGrade();
  }

  useEffect(() => {
    fetchGrade();
  }, []);

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
      setGroupName(data.group.name); // Assuming `name` is returned in the response
    }
  };

  // Group fetching logic
  useEffect(() => {
    fetchGroupData();
  }, []);

  const resetRatingsAndFeedback = () => {
    setRatings({
      Cooperation: 0,
      ConceptualContribution: 0,
      PracticalContribution: 0,
      WorkEthic: 0,
    });
    setFeedback({
      CooperationFeedback: '',
      ConceptualContributionFeedback: '',
      PracticalContributionFeedback: '',
      WorkEthicFeedback: '',
    });
  };

  const handleRateStudent = async (student: Student) => {
    setSelectedStudent(student);

    const token = localStorage.getItem('token') || '';

    try {
      // Fetch existing rating for the selected student
      const response = await fetch('http://localhost:3001/getRating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
        body: JSON.stringify({
          groupId,
          rateeId: student._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.rating) {
          // Set the ratings and feedback state with existing data
          setRatings({
            Cooperation: data.rating.CooperationRating || 0,
            ConceptualContribution: data.rating.ConceptualContributionRating || 0,
            PracticalContribution: data.rating.PracticalContributionRating || 0,
            WorkEthic: data.rating.WorkEthicRating || 0,
          });
          setFeedback({
            CooperationFeedback: data.rating.CooperationFeedback || '',
            ConceptualContributionFeedback: data.rating.ConceptualContributionFeedback || '',
            PracticalContributionFeedback: data.rating.PracticalContributionFeedback || '',
            WorkEthicFeedback: data.rating.WorkEthicFeedback || '',
          });
        } else {
          // No existing rating, reset to default
          resetRatingsAndFeedback();
        }
      } else {
        console.error('Failed to fetch existing rating');
        resetRatingsAndFeedback();
      }
    } catch (error) {
      console.error('Error fetching existing rating:', error);
      resetRatingsAndFeedback();
    }
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
      <h2 className="groupNameTitle">{groupName}</h2>
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
                {student._id !== currentUserId ? (
                  <button onClick={() => handleRateStudent(student)}
                    className={student.rated ? 'btn-rated' : 'btn-not-rated'}
                  >
                    {student.rated ? 'Change Rating' : 'Not Rated Yet'}
                  </button>
                ) : (
                  <span>Self</span> // Display "Self" or leave it blank
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal for rating */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Rate {selectedStudent?.firstName} {selectedStudent?.lastName}
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
      <div className="grades">
        {existGrade ? <div>
          <h3>Grades</h3>
          <div>Total Grade: {totalGrade}/5</div>
          <div>Cooperation: {cooperationGrade}/5</div>
          <div>Conceptual Contribution: {conceptualGrade}/5</div>
          <div>Practical Contribution: {practicalGrade}/5</div>
          <div>Work Ethic: {workEthicGrade}/5</div>
        </div>
          :
          <div>
            Not Graded Yet
          </div>
        }
      </div>
    </div>
  );
}

export default StudentGroup;