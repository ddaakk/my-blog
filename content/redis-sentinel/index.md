---
emoji: 📖
title: Redis Sentinel과 마스터 노드 선출
date: '2024-07-25 11:13:18'
author: 에디
tags: redis
categories: redis
---

## Redis Sentinel

Redis Sentinel은 Redis의 고가용성(High Availability)을 보장하기 위한 도구이다. Sentinel을 사용하면 Redis 서버 인스턴스들을 모니터링하고, 장애가 발생했을 때 자동으로 복구할 수 있다. Redis 클러스터를 구성하지 않고도 마스터-슬레이브 간의 복제와 장애 조치(Failover)를 효과적으로 관리할 수 있다. Sentinel의 주요 기능은 다음과 같다.

### 1. 모니터링 (Monitoring)  
Sentinel은 마스터와 슬레이브 인스턴스를 지속적으로 감시하여, 서버가 정상적으로 동작하는지 확인한다. 특정 인스턴스가 응답하지 않거나 다운되었다고 판단되면, Sentinel은 이를 즉시 감지하고 필요한 조치를 취할 준비를 한다.

### 2. 자동 페일오버 (Automatic Failover)  
마스터 인스턴스가 장애로 인해 다운되면, Sentinel은 슬레이브 인스턴스 중 하나를 새로운 마스터로 승격시킨다. 이후 나머지 슬레이브들이 새로운 마스터를 따르도록 재구성하여, 서비스가 중단되지 않고 지속될 수 있도록 한다. 이를 통해 장애 발생 시 자동으로 복구가 가능하다.

### 3. 알림 (Notification)  
Sentinel은 장애가 감지되거나 페일오버가 수행되었을 때 관리자에게 알림을 보낼 수 있다. 이를 통해 관리자는 Redis 인스턴스의 상태를 실시간으로 파악하고, 필요한 경우 즉각적인 대응을 할 수 있다.

### 4. 구성 관리 (Configuration Management)  
Sentinel은 마스터와 슬레이브의 구성 정보를 중앙에서 관리하여, Redis 클라이언트가 항상 최신 마스터 인스턴스와 연결될 수 있도록 한다. 클라이언트는 Sentinel에 요청하여 현재 마스터의 주소를 확인하고, 장애 발생 시에도 올바른 마스터와 연결할 수 있다.

Redis Sentinel은 이러한 기능을 통해 Redis 서버의 높은 가용성을 유지하며, 클러스터를 구성하지 않아도 비교적 간단하게 장애 복구를 관리할 수 있는 장점이 있다. 다만, Sentinel은 기본적인 장애 조치와 리더 선출 과정에 집중되어 있으며, 클러스터와 같은 고도화된 분산 처리나 데이터를 샤딩(sharding)하여 저장하는 기능은 제공하지 않는다.

---

## Redis Sentinel에서 리더 선출 시 노드를 홀수 개로 두어야 하는 이유

리더 선출은 블록체인, ELK의 리더 선출 방식과 매우 유사하다.

1. **다수결에 의한 결정**  
   리더 선출 과정에서 Sentinel 노드는 다수결에 따라 장애 여부를 판단한다. 이때 명확한 과반수를 확보하기 위해서는 노드 수가 홀수여야 한다. 노드 수가 홀수일 경우 항상 과반수가 존재하므로, 합의가 필요한 상황에서 명확한 결정을 내릴 수 있다.

2. **합의 과정의 안정성**  
   Sentinel 노드가 짝수 개일 경우, 특정 상황에서 2:2와 같은 동률이 발생할 가능성이 있다. 이 경우 장애 여부에 대해 결정을 내리지 못할 수 있으며, 리더 선출 과정이 불안정해질 수 있다. 홀수 개일 때는 최소 과반수가 보장되므로, 합의 과정을 안정적으로 유지할 수 있다.

3. **Split-Brain 방지**  
  네트워크 분할(network partition)과 같은 문제가 발생하면 Sentinel 노드들이 서로 다른 그룹으로 나뉘어, 각 그룹이 서로 다른 결정을 내릴 수 있다. 이를 "Split-Brain"이라고 부르는데, 이는 두 그룹이 동시에 서로 다른 리더를 선출하는 혼란스러운 상황을 초래할 수 있다.

  Sentinel 노드를 홀수 개로 유지하면, 네트워크가 분리되더라도 한쪽 그룹이 항상 **과반수(다수결)**를 확보할 수 있게 된다. 예를 들어 Sentinel 노드가 3개일 때, 두 개의 노드가 같은 그룹에 남게 되면 그 그룹이 과반수를 차지하므로, 안정적으로 하나의 리더를 선택할 수 있다. 이렇게 하면 두 그룹이 각각 다른 리더를 선출하는 상황을 방지할 수 있어, 시스템이 혼란 없이 일관성을 유지할 수 있다.

  즉, 홀수 개로 구성하면 네트워크 문제 상황에서도 한쪽이 다수결을 통해 결정을 내릴 수 있으므로, Split-Brain 현상을 줄이는 데 도움이 된다.

* 또, 좋은 팁으로는 Redis Sentinel 노드를 굳이 다른 노드들과 분리하지 않고, 컨테이너화 시켜서 같은 노드 내에 배치하는 하는 것도 나쁘진 않다.
물론, 그 노드가 죽으면 문제가 되겠지만, 많은 사람들이 위의 방식도 채택한다.

```toc
```