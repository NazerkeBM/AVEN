package com.aven.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))

                .csrf(csrf -> csrf
                        .csrfTokenRepository(
                                CookieCsrfTokenRepository.withHttpOnlyFalse()
                        )
                        .csrfTokenRequestHandler(
                                new CsrfTokenRequestAttributeHandler()
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                HttpMethod.OPTIONS, "/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/uploads/avatars/**",
                                "/uploads/images/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST, "/api/avatar/upload"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                "/api/auth/me"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/users/**"
                        ).denyAll()

                        .anyRequest().authenticated()
                )

                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/login")
                        .usernameParameter("login")
                        .passwordParameter("password")

                        .successHandler((request, response, authentication) -> {
                            response.setStatus(200);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"message\":\"Login successful\"}"
                            );
                        })

                        .failureHandler((request, response, exception) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"message\":\"Invalid username or password\"}"
                            );
                        })

                        .permitAll()
                )

                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies("JSESSIONID")

                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(200);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"message\":\"Logged out successfully\"}"
                            );
                        })
                )

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, error) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"message\":\"Authentication required\"}"
                            );
                        })
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5500",
                "http://127.0.0.1:5500"
        ));

        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT",
                "PATCH", "DELETE", "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }
}