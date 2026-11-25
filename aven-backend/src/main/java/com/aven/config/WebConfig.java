package com.aven.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry
    ) {

        registerDirectory(
                registry,
                "avatars"
        );

        registerDirectory(
                registry,
                "images"
        );
    }

    private void registerDirectory(
            ResourceHandlerRegistry registry,
            String folder
    ) {

        Path directory = Paths.get("uploads", folder)
                .toAbsolutePath()
                .normalize();

        String resourceLocation =
                directory.toUri().toString();

        if (!resourceLocation.endsWith("/")) {
            resourceLocation += "/";
        }

        registry
                .addResourceHandler("/uploads/" + folder + "/**")
                .addResourceLocations(resourceLocation);
    }
}