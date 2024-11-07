---
emoji: 📖
title: Docker Host DNS
date: '2024-06-05 23:16:26'
author: 에디
tags: docker
categories: docker
---

`**host.docker.internal**`은 Docker에서 제공하는 특수한 DNS 이름으로, **컨테이너가 호스트 시스템에 접근할 수 있도록 도와주는 기능**이다. 이를 통해 Docker 컨테이너 내부에서 호스트 머신의 네트워크 자원에 쉽게 접근할 수 있다.

기본적으로 Docker 컨테이너는 자체 네트워크 환경을 가지고 있어서, 호스트 시스템의 네트워크와 격리된 상태로 동작한다. 하지만 때로는 컨테이너가 호스트 시스템의 네트워크 서비스에 접근해야 할 경우가 있다. 예를 들어, 호스트 시스템에서 실행 중인 데이터베이스나 API에 컨테이너가 연결해야 하는 경우가 그런 상황이다.

---

### 주요 특징

1. **호스트 머신에 네트워크 접근 제공**  
   - `host.docker.internal`을 사용하면 Docker 컨테이너가 호스트 시스템의 IP 주소나 네트워크 자원에 접근할 수 있다.
   - 예를 들어, 호스트 시스템에서 데이터베이스 서버가 실행 중이라면, 컨테이너 내부에서 `host.docker.internal` 주소를 사용해 해당 데이터베이스에 연결할 수 있다.

2. **운영체제에 따른 지원 여부**  
   - **Windows**와 **macOS**에서는 `host.docker.internal`이 기본적으로 지원된다.
   - **Linux**에서는 기본적으로 지원되지 않지만, 이를 구현하기 위한 몇 가지 대안이 있다. 예를 들어, Docker 실행 시 `--add-host` 옵션을 사용해 호스트 시스템의 IP를 수동으로 지정할 수 있다.

3. **Docker Compose와의 통합**  
   - Docker Compose를 사용할 때도 `host.docker.internal`을 사용해 호스트 네트워크에 접근할 수 있다. 이를 통해 Docker Compose로 관리하는 여러 서비스들이 호스트 머신과 상호작용할 수 있다.

---

### 사용 예시

컨테이너 내부에서 호스트 머신의 MySQL 데이터베이스에 접근하고 싶다면, 다음과 같이 `host.docker.internal`을 사용할 수 있다:

```bash
mysql -h host.docker.internal -u username -p
```

여기서 `host.docker.internal`은 호스트 시스템의 IP 주소로 해석되어, MySQL 서버에 접근할 수 있게 된다.

---

### 주의사항

- `host.docker.internal`을 사용하면 네트워크 격리를 우회하기 때문에, 보안상의 주의가 필요하다. 외부 네트워크나 민감한 자원에 접근할 때는 적절한 보안 설정이 필수적이다.

- Linux에서는 기본적으로 지원되지 않으므로, 수동으로 호스트 IP를 설정해야 할 수 있다. 필요할 경우 `--add-host` 옵션이나 호스트의 IP 주소를 직접 컨테이너에 추가하는 방식으로 대체할 수 있다.

---

**결론적으로**, `host.docker.internal`은 Docker 컨테이너와 호스트 시스템 간의 네트워크 상호작용을 간편하게 해주는 유용한 기능이지만, 지원 여부와 보안 측면을 고려하여 신중하게 사용해야 한다.

```toc

```
