package com.ecommerce.service;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.entity.*;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.OrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        CartService cartService) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartService = cartService;
    }

    // Get orders of logged-in user
    public List<OrderDTO> getUserOrders(User user) {

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Admin / SubAdmin
    public List<OrderDTO> getAllOrders() {

        return orderRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // Get order by ID
    public OrderDTO getOrderById(User user, Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean isAdmin =
                user.getRole() == User.Role.ROLE_ADMIN ||
                user.getRole() == User.Role.ROLE_SUB_ADMIN;

        if (!order.getUser().getId().equals(user.getId()) && !isAdmin) {
            throw new RuntimeException("Access denied");
        }

        return toDTO(order);
    }

    // Place order from cart
    @Transactional
    public OrderDTO placeOrder(User user, String shippingAddress) {

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .shippingAddress(shippingAddress)
                .status(Order.OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = cart.getItems().stream()
                .map(ci -> OrderItem.builder()
                        .order(order)
                        .product(ci.getProduct())
                        .quantity(ci.getQuantity())
                        .priceAtPurchase(ci.getProduct().getPrice())
                        .build())
                .toList();

        BigDecimal total = orderItems.stream()
                .map(i ->
                        i.getPriceAtPurchase()
                                .multiply(BigDecimal.valueOf(i.getQuantity()))
                )
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        order.setItems(orderItems);
        order.setTotalAmount(total);

        Order savedOrder = orderRepository.save(order);

        // clear cart after order
        cartService.clearCart(user);

        return toDTO(savedOrder);
    }

    // Update order status (Admin)
    @Transactional
    public OrderDTO updateStatus(Long orderId, String statusStr) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus status =
                Order.OrderStatus.valueOf(statusStr.toUpperCase());

        order.setStatus(status);

        return toDTO(orderRepository.save(order));
    }

    // Convert entity -> DTO
    private OrderDTO toDTO(Order order) {

        List<OrderDTO.OrderItemDTO> items = order.getItems().stream()
                .map(i -> OrderDTO.OrderItemDTO.builder()
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .imageUrl(i.getProduct().getImageUrl())
                        .category(i.getProduct().getCategory())
                        .quantity(i.getQuantity())
                        .priceAtPurchase(i.getPriceAtPurchase())
                        .build())
                .toList();

        return OrderDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getUsername())
                .userEmail(order.getUser().getEmail())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .build();
    }
}