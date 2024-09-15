---
emoji: 📖
title: Spring Lock
date: '2021-03-22 23:00:00'
author: 에디
tags: spring
categories: spring
---

# 스프링 부트에서의 락(Lock) 개념 정리

스프링 부트에서는 **동시성 문제**를 해결하기 위해 다양한 락(Lock) 기법을 제공합니다. 멀티스레드 환경에서 여러 스레드가 동시에 같은 자원에 접근하려 할 때 **데이터 무결성**을 보장하기 위해 락을 사용합니다. 스프링 부트에서 사용 가능한 주요 락 개념을 살펴보면, 기본적인 락 외에도 자바에서 제공하는 다양한 락을 활용할 수 있습니다.

## 1. **낙관적 락 (Optimistic Lock)**
낙관적 락은 **데이터 충돌 가능성이 낮을 때** 사용하는 락으로, 버전 필드를 사용하여 충돌을 감지하고, 충돌이 발생할 경우 **예외**를 발생시킵니다.

### 동작 원리:
- 데이터 수정 시점에 버전 필드를 확인하여 충돌을 감지.
- 충돌이 없으면 데이터가 정상적으로 저장되고, 충돌이 있으면 예외 발생.

### 예시:
```java
@Version
private int version;
```

낙관적 락은 주로 **데이터 읽기 작업이 빈번하고 충돌이 적은 경우** 사용됩니다.

## 2. **비관적 락 (Pessimistic Lock)**
비관적 락은 **데이터 충돌 가능성이 높을 때** 사용하는 락으로, 자원에 접근하는 순간 다른 스레드가 자원을 사용하지 못하도록 **락을 걸어** 충돌을 미리 방지합니다.

### 동작 원리:
- 데이터를 읽거나 수정하는 순간, 해당 데이터에 락을 걸어 다른 스레드의 접근을 차단.

### 예시:
```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
Product findProductForUpdate(Long id);
```

비관적 락은 충돌 가능성이 높은 경우에 적합합니다.

## 3. **베타락 (Read-Write Lock)**
베타락은 **읽기 작업과 쓰기 작업을 구분**하여 병렬 처리가 가능합니다. 여러 스레드가 동시에 읽기는 가능하나, 쓰기 작업이 발생하면 읽기와 쓰기를 모두 차단하여 데이터의 **일관성**을 보장합니다.

### 동작 원리:
- **읽기 락**: 여러 스레드가 동시에 데이터를 읽는 것은 허용.
- **쓰기 락**: 쓰기 작업 시 모든 접근을 차단.

### 예시:
```java
private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
lock.readLock().lock(); // 읽기 락
lock.writeLock().lock(); // 쓰기 락
```

베타락은 **읽기 작업이 많은 경우**에 유용합니다.

## 4. **Synchronized 키워드 (Synchronized Block)**
`Synchronized`는 자바에서 가장 기본적인 락 메커니즘으로, **단일 스레드**만 특정 코드 블록이나 메서드에 접근할 수 있도록 합니다.

### 동작 원리:
- `synchronized`가 붙은 블록은 한 번에 한 스레드만 접근 가능.

### 예시:
```java
public synchronized void incrementCounter() {
    counter++;
}
```

`Synchronized`는 간단한 락을 구현할 때 유용하지만 성능 저하가 있을 수 있습니다.

## 5. **ReentrantLock**
`ReentrantLock`은 `synchronized`보다 유연한 락으로, 락을 **재귀적으로 획득**할 수 있으며, **타임아웃 설정** 및 **명시적 해제**가 가능합니다.

### 동작 원리:
- `lock.lock()`으로 락을 획득하고, `lock.unlock()`으로 해제.

### 예시:
```java
private final ReentrantLock lock = new ReentrantLock();
lock.lock(); // 락 획득
lock.unlock(); // 락 해제
```

`ReentrantLock`은 더 복잡한 락 처리에 적합합니다.

## 6. **StampedLock**
`StampedLock`은 Java 8에 도입된 락으로, **낙관적 읽기**와 **쓰기 락**을 동시에 제공하여 읽기 작업이 많은 환경에서 성능을 최적화할 수 있습니다.

### 동작 원리:
- 낙관적 읽기를 시도하고, 충돌이 없으면 락을 획득하지 않고 데이터를 읽음.
- 충돌이 발생하면 쓰기 락을 사용.

### 예시:
```java
long stamp = lock.tryOptimisticRead();
if (!lock.validate(stamp)) {
    stamp = lock.readLock();
}
lock.writeLock();
```

`StampedLock`은 **읽기 성능을 최적화**할 때 사용됩니다.

## 7. **Semaphore (세마포어)**
`Semaphore`는 **동시에 접근할 수 있는 스레드 수**를 제한하는 메커니즘입니다. 지정된 개수의 스레드만 자원에 접근할 수 있도록 제어합니다.

### 동작 원리:
- `semaphore.acquire()`로 자원 획득, `semaphore.release()`로 자원 반환.

### 예시:
```java
private final Semaphore semaphore = new Semaphore(3);
semaphore.acquire(); // 자원 획득
semaphore.release(); // 자원 반환
```

`Semaphore`는 자원의 **동시 접근을 제한**할 때 유용합니다.

## 8. **CountDownLatch**
`CountDownLatch`는 **여러 스레드가 특정 작업을 완료할 때까지 대기**하게 하는 동기화 도구입니다. 모든 스레드가 완료되면 다음 작업을 진행할 수 있습니다.

### 동작 원리:
- `countDown()`을 통해 카운트를 줄이고, 카운트가 0이 되면 모든 스레드가 대기 상태에서 해제.

### 예시:
```java
private final CountDownLatch latch = new CountDownLatch(3);
latch.countDown(); // 작업 완료 시 호출
latch.await(); // 모든 작업이 완료될 때까지 대기
```

`CountDownLatch`는 **비동기 작업의 완료를 기다릴 때** 유용합니다.

## 9. **CyclicBarrier**
`CyclicBarrier`는 **여러 스레드가 모두 특정 지점에 도달할 때까지 대기**하게 하는 락입니다. 모든 스레드가 도착하면 동시에 다음 작업을 시작합니다.

### 동작 원리:
- 모든 스레드가 `barrier.await()`에 도달하면 동시에 다음 단계로 이동.

### 예시:
```java
private final CyclicBarrier barrier = new CyclicBarrier(3);
barrier.await(); // 3개의 스레드가 모두 도착할 때까지 대기
```

`CyclicBarrier`는 **동시성 제어**가 필요한 경우에 적합합니다.

---

## 요약
스프링 부트에서 사용하는 다양한 락 기법들은 동시성 문제를 해결하고, 데이터 무결성을 보장하는 데 중요한 역할을 합니다. 각각의 락은 상황에 맞게 사용되며, **낙관적 락**, **비관적 락**, **베타락** 외에도 자바의 기본 락 기법인 **Synchronized**, **ReentrantLock**, **StampedLock**, **Semaphore**, **CountDownLatch**, **CyclicBarrier** 등을 통해 더 유연하게 동시성 처리를 할 수 있습니다.

### 락 선택 기준:
- **낙관적 락**: 데이터 충돌 가능성이 낮을 때.
- **비관적 락**: 데이터 충돌 가능성이 높을 때.
- **베타락**: 읽기 작업이 많고 쓰기 작업이 적을 때.
- **ReentrantLock**: 복잡한 동시성 처리.
- **StampedLock**: 성능 최적화된 낙관적 읽기 처리.
- **Semaphore**: 동시 자원 접근을 제한할 때.
- **CountDownLatch**: 비동기 작업 완료 대기.
- **CyclicBarrier**: 동시 작업의 동기화를 위해.

이러한 다양한 락 기법을 적절히 사용하면 스프링 부트 애플리케이션에서의 동시성 문제를 효과적으로 해결할 수 있습니다.

```toc

```