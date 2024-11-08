---
emoji: 📖
title: Redis 캐싱
date: '2024-03-18 17:42:31'
author: 에디
tags: redis
categories: redis
---

# Redis 캐싱 전략

Redis를 이용해 캐싱을 구현할 때, 데이터를 어떻게 읽고 쓰는지에 따라 다양한 전략을 사용할 수 있다. 각 전략은 성능과 데이터 일관성에 미치는 영향이 다르므로, 애플리케이션의 특성에 맞는 방식을 선택하는 것이 중요하다. 아래는 Redis 캐싱에서 자주 사용되는 **읽기 전략**과 **쓰기 전략**이다.

---

## 🟢 읽기 전략 (Read Strategies)

### 1. **Read-Through** (캐시 자동 조회)
클라이언트가 데이터를 요청하면 먼저 캐시를 확인하고, 캐시에 데이터가 없으면 캐시가 자동으로 데이터베이스에서 데이터를 가져와 저장한 후 클라이언트에게 반환하는 방식이다.

- **장점**
  - 캐시 관리가 자동으로 이루어져 관리가 편리하다.
  - 자주 사용되는 데이터가 캐시에 남아 조회 속도가 빨라진다.
  
- **단점**
  - 처음 요청 시에는 캐시에 데이터가 없어 응답이 느릴 수 있다.
  - 캐시와 데이터베이스 간 통합 설정이 다소 복잡할 수 있다.

---

### 2. **Cache-Aside (Lazy Loading)** (캐시 수동 조회)
애플리케이션이 직접 캐시를 관리하는 방식이다. 클라이언트가 데이터를 요청할 때 캐시에 없으면 데이터베이스에서 데이터를 가져와 캐시에 저장하고 반환한다.

- **장점**
  - 개발자가 캐시 로직을 직접 제어할 수 있어 유연하다.
  - 자주 사용되는 데이터만 캐시에 저장되므로 메모리를 효율적으로 사용할 수 있다.
  
- **단점**
  - 캐시 관리 로직을 직접 구현해야 하기 때문에 복잡할 수 있다.
  - 초기 캐시 미스 시 응답이 지연될 수 있다.

---

### 3. **Refresh-Ahead** (미리 갱신)
데이터가 만료되기 전에 캐시를 미리 갱신하는 방식이다. 예상되는 요청에 대비해 캐시를 백그라운드에서 업데이트하여 캐시 미스를 줄인다.

- **장점**
  - 캐시 미스를 줄여 응답 시간이 일정하게 유지된다.
  
- **단점**
  - 사용되지 않을 데이터를 갱신하면 리소스가 낭비될 수 있다.
  - 데이터 요청 패턴을 잘못 예측하면 효과가 떨어질 수 있다.

---

### 4. **TTL (Time to Live) 기반 캐싱**
캐시에 저장된 데이터에 유효 기간을 설정하여, 그 시간이 지나면 자동으로 캐시에서 제거되도록 하는 방식이다.

- **장점**
  - 오래된 데이터가 자동으로 삭제되어 항상 최신 데이터를 유지할 수 있다.
  - 메모리 사용을 최적화할 수 있다.
  
- **단점**
  - 적절한 TTL 설정이 어려울 수 있다. 너무 짧으면 캐시 미스가 자주 발생하고, 너무 길면 오래된 데이터가 유지될 수 있다.
  - 캐시 만료 후 다시 데이터베이스에서 데이터를 가져오는 동안 지연이 발생할 수 있다.

---

## 🔵 쓰기 전략 (Write Strategies)

### 1. **Write-Through** (쓰기 직행)
데이터를 캐시와 데이터베이스에 동시에 쓰는 방식이다. 클라이언트가 데이터를 쓰면 캐시와 데이터베이스에 모두 반영된다.

- **장점**
  - 캐시와 데이터베이스의 데이터가 항상 동기화되어 데이터 일관성이 보장된다.
  - 최신 데이터를 캐시에서 바로 가져올 수 있어 읽기 성능이 향상된다.
  
- **단점**
  - 캐시와 데이터베이스에 동시에 기록하므로 쓰기 속도가 느려질 수 있다.

---

### 2. **Write-Around** (쓰기 우회)
데이터를 데이터베이스에만 기록하고, 캐시에는 쓰지 않는 방식이다. 이후 데이터를 읽을 때 캐시에 로드된다.

- **장점**
  - 캐시를 자주 사용되지 않는 데이터로부터 보호하여 캐시 공간을 더 효율적으로 사용할 수 있다.
  
- **단점**
  - 처음 데이터를 읽을 때는 캐시에 없기 때문에 데이터베이스에서 가져오는 동안 지연이 발생할 수 있다.

---

### 3. **Write-Back** (쓰기 지연)
데이터를 먼저 캐시에 저장하고, 일정 조건이 충족되면 나중에 데이터베이스에 반영하는 방식이다.

- **장점**
  - 대부분의 쓰기 작업이 캐시에서 이루어지므로 성능이 크게 향상된다.
  - 데이터베이스에 대한 쓰기 부하를 줄일 수 있다.
  
- **단점**
  - 캐시와 데이터베이스 간 데이터 불일치가 발생할 수 있으며, 캐시에 문제가 생기면 데이터 손실 위험이 있다.
  - 이를 위한 복잡한 동기화 로직이 필요할 수 있다.

---

적절한 캐싱 전략을 통해 Redis의 성능을 극대화하고 데이터 일관성을 유지할 수 있다. 애플리케이션의 특성에 맞는 전략을 선택해 사용하는 것이 중요하다.

```toc
```