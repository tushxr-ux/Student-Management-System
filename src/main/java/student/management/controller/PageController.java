package student.management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String home() {
        return "home";
    }


    @GetMapping("/students-page")
    public String studentsPage() {
        return "student";
    }
}