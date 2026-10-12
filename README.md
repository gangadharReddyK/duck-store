# Duck Store

A warehouse management system for duck inventory with real-time pricing and order management capabilities.

## Prerequisites

- **Docker** (20.10+) for MySQL container and Testcontainers
- **Node.js LTS** (v20+) with npm
- **MySQL 8.4** (or Docker container)
- **MySQL client** (optional, for manual inspection)

## Quick Start

```bash
# 1. Start MySQL container
docker compose up -d

# 2. Install dependencies
cd apps/api && npm ci
cd ../web && npm ci

# 3. Start backend
cd apps/api && npm run start:dev

# 4. Start frontend
cd ../web && npm run dev
```

**Access URLs:**
- API: http://localhost:3000
- API Base Path: `/api/v1` (all endpoints are prefixed with `/api/v1`)
- Swagger UI: http://localhost:3000/api/docs
- Web: http://localhost:5173

## Environment Configuration

Create `.env` file in project root:

```env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=root
DB_NAME=duckstore
PORT=3000
```

## Database Setup

The schema is defined in `apps/api/src/database/schema.ts` and auto-applied on startup:

```sql
CREATE TABLE duck (
  id INT AUTO_INCREMENT PRIMARY KEY,
  color ENUM('Red','Green','Yellow','Black') NOT NULL,
  size ENUM('XLarge','Large','Medium','Small','XSmall') NOT NULL,
  price_cents INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  version INT NOT NULL DEFAULT 0,
  active_key TINYINT GENERATED ALWAYS AS (IF(deleted = 0, 1, NULL)) STORED,
  UNIQUE KEY uq_active_duck (color, size, price_cents, active_key)
);
```

## API Summary

### Warehouse Endpoints

**POST /api/v1/ducks** – Create or merge a duck (201/200)
```json
{
  "color": "Red",
  "size": "Large",
  "price": 25.00,
  "quantity": 5
}
```

**GET /api/v1/ducks** – List ducks (sorted by quantity desc, then id asc)
```json
{
  "id": 1,
  "color": "Red",
  "size": "Large",
  "price": 25.00,
  "quantity": 5,
  "version": 0
}
```

**PUT /api/v1/ducks/:id** – Update duck (409 on conflict)
**DELETE /api/v1/ducks/:id** – Soft delete (204)

### Store Endpoints

**POST /api/v1/store/orders** – Calculate order quote (read-only)
```json
{
  "package": "WOOD",
  "protection": ["POLYSTYRENE_BALLS"],
  "unitPrice": 1000,
  "lineItems": [{ code: "BASE", label: "Base Price", amount: 5000 }, ...],
  "total": 51700,
  "currency": "USD"
}
```

## API Documentation

This API is fully documented using Swagger/OpenAPI at `/api/docs`. The Swagger UI provides interactive documentation where you can:

- View all available endpoints organized by tags (ducks, store, health, app)
- See request/response schemas and examples
- Test endpoints directly from your browser using the interactive "Try it out" feature
- Understand parameter requirements and validation rules

**Swagger UI URL:** `http://localhost:3000/api/docs`

## Testing

### Unit Tests (Business Rules)

```bash
cd apps/api && npm test
```

### E2E Tests (Requires Docker)

```bash
cd apps/api && npm run test:e2e
```

**Test Coverage:**
- Atomic upsert behavior
- Version conflict detection
- Soft delete functionality
- Duplicate prevention
- Price calculation accuracy
- Package determination
- Protection requirements
- Shipping cost calculation
- Destination pricing

## Decisions

| Decision | Alternative | Reason |
|----------|-------------|---------|
| Merge via unique key + atomic upsert | Multiple-step read-modify-write | Ensures consistency without race conditions |
| Soft delete + active_key | Hard delete | Preserves history, enables recovery |
| Cents (money is integer cents) | Floating-point decimal | Avoids floating-point precision issues |
| Edit conflicts → 409 | Silent overwrite | Detects concurrent modifications via version |
| Quote-only store | Full store UI | Separates pricing logic from UI concerns |
| Lowest-price lot | Average or max price | Guarantees best customer value |
| Percentages on discounted subtotal | Percentage of base only | Accurate volume discount calculation |
| Per-line rounding | Sum then round total | Ensures fair per-line pricing |
| Thresholds | Flat discount | Tiered pricing better reflects volume economics |
| Air bulk discount 15% when qty > 1000 | No bulk discount | Encourages larger air shipments |
| Sort by quantity desc | Sort by id asc | Better UX for inventory viewing |
| Active key generated | Manual tracking | Automatic deduplication |
| Atomic upsert | Non-atomic insert+update | Prevents lost updates |
| Version field | Timestamp | Simple comparison for staleness |
| MySQL 8.4 | PostgreSQL | Aligns with existing infrastructure |
| NestJS v12 | Older version | Latest stable for performance |

## Not Done and Why

- **Stock reservation** – Requires transaction handling beyond current scope
- **Pagination** – Trade-offs with client-side vs server-side implementation
- **Auth** – Security not required for this demo
- **Store UI** – UI layer separated from core business logic

## AI Usage Note

I have leveraged my software development expertise in Java, Microservices, JSP, Angular, and testing frameworks to develop this project based on the assessment documentation. Since Digital Harbour primarily works with NestJS and React, the project was developed using these technologies with the assistance of AI tools.