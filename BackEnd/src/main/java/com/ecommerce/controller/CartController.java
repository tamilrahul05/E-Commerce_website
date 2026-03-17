package com.ecommerce.controller;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addItem(@AuthenticationPrincipal User user,
                                           @RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = Integer.parseInt(body.getOrDefault("quantity", 1).toString());
        return ResponseEntity.ok(cartService.addItem(user, productId, quantity));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDTO> updateItem(@AuthenticationPrincipal User user,
                                              @PathVariable Long cartItemId,
                                              @RequestBody Map<String, Integer> body) {
        int quantity = body.get("quantity");
        return ResponseEntity.ok(cartService.updateItemQuantity(user, cartItemId, quantity));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartDTO> removeItem(@AuthenticationPrincipal User user,
                                              @PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(user, cartItemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user);
        return ResponseEntity.noContent().build();
    }
}
