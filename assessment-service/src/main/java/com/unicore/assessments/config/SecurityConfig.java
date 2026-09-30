package com.unicore.assessments.config;

import com.unicore.assessments.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {
  @Bean
  SecurityFilterChain security(HttpSecurity http, JwtAuthFilter jwt) throws Exception {
    http.csrf(csrf -> csrf.disable()).cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/assessments/stats").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/assessments/**", "/api/results/**").authenticated()
            .requestMatchers(HttpMethod.POST, "/api/assessments/*/submit").hasRole("STUDENT")
            .requestMatchers(HttpMethod.POST, "/api/assessments/**").hasAnyRole("INSTRUCTOR", "ADMIN")
            .requestMatchers(HttpMethod.PUT, "/api/assessments/**").hasAnyRole("INSTRUCTOR", "ADMIN")
            .requestMatchers(HttpMethod.DELETE, "/api/assessments/**").hasAnyRole("INSTRUCTOR", "ADMIN")
            .anyRequest().authenticated())
        .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }
  @Bean CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration c = new CorsConfiguration();
    c.addAllowedOrigin("http://localhost:3000"); c.addAllowedHeader("*"); c.addAllowedMethod("*");
    UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
    s.registerCorsConfiguration("/**", c);
    return s;
  }
}
