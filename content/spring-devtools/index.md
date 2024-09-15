---
emoji: 📖
title: Spring DevTools
date: '2021-03-22 23:00:00'
author: 에디
tags: spring
categories: spring
---

# Spring DevTools

Spring DevTools는 **Spring Framework**를 사용하여 애플리케이션을 개발할 때 개발 생산성을 높이기 위한 도구 모음입니다. 주로 개발 중에 발생하는 반복적인 작업을 줄이고, 개발 속도를 높이는 데 초점을 맞추고 있습니다. 다음은 Spring DevTools의 주요 기능과 사용 방법에 대한 설명입니다.

## 1. 자동 재시작 (Automatic Restart)
Spring DevTools는 클래스 경로에 있는 파일이 변경될 때마다 애플리케이션을 자동으로 재시작합니다. 이렇게 하면 개발자가 코드를 수정한 후에 서버를 수동으로 다시 시작하지 않고도 변경된 내용을 즉시 확인할 수 있습니다. 자동 재시작 기능은 크게 두 가지 방식으로 작동합니다:
   
- **클래스 경로 모니터링**: 클래스 파일이 변경되면 애플리케이션을 재시작합니다.
- **재시작 제외 설정**: 재시작의 성능을 향상시키기 위해, 재시작이 불필요한 클래스 경로는 제외할 수 있습니다. 기본적으로 `static` 리소스나 `META-INF/resources`, `resources`, `static`, `public` 디렉토리의 변경은 재시작을 트리거하지 않습니다.

## 2. 라이브 리로드 (Live Reload)
Spring DevTools는 브라우저에서 페이지를 새로고침하지 않고도 변경된 내용을 자동으로 반영하는 LiveReload 서버를 내장하고 있습니다. 개발자가 HTML, CSS, JavaScript 파일을 변경하면 브라우저가 자동으로 리로드되도록 합니다. 이를 통해 개발자가 UI 변경사항을 빠르게 확인할 수 있습니다.

## 3. 캐시 비활성화
Spring DevTools는 개발 중 자주 변경되는 리소스에 대해 캐시를 비활성화하여, 변경 사항을 즉시 반영하도록 도와줍니다. 예를 들어, `Thymeleaf` 템플릿 엔진을 사용할 때 템플릿 캐싱이 기본적으로 비활성화되어 있어, HTML 파일의 수정 사항이 서버 재시작 없이 즉시 반영됩니다.

## 4. 애플리케이션 속성의 개발/프로덕션 분리
Spring DevTools를 사용하면 애플리케이션이 개발 모드에서 실행될 때만 특정 설정이 적용되도록 할 수 있습니다. 예를 들어, `application.properties` 또는 `application.yml` 파일에 다음과 같은 속성을 추가하여 개발 모드에서만 적용되는 설정을 정의할 수 있습니다.

```properties
spring.devtools.restart.enabled=true
spring.thymeleaf.cache=false
```

개발 환경과 프로덕션 환경에서 다른 설정을 쉽게 관리할 수 있도록 도와줍니다.

## 5. 원격 개발 지원 (Remote Development)
Spring DevTools는 원격 서버에서도 개발 중인 애플리케이션을 모니터링하고 자동 재시작 등의 기능을 사용할 수 있는 **원격 개발** 기능을 지원합니다. 이 기능을 사용하려면 원격 서버에서 DevTools를 활성화한 후, 로컬 환경에서 수정된 파일을 원격 서버로 전송하여 서버가 자동으로 변경 사항을 반영할 수 있습니다.

```properties
spring.devtools.remote.secret=mysecret
```

위와 같이 비밀번호를 설정한 후, 로컬에서 `Remote Spring Boot Application`으로 실행하여 원격 서버와 통신할 수 있습니다.

## 6. 기본 제공 프로파일
Spring DevTools는 개발에서 자주 사용하는 다양한 프로파일을 기본적으로 제공하여 설정을 간편하게 관리할 수 있습니다. 개발자들은 이러한 기본 제공 프로파일을 통해 개발 환경에서의 애플리케이션 설정을 손쉽게 관리할 수 있습니다.

---

## Spring DevTools 사용 방법

Spring DevTools는 의존성 관리 도구인 Maven 또는 Gradle을 통해 간단히 설정할 수 있습니다.

- **Maven**을 사용하는 경우:
  ```xml
  <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-devtools</artifactId>
      <optional>true</optional>
  </dependency>
  ```

- **Gradle**을 사용하는 경우:
  ```gradle
  dependencies {
      developmentOnly 'org.springframework.boot:spring-boot-devtools'
  }
  ```

## 주의 사항
- DevTools는 개발 환경에서만 사용하는 것이 권장됩니다. 프로덕션 환경에서 사용하지 않도록 패키징할 때 DevTools를 제외해야 합니다.
- DevTools는 성능보다는 편리한 개발을 위해 설계되었기 때문에, 프로덕션 배포 시 성능 저하를 방지하기 위해 반드시 제외 처리해야 합니다.

---

Spring DevTools는 Spring Boot 애플리케이션의 개발 속도를 크게 향상시켜주며, 특히 UI 관련 작업이나 빠른 피드백이 중요한 프로젝트에서 매우 유용하게 사용될 수 있습니다.

```toc

```