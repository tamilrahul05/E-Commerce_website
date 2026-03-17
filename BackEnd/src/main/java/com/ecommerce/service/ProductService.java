package com.ecommerce.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Get products with optional filter
    public List<ProductDTO> getAllProducts(String category, String search) {

        boolean hasCategory = category != null && !category.isBlank();
        boolean hasSearch = search != null && !search.isBlank();

        List<Product> products;

        if (hasCategory && hasSearch) {
            products = productRepository
                    .findByCategoryAndNameContainingIgnoreCase(category, search);

        } else if (hasCategory) {
            products = productRepository.findByCategory(category);

        } else if (hasSearch) {
            products = productRepository.findByNameContainingIgnoreCase(search);

        } else {
            products = productRepository.findAll();
        }

        return products.stream()
                .map(this::toDTO)
                .toList();
    }

    // Get single product
    public ProductDTO getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found with id: " + id));

        return toDTO(product);
    }

    // Create product
    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {

        Product product = toEntity(dto);

        return toDTO(productRepository.save(product));
    }

    // Update product
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {

        Product existing = productRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found with id: " + id));

        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setStockQuantity(dto.getStockQuantity());
        existing.setCategory(dto.getCategory());
        existing.setImageUrl(dto.getImageUrl());
        existing.setDiscountPrice(dto.getDiscountPrice());
        existing.setRating(dto.getRating());
        existing.setReviewsCount(dto.getReviewsCount());
        existing.setIsFeatured(dto.getIsFeatured());

        return toDTO(productRepository.save(existing));
    }

    // Delete product
    @Transactional
    public void deleteProduct(Long id) {

        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }

        productRepository.deleteById(id);
    }

    // Convert Entity → DTO
    private ProductDTO toDTO(Product p) {

        return ProductDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stockQuantity(p.getStockQuantity())
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .discountPrice(p.getDiscountPrice())
                .rating(p.getRating())
                .reviewsCount(p.getReviewsCount())
                .isFeatured(p.getIsFeatured())
                .build();
    }

    // Convert DTO → Entity
    private Product toEntity(ProductDTO dto) {

        return Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stockQuantity(dto.getStockQuantity())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .discountPrice(dto.getDiscountPrice())
                .rating(dto.getRating())
                .reviewsCount(dto.getReviewsCount())
                .isFeatured(dto.getIsFeatured())
                .build();
    }
}