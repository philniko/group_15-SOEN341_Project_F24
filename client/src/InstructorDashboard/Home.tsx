import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const groupNameInput = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<{ _id: string, name: string, students: [] }[]>([]);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");

  // State for handling the rename modal
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [groupToRename, setGroupToRename] = useState<{ id: string, currentName: string } | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  // State for handling the confirmation modal for deletion
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const createGroup = async () => {
    if (groupName === "") {
      setMessageType("error");
      setMessage("Please enter a team name!");
    } else {
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
      } else {
        setMessageType("error");
        setMessage("An error occurred :(");
      }
    }
  };

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
  };

  useEffect(() => {
    updateGroups();
  }, []);

  // Function to delete a group
  const deleteGroup = async () => {
    if (!groupToDelete) return;

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
  };

  // Function to open the rename modal
  const openRenameModal = (groupId: string, currentName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setGroupToRename({ id: groupId, currentName });
    setNewGroupName(currentName);
    setShowRenameModal(true);
  };

  // Function to handle renaming the group
  const renameGroup = async () => {
    if (!groupToRename || newGroupName.trim() === "") {
      setMessageType("error");
      setMessage("Please enter a new name!");
      return;
    }

    const token = localStorage.getItem('token') || "";
    const response = await fetch("http://localhost:3001/changeGroupName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      },
      body: JSON.stringify({ groupId: groupToRename.id, newName: newGroupName })
    });

    if (response.ok) {
      setGroups(groups.map(group =>
        group._id === groupToRename.id ? { ...group, name: newGroupName } : group
      ));
      setMessageType("success");
      setMessage("Group name updated successfully");
    } else {
      setMessageType("error");
      setMessage("An error occurred while renaming the group");
    }

    // Close modal and reset state
    setShowRenameModal(false);
    setGroupToRename(null);
  };

  // Function to handle delete confirmation
  const confirmDeleteGroup = (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setGroupToDelete(groupId);
    setShowConfirmModal(true);
  };

  return (
    <div className="home">
      <div className="container">
        <div className="row border-bottom border-secondary pb-3 mb-3 align-items-center">
          <div className="col-5">
            Number of Groups: {groups.length}
          </div>
          <div className="col-7 text-end" id="create-btn">
            <button onClick={() => createGroup()} className="mr-sm">Create Group</button>
            <input
              ref={groupNameInput}
              placeholder="Group Name"
              onChange={(e) => { setGroupName(e.target.value) }}
              className={messageType === "error" ? "border border-danger" : ""}
            />
            <br />
            {message === "" ? null : (
              <small className={messageType === "error" ? "text-danger" : "text-success"}>{message}</small>
            )}
          </div>
        </div>

        <div className='row'>
          {groups.map((group) =>
            <div key={String(group._id)} className="col-12 mb-3">
              <div className="card" onClick={() => navigate("/instructor/group/" + group._id)}>
                {/* X button to delete the group */}
                <button
                  className="card-close"
                  onClick={(event) => confirmDeleteGroup(group._id, event)}
                >
                  &times;
                </button>
                <div className="card-body">
                  <h5 className="card-title">
                    {group.name}
                    <span
                      onClick={(event) => openRenameModal(group._id, group.name, event)}
                      title="Rename Group"
                      className="rename-icon"
                    >
                      &#9998;
                    </span>
                  </h5>
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

      {/* Rename Modal for Group Name Update */}
      {showRenameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowRenameModal(false)}
              className="modal-close"
            >
              &times;
            </button>
            <h5>Rename Group</h5>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter new group name"
              className="form-control"
            />
            <button onClick={renameGroup} className="btn btn-primary mt-3">Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
