package com.ecommerce.controller;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.entity.User;
import com.ecommerce.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Get orders
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(@AuthenticationPrincipal User user) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (user.getRole() == User.Role.ROLE_ADMIN ||
            user.getRole() == User.Role.ROLE_SUB_ADMIN) {

            return ResponseEntity.ok(orderService.getAllOrders());
        }

        return ResponseEntity.ok(orderService.getUserOrders(user));
    }

    // Get order by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(orderService.getOrderById(user, orderId));
    }

    // Place new order
    @PostMapping
    public ResponseEntity<OrderDTO> placeOrder(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String shippingAddress = body.getOrDefault("shippingAddress", "");

        OrderDTO order = orderService.placeOrder(user, shippingAddress);

        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    // Admin/SubAdmin only — update order status
    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUB_ADMIN')")
    public ResponseEntity<OrderDTO> updateStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");

        return ResponseEntity.ok(orderService.updateStatus(orderId, status));
    }
}