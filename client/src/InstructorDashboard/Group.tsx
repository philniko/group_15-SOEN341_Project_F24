import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

function Group() {
  const { id } = useParams();
  const studentEmailInput = useRef<HTMLInputElement>(null);
  const [studentEmail, setStudentEmail] = useState("");
  const [students, setStudents] = useState<{ _id: string, firstName: string, lastName: string }[]>([]);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");

  const updateStudents = async () => {
    const token = localStorage.getItem('token') || "";
    const response = await fetch("http://localhost:3001/getGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      },
      body: JSON.stringify({ id: id })
    });

    if (response.ok) {
      const data = await response.json();
      setStudents(data.group.students || []);
    }
  }

  const addStudent = async () => {

    if (studentEmail === "") {
      setMessageType("error");
      setMessage("Please enter a student email!");
    }
    else {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("http://localhost:3001/addStudent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token
        },
        body: JSON.stringify({ groupId: id, userEmail: studentEmail })
      });

      if (response.ok) {
        if (studentEmailInput.current) {
          studentEmailInput.current.value = "";
        }

        setStudentEmail("");
        updateStudents();
        setMessageType("success");
        setMessage("Student successfully added!");
      }
      else if (response.status == 400) {
        const data = await response.json();
        setMessageType(data.type);
        setMessage(data.message);
      }
      else {
        setMessageType("error");
        setMessage("An error occurred :(");
      }
    }
  }

  useEffect(() => {
    updateStudents();
  }, []);

  return (
    <div className="home">
      <div className="container">
        <div className='row border-bottom border-secondary pb-3 mb-3'>
          <div className='col-5'>
            Number of Students: {students.length}
          </div>
          <div className='col-7 text-end'>
            <button onClick={() => addStudent()}>Add Student</button>
            <input
              ref={studentEmailInput}
              placeholder="Student Email"
              onChange={(e) => { setStudentEmail(e.target.value) }}
              className={messageType == "error" ? "border border-danger" : ""}>
            </input>
            <br /> {message == "" ? null : <small className={messageType == "error" ? "text-danger" : "text-success"}>{message}</small>}
          </div>
        </div>

        <div className='row'>
          {students.map((student) =>
            <div key={String(student._id)} className="col-12 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{student.firstName + " " + student.lastName}</h5>
                  <p className="card-text">
                    Overall Grade: {"TODO" /*TODO*/}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Group;
