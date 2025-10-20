# @intelligence-studio/wizard-datasources

Production-grade data source manager with SSRF protection, retries, circuit breakers, and caching.

## Features

- ✅ **SSRF Protection** - Blocks private IPs, enforces HTTPS, host allowlisting
- ✅ **Retry with Jitter** - Exponential/linear/fixed backoff strategies
- ✅ **Circuit Breakers** - Prevents cascading failures
- ✅ **LRU Cache** - With TTL and custom cache keys
- ✅ **In-Flight Deduplication** - Coalesces concurrent identical requests
- ✅ **Privacy Enforcer** - Classification, purpose, retention, AI gates
- ✅ **79/79 Tests Passing** - 100% test coverage

## Installation

```bash
npm install @intelligence-studio/wizard-datasources @intelligence-studio/wizard-core zod
```

## Usage

### Basic Usage

```typescript
import { DataSourceManager } from '@intelligence-studio/wizard-datasources'

const dsm = new DataSourceManager({
  allowedHosts: [
    '^/api/',
    'https://api\\.motomind\\.com'
  ],
  requireHTTPS: true,
  blockPrivateIPs: true,
})

const result = await dsm.execute({
  name: 'vinDecode',
  type: 'http.get',
  url: '/api/vin/decode?vin={{fields.vin.value}}',
  retry: {
    retries: 3,
    backoff: 'exponential',
    baseMs: 100,
    maxMs: 5000
  }
}, context)
```

### With Circuit Breaker

```typescript
const result = await dsm.execute({
  name: 'slowService',
  type: 'http.get',
  url: 'https://api.example.com/data',
  circuitBreaker: {
    enabled: true,
    threshold: 5,
    timeout: 60000,
    halfOpenAttempts: 3
  }
}, context)
```

## API

### `DataSourceManager`

Main class for managing data sources.

### Security Features

- **URL Validator** - SSRF protection, HTTPS enforcement
- **Retry Logic** - With jitter to prevent thundering herd
- **Circuit Breaker** - Auto-recovery with half-open state
- **Privacy Enforcer** - Required tags for data handling

## License

Apache-2.0
