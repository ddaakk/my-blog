---
emoji: 📖
title: Spring Fetch Join과 여러 엔티티 Join의 주의사항
date: '2021-03-22 23:00:00'
author: 에디
tags: spring
categories: spring
---

# 스프링 부트에서 Fetch Join과 여러 엔티티 Join의 주의사항

스프링 부트에서 **Fetch Join**과 **여러 엔티티 Join**은 데이터베이스 성능 최적화와 N+1 문제 해결에 유용하지만, 잘못 사용하면 성능 문제나 중복 데이터 발생 등 다양한 문제가 발생할 수 있습니다. 이를 제대로 이해하고 적절히 사용해야 애플리케이션 성능을 유지할 수 있습니다. 여기에서는 Fetch Join 사용 시 주의사항과 여러 엔티티를 Join할 때의 문제점 및 해결 방법을 설명합니다.

## 1. **Fetch Join이란?**

**Fetch Join**은 JPA에서 **N+1 문제**를 해결하기 위해 관계된 엔티티를 **한 번의 쿼리**로 함께 조회하는 기법입니다. 기본적으로 **Lazy Loading**을 대체하여 성능을 최적화하지만, 잘못 사용하면 오히려 성능 저하가 발생할 수 있습니다.

### Fetch Join의 기본 사용 예시:
```java
SELECT m FROM Member m JOIN FETCH m.team
```
이 예시는 `Member`를 조회하면서 `Team`을 함께 가져오는 방식입니다. 한 번의 쿼리로 두 개의 엔티티 데이터를 동시에 로딩할 수 있어 효율적입니다.

---

## 2. **Fetch Join의 주의사항**

### (1) **중복 데이터 문제**
Fetch Join은 **일대다(OneToMany) 관계**에서 중복 데이터를 발생시킬 수 있습니다. 예를 들어, `Team`과 `Member`가 1:N 관계일 때, `Team`을 기준으로 Fetch Join을 사용하면 동일한 팀 데이터가 여러 번 반복해서 조회될 수 있습니다.

#### 해결 방법:
- **JPQL의 `DISTINCT`** 키워드를 사용하여 중복된 데이터를 필터링할 수 있지만, 이는 **SQL의 DISTINCT**와 다르게 애플리케이션 레벨에서 처리되어 성능에 영향을 미칠 수 있습니다.
  
```java
SELECT DISTINCT t FROM Team t JOIN FETCH t.members
```

### (2) **페이징과 Fetch Join**
**일대다 관계**에서 Fetch Join을 사용할 때 페이징 처리가 제대로 동작하지 않습니다. JPA는 메모리에서 페이징을 처리하기 때문에 **메모리 사용량이 증가**하고, 성능 저하가 발생할 수 있습니다.

#### 해결 방법:
- **서브쿼리**를 사용하거나 **배치 패치(batch fetch)** 전략을 사용하여 데이터를 나누어 처리하는 것이 좋습니다.

### (3) **여러 컬렉션 Fetch Join의 제한**
JPA 스펙에서는 **하나의 쿼리에서 여러 컬렉션을 Fetch Join**하는 것을 허용하지 않습니다. 여러 컬렉션을 동시에 Fetch Join하려 하면 JPA 예외가 발생할 수 있습니다.

```java
// 잘못된 예시: 두 개의 컬렉션을 Fetch Join
SELECT t FROM Team t JOIN FETCH t.members JOIN FETCH t.projects
```

이 경우, 컬렉션 중 하나만 Fetch Join을 사용하고 나머지는 Lazy Loading으로 처리하거나 다른 전략을 사용해야 합니다.

### (4) **대량 데이터 조회 시 성능 저하**
Fetch Join은 많은 데이터를 한 번에 가져오는 방식이므로 대량의 데이터를 처리할 때 성능 저하가 발생할 수 있습니다. 특히 일대다 관계에서 Fetch Join을 사용할 때 데이터가 기하급수적으로 증가할 수 있습니다.

---

## 3. **여러 엔티티를 Join할 때 발생할 수 있는 문제들**

여러 엔티티를 JPQL에서 Join하여 조회하는 것은 가능하지만, Fetch Join을 사용할 때 주의해야 할 문제들이 있습니다.

### (1) **SQL의 Cartesian Product(카테시안 곱) 문제**
여러 엔티티를 Fetch Join하게 되면 데이터가 곱셈 구조로 증가하여 **카테시안 곱** 문제가 발생할 수 있습니다. 이는 대량의 중복 데이터가 조회되면서 성능에 큰 영향을 미칠 수 있습니다.

### (2) **중복 데이터 발생**
여러 엔티티를 Join하면 **중복 데이터**가 발생할 가능성이 큽니다. 특히 **일대다 관계**에서 Fetch Join을 사용하면, 다(N)쪽의 엔티티 수만큼 일(1)쪽의 엔티티가 중복 조회될 수 있습니다.

#### 예시:
```java
SELECT t FROM Team t 
JOIN FETCH t.members 
JOIN FETCH t.projects
```
이 경우, 각 팀에 여러 멤버와 여러 프로젝트가 있을 때 중복된 팀 데이터가 여러 번 조회됩니다.

### (3) **여러 컬렉션을 Fetch Join하지 않는 것이 좋다**
일대다 관계에서 두 개 이상의 컬렉션을 Fetch Join하려 하면 문제가 발생합니다. **JPA는 한 번에 하나의 컬렉션만 Fetch Join**할 수 있으므로, 다중 컬렉션 Fetch Join은 피해야 합니다.

---

## 4. **문제 해결 방안**

### (1) **다대일(N:1) 또는 일대일(1:1) 관계에서 Fetch Join 사용**
**다대일** 또는 **일대일** 관계에서는 Fetch Join을 사용하는 것이 안전합니다. 이 경우, 중복 데이터 문제 없이 데이터를 효율적으로 로드할 수 있습니다.

```java
SELECT m FROM Member m JOIN FETCH m.team
```
위와 같은 다대일 관계에서는 안전하게 Fetch Join을 사용할 수 있습니다.

### (2) **일대다(1:N) 관계에서 Fetch Join 최소화**
일대다 관계에서는 Fetch Join을 최소화하고, 필요 시 **Lazy Loading**을 통해 데이터를 조회하는 것이 더 좋습니다. 특히 대량 데이터를 다룰 때 Fetch Join은 중복 데이터를 발생시키므로 주의해야 합니다.

### (3) **배치 패치(batch fetch) 사용**
**Batch Fetching**은 여러 엔티티를 한 번에 가져오는 방식으로, 페이징이나 대량 데이터를 다룰 때 유용합니다. 이를 사용하면 **N+1 문제**를 해결하면서도 성능을 유지할 수 있습니다.

```java
@Entity
@BatchSize(size = 10)
public class Team {
    //...
}
```

### (4) **서브쿼리 활용**
**서브쿼리**를 사용하면 일대다 관계에서 페이징 문제를 해결할 수 있습니다. 서브쿼리로 먼저 일(1)쪽 데이터를 가져온 후 필요한 다(N)쪽 데이터를 추가로 로드하는 방식입니다.

```java
SELECT t FROM Team t 
WHERE t.id IN (SELECT t2.id FROM Team t2)
```

---

## 5. **Team과 Member 관계에서의 Fetch Join 사용**

`Team`과 `Member`가 **1:N 관계**일 때, **Member를 기준으로 Fetch Join**을 사용하는 것이 안전합니다. **Member**는 다대일 관계에서 다(N)쪽에 해당하므로, 중복 데이터 없이 조회가 가능합니다.

```java
SELECT m FROM Member m JOIN FETCH m.team
```
이렇게 하면 `Member` 기준으로 `Team` 데이터를 중복 없이 가져올 수 있습니다.

반대로 **Team**을 기준으로 Fetch Join을 사용하면, **Team** 데이터가 멤버 수만큼 중복되기 때문에 **성능 문제**가 발생할 수 있습니다.

---

## 요약

1. **Fetch Join**은 성능 최적화에 유용하지만 **일대다(1:N) 관계**에서 **중복 데이터**와 **페이징 문제**가 발생할 수 있으므로 주의가 필요합니다.
2. **다대일(N:1) 또는 일대일(1:1)** 관계에서는 Fetch Join을 안전하게 사용할 수 있습니다.
3. 여러 엔티티를 Join할 때 **중복 데이터** 문제와 **카테시안 곱** 문제에 유의해야 하며, 필요 시 **배치 패치**나 **서브쿼리**를 활용하는 것이 좋습니다.
4. `Team`과 `Member` 관계에서는 **Member** 기준으로 Fetch Join을 사용하는 것이 **중복 문제**를 피하는 좋은 방법입니다.

적절한 **쿼리 설계**와 **최적화 전략**을 통해 성능 저하를 방지하고 데이터를 효율적으로 조회할 수 있습니다.

```toc

```