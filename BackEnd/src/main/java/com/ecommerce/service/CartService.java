package com.ecommerce.service;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public CartDTO getCart(User user) {
        Cart cart = getOrCreateCart(user);
        return toDTO(cart);
    }

    @Transactional
    public CartDTO addItem(User user, Long productId, int quantity) {

        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {

            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);

        } else {

            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();

            cart.getItems().add(newItem);
        }

        return toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO updateItemQuantity(User user, Long cartItemId, int quantity) {

        Cart cart = getOrCreateCart(user);

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }

        return toDTO(cartRepository.save(cart));
    }

    @Transactional
    public CartDTO removeItem(User user, Long cartItemId) {

        Cart cart = getOrCreateCart(user);

        cart.getItems().removeIf(i -> i.getId().equals(cartItemId));

        return toDTO(cartRepository.save(cart));
    }

    @Transactional
    public void clearCart(User user) {

        Cart cart = getOrCreateCart(user);

        cart.getItems().clear();

        cartRepository.save(cart);
    }

    // ───── Helper Methods ─────

    private Cart getOrCreateCart(User user) {

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {

                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();

                    return cartRepository.save(newCart);
                });
    }

    private CartDTO toDTO(Cart cart) {

        List<CartDTO.CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(item -> CartDTO.CartItemDTO.builder()
                        .cartItemId(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .imageUrl(item.getProduct().getImageUrl())
                        .price(item.getProduct().getPrice())
                        .quantity(item.getQuantity())
                        .subtotal(
                                item.getProduct().getPrice()
                                        .multiply(BigDecimal.valueOf(item.getQuantity()))
                        )
                        .build())
                .collect(Collectors.toList());

        BigDecimal total = itemDTOs.stream()
                .map(CartDTO.CartItemDTO::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDTO.builder()
                .cartId(cart.getId())
                .items(itemDTOs)
                .totalPrice(total)
                .build();
    }
}