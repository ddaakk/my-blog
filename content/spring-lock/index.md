---
emoji: 📖
title: Spring Lock
date: '2024-01-15 10:23:45'
author: 에디
tags: spring
categories: spring
---

# 스프링 부트에서의 락(Lock) 개념 정리

스프링 부트에서 동시성 문제를 해결하려면 다양한 **락(Lock) 기법**을 사용할 수 있다. 여러 스레드가 동시에 같은 자원에 접근하려 할 때, 데이터가 엉키지 않도록 **데이터 무결성**을 보장하려면 락을 걸어야 한다. 스프링 부트는 자바에서 제공하는 기본 락 외에도 다양한 락을 사용할 수 있게 해준다.

### 1. **낙관적 락 (Optimistic Lock)**
낙관적 락은 **데이터 충돌 가능성이 낮을 때** 사용하는 방식이다. 데이터에 버전 필드를 두고, 충돌이 발생하면 **예외를 발생**시킨다. 주로 읽기 작업이 빈번하고 충돌이 적은 경우에 적합하다.

- **예시**: 
  ```java
  @Version
  private int version;
  ```

### 2. **비관적 락 (Pessimistic Lock)**
비관적 락은 **충돌 가능성이 높을 때** 사용하는 락이다. 자원에 접근하려는 순간 락을 걸어 다른 스레드가 접근하지 못하게 막는다.

- **예시**:
  ```java
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  Product findProductForUpdate(Long id);
  ```

### 3. **베타락 (Read-Write Lock)**
읽기와 쓰기를 구분해서 관리하는 **베타락**은 여러 스레드가 동시에 읽기 작업을 할 수 있도록 하되, 쓰기 작업이 발생하면 읽기와 쓰기를 모두 막아 데이터의 일관성을 유지한다.

- **예시**:
  ```java
  private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
  lock.readLock().lock(); // 읽기 락
  lock.writeLock().lock(); // 쓰기 락
  ```

### 4. **Synchronized 키워드**
`synchronized`는 자바에서 가장 기본적인 락이다. `synchronized` 블록을 사용하면 한 번에 한 스레드만 접근할 수 있게 한다.

- **예시**:
  ```java
  public synchronized void incrementCounter() {
      counter++;
  }
  ```

### 5. **ReentrantLock**
`synchronized`보다 좀 더 유연한 방법으로, 재귀적으로 락을 걸 수 있고 타임아웃을 설정할 수도 있다.

- **예시**:
  ```java
  private final ReentrantLock lock = new ReentrantLock();
  lock.lock(); // 락 획득
  lock.unlock(); // 락 해제
  ```

### 6. **StampedLock**
Java 8부터 도입된 이 락은 읽기 작업이 많은 환경에서 성능을 높이는 데 효과적이다. 낙관적 읽기와 쓰기 락을 함께 제공한다.

- **예시**:
  ```java
  long stamp = lock.tryOptimisticRead();
  if (!lock.validate(stamp)) {
      stamp = lock.readLock();
  }
  lock.writeLock();
  ```

### 7. **Semaphore (세마포어)**
세마포어는 **동시에 접근할 수 있는 스레드 수를 제한**하는 방식이다. 예를 들어, 세 개의 스레드만 자원에 접근하도록 설정할 수 있다.

- **예시**:
  ```java
  private final Semaphore semaphore = new Semaphore(3);
  semaphore.acquire(); // 자원 획득
  semaphore.release(); // 자원 반환
  ```

### 8. **CountDownLatch**
여러 스레드가 특정 작업을 모두 완료할 때까지 대기하게 하는 도구다. 모든 스레드가 완료되면 다음 단계로 넘어간다.

- **예시**:
  ```java
  private final CountDownLatch latch = new CountDownLatch(3);
  latch.countDown(); // 작업 완료 시 호출
  latch.await(); // 모든 작업이 완료될 때까지 대기
  ```

### 9. **CyclicBarrier**
여러 스레드가 모두 특정 지점에 도달할 때까지 기다리게 하고, 동시에 다음 작업을 시작하게 만드는 락이다.

- **예시**:
  ```java
  private final CyclicBarrier barrier = new CyclicBarrier(3);
  barrier.await(); // 3개의 스레드가 모두 도착할 때까지 대기
  ```

---

스프링 부트에서 제공하는 다양한 락 기법들은 동시성 문제를 해결하는 데 중요한 역할을 한다. 상황에 맞게 **낙관적 락**, **비관적 락**, **베타락** 등을 선택할 수 있으며, **ReentrantLock**, **StampedLock**, **Semaphore** 같은 자바의 기본 락 도구들도 함께 사용할 수 있다. 이를 잘 활용하면 스프링 부트 애플리케이션에서의 동시성 문제를 효과적으로 해결할 수 있다.

```toc

```
