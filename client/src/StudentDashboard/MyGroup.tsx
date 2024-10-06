import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";




function MyGroup() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [newGroupName, setNewGroupName] = useState('');

    useEffect(() => {
        const fetchGroups = async () => {
            const token = localStorage.getItem('token') || '';
            if (token) {
                const decodedToken: any = jwtDecode(token);
                setUser(decodedToken);
            }
            try {
                const response = await fetch("http://localhost:3001/getGroups", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-access-token": token
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch groups");
                }

                const data = await response.json();
                setGroups(data.groups);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    const handleCreateGroup = async () => {
        const token = localStorage.getItem('token') || '';
        try {
            const response = await fetch("http://localhost:3001/createGroup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token
                },
                body: JSON.stringify({ name: newGroupName })
            });

            if (!response.ok) {
                throw new Error("Failed to create group");
            }

            const newGroup = await response.json();
            setGroups([...groups, newGroup]); // Add the newly created group to the list
            setNewGroupName(''); // Clear the input field after creation
        } catch (error: any) {
            setError(error.message);
        }
    };

    if (loading) {
        return <div className="text-center mt-4"><p>Loading groups...</p></div>;
    }

    if (error) {
        return <div className="text-center mt-4"><p>Error: {error}</p></div>;
    }

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>My Groups</h1>
                {user.role === 'instructor' && ( // Conditionally render the Create Group button if user is an instructor
                    <div>
                        <input
                            type="text"
                            className="form-control d-inline-block w-auto mr-2"
                            placeholder="Group Name"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleCreateGroup}>Create Group</button>
                    </div>
                )}
            </div>
            {groups.length === 0 ? (
                <p>No groups found</p>
            ) : (
                <div className="row">
                    {groups.map(group => (
                        <div className="col-md-4 mb-4" key={group._id}>
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title">{group.name}</h5>
                                    <h6 className="card-subtitle mb-2 text-muted">
                                        Instructor: {group.instructor.firstName} {group.instructor.lastName}
                                        {group.instructor._id === user.id ? ' (me)' : ''}
                                    </h6>
                                    <p className="card-text">
                                        Number of students: {group.students.length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyGroup;
