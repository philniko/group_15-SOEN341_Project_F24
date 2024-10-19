import {useEffect, useState} from 'react'
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

function Home(){
    const [students, setStudents] = useState([]); // To store group members
    const [selectedStudent, setSelectedStudent] = useState(null); // To store the selected student for rating
    const [showModal, setShowModal] = useState(false); // To control pop-up visibility
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

    useEffect(() => {
        // Fetch group and student info
        async function fetchStudents() {
            const token = localStorage.getItem('token') || '';
            const response = await axios.post('http://localhost:3001/getGroup', {
                headers: {
                    'x-access-token': token,
                }
            });
            setStudents(response.data.students);
        }

        fetchStudents();
    }, []);

    // Function to handle "Not Rated Yet" or "Change Rating" click
    const handleRateStudent = (student) => {
        setSelectedStudent(student);
        setShowModal(true);

        // If it's "Change Rating," fetch previous rating and fill the form
        if (student.rated) {
            // Fetch and populate ratings (API call)
        }
    };

    const handleRatingChange = (attribute, value) => {
        setRatings({ ...ratings, [attribute]: value });
    };

    const handleSubmitRating = async () => {
        const token = localStorage.getItem('token') || '';
        const ratingData = {
            raterEmail: "your-email@example.com", // Replace with logged-in user's email
            studentId: selectedStudent._id,
            ...ratings,
            ...feedback
        };

        const response = await axios.post('http://localhost:3001/saveRating', ratingData, {
            headers: { 'x-access-token': token }
        });

        if (response.status === 200) {
            setShowModal(false);
            setStudents(students.map(student => {
                if (student._id === selectedStudent._id) {
                    student.rated = true;
                }
                return student;
            }));
        }
    };

    return (
        <div className="container">
            {students.length > 0 && (
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
                    {students.map(student => (
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
            )}

            {/* Modal for rating */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Rate {selectedStudent?.firstName} {selectedStudent?.lastName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="rating-section">
                        {/* Cooperation Rating */}
                        <div>
                            <strong>Cooperation</strong>
                            {[1, 2, 3, 4].map(value => (
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
                        {/* Similar structure for other attributes... */}
                        {/* Conceptual Contribution, Practical Contribution, Work Ethic */}
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

export default Home;

export default Home;