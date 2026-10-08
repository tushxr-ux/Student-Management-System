# 🎓 Student Management System

A full-stack, responsive **Student Management System** built with **Spring Boot**, **Thymeleaf**, and modern Vanilla CSS & JavaScript. Featuring a live student directory, real-time CRUD operations, interactive dashboards, and RESTful API endpoints.

[![Java](https://img.shields.io/badge/Java-21-orange.svg?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.8-brightgreen.svg?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Thymeleaf](https://img.shields.io/badge/Thymeleaf-3.x-005F0F.svg?logo=thymeleaf&logoColor=white)](https://www.thymeleaf.org/)
[![Maven](https://img.shields.io/badge/Maven-Build-C71A36.svg?logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- ⚡ **Full CRUD Functionality**: Seamlessly create, read, update, and delete student records in real time.
- 🎨 **Modern Glassmorphism UI**: High-end responsive UI with sleek dark-mode aesthetics, gradient accents, and subtle micro-animations.
- 📊 **Real-Time Analytics & Dashboard**: Instant metrics on student enrollments, course distributions, and live backend health status.
- 🔍 **Instant Search & Filtering**: Client-side dynamic search by Student ID, Name, or Engineering Branch.
- 🛡️ **RESTful API**: Clean REST controllers exposing standard HTTP endpoints with proper status codes and JSON payloads.
- 🧵 **Thread-Safe Architecture**: In-memory management powered by `CopyOnWriteArrayList` for consistent concurrent operations.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Java 21, Spring Boot (Spring MVC, REST Controllers) |
| **Frontend Templates** | Thymeleaf (Server-Side Rendering) |
| **Styling** | Vanilla CSS (Modern CSS Variables, Flexbox/Grid, Glassmorphism) |
| **Client-Side Logic** | Vanilla JavaScript (Async Fetch API, Dynamic DOM Rendering) |
| **Icons & Fonts** | Font Awesome 6, Google Fonts (*Outfit*, *Plus Jakarta Sans*) |
| **Build Tool** | Apache Maven |

---

## 📁 Project Structure

```text
management/
├── .mvn/wrapper/                 # Maven wrapper configuration
├── src/
│   ├── main/
│   │   ├── java/student/management/
│   │   │   ├── ManagementApplication.java       # Spring Boot main entry point
│   │   │   ├── controller/
│   │   │   │   ├── PageController.java          # View routing controller
│   │   │   │   └── StudentController.java       # REST API endpoints & business logic
│   │   │   └── model/
│   │   │       └── Student.java                 # Student domain entity model
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── css/style.css                # Premium custom styling & design tokens
│   │       │   └── js/dashboard.js              # Interactive dashboard & AJAX handlers
│   │       ├── templates/
│   │       │   ├── home.html                    # Welcome landing & campus portal
│   │       │   └── student.html                 # Student records directory console
│   │       └── application.properties           # Spring Boot configuration
│   └── test/java/student/management/            # Unit & integration tests
├── .gitignore
├── mvnw / mvnw.cmd                              # Maven wrapper scripts
├── pom.xml                                      # Maven project configuration
└── README.md                                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Java Development Kit (JDK) 21+](https://www.oracle.com/java/technologies/downloads/)
- [Apache Maven](https://maven.apache.org/) (optional if using the included `mvnw`)
- [Git](https://git-scm.com/)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tushxr-ux/Student-Management-System.git
   cd Student-Management-System
   ```

2. **Run with Maven Wrapper**:

   - **Windows**:
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - **Linux / macOS**:
     ```bash
     ./mvnw spring-boot:run
     ```

3. **Or Run with Docker**:
   ```bash
   # Build and run using Docker Compose
   docker compose up --build

   # Or build and run standalone container
   docker build -t student-management-system .
   docker run -p 8080:8080 student-management-system
   ```

4. **Access the application**:
   - 🏠 **Home Portal**: [http://localhost:8080/](http://localhost:8080/)
   - 📋 **Student Directory & Console**: [http://localhost:8080/students-page](http://localhost:8080/students-page)
   - 🔌 **REST API**: [http://localhost:8080/students](http://localhost:8080/students)

---

## 📡 REST API Reference

| Method | Endpoint | Description | Request Body | Response Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/students` | Get list of all students | None | `200 OK` |
| `GET` | `/students/{id}` | Get student by ID | None | `200 OK`, `404 Not Found` |
| `POST` | `/students` | Create new student | `{ "id": 104, "name": "...", "course": "..." }` | `201 Created`, `409 Conflict` |
| `PUT` | `/students/{id}` | Update existing student | `{ "name": "...", "course": "..." }` | `200 OK`, `404 Not Found` |
| `DELETE` | `/students/{id}` | Delete student by ID | None | `200 OK`, `404 Not Found` |

### Sample JSON Payload

```json
{
  "id": 104,
  "name": "Aarav Sharma",
  "course": "Computer Engineering"
}
```

---

## 👨‍💻 Author

**Tushar Salunkhe**  
- GitHub: [@tushxr-ux](https://github.com/tushxr-ux)
- Email: salunkhetushar635@gmail.com

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
