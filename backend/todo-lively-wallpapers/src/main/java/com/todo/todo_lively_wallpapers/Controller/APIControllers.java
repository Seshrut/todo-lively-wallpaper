package com.todo.todo_lively_wallpapers.Controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class APIControllers
{
    @GetMapping("/")
    public String getPage()
    {
        return "Welcome to SpringBoot";
    }
}