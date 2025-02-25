package com.todo.todo_lively_wallpapers.post;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;

public record Post(
    @Id
    String item, 
    int quantity, 
    String unit,
    @Version
    Integer version
    ) {
}

