import {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';

function Home(){
    const navigate = useNavigate();
    const groupNameInput = useRef<HTMLInputElement>(null);
    const [groupName, setGroupName] = useState("");
    const [groups, setGroups] = useState<{_id: String, name: String, students: []}[]>([]);
    const [messageType, setMessageType] = useState("");
    const [message, setMessage] = useState("");

    const createGroup = async () => {

        if (groupName === "") {
            setMessageType("error");
            setMessage("Please enter a team name!");
        }
        else {
            const token = localStorage.getItem('token') || "";
            const response = await fetch("http://localhost:3001/createGroup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token
                },
                body: JSON.stringify({name: groupName})
            });

            if (response.ok) {
                if (groupNameInput.current) {
                    groupNameInput.current.value = "";
                }
                
                setGroupName("");
                updateGroups();
                setMessageType("success");
                setMessage("Group creation success!");
            }
            else {
                setMessageType("error");
                setMessage("An error occurred :(");
            }
        }
    }
    
    const updateGroups = async () => {
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
            setGroups(data.groups || []);
        }
    }
    
    useEffect(() => {
        updateGroups();
    }, []);

    return(
        <div className="home">
            <div className="container">
                <div className='row border-bottom border-secondary pb-3 mb-3'>
                    <div className='col-5'>
                        Number of Groups: {groups.length}
                    </div>
                    <div className='col-7 text-end'>
                        <button onClick={() => createGroup()} className="mr-sm">Create Group</button>
                        <input 
                            ref={groupNameInput}
                            placeholder="Group Name"
                            onChange={(e) => {setGroupName(e.target.value)}}
                            className={messageType == "error" ? "border border-danger" : ""}>
                        </input>
                        <br /> {message == "" ? null : <small className={messageType == "error" ? "text-danger" : "text-success"}>{message}</small>}
                    </div>
                </div>
    
                <div className='row'>
                    {groups.map((group) => 
                        <div key={String(group._id)} className="col-12 mb-3">
                            <div className="card" onClick={() => navigate("/instructor/group/" + group._id)}>
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

export default Home;