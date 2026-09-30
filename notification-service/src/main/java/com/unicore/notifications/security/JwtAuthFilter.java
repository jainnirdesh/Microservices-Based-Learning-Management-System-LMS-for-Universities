package com.unicore.notifications.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final SecretKey key;
  public JwtAuthFilter(@Value("${jwt.secret}") String secret) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
    String auth = request.getHeader("Authorization");
    if (auth != null && auth.startsWith("Bearer ")) {
      Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(auth.substring(7)).getPayload();
      String role = claims.get("role", String.class);
      var token = new UsernamePasswordAuthenticationToken(claims.getSubject(), null,
          List.of(new SimpleGrantedAuthority("ROLE_" + role)));
      token.setDetails(claims);
      SecurityContextHolder.getContext().setAuthentication(token);
    }
    chain.doFilter(request, response);
  }
}
