import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

function Home() {
  const navigate = useNavigate();
  const groupNameInput = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState("");
  const [groups, setGroups] = useState<
    { _id: string; name: string; students: [] }[]
  >([]);
  const [courses, setCourses] = useState<
    { _id: string; courseCode: string; name: string; groups: any[] }[]
  >([]);
  const [messageType, setMessageType] = useState("");
  const [message, setMessage] = useState("");

  // Course creation state
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");

  // State for handling the rename modal
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [groupToRename, setGroupToRename] = useState<{
    id: string;
    currentName: string;
  } | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  // State for handling the confirmation modal for deletion
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  useEffect(() => {
    updateGroups();
    updateCourses();
  }, []);

  const createGroup = async () => {
    if (groupName === "") {
      setMessageType("error");
      setMessage("Please enter a team name!");
    } else {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("http://localhost:3001/createGroup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({ name: groupName }),
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
    const token = localStorage.getItem("token") || "";
    const response = await fetch("http://localhost:3001/getUnassignedGroups", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setGroups(data.groups || []);
    } else {
      setMessageType("error");
      setMessage("Error fetching groups");
    }
  };

  const updateCourses = async () => {
    const token = localStorage.getItem("token") || "";
    const response = await fetch("http://localhost:3001/getCourses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    });

    if (response.ok) {
      const data = await response.json();
      setCourses(data.courses || []);
    } else {
      setMessageType("error");
      setMessage("Error fetching courses");
    }
  };

  const createCourse = async () => {
    if (courseCode === "" || courseName === "") {
      setMessageType("error");
      setMessage("Please enter both course code and name!");
    } else {
      const token = localStorage.getItem("token") || "";
      const response = await fetch("http://localhost:3001/createCourse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({ courseCode, name: courseName }),
      });

      if (response.ok) {
        setCourseCode("");
        setCourseName("");
        updateCourses();
        setMessageType("success");
        setMessage("Course created successfully!");
      } else {
        setMessageType("error");
        setMessage("An error occurred while creating the course");
      }
    }
  };

  const deleteGroup = async () => {
    if (!groupToDelete) return;

    const token = localStorage.getItem("token") || "";
    const response = await fetch("http://localhost:3001/removeGroup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify({ groupId: groupToDelete }),
    });

    if (response.ok) {
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupToDelete)
      );
      // Also remove the group from any course it might be in
      setCourses((prevCourses) =>
        prevCourses.map((course) => ({
          ...course,
          groups: course.groups.filter((g: any) => g._id !== groupToDelete),
        }))
      );
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

  const openRenameModal = (
    groupId: string,
    currentName: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setGroupToRename({ id: groupId, currentName });
    setNewGroupName(currentName);
    setShowRenameModal(true);
  };

  const renameGroup = async () => {
    if (!groupToRename || newGroupName.trim() === "") {
      setMessageType("error");
      setMessage("Please enter a new name!");
      return;
    }

    const token = localStorage.getItem("token") || "";
    const response = await fetch("http://localhost:3001/changeGroupName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify({
        groupId: groupToRename.id,
        newName: newGroupName,
      }),
    });

    if (response.ok) {
      // Update groups and courses in state
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupToRename.id
            ? { ...group, name: newGroupName }
            : group
        )
      );
      setCourses((prevCourses) =>
        prevCourses.map((course) => ({
          ...course,
          groups: course.groups.map((group: any) =>
            group._id === groupToRename.id
              ? { ...group, name: newGroupName }
              : group
          ),
        }))
      );
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

  const confirmDeleteGroup = (groupId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setGroupToDelete(groupId);
    setShowConfirmModal(true);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return; // Dropped outside any droppable area

    if (
      source.droppableId === "unassigned-groups" &&
      destination.droppableId.startsWith("course-")
    ) {
      // Add group to course
      const courseId = destination.droppableId.replace("course-", "");
      addGroupToCourse(courseId, draggableId);
    } else if (
      source.droppableId.startsWith("course-") &&
      destination.droppableId === "unassigned-groups"
    ) {
      // Remove group from course
      const courseId = source.droppableId.replace("course-", "");
      removeGroupFromCourse(courseId, draggableId);
    } else if (
      source.droppableId.startsWith("course-") &&
      destination.droppableId.startsWith("course-") &&
      source.droppableId !== destination.droppableId
    ) {
      // Move group from one course to another
      const sourceCourseId = source.droppableId.replace("course-", "");
      const destCourseId = destination.droppableId.replace("course-", "");
      moveGroupBetweenCourses(sourceCourseId, destCourseId, draggableId);
    }
  };

  const addGroupToCourse = async (courseId: string, groupId: string) => {
    // Find the group being moved
    const group = groups.find((g) => g._id === groupId);
    if (!group) return;

    // Update local state optimistically
    setGroups((prevGroups) => prevGroups.filter((g) => g._id !== groupId));
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course._id === courseId
          ? { ...course, groups: [...course.groups, group] }
          : course
      )
    );

    // Make backend call
    const token = localStorage.getItem("token") || "";
    const response = await fetch("http://localhost:3001/addGroupToCourse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify({ courseId, groupId }),
    });

    if (!response.ok) {
      // If backend call fails, revert the state
      setGroups((prevGroups) => [...prevGroups, group]);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? {
                ...course,
                groups: course.groups.filter((g: any) => g._id !== groupId),
              }
            : course
        )
      );
      setMessageType("error");
      setMessage("Error adding group to course");
    } else {
      setMessageType("success");
      setMessage("Group added to course successfully");
    }
  };

  const removeGroupFromCourse = async (courseId: string, groupId: string) => {
    // Find the group being moved
    const course = courses.find((c) => c._id === courseId);
    const group = course?.groups.find((g: any) => g._id === groupId);
    if (!group) return;

    // Update local state optimistically
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course._id === courseId
          ? {
              ...course,
              groups: course.groups.filter((g: any) => g._id !== groupId),
            }
          : course
      )
    );
    setGroups((prevGroups) => [...prevGroups, group]);

    // Make backend call
    const token = localStorage.getItem("token") || "";
    const response = await fetch(
      "http://localhost:3001/removeGroupFromCourse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({ courseId, groupId }),
      }
    );

    if (!response.ok) {
      // If backend call fails, revert the state
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId
            ? { ...course, groups: [...course.groups, group] }
            : course
        )
      );
      setGroups((prevGroups) => prevGroups.filter((g) => g._id !== groupId));
      setMessageType("error");
      setMessage("Error removing group from course");
    } else {
      setMessageType("success");
      setMessage("Group removed from course successfully");
    }
  };

  const moveGroupBetweenCourses = async (
    sourceCourseId: string,
    destCourseId: string,
    groupId: string
  ) => {
    // Find the group being moved
    const sourceCourse = courses.find((c) => c._id === sourceCourseId);
    const group = sourceCourse?.groups.find((g: any) => g._id === groupId);
    if (!group) return;

    // Update local state optimistically
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course._id === sourceCourseId) {
          return {
            ...course,
            groups: course.groups.filter((g: any) => g._id !== groupId),
          };
        } else if (course._id === destCourseId) {
          return {
            ...course,
            groups: [...course.groups, group],
          };
        } else {
          return course;
        }
      })
    );

    // Make backend calls
    const token = localStorage.getItem("token") || "";

    // Remove group from source course
    const removeResponse = await fetch(
      "http://localhost:3001/removeGroupFromCourse",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({ courseId: sourceCourseId, groupId }),
      }
    );

    // Add group to destination course
    const addResponse = await fetch("http://localhost:3001/addGroupToCourse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token,
      },
      body: JSON.stringify({ courseId: destCourseId, groupId }),
    });

    if (!removeResponse.ok || !addResponse.ok) {
      // If any backend call fails, revert the state
      setCourses((prevCourses) =>
        prevCourses.map((course) => {
          if (course._id === sourceCourseId) {
            return { ...course, groups: [...course.groups, group] };
          } else if (course._id === destCourseId) {
            return {
              ...course,
              groups: course.groups.filter((g: any) => g._id !== groupId),
            };
          } else {
            return course;
          }
        })
      );
      setMessageType("error");
      setMessage("Error moving group between courses");
    } else {
      setMessageType("success");
      setMessage("Group moved between courses successfully");
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="home">
        <div className="container">
          {/* Combined Group and Course Creation Section */}
          <div className="row align-items-center mb-3">
            {/* Create Group */}
            <div className="col-6 d-flex align-items-center">
              <div
                id="create-btn"
                className="ml-auto d-flex align-items-center"
              >
                <button onClick={createGroup} className="mr-sm">
                  Create Group
                </button>
                <input
                  ref={groupNameInput}
                  placeholder="Group Name"
                  onChange={(e) => {
                    setGroupName(e.target.value);
                  }}
                  className={
                    messageType === "error" ? "border border-danger" : ""
                  }
                />
                <span>Groups: {groups.length}</span>
              </div>
            </div>

            {/* Create Course */}
            <div className="col-6 d-flex align-items-center">
              <div
                id="create-course-btn"
                className="ml-auto d-flex align-items-center"
              >
                <button onClick={createCourse} className="mr-sm">
                  Create Course
                </button>
                <input
                  placeholder="Course Code"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className={
                    messageType === "error" ? "border border-danger" : ""
                  }
                />
                <input
                  placeholder="Course Name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className={
                    messageType === "error" ? "border border-danger" : ""
                  }
                />
                <span>Courses: {courses.length}</span>
              </div>
            </div>
          </div>

          {/* Unassigned Groups */}
          <div className="unassigned-groups-container">
            <h4>Unassigned Groups</h4>
            <Droppable droppableId="unassigned-groups" direction="horizontal">
              {(provided) => (
                <div
                  className="groups-container"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {groups.map((group, index) => (
                    <Draggable
                      key={group._id}
                      draggableId={group._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="group-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {/* Group card content */}
                          <div
                            className="card"
                            onClick={() =>
                              navigate("/instructor/group/" + group._id)
                            }
                          >
                            {/* X button to delete the group */}
                            <button
                              className="card-close"
                              onClick={(event) =>
                                confirmDeleteGroup(group._id, event)
                              }
                            >
                              &times;
                            </button>
                            <div className="card-body">
                              <h5 className="card-title">
                                {group.name}
                                <span
                                  onClick={(event) =>
                                    openRenameModal(
                                      group._id,
                                      group.name,
                                      event
                                    )
                                  }
                                  title="Rename Group"
                                  className="rename-icon"
                                >
                                  &#9998;
                                </span>
                              </h5>
                              <p className="card-text">
                                Students: {group.students.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Courses */}
          <div className="courses-section">
            {courses.map((course) => (
              <div key={course._id} className="course-container">
                <h4>
                  {course.name} ({course.courseCode})
                </h4>
                <Droppable
                  droppableId={`course-${course._id}`}
                  direction="horizontal"
                >
                  {(provided) => (
                    <div
                      className="course-groups"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {course.groups.map((group: any, index: number) => (
                        <Draggable
                          key={group._id}
                          draggableId={group._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              className="group-card"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {/* Group card content */}
                              <div
                                className="card"
                                onClick={() =>
                                  navigate("/instructor/group/" + group._id)
                                }
                              >
                                {/* X button to delete the group */}
                                <button
                                  className="card-close"
                                  onClick={(event) =>
                                    confirmDeleteGroup(group._id, event)
                                  }
                                >
                                  &times;
                                </button>
                                <div className="card-body">
                                  <h5 className="card-title">
                                    {group.name}
                                    <span
                                      onClick={(event) =>
                                        openRenameModal(
                                          group._id,
                                          group.name,
                                          event
                                        )
                                      }
                                      title="Rename Group"
                                      className="rename-icon"
                                    >
                                      &#9998;
                                    </span>
                                  </h5>
                                  <p className="card-text">
                                    Students: {group.students.length}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
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
              <p>
                Are you sure you want to delete this group? This action cannot
                be undone.
              </p>
              <button onClick={deleteGroup} className="btn btn-danger">
                Confirm
              </button>
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
              <button onClick={renameGroup} className="btn btn-primary mt-3">
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}

export default Home;
