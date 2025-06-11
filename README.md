# Math-Web

This web app provides dashboards for teachers, administrators, and parents to monitor student performance and manage math assessment tests within the Mathoria game. It allows educators to register students, track progress, and adjust assessment tasks for an enhanced learning experience through interactive mini-games including Order the Numbers, Compare Numbers, and What Number Do You Hear?.
## 🚀 Features

- **Student Registration:** Teachers can create student accounts.
- **Real-Time Sync:** Seamlessly integrates with Mathoria's Firebase Realtime Database for live updates.
- **Performance Monitoring:** Enables tracking of student progress, scores, and performance reports.
- **Role-Based Access:** Custom dashboards for principals, administrators, and teachers with Firebase Authentication.
- **User Role Management:** Principals and administrators can assign roles to users, and create parents accounts.
- **Classroom Insights (Administrators and Principals):** View school and classroom performance averages and indicators, with drill-down options for detailed student insights.
- **Adaptive Quests:** Teachers can adjust assessment tasks based on each student’s performance and learning progress.

## 📦 Tech Stack

- **Frontend:** Angular.
- **Backend:** Firebase Realtime Database & Firebase Authentication.

## ⚙️ How It Works

1. **User Authentication:** Users create an account through Firebase authentication. Principals can assign any role, and administrators can assign teacher role and create parents accounts that parents can use to log in the mobile aplication [Parents App]

2. **Student Registration:** Teachers create student accounts and generate QR codes that students can use to authenticate in Mathoria game.
3. **Profile Sync:** Student profiles sync with Mathoria, enabling test access.
4. **Monitoring:** Principals, administrators, teachers can view tailored performance data and analytics based on their assigned roles.
5. **Automatic User IDs:** The `Principal`, `Teacher`, `Parent`, `Administrator`, and `Student` classes inherit the `uid` field from the parent abstract Firebase class `User`. This ensures that each user is uniquely identified.

## 🔑 Registration Flow

1. **Add a Student:** Fill in the student's first name, last name, birthday, grade, gender and password (4-digit pin).
2. **QR code is generated:** Once the account is created, a QR code is generated and saved as a PDF.
3. **Log into the game:** The student can scan the QR code to log into the game.


### Key Classes:
- **User (Abstract Class):** All user roles (Principal, Teacher, Parent, Administrator, Student) inherit from this class, which includes the `uid` field for unique identification and methods for authentication.
- **Principal:** Can assign roles to other users (administrators and teachers, and even create parents accounts if wished) and has access to school-wide performance data.
- **Teacher:** Responsible for creating student accounts and creating and configuring test mini-games.
- **Administrator:** Has access to performance data at both the classroom and school levels, and can assign teacher role to users and create parent accounts that can be used in the [Parents App]
.
- **Parent:** Can monitor their children's academic progress and performance through the [Parents App].
- **Student:** Represents the students registered to take the assessment tests, with personalized profiles synced with the Mathoria game.
- **TestConfig:** Represents a test created by a teacher, including duration, grade, default/custom mini-game order, and a map of game configurations (`MiniGameConfig`). Also tracks creation and update timestamps.
- **MiniGameConfig:** Contains mini-game settings for a specific grade, including the teacher’s default config and optional group-specific overrides (`GroupConfig`).
- **GroupConfig:** Associates a set of students with a custom game configuration (`GameConfig`) for more targeted assessment.
- **GameConfig:** Defines detailed settings for each mini-game such as `numQuestions`, `operation`, `displayTime`, `uploadedNumbersAudioLinks`, and more.
- **MiniGame:** Describes the available games with multilingual `title`, `description`, `version`, and default configurations per grade.
- **TestResult:** Stores student scores and timestamps, linking the result to its associated test and student.
- **UserRole (enum):** Defines the possible user roles in the system: `Principal`, `Teacher`, `Parent`, `Administrator`, and `Student`.
- **Language (enum):** Specifies supported languages: `ar`, `fr`, and `en`.
- **TestStatus (enum):** Represents the publication status of a test: `DRAFT`, `PUBLISHED`, `ARCHIVED`, or `DELETED`.
- **GradeLevel (enum):** Represents the academic levels targeted by the system: `One`, `Two`, `Three`, `Four`, `Five`, and `Six`.

---

## 📁 JSON Structure

For real data examples and templates, check the `/JSON_DB` directory:
- `test_config.json` – Full test configuration linked to teacher roles and mini-games.
- `miniGames.json` – Definitions of all available mini-games with multilingual metadata and default configs.
- `users.json` – Sample users from each role (`Principal`, `Administrator`, `Teacher`, `Parent`, and `Student`) linked by `uid` and school.
- `/mini-games-data/` – Individual JSON files with real game content (e.g., choice questions, number-to-letters mappings, math problems, and matching pairs).

---

## 📥 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/brahimbus/math-web.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the file: `src/environments/environment.ts`

4. Add your Firebase config like this:

```ts
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
    databaseURL: 'https://YOUR_PROJECT.firebaseio.com'
  }
};
```

5. **Set Firebase Realtime Database Rules**

   In your Firebase Console, navigate to **Build > Realtime Database > Rules**, and replace the contents with:

   ```json
   {
  "rules": {
    "users": {
      ".indexOn": ["playerName", "role", "username"],
      ".read": true,
      ".write": true
    },
    "tests": {
      ".read": true,
      ".write": true
    },
    "testResults": {
      ".read": true,
      ".write": true
    }
  }
}

   ```
   > This ensures read/write access for `users` , `tests` and 'testResults'.

6. Run the app:
   ```bash
   ng serve
   ```

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b group-one`).
3. Commit changes (`git commit -m 'Add the group number one'`).
4. Push to the branch (`git push origin group-one`).
5. Open a pull request.

