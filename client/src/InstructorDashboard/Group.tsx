import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Group() {
  const { groupId } = useParams();
  const studentEmailInput = useRef<HTMLInputElement>(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [students, setStudents] = useState<
    {
      _id: string;
      firstName: string;
      lastName: string;
      overallGrade: string;
    }[]
  >([]);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // State for handling the confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const updateStudents = async () => {
    const token = localStorage.getItem("token") || "";
    const response = await fetch("http://localhost:3001/getGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify({ id: groupId }),
    });

    if (response.ok) {
      const data = await response.json();
      setStudents(data.group.students || []);
    }
  };

  const addStudent = async () => {
    if (studentEmail === "") {
      setMessageType("error");
      setMessage("Please enter a student email!");
    } else {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("http://localhost:3001/addStudent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({ groupId: groupId, userEmail: studentEmail }),
      });

      if (response.ok) {
        if (studentEmailInput.current) {
          studentEmailInput.current.value = "";
        }

        setStudentEmail("");
        updateStudents();
        setMessageType("success");
        setMessage("Student successfully added!");
      } else if (response.status === 400) {
        const data = await response.json();
        setMessageType(data.type);
        setMessage(data.message);
      } else {
        setMessageType("error");
        setMessage("An error occurred :(");
      }
    }
  };

  useEffect(() => {
    updateStudents();
  }, []);

  // Function to remove a student from the group
  const removeStudent = async () => {
    if (!studentToDelete) return; // Ensure a student is selected

    const token = localStorage.getItem("token") || "";
    const response = await fetch("http://localhost:3001/removeStudent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify({ groupId: groupId, studentId: studentToDelete }),
    });

    if (response.ok) {
      setMessageType("success");
      setMessage("Student removed successfully!");
      updateStudents(); // Refresh the student list
    } else {
      const data = await response.json();
      setMessageType("error");
      setMessage(
        data.message || "An error occurred while removing the student."
      );
    }

    // Close modal and reset state
    setShowConfirmModal(false);
    setStudentToDelete(null);
  };

  const confirmRemoveStudent = (studentId: string) => {
    setStudentToDelete(studentId); // Set the student to be removed
    setShowConfirmModal(true); // Show the confirmation modal
  };

  return (
    <div className="home">
      <div className="container">
        <div className="row border-bottom border-secondary pb-3 mb-3 align-items-center">
          <div className="col-5">Number of Students: {students.length}</div>
          <div className="col-7 text-end" id="create-btn">
            <button onClick={() => addStudent()}>Add Student</button>
            <input
              ref={studentEmailInput}
              placeholder="Student Email"
              onChange={(e) => {
                setStudentEmail(e.target.value);
              }}
              className={messageType === "error" ? "border border-danger" : ""}
            ></input>
            <br />{" "}
            {message === "" ? null : (
              <small
                className={
                  messageType === "error" ? "text-danger" : "text-success"
                }
              >
                {message}
              </small>
            )}
          </div>
        </div>

        <div className="row">
          {students.map((student) => (
            <div
              key={String(student._id)}
              className="col-12 mb-3"
              onClick={() => navigate(`student/${student._id}`)}
            >
              <div className="card">
                {/* X button to delete the student */}
                <button
                  className="card-close"
                  onClick={(event) => {
                    event.stopPropagation(); // Prevents the card's onClick from firing
                    confirmRemoveStudent(student._id);
                  }}
                >
                  &times;
                </button>
                <div className="card-body">
                  <h5 className="card-title">
                    {student.firstName + " " + student.lastName}
                  </h5>
                  <p className="card-text">
                    Overall Grade: {student.overallGrade}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="modal-close"
            >
              &times;
            </button>
            <h5>Confirm Removal</h5>
            <p>
              Are you sure you want to remove this student from the group? All
              ratings made by and given to this student will be lost!
            </p>
            <button onClick={removeStudent} className="btn btn-danger">
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Group;
