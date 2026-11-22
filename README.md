# ShopFlow

A small e-commerce backend built with **NestJS, PostgreSQL, Redis and BullMQ**.
Each folder demonstrates one production pattern in the smallest useful amount of code.

## Stack

- **NestJS 12** (ESM, TypeScript) — modules, DI, guards, pipes
- **PostgreSQL + TypeORM** — users, products, orders, reports, idempotency keys
- **Redis + ioredis** — cache, distributed locks, rate limiting, queues
- **BullMQ + Bull Board** — background jobs and a queue dashboard
- **Docker Compose** — Postgres and Redis only; the app can run on the host or in Docker

## Quick start

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run infra:up         # Postgres + Redis, waits until healthy
npm run dev              # http://localhost:3000
```

Run the app in Docker instead: `npm run docker:dev` (stop it with `docker:dev:down`).

## How it fits together

```text
request → global RateLimitGuard → route guard (DevAuthGuard)
        → ValidationPipe + DTO → controller → service
        → PostgreSQL / Redis / BullMQ
```

One folder per concern: `products/`, `orders/`, `cache/`, `locks/`, `rate-limit/`, `mail/`, `reports/`, `imports/`, `health/`, `monitoring/`.

## Core concepts

### 1. Modules, DI and DTO validation

- **What:** Nest splits code into modules; services are injected through constructors; DTOs validate request bodies.
- **Why:** Separation of concerns and safe input at the edge.
- **How:** `AppModule` wires feature modules. `ValidationPipe({ whitelist, transform })` in `src/main.ts` validates DTOs such as `src/orders/dtos/createOrder.dto.ts`; `PartialType` builds update DTOs.

### 2. Cache-aside with stampede protection

- **What:** Reads check Redis first; on a miss the value is loaded from the DB and cached.
- **Why:** Cuts database load for hot reads and prevents many requests from hitting the DB when a key expires.
- **How:** `src/cache/cache.service.ts` provides `getOrSet(key, ttl, loader)`. It uses a short Redis lock, a double-check, TTL jitter and 30s negative caching. `ProductsService.findOne` caches products for 5 minutes and deletes the key on update.

### 3. Distributed locks

- **What:** A lock stored in Redis, shared by all app instances.
- **Why:** In-memory locks only protect one process; multiple servers must not run the same job or rebuild the same cache entry.
- **How:** `src/locks/locks.service.ts` acquires with `SET key token PX ttl NX` and releases with a Lua script that deletes the key only if the token matches.

### 4. Rate limiting

- **What:** Limits requests per client in a time window using a Redis sorted-set sliding window.
- **Why:** Stops brute-force logins, scrapers and retry storms.
- **How:** `src/rate-limit/rate-limit.guard.ts` is a global `APP_GUARD` (default 100 req/min per IP). `@RateLimit(5, 15 * 60, 'ip+body.email')` protects `POST /auth/login`. Returns `429` + `Retry-After`; fails open if Redis is down.

### 5. Background jobs, retries and DLQ

- **What:** BullMQ queues run slow work outside the HTTP request; failed jobs are retried, then moved to a dead letter queue.
- **Why:** A slow email must not block `POST /orders`, and temporary failures should recover automatically.
- **How:** `OrdersService` adds an `emails` job; `src/mail/emails.processor.ts` processes it with concurrency 5. `src/mail/email-job-options.ts` sets 5 attempts and exponential backoff. Exhausted or `UnrecoverableError` jobs go to `dlq-emails`; `src/mail/dlq.controller.ts` lists and re-queues them.

### 6. Scheduled reports (cron + lock)

- **What:** A cron job enqueues a daily sales report.
- **Why:** Scheduled work must run once even with several instances.
- **How:** `src/reports/reports.scheduler.ts` runs `@Cron` (every minute in the demo), takes a distributed lock, then adds a job with `jobId: daily-sales-<date>`. `reports.processor.ts` computes totals with SQL and upserts one row per day.

### 7. Idempotency keys

- **What:** Repeating a request with the same `Idempotency-Key` returns the original result instead of creating a duplicate.
- **Why:** Clients retry on timeouts; retries must not create duplicate orders.
- **How:** `src/idempotency/idempotency.service.ts` uses a composite primary key `(key, userId)` and a SHA-256 hash of the body. Same key + different body → `422`; still processing → `409`; completed → stored response. Failed handlers delete the row so the client can retry.

### 8. Streaming CSV import and export

- **What:** Files and query results are processed as streams instead of loading everything into memory.
- **Why:** Large CSVs would exhaust memory; backpressure keeps reads in step with database writes.
- **How:** Import (`src/imports/imports.controller.ts` + `imports.processor.ts`): upload to disk (500 MB limit), enqueue, then stream with `csv-parse`, insert batches of 1000, skip bad rows, delete the temp file. Export (`export.controller.ts`): TypeORM `.stream()` piped through `csv-stringify` into the response.

### 9. Health checks and graceful shutdown

- **What:** Liveness/readiness endpoints plus a drain period before the process exits.
- **Why:** Orchestrators need to know when to route traffic and when a pod is shutting down; draining avoids dropped requests.
- **How:** `/health/live` always returns OK; `/health/ready` returns `503` while `ShutdownService` drains (`DRAIN_MS`, default 5s). `app.enableShutdownHooks()` in `src/main.ts` activates it.

### 10. Runtime monitoring

- **What:** A `/monitoring/performance` endpoint reporting CPU, memory, event-loop delay and WebSocket counters.
- **Why:** A blocked event loop makes every request slow; these metrics expose it quickly.
- **How:** `src/monitoring/performance.service.ts` uses `monitorEventLoopDelay`, `process.cpuUsage()` and `process.memoryUsage()`.

## API

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/products/:id` | cached for 5 min |
| `POST` | `/products` | `x-user-id`; validated DTO |
| `PATCH` | `/products/:id` | `x-user-id`; invalidates cache |
| `POST` | `/orders` | `x-user-id` + `Idempotency-Key`; queues email |
| `POST` | `/auth/login` | rate limited: 5 / 15 min per IP + email |
| `POST` | `/admin/products/import` | multipart CSV upload |
| `GET` | `/admin/orders/export` | streamed CSV |
| `GET` / `POST` | `/admin/dlq`, `/admin/dlq/:id/retry` | inspect and retry dead jobs |
| `GET` | `/admin/queues` | Bull Board dashboard |
| `GET` | `/health/live`, `/health/ready`, `/monitoring/performance` | ops endpoints |

## Notes

- `synchronize: true` is for development only; use migrations in production.
- Auth is a dev guard (`x-user-id`); email sending is simulated.
- The WebSocket gateway (`src/websocket/`) is scaffolded but not registered; the audit entity/helper (`src/audit/`) is not wired in.
- BullMQ reads `REDIS_HOST`/`REDIS_PORT` while Docker Compose sets only `REDIS_URL`; align them when running in Docker.
- No test specs exist yet, but Vitest and oxlint are configured (`npm run test`, `npm run lint`).

See the [NestJS documentation](https://docs.nestjs.com) for framework details.
