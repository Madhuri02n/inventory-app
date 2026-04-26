package com.inventory;

import com.inventory.model.Product;
import com.inventory.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if empty
        if (productRepository.count() == 0) {
            productRepository.save(createProduct("Laptop Pro 15", "High-performance laptop", "Electronics", 999.99, 25, 5));
            productRepository.save(createProduct("Wireless Mouse", "Ergonomic wireless mouse", "Electronics", 29.99, 8, 10));
            productRepository.save(createProduct("USB-C Hub", "7-in-1 USB-C hub", "Electronics", 49.99, 50, 10));
            productRepository.save(createProduct("Office Chair", "Ergonomic mesh chair", "Furniture", 349.99, 12, 3));
            productRepository.save(createProduct("Standing Desk", "Adjustable height desk", "Furniture", 599.99, 3, 5));
            productRepository.save(createProduct("Notebook A4", "200-page lined notebook", "Stationery", 4.99, 200, 30));
            productRepository.save(createProduct("Ballpoint Pens (12pk)", "Blue ink ballpoint pens", "Stationery", 8.99, 7, 15));
            productRepository.save(createProduct("Mechanical Keyboard", "TKL mechanical keyboard", "Electronics", 129.99, 18, 5));

            System.out.println("✅ Sample data seeded successfully!");
        }
    }

    private Product createProduct(String name, String desc, String category,
                                   double price, int qty, int threshold) {
        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setCategory(category);
        p.setPrice(price);
        p.setQuantity(qty);
        p.setLowStockThreshold(threshold);
        return p;
    }
}
