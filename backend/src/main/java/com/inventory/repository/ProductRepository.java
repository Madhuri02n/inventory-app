package com.inventory.repository;

import com.inventory.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategory(String category);

    List<Product> findByNameContainingIgnoreCase(String name);

    // Find low stock products where quantity <= threshold
    @Query("SELECT p FROM Product p WHERE p.quantity <= p.lowStockThreshold")
    List<Product> findLowStockProducts();

    @Query("SELECT DISTINCT p.category FROM Product p ORDER BY p.category")
    List<String> findAllCategories();

    @Query("SELECT SUM(p.price * p.quantity) FROM Product p")
    Double calculateTotalInventoryValue();
}
