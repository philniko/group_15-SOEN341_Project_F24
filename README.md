# group_15-SOEN341_Project_F24

## Table of Contents
- [Description](#description)
- [Usage](#usage)
  - [Installation and Setup](#installation-and-setup)
  - [Application Usage](#application-usage)
    - [Student](#student)
    - [Instructor](#instructor)
- [Team Members](#team-members)

## Description

**group_15-SOEN341_Project_F24 is a peer assessment system targeted towards university-level team projects!** It allows students to both give and receive valuable feedback for individual contributions made in an anonymous way, promoting collaboration and accountability. It is also a way for instructors to evaluate the individual contributions of students, ensuring work was distributed in an equitable fashion.

Student users are evaluated by 4 categories:

- **Cooperation**
- **Conceptual Contribution**
- **Practical Contribution**
- **Work Ethic**

After every student participant has submitted their assessment for every other student in their team, they may gain access to the results of their peer-reviewed evaluation. Students may not know what individual values were given to each category; they will only have access to an aggregate value received for every category.

After every student in a given team has submitted their evaluation, the instructor will receive the calculated grade of each student and have access to a more detailed breakdown of how grades were calculated. This breakdown may then be exported to a CSV file for later use.

## Usage

### Installation and Setup

To run the application locally:

1. Navigate to the **client** folder and run:
   ```bash
   npm install
   npm run dev
   ```
2. Navigate to the **server** folder and run:
   ```bash
   npm install
   npm start
   ```
3. Ensure you have a **MongoDB** database running on your machine with port **27017** (default MongoDB port). If MongoDB is not installed, you can download it from the [MongoDB Download Center](https://www.mongodb.com/try/download/community).

### Application Usage

#### Student

- After signing in, the **student** has access to **groups** that any **instructor** has placed them in.
- Inside a **group**, a student can give **ratings** in the **4 categories** to each teammate within the same group.

#### Instructor

- After signing in, the **instructor** has access to **groups** they have created and can also **create** new ones.
- For each group, the **instructor** can add **students** and view the ratings of each student given by the rest of the team.

## Team Members

- **Charles Partous** (40175854) | Front-End
- **Zachary Corber** (40246724) | Front-End
- **Carlo Ramadori** (40243639) | Front-End
- **Omar Chabti** (40262497) | Back-End
- **Kevin Liu** (40281197) | Back-End
- **Philippe Nikolov** (40245641) | Back-End

> **Note:** Front-End and Back-End roles are not strict; all collaborators contributed to all aspects of this application.
