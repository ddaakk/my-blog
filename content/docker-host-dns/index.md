---
emoji: 📖
title: Docker Host DNS
date: '2021-03-22 23:00:00'
author: 에디
tags: docker
categories: docker
---

`**host.docker.internal**`은 Docker에서 컨테이너가 호스트 시스템에 접근할 수 있도록 도와주는 특수한 DNS 이름입니다. 이를 통해 Docker 컨테이너 내부에서 호스트 머신의 네트워크 자원에 접근할 수 있게 합니다. 

일반적으로 Docker 컨테이너는 자체 네트워크를 갖고 있어서 호스트 시스템의 네트워크와 격리된 상태로 동작합니다. 그러나 때로는 컨테이너가 호스트 시스템의 네트워크 서비스에 접근해야 할 필요가 있습니다. 예를 들어, 호스트 시스템에서 실행 중인 데이터베이스나 API에 컨테이너가 접근해야 하는 경우가 이에 해당합니다.

### 주요 특징

1. **호스트 머신에 네트워크 접근 제공**: 
   - `host.docker.internal`은 Docker 컨테이너가 호스트 시스템의 IP 주소나 네트워크 자원에 접근할 수 있도록 해줍니다.
   - 예를 들어, 호스트 시스템에서 데이터베이스 서버가 실행 중이라면, 컨테이너 내부에서 `host.docker.internal` 주소를 사용해 해당 데이터베이스에 연결할 수 있습니다.
   
2. **운영체제에 따라 지원 여부가 다름**:
   - **Windows**와 **macOS**에서는 기본적으로 `host.docker.internal`이 지원됩니다.
   - **Linux**에서는 기본적으로 지원되지 않지만, 이를 구현하기 위한 다양한 대안이 있습니다. (예: `--add-host` 옵션을 사용하여 호스트 시스템의 IP를 직접 지정하는 방법)

3. **Docker Compose와의 통합**:
   - Docker Compose를 사용할 때도 `host.docker.internal`을 서비스 내에서 사용하여 호스트 네트워크에 접근할 수 있습니다. 이를 통해 Docker Compose로 관리하는 여러 서비스들이 호스트 머신과 상호작용할 수 있습니다.

### 사용 예시

컨테이너 내부에서 호스트 머신의 MySQL 데이터베이스에 접근하고 싶을 때, 다음과 같이 `host.docker.internal`을 사용할 수 있습니다.

```bash
mysql -h host.docker.internal -u username -p
```

여기서 `host.docker.internal`은 호스트 시스템의 IP 주소로 해석되어 MySQL 서버에 접근하게 됩니다.

### 주의사항

- `host.docker.internal`은 네트워크 격리를 우회하기 때문에, 보안상의 이유로 사용에 주의가 필요합니다. 외부 네트워크나 민감한 자원에 접근할 때는 적절한 보안 설정이 요구됩니다.
  
- Linux에서는 기본적으로 지원되지 않으므로, 직접 호스트 IP를 알아내고 수동으로 설정해야 할 수 있습니다.

결론적으로, `host.docker.internal`은 Docker 컨테이너와 호스트 시스템 간의 네트워크 상호작용을 간편하게 해주는 유용한 기능이지만, 지원 여부와 보안 측면을 고려하여 적절하게 사용해야 합니다.

```toc

```