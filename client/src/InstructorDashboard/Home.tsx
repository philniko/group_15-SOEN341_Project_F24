import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const groupNameInput = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<{ _id: string, name: string, students: [] }[]>([]);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");

  // State for handling the confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

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
        body: JSON.stringify({ name: groupName })
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

  // Function to delete a group
  const deleteGroup = async () => {
    if (!groupToDelete) return; // No group selected for deletion

    const token = localStorage.getItem('token') || "";
    const response = await fetch("http://localhost:3001/removeGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      },
      body: JSON.stringify({ groupId: groupToDelete })
    });

    if (response.ok) {
      setGroups(groups.filter(group => group._id !== groupToDelete));
      setMessageType("success");
      setMessage("Group deleted successfully");
    } else {
      const data = await response.json();
      setMessageType("error");
      setMessage(data.message || "An error occurred while deleting the group");
    }
    
    // Close modal and reset state
    setShowConfirmModal(false);
    setGroupToDelete(null);
  }

  useEffect(() => {
    updateGroups();
  }, []);

  // Function to handle delete confirmation
  const confirmDeleteGroup = (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent card click
    setGroupToDelete(groupId); // Set the group to be deleted
    setShowConfirmModal(true); // Show the confirmation modal
  };

  return (
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
              onChange={(e) => { setGroupName(e.target.value) }}
              className={messageType == "error" ? "border border-danger" : ""}>
            </input>
            <br /> {message == "" ? null : <small className={messageType == "error" ? "text-danger" : "text-success"}>{message}</small>}
          </div>
        </div>

        <div className='row'>
          {groups.map((group) =>
            <div key={String(group._id)} className="col-12 mb-3">
              <div className="card" onClick={() => navigate("/instructor/group/" + group._id)}>
                {/* X button to delete the group */}
                <button
                  className="card-close"
                  onClick={(event) => {
                    event.stopPropagation();
                    confirmDeleteGroup(group._id,event);
                  }}
                >
                  &times;
                </button>
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
      {/* Confirmation Modal for Group Deletion */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="modal-close"
            >
              &times;
            </button>
            <h5>Confirm Deletion</h5>
            <p>Are you sure you want to delete this group? This action cannot be undone.</p>
            <button onClick={deleteGroup} className="btn btn-danger">Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
