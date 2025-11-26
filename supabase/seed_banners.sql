
INSERT INTO banners (title, image_url, link_url, start_time, end_time, is_active, display_order)
VALUES 
('Welcome Offer', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', '/menu', NOW(), NOW() + INTERVAL '7 days', true, 1);

