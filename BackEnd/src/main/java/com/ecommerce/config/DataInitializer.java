package com.ecommerce.config;

import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Cart;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.CartRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            ProductRepository productRepository,
            CartRepository cartRepository,
            PasswordEncoder passwordEncoder,
            JdbcTemplate jdbcTemplate) {

        return args -> {

            try {
                jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            } catch (Exception e) {
                System.out.println("Constraint not found");
            }

            seedUser(userRepository, cartRepository, passwordEncoder,
                    "Admin", "admin@ecommerce.com", "admin123", User.Role.ROLE_ADMIN);

            seedUser(userRepository, cartRepository, passwordEncoder,
                    "SubAdmin", "subadmin@ecommerce.com", "sub123", User.Role.ROLE_SUB_ADMIN);

            if (productRepository.count() == 0) {

                productRepository.saveAll(List.of(

                        createProduct("Neon Pro Smartphone",
                                "High-performance smartphone",
                                "59999.00",
                                "Electronics",
                                true),

                        createProduct("Cyber Gaming Laptop",
                                "High-end gaming laptop",
                                "124999.00",
                                "Electronics",
                                true),

                        createProduct("Streetwear Hoodie",
                                "Comfortable cotton hoodie",
                                "2999.00",
                                "Clothing",
                                false),

                        createProduct("Clean Code",
                                "Essential programming book",
                                "1299.00",
                                "Books",
                                false),

                        createProduct("Smart Watch",
                                "Modern fitness tracker",
                                "8999.00",
                                "Electronics",
                                false)
                ));

                System.out.println("Sample products seeded successfully!");
            }
        };
    }

    private void seedUser(UserRepository repo,
                          CartRepository cartRepo,
                          PasswordEncoder encoder,
                          String name,
                          String email,
                          String pass,
                          User.Role role) {

        if (!repo.existsByEmail(email)) {

            User user = User.builder()
                    .username(name)
                    .email(email)
                    .password(encoder.encode(pass))
                    .role(role)
                    .build();

            user = repo.save(user);

            Cart cart = Cart.builder()
                    .user(user)
                    .build();

            cartRepo.save(cart);
        }
    }

    private Product createProduct(String name,
                                  String desc,
                                  String price,
                                  String category,
                                  boolean featured) {

        return Product.builder()
                .name(name)
                .description(desc)
                .price(new BigDecimal(price))
                .stockQuantity(100)
                .category(category)
                .isFeatured(featured)
                .rating(4.5)
                .reviewsCount(5)
                .build();
    }
}