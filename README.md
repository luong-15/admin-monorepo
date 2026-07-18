# Admin Monorepo (Next.js + Spring Boot)

Repo này tách riêng **UI Admin** và **Backend REST** để chạy đồng thời bằng Docker.

- `admin-frontend/`: UI Admin (Next.js)
- `admin-backend/`: Backend REST (Spring Boot)
- `docker-compose.yml`: chạy đồng thời 2 service

---

## 1) Chạy local (không dùng Docker)

### Backend (Spring Boot)

```bash
cd admin-monorepo
mvn -pl admin-backend clean package
mvn -pl admin-backend spring-boot:run
```

Backend chạy tại:

- `http://localhost:8080`

### Frontend (Next.js)

```bash
cd admin-monorepo/admin-frontend
npm install
npm run dev
```

Frontend chạy tại (thường là):

- `http://localhost:3000`

> Nếu FE yêu cầu env `NEXT_PUBLIC_SUPABASE_*` để login, hãy tạo `.env` trong `admin-monorepo/admin-frontend` hoặc cấu hình theo Next docs.

---

## 2) Chạy bằng Docker Compose

### Yêu cầu

- Docker Desktop (hoặc docker engine + docker compose plugin)

### Env/ cấu hình

`docker-compose.yml` đã set mặc định cho backend (JWT + datasource) theo biến env.

Frontend cần Supabase env để auth hoạt động. Bạn có thể để default trong compose hoặc set thêm bằng `.env`.

Tạo file `.env` (khuyến nghị) tại `admin-monorepo/.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3001/dashboard

# Optional (nếu muốn override backend)
# SUPABASE_JWKS_URL=...
# SUPABASE_JWT_ISSUER=...
# SUPABASE_JWT_SECRET=...
# SPRING_DATASOURCE_URL=...
# SPRING_DATASOURCE_USERNAME=...
# SPRING_DATASOURCE_PASSWORD=...
```

### Build & chạy

```bash
cd admin-monorepo
docker compose up --build
```

### URL truy cập

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:8080`

---

## 3) Mapping port / biến môi trường quan trọng

### Backend port

- Spring Boot expose `8080`
- Trùng với `server.port: 8080` trong `admin-backend/src/main/resources/application.yml`

### FE -> BE API base

`docker-compose.yml` inject vào frontend:

- `NEXT_PUBLIC_ADMIN_API_BASE=http://admin-backend:8080`

Ứng dụng FE dùng biến này để gọi các API dưới `/api/admin/**`.

---

## 4) API endpoints (tham khảo)

Hiện tại FE mong đợi các endpoint dạng:

- `GET/POST/PUT/DELETE /api/admin/products`
- `GET/POST/PUT/DELETE /api/admin/orders`
- `GET/POST/PUT/DELETE /api/admin/users`
- `GET /api/admin/categories`

Nếu BE thiếu endpoint nào, bạn cần bổ sung controller tương ứng trong `admin-backend`.

---

## 5) Dockerfile overview

### admin-frontend/Dockerfile

- Multi-stage build bằng `node:20-alpine`
- Chạy `npm run start -- -p 3000`

### admin-backend/Dockerfile

- Multi-stage build bằng `maven:3.9.9-eclipse-temurin-21`
- Chạy JAR bằng `eclipse-temurin:21-jre-alpine`

---

## 5) Các lệnh hữu ích

### Dừng service

```bash
cd admin-monorepo
docker compose down
```

### Xem log

```bash
docker compose logs -f admin-frontend
docker compose logs -f admin-backend
```
