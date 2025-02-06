# Math-Web

This is a teacher, principal, and parent dashboard designed to integrate seamlessly with the Mathoria game. This web app allows educators and administrators to register students, monitor their performance, and manage math assessment tests.

## 🚀 Features

- **Student Registration:** Teachers can register students for Mathoria’s assessment tests.
- **Real-Time Sync:** Connects with Mathoria's Firebase Realtime Database for live updates.
- **Performance Monitoring:** Track student progress, scores, and performance reports.
- **Role-Based Access:** Dashboards for teachers, principals, and parents with Firebase Authentication.
- **User Role Management:** Authentication for teachers, principals, and parents, ensuring role-specific access and features.
- **Cheat Prevention:** Students can only take the math test if registered by an eligible teacher.
- **Classroom Insights (Principals):** View classroom performance averages and indicators, with options to dive into specific student details.
- **Parental Access:** Parents can track their child's academic progress and performance.

## 📦 Tech Stack

- **Frontend:** Angular (primary), a React sample project is provided for reference.
- **Backend:** Firebase Realtime Database & Firebase Authentication.

## ⚙️ How It Works

1. **User Authentication:** Teachers, principals, and parents authenticate via Firebase based on their role.
2. **Student Registration:** Teachers register students using the player's Mathoria name.
3. **Profile Sync:** Student profiles sync with Mathoria to enable test access.
4. **Monitoring:** Teachers, principals, and parents can view performance data and analytics tailored to their roles.

## 🔑 Registration Flow

1. **Search Student:** Enter the player's Mathoria name `player_name`.
2. **Register Details:** Fill in first name, last name, birthday, grade, gender, and photo.
3. **Sync:** The student is now eligible for the test (fields `is_authenticated_by_teacher` = true & `linked_teacher_id` updated).

## 🔒 Rules & Policies

- Only registered students can take the test.
- Students leaving the game multiple times during a test may automatically fail.
- Photo URL is used for unique identification (face recognition).

## 🗂 Sample Project

Refer to the sample React project here: [Math Dashboard React](https://github.com/najlae01/math-dashboard-react)

## 📥 Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/najlae01/math-web.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the app:
   ```bash
   ng serve
   ```

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b group-one`).
3. Commit changes (`git commit -m 'Add the group number one'`).
4. Push to the branch (`git push origin group-one`).
5. Open a pull request.

## 📧 Contact

For support, contact [Najlae](mailto:najlae.abarghache@etu.uae.ac.ma).

