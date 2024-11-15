import axios from "axios";
import fs from "fs";

const baseURL = "http://localhost:3001";

(async () => {
  try {
    // Step 1: Load users from JSON files
    const students = JSON.parse(fs.readFileSync("./students.json", "utf-8"));
    const instructors = JSON.parse(
      fs.readFileSync("./instructors.json", "utf-8")
    );

    const users = [...students, ...instructors];
    const userTokens = {};

    // Step 2: Register users
    for (const user of users) {
      try {
        // Register user
        await axios.post(`${baseURL}/register`, user);
        console.log(`Registered: ${user.email}`);

        // Log in the user to get a token
        const loginResponse = await axios.post(`${baseURL}/login`, {
          email: user.email,
          password: user.password,
        });
        userTokens[user.email] = loginResponse.data.token;
        console.log(`Logged in: ${user.email}`);
      } catch (error) {
        console.error(
          `Error with ${user.email}:`,
          error.response?.data || error.message
        );
      }
    }

    // Step 3: Create groups for each instructor
    const totalStudents = students.length;
    const totalInstructors = instructors.length;

    // Calculate base students per instructor and distribute extras
    const baseStudentsPerInstructor = Math.floor(
      totalStudents / totalInstructors
    );
    const extraStudents = totalStudents % totalInstructors;

    // Shuffle students before distribution
    function shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5);
    }

    const shuffledStudents = shuffleArray(students);

    let studentIndex = 0;

    for (let i = 0; i < instructors.length; i++) {
      const instructor = instructors[i];
      const token = userTokens[instructor.email];
      if (!token) continue;

      console.log(`Creating groups for instructor: ${instructor.email}`);
      const groupSize = 5;
      let groupIndex = 0;

      // Determine the number of students for this instructor
      const numStudentsForInstructor =
        baseStudentsPerInstructor + (i < extraStudents ? 1 : 0);

      // Get the subset of students for this instructor
      const instructorStudents = shuffledStudents.slice(
        studentIndex,
        studentIndex + numStudentsForInstructor
      );

      console.log(
        `Instructor ${instructor.email} has ${instructorStudents.length} students assigned.`
      );

      studentIndex += numStudentsForInstructor;

      while (groupIndex < instructorStudents.length) {
        const groupStudents = instructorStudents.slice(
          groupIndex,
          groupIndex + groupSize
        );

        const groupName = `${instructor.firstName}'s Group ${Math.ceil(
          (groupIndex + 1) / groupSize
        )}`;

        console.log(
          `Assigning ${groupStudents.length} students to ${groupName}`
        );

        try {
          // Create group
          const groupResponse = await axios.post(
            `${baseURL}/createGroup`,
            { name: groupName },
            { headers: { "x-access-token": token } }
          );
          console.log(`Created group: ${groupName}`);

          const groupId = groupResponse.data._id;

          // Add students to the group
          for (const student of groupStudents) {
            const studentToken = userTokens[student.email];
            if (!studentToken) continue;

            await axios.post(
              `${baseURL}/addStudent`,
              { groupId, userEmail: student.email },
              { headers: { "x-access-token": token } }
            );
            console.log(
              `Added student ${student.email} to group: ${groupName}`
            );
          }
        } catch (error) {
          console.error(
            `Error creating group for ${instructor.email}:`,
            error.response?.data || error.message
          );
        }

        groupIndex += groupSize;
      }
    }

    // Step 4: Add random ratings from student to student
    for (const student of students) {
      const token = userTokens[student.email];
      if (!token) continue;

      try {
        // Fetch the student's group
        const studentGroupsResponse = await axios.post(
          `${baseURL}/getStudentGroup`,
          {},
          { headers: { "x-access-token": token } }
        );
        const group = studentGroupsResponse.data.group;

        if (!group || !group.students || group.students.length < 2) continue;

        // Find the student's own ID from the group students
        const selfStudent = group.students.find(
          (s) => s.email === student.email
        );
        if (!selfStudent) {
          console.error(`Student ${student.email} not found in their group`);
          continue;
        }

        const studentId = selfStudent._id;

        // Add ratings to other students in the same group
        for (const ratee of group.students) {
          // Convert IDs to strings before comparing
          if (ratee._id.toString() === studentId.toString()) continue;

          const ratingPayload = {
            rateeId: ratee._id,
            groupId: group._id,
            Cooperation: Math.floor(Math.random() * 5) + 1,
            ConceptualContribution: Math.floor(Math.random() * 5) + 1,
            PracticalContribution: Math.floor(Math.random() * 5) + 1,
            WorkEthic: Math.floor(Math.random() * 5) + 1,
            CooperationFeedback: "Good teamwork!",
            ConceptualContributionFeedback: "Great ideas!",
            PracticalContributionFeedback: "Very practical contributions.",
            WorkEthicFeedback: "Strong work ethic.",
          };

          await axios.post(`${baseURL}/saveRating`, ratingPayload, {
            headers: { "x-access-token": token },
          });
          console.log(
            `Student ${student.email} rated ${ratee.email} in group ${group.name}`
          );
        }
      } catch (error) {
        console.error(
          `Error adding ratings for ${student.email}:`,
          error.response?.data || error.message
        );
      }
    }

    console.log("Finished processing all users, groups, and ratings.");
  } catch (error) {
    console.error("General error:", error.message);
  }
})();
