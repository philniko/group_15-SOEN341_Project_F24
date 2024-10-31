import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<{ _id: string, name: string, students: [] }[]>([]);

  const getStudentGroups = async () => {
    const token = localStorage.getItem('token') || "";
    const response = await fetch("http://localhost:3001/getGroups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Fetched groups:", data);
      setGroups(data.groups || []);
    }
  }

  useEffect(() => {
    getStudentGroups();
  }, []);

  return (
    <div className="home">
      <div className="container">
        <div className='row'>
          {groups.map((group) =>
            <div key={String(group._id)} className="col-12 mb-3">
              <div className="card" onClick={() => navigate("/student/group/" + group._id)}>
                <div className="card-body">
                  <h5 className="card-title">{group.name}</h5>
                  <p className="card-text">
                    Number of Students: {group.students.length}
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

export default Home
