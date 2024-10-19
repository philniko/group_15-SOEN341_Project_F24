import {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';

function Group() {
    let { id } = useParams();
    const [studentEmail, setStudentEmail] = useState("");
    const [students, setStudents] = useState<{_id: string, firstName: string, lastName: string}[]>([]);

    let updateStudents = async () => {
        const token = localStorage.getItem('token') || "";
        const response = await fetch("http://localhost:3001/getGroup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            body: JSON.stringify({id: id})
        });

        if (response.ok) {
            let data = await response.json();
            setStudents(data.group.students || []);
        }
    }
    
    let addStudent = async () => {
        const token = localStorage.getItem("token") || "";
        const response = await fetch("http://localhost:3001/addStudent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": token
            },
            body: JSON.stringify({groupId: id, userEmail: studentEmail})
        });

        if (response.ok) {
            setStudentEmail("");
            updateStudents();
        }
    }

    useEffect(() => {
        updateStudents();
    }, []);

    return(
        <div className="home">
            <div className="container">
                <div className='row border-bottom border-secondary pb-3 mb-3'>
                    <div className='col-5'>
                        Number of Students: {students.length}
                    </div>
                    <div className='col-7 text-end'>
                        <input onChange={(e) => {setStudentEmail(e.target.value)}}></input>
                        <button onClick={() => addStudent()}>Add Student</button>
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