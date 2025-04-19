---
emoji: 📖
title: AOP로 ‘지루한’ 로깅 코드를 날려버리기
date: '2025-01-06 20:30:15'
author: 에디
categories: aop
---

AOP로 ‘지루한’ 로깅 코드를 날려버리기

📌 들어가며

“이번에도 또 메소드마다 logger.info(…), logger.error(…) …”
프로젝트를 진행하면서 메소드마다 똑같은 로깅 코드를 붙이다 보면, 어느새 핵심 비즈니스 로직보다 ‘부가적인’ 로깅 코드가 더 많아집니다. 가독성은 떨어지고, 유지보수는 더 어려워지죠. 이럴 때 **AOP(Aspect‑Oriented Programming)**를 도입하면, 로깅이라는 횡단 관심사를 깔끔하게 분리할 수 있습니다.

이번 포스팅에서는 Spring AOP와 커스텀 어노테이션을 활용해, 메소드 호출 전·후, 예외 발생 시 자동으로 로깅이 되는 라이브러리를 만들어보겠습니다. 마치 “메소드에 한 줄만 붙이면 끝!” 이라는 느낌으로요.

### 프로젝트 세팅: build.gradle

Spring Boot 프로젝트에 AOP 기능을 추가하려면,

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter'      // 기본 스타터
    implementation 'org.springframework.boot:spring-boot-starter-aop'  // AOP 지원
    // SLF4J+Logback은 스타터에 이미 포함되어 있습니다.
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

spring-boot-starter-aop 하나만 추가하면, AOP와 관련된 모든 의존성이 자동으로 설정됩니다.

### “이 메소드만 로깅해 주세요” – 커스텀 어노테이션

메소드마다 일일이 logger를 부르지 않고, 어노테이션 하나로 제어할 수 있게 해줄 커스텀 어노테이션을 정의합니다.

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface Loggable {
    LogLevel level() default LogLevel.INFO;       // 로그 레벨
    boolean showParams() default true;            // 파라미터 로깅 여부
    boolean showResult() default true;            // 반환값 로깅 여부
    boolean measureExecutionTime() default true;  // 실행 시간 측정 여부
    String prefix() default "";                   // 메시지 앞에 붙일 접두사
}
```

```java
public enum LogLevel { TRACE, DEBUG, INFO, WARN, ERROR }
```

메소드 위에 @Loggable만 붙이면, 그 메소드 호출 전후에 자동으로 로그가 찍힙니다.

### 핵심! LoggingAspect – AOP 어드바이스

이제 실제로 메소드 실행 시점을 가로채 로깅을 해줄 Aspect를 작성합니다.

```java
@Aspect
@Component
public class LoggingAspect {

    // @Loggable이 붙은 메소드 또는 클래스 범위
    @Pointcut("@annotation(com.example.logging.annotation.Loggable)"
            + " || @within(com.example.logging.annotation.Loggable)")
    public void loggablePointcut() {}

    @Around("loggablePointcut()")
    public Object logAround(ProceedingJoinPoint joinPoint) throws Throwable {
        // 1) 메소드·클래스 정보 추출
        MethodSignature sig = (MethodSignature) joinPoint.getSignature();
        Method method = sig.getMethod();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = method.getName();
        Logger logger = LoggerFactory.getLogger(joinPoint.getTarget().getClass());

        // 2) @Loggable 설정 가져오기
        Loggable loggable = method.getAnnotation(Loggable.class);
        if (loggable == null) {
            loggable = joinPoint.getTarget().getClass().getAnnotation(Loggable.class);
        }

        // 3) 실행 시작 로그
        String prefix = loggable.prefix().isEmpty() ? "" : "[" + loggable.prefix() + "] ";
        Object[] args = joinPoint.getArgs();
        if (loggable.showParams() && args.length > 0) {
            String params = formatParameters(sig.getParameterNames(), args);
            logByLevel(logger, loggable.level(),
                "{}{}#{} - 실행 시작, 파라미터: {}", prefix, className, methodName, params);
        } else {
            logByLevel(logger, loggable.level(),
                "{}{}#{} - 실행 시작", prefix, className, methodName);
        }

        // 4) 실제 메소드 호출 및 종료/예외 처리
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long elapsed = System.currentTimeMillis() - start;

            // 4‑1) 실행 완료 로그
            if (loggable.showResult()) {
                String resStr = formatResult(result);
                String msg = loggable.measureExecutionTime()
                    ? "{}{}#{} - 실행 완료 ({}ms), 반환값: {}"
                    : "{}{}#{} - 실행 완료, 반환값: {}";
                logByLevel(logger, loggable.level(),
                    msg, prefix, className, methodName, elapsed, resStr);
            } else if (loggable.measureExecutionTime()) {
                logByLevel(logger, loggable.level(),
                    "{}{}#{} - 실행 완료 ({}ms)", prefix, className, methodName, elapsed);
            } else {
                logByLevel(logger, loggable.level(),
                    "{}{}#{} - 실행 완료", prefix, className, methodName);
            }
            return result;
        } catch (Exception e) {
            // 4‑2) 예외 발생 시 무조건 ERROR
            logger.error("{}{}#{} - 실행 실패: {}", prefix, className, methodName, e.getMessage(), e);
            throw e;
        }
    }

    // 파라미터·결과 스트링으로 변환하는 헬퍼 메소드들(formatParameters, formatResult, formatValue, logByLevel…)
    // (생략: 본문 참고)
}
```

각 단계별로 코드를 살펴보면
	1.	메소드 정보 추출: ProceedingJoinPoint로부터 대상 클래스와 메소드 이름, 파라미터 값을 얻습니다.
	2.	어노테이션 설정 읽기: 메소드에 직접 달려 있지 않으면 클래스 단위 @Loggable을 확인합니다.
	3.	시작 로그: 레벨(INFO, DEBUG 등)과 prefix를 반영해 “메소드 시작” 메시지를 찍습니다.
	4.	실제 메소드 실행 후
	  • 성공 시 실행 시간과 반환값(또는 생략)을 로그에 남깁니다.
	  •	예외 시 에러 메시지와 스택 트레이스를 ERROR 레벨로 기록합니다.

이렇게 하면, 애플리케이션 전반의 로깅 정책을 한 곳에서 관리할 수 있습니다.

### 자동 설정과 스캔

Spring Boot 자동 설정 방식을 이용하려면

```java
@Configuration
@EnableAspectJAutoProxy
@ComponentScan("com.example.logging")
public class LoggingAutoConfiguration {}
```

그리고 META-INF/spring.factories에

```text
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.logging.config.LoggingAutoConfiguration
```

를 등록하면, 사용자 코드는 의존성만 추가하고 별도 설정 없이 자동으로 AOP 로깅이 활성화됩니다.

### 샘플 서비스에 붙여보기

```java
@Service
public class ProductService {

    @Loggable                           // 기본 INFO, 파라미터/결과/시간 모두 로깅
    public List<String> getAllProducts() { … }

    @Loggable(level = LogLevel.DEBUG,
               showResult = false)     // DEBUG 레벨, 결과 생략
    public String getProductById(Long id) { … }

    @Loggable(measureExecutionTime = false,
               prefix = "상품관리")     // 실행 시간 생략, 접두사 포함
    public void updateProduct(Long id, String name, Double price) { … }

    @Loggable(level = LogLevel.WARN)    // WARN 레벨, 실패 시 에러 로그
    public Optional<String> findProductByCode(String code) { … }

    @Loggable(level = LogLevel.TRACE)   // TRACE 레벨로 가장 상세히 로깅
    public int processOrder(Long orderId,
            List<String> productCodes, boolean isPriority) { … }
}
```

메소드 위에 @Loggable 한 줄만 붙이면, 이제 시작·종료·예외 모두 자동으로 기록됩니다!

### 테스트로 확인하기

JUnit과 OutputCaptureExtension을 이용해, 콘솔에 찍히는 로그 메시지를 검증해볼 수 있습니다.

```java
@SpringBootTest(classes = {ProductService.class, LoggingAutoConfiguration.class})
public class LoggingAspectTest {
    @Autowired ProductService svc;

    @Test
    void testBasicLogging(CapturedOutput out) {
        svc.getAllProducts();
        assertThat(out).contains("ProductService#getAllProducts - 실행 시작");
        assertThat(out).containsPattern("\\(\\d+ms\\), 반환값: \\[.*\\]");
    }
    // … 그 외 DEBUG/예외/다양한 파라미터 케이스 테스트
}
```

테스트만으로도 AOP가 제대로 로깅을 훔쳐(…) 오는지 확인할 수 있으니, 안정적으로 유지보수할 수 있습니다.

### Logback 설정

src/main/resources/logback.xml에서 레벨과 포맷을 조정해 줍니다.

```xml
<configuration>
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
    </encoder>
  </appender>
  <logger name="com.example.logging" level="DEBUG"/>
  <root level="INFO">
    <appender-ref ref="CONSOLE"/>
  </root>
</configuration>
```

	• com.example.logging(우리 AOP 코드)만 DEBUG로 띄워서, 개발 중 상세 로그를 볼 수 있게 하고
	• 그 외 애플리케이션은 INFO 이상으로 통일해서 잡다한 로그를 줄여줍니다.

프로젝트에 AOP 기반 로깅 라이브러리를 적용해 보면, 코드 베이스가 훨씬 깔끔해지고 핵심 로직이 빛나기 시작합니다. “메소드마다 logger 호출” 에서 해방되어, 정말 중요한 비즈니스 로직에만 집중해 보세요!