package student.management.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import student.management.model.Student;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final List<Student> students = new CopyOnWriteArrayList<>();

    public StudentController() {
        // Initial sample data for TSEC Mumbai
        students.add(new Student(101, "Aarav Sharma", "Computer Engineering"));
        students.add(new Student(102, "Ananya Patel", "Information Technology"));
        students.add(new Student(103, "Rohan Verma", "Computer Science & Engineering (AI & ML)"));
    }

    // 1. Get all students
    @GetMapping
    public List<Student> getAllStudents() {
        return students;
    }

    // 2. Get student by ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable int id) {
        return students.stream()
                .filter(s -> s.getId() == id)
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // 3. Add student
    @PostMapping
    public ResponseEntity<?> addStudent(@RequestBody Student student) {
        boolean exists = students.stream().anyMatch(s -> s.getId() == student.getId());
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("{\"message\":\"Student with ID " + student.getId() + " already exists.\"}");
        }
        students.add(student);
        return ResponseEntity.status(HttpStatus.CREATED).body(student);
    }

    // 4. Update student
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable int id, @RequestBody Student updatedStudent) {
        for (int i = 0; i < students.size(); i++) {
            if (students.get(i).getId() == id) {
                Student s = students.get(i);
                s.setName(updatedStudent.getName());
                s.setCourse(updatedStudent.getCourse());
                return ResponseEntity.ok(s);
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("{\"message\":\"Student with ID " + id + " not found.\"}");
    }

    // 5. Delete student
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable int id) {
        boolean removed = students.removeIf(s -> s.getId() == id);
        if (removed) {
            return ResponseEntity.ok("Student deleted successfully!");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Student with ID " + id + " not found.");
        }
    }
}
