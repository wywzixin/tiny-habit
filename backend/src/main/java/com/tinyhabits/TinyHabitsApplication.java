package com.tinyhabits;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.tinyhabits.mapper")
public class TinyHabitsApplication {

    public static void main(String[] args) {
        SpringApplication.run(TinyHabitsApplication.class, args);
    }
}
