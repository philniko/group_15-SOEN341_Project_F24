import axios from "axios";
import fs from "fs";

const baseURL = "http://localhost:3001/register";

(async () => {
  try {
    // Read students.json and instructors.json
    const students = JSON.parse(fs.readFileSync("./students.json", "utf-8"));
    const instructors = JSON.parse(fs.readFileSync("./instructors.json", "utf-8"));

    // Combine the two arrays
    const users = [...students, ...instructors];

    // Iterate over each user and send a POST request
    for (const user of users) {
      try {
        const response = await axios.post(baseURL, user);
      } catch (error) {
        console.error("Error creating user:", error.response?.data || error.message);
      }
    }
    console.log("Users created successfully!");
  } catch (error) {
    console.error("Error reading JSON files:", error.message);
  }
})();
