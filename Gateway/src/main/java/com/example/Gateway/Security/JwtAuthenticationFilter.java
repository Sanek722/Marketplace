package com.example.Gateway.Security;

import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Публичные маршруты
        List<String> publicPaths = List.of(
                "/market/products",
                "/market/files/{filename}",
                "/market/comments/product/{productId}",
                "/market/{id}",
                "/auth/login",
                "/auth/register",
                "/auth/logout",
                "/user/files",
                "/market/upload"
        );

        AntPathMatcher pathMatcher = new AntPathMatcher();
        boolean isPublic = publicPaths.stream().anyMatch(pattern -> pathMatcher.match(pattern, path));


        if (isPublic) {
            return chain.filter(exchange); // Без токена
        }

        String token = null;


        HttpCookie cookie = exchange.getRequest().getCookies().getFirst("accessToken");
        if (cookie != null) {
            token = cookie.getValue();
        }


        if (token == null) {
            String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (token == null || !jwtUtil.validateToken(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        Claims claims = jwtUtil.extractClaims(token);
        String username = claims.getSubject();
        String role = claims.get("role", String.class);

        if (path.startsWith("/admin") && !"Admin".equals(role)) {
            exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
            return exchange.getResponse().setComplete();
        }

        // Пробрасываем заголовки дальше
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header("X-User", username)
                .header("X-Role", role)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }
}
