# group_15-SOEN341_Project_F24

## Description
**group_15-SOEN341_Project_F24 is a peer assessment system targeted towards university level team projects!** It allows students to both give and receive valuable feedback for individual contributions made in anonymous way, promoting collaboration and accountability. It is also a way
for instructors to evaluate the individual contributions of students, ensuring work was
distributed in an equitable fashion.
<br><br>

Student users are evaluated by 4 categories...
- Cooperation
- Conceptual Contribution
- Practical Contribution 
- Work Ethic
<br><br>

After every student participant has submitted their assessment for every other student in their team, they may gain access to the results of their peer-reviewed evaluation. Students may not know what individual values were given to each category; they will only have access to an aggregate value received for every category.
<br><br>

After every student in a given team has submitted their evaluation, the instructor will receive the calculated grade of each student and have access to a more detailed breakdown of how grades were calculated. This breakdown may then be exported to a CSV file for later use.

## Usage

### Installation and Setup

To run locally,

1. cd into the **client** folder and run:
```
npm i
npm run dev
```
2. cd into the **server** folder and run:
```
npm i
npm start
```
3. **mongodb database** is required as well, host a db on your machine with port **20717**

### Usage

#### Student

- After signing in, the **user** has access to **groups** that any **instructor** has placed him in.
- Inside a **group**, a student can give **ratings** in **4 categories** to each teammate within the same group

#### Instructor

- After signing in, the **user** has access to **groups** he has created and can also **create** new ones.
- For each group, the **user** can add **students** and view the ratings of each student given by the rest of the team.

## Team Members
  - **Charles Partous** (40175854) | Front-End
  - **Zachary Corber** (40246724) | Front-End
  - **Carlo Ramadori** (40243639) | Front-End
  - **Omar Chabti** (40262497) | Back-End
  - **Kevin Liu** (40281197) | Back-End
  - **Philippe Nikolov** (40245641) | Back-End

> [!NOTE]
> Front-End and Back-End roles are not strict, all collaborators contributed to all aspects of this application
