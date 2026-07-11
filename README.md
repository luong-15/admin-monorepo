# Admin Monorepo (UI Next.js + Backend Spring Boot)

Mục tiêu:

- Tách admin UI khỏi project chính
- Vẫn giữ UI và logic hiện tại
- Sau đó bổ sung Spring Boot REST backend cho các endpoint admin

Cấu trúc:

- `admin-frontend/`: UI Admin Next.js
- `admin-backend/`: Backend Spring Boot REST
- `docker-compose.yml`: chạy 2 service

## Chạy Maven (BE) từ thư mục gốc

Từ `admin-monorepo/` bạn có thể chạy Maven cho backend qua module:

- Build backend:

  `mvn -pl admin-backend clean package`

- Chạy backend:

  `mvn -pl admin-backend spring-boot:run`
