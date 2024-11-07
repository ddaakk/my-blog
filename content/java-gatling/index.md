---
emoji: 📖
title: Gatling을 통한 부하테스트
date: '2024-05-12 19:53:36'
author: 에디
tags: gatling
categories: gatling
---

## Gatling: 자바 환경에서의 부하 테스트 및 성능 테스트

Gatling은 웹 애플리케이션의 부하 테스트와 성능 테스트에 사용되는 강력한 도구로, 기본적으로 **스칼라(Scala)** 언어로 작성되어 있다. 그러나 **자바 환경**에서도 Gatling을 사용할 수 있으며, Gradle을 통해 손쉽게 설정할 수 있다. 자바 환경에서 Gatling을 사용하면 **성능 테스트 스크립트를 자바 코드로 작성**할 수 있고, 이를 통해 웹 애플리케이션의 **성능 병목 현상을 파악하고 최적화**할 수 있다.

---

### 자바 환경에서 Gatling의 주요 특징

1. **고성능 부하 테스트 도구**: Gatling은 비동기 방식으로 높은 부하를 처리할 수 있어 자바 웹 애플리케이션의 성능 테스트에 적합하다.
2. **자바 지원**: 스칼라 기반이지만, 자바로 작성된 테스트 시나리오도 지원하여 자바 개발자에게 친숙하다.
3. **결과 리포팅**: 성능 테스트 후 자세한 HTML 리포트를 제공하여 응답 시간, 요청 성공/실패 비율 등 다양한 성능 지표를 확인할 수 있다.

---

### Gradle 환경에서 자바 기반 Gatling 설정 방법

#### 1. Gradle 설정 파일 (`build.gradle`) 구성
자바 기반의 Gatling을 사용하려면 `build.gradle` 파일에 Gatling 플러그인과 관련 의존성을 추가해야 한다.

```gradle
plugins {
    id 'java' // 자바 프로젝트 플러그인
    id 'io.gatling.gradle' version '3.9.5' // Gatling 플러그인 추가
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'io.gatling.highcharts:gatling-charts-highcharts:3.9.5' // 리포팅 기능을 위한 의존성
    implementation 'io.gatling:gatling-app:3.9.5' // Gatling 기본 의존성
    testImplementation 'junit:junit:4.13.2' // 테스트 의존성 (선택 사항)
}
```

---

#### 2. Gatling 디렉토리 구조
Gradle을 통해 Gatling을 설정한 후, 기본적으로 다음과 같은 디렉토리 구조를 사용하여 자바 기반 Gatling 테스트를 작성할 수 있다.

```
src
├── gatling
│   └── java
│       └── simulations
│           └── YourSimulation.java
```

여기서 `YourSimulation.java` 파일이 Gatling 테스트 시나리오를 포함하는 파일이다.

---

#### 3. Gatling 자바 시나리오 작성
자바로 Gatling 테스트 시나리오를 작성하려면 `io.gatling.javaapi.core` 패키지를 사용한다. 자바에서는 스칼라와 비슷한 방식으로 HTTP 요청을 작성할 수 있지만, 자바 문법을 사용하게 된다.

다음은 간단한 자바 기반 Gatling 시나리오 예시다.

```java
package simulations;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import java.time.Duration;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

public class BasicSimulation extends Simulation {

    // HTTP 프로토콜 설정
    HttpProtocolBuilder httpProtocol = http
        .baseUrl("https://example.com") // 테스트할 기본 URL
        .acceptHeader("text/html");     // HTTP 헤더 설정

    // 시나리오 정의
    ScenarioBuilder scn = scenario("BasicSimulation")
        .exec(
            http("request_1")
                .get("/")               // 기본 경로에 GET 요청
        )
        .pause(Duration.ofSeconds(5));   // 5초 대기

    // 시나리오 실행 및 설정
    {
        setUp(
            scn.injectOpen(atOnceUsers(10)) // 동시에 10명의 사용자 요청 시작
        ).protocols(httpProtocol);
    }
}
```

위 코드에서:
- `httpProtocol`: Gatling의 HTTP 요청을 보낼 기본 프로토콜을 정의한다. 여기에는 기본 URL 및 요청 헤더 정보가 포함된다.
- `ScenarioBuilder`: 실제로 성능 테스트에서 사용할 시나리오를 정의한다. 여기서는 `/` 경로에 GET 요청을 보내고, 5초 대기하는 시나리오다.
- `setUp`: 시나리오를 설정하고, 몇 명의 가상 사용자가 동시에 요청을 보낼지 지정한다. 여기서는 10명의 사용자가 동시에 요청을 보낸다.

---

#### 4. Gatling 테스트 실행
Gatling 테스트를 실행하려면 Gradle 명령을 사용한다. 아래 명령어를 사용하면 정의된 Gatling 시나리오를 실행할 수 있다.

```bash
./gradlew gatlingRun
```

이 명령어는 `src/gatling/java/simulations` 디렉토리 아래에 있는 모든 시나리오를 실행한다. 테스트가 완료되면 Gatling은 HTML 리포트를 자동으로 생성하여 성능 결과를 확인할 수 있다.

---

#### 5. Gatling 테스트 결과 리포트
테스트가 완료되면, Gatling은 자동으로 성능 테스트 리포트를 생성한다. 리포트는 보통 `build/reports/gatling` 디렉토리에서 확인할 수 있다. HTML 리포트에는 다음과 같은 성능 지표가 포함된다:
- **응답 시간 분포**: 요청의 평균 응답 시간과 퍼센트 범위를 그래프 형식으로 시각화한다.
- **처리량**: 초당 처리된 요청 수.
- **성공/실패 비율**: 성공한 요청과 실패한 요청의 비율.

리포트는 웹 브라우저에서 열어 시각적인 데이터를 통해 성능 문제를 쉽게 파악할 수 있다.

---

### Gatling 테스트 시나리오 구성 요소

1. **HTTP 프로토콜 설정 (`httpProtocol`)**:
   HTTP 프로토콜을 정의하여 기본 URL, 헤더, 쿠키 등을 설정한다. 모든 시나리오에서 동일한 설정을 사용할 수 있다.

2. **ScenarioBuilder**:
   시나리오는 사용자가 어떤 요청을 보내고, 어떤 작업을 할지를 정의한다. 여러 단계로 구성할 수 있으며, 다양한 HTTP 요청 메서드(GET, POST 등)를 지원한다.

3. **Load Injection**:
   성능 테스트에서는 얼마나 많은 가상 사용자가 동시에 요청을 보내는지를 정의하는 것이 중요하다. Gatling은 다양한 부하 시뮬레이션 방법을 제공한다:
   - `atOnceUsers(n)`: 한 번에 n명의 사용자가 동시에 요청을 보냄.
   - `rampUsers(n).during(Duration)`: 주어진 시간 동안 n명의 사용자가 서서히 요청을 보냄.
   - `constantUsersPerSec(n).during(Duration)`: 주어진 시간 동안 초당 n명의 사용자가 일정하게 요청을 보냄.

4. **Assertions**:
   Gatling은 성능 테스트에서 특정 조건을 설정하여 테스트가 성공 또는 실패했는지를 판별하는 **Assertions** 기능도 제공한다. 예를 들어, 응답 시간이 일정 시간 이하인지를 테스트할 수 있다.

```java
setUp(
    scn.injectOpen(atOnceUsers(10))
).protocols(httpProtocol)
 .assertions(
    global().responseTime().max().lt(2000), // 최대 응답 시간이 2초 이하
    global().successfulRequests().percent().gt(95.0) // 성공한 요청이 95% 이상
 );
```

---

### 결론
자바 환경에서 Gatling을 사용하는 것은 자바 개발자에게 친숙한 방식으로 성능 테스트를 구성할 수 있는 좋은 방법이다. Gradle을 통해 Gatling을 설정하고 자바로 작성된 성능 테스트 시나리오를 쉽게 작성할 수 있으며, 결과는 Gatling이 제공하는 강력한 리포트 기능을 통해 상세히 분석할 수 있다. Gatling은 복잡한 부하 테스트나 고성능 웹 애플리케이션의 성능 병목 현상을 파악하는 데 매우 유용한 도구이다.

```toc

```
