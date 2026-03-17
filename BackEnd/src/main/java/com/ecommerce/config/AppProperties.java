package com.ecommerce.config;

import java.util.List;
import lombok.Data;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();

    @Data
    public static class Jwt {
        private String secret;
        private Long expirationMs;
    }

    @Data
    public static class Cors {
        private List<String> allowedOrigins;
    }
}
