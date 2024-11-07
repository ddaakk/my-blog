---
emoji: 📖
title: JMH를 통한 마이크로벤치마킹
date: '2024-06-22 09:45:27'
author: 에디
tags: benchmark
categories: benchmark
---

## JMH(Java Microbenchmark Harness)

**JMH**는 자바에서 **마이크로벤치마크**를 작성하고 실행하는 도구로, 고성능 애플리케이션의 성능을 정확하게 측정하기 위해 사용된다. 메소드 호출, 객체 생성, 컬렉션 처리 같은 **낮은 수준의 성능 특성**을 세밀하게 분석할 수 있어 특히 유용하다. JMH는 자바의 표준 라이브러리가 아니라, OpenJDK에서 별도로 개발된 라이브러리로, 정확한 성능 측정을 위해 다양한 벤치마크 모드, 쓰레드 모델, 타이머 제어 등을 지원한다.

---

### JMH가 필요한 이유

자바에서 성능 테스트는 생각보다 복잡하다. **JIT 컴파일러**, **Garbage Collection (GC)**, **클래스 로딩** 등 여러 요소가 성능 측정에 영향을 미쳐, 일반적인 방식으로는 정확한 성능 데이터를 얻기 어렵다. 이러한 변수들을 제대로 관리하지 않으면 측정 결과가 부정확할 수 있다.

JMH는 이런 문제를 해결하기 위해 만들어졌으며, 다양한 설정을 통해 **정확한 성능 측정**을 할 수 있도록 도와준다.

---

### JMH의 주요 개념과 특징

#### 1. **Warmup(웜업)**

JVM의 **JIT 컴파일러**는 자주 실행되는 메서드를 네이티브 코드로 최적화하는데, 처음 실행할 때와 반복적으로 실행할 때의 성능이 다를 수 있다. JMH는 이를 고려해 벤치마크 실행 전에 "웜업" 단계를 거친다. 웜업 단계에서 코드를 여러 번 실행해 JIT 컴파일러가 최적화할 시간을 주고, 이후 본격적으로 성능을 측정한다.

```java
@Benchmark
@Warmup(iterations = 5)  // 5번의 웜업 반복
public void testMethod() {
    // 성능을 측정할 메서드
}
```

#### 2. **Iteration(반복 실행)**

JMH는 벤치마크를 여러 번 반복 실행해 성능 데이터를 수집한다. 단일 실행의 결과는 JVM의 일시적인 상태(예: GC, JIT 최적화 등)에 영향을 받을 수 있기 때문에, 여러 번 반복 실행해 **신뢰성 있는 평균값**을 얻는다.

```java
@Benchmark
@Measurement(iterations = 10)  // 10번의 반복 실행
public void testMethod() {
    // 측정할 메서드
}
```

#### 3. **Mode(측정 모드)**

JMH는 성능 측정 시 다양한 **측정 모드**를 제공한다. 대표적인 모드는 다음과 같다.

- **Throughput**: 단위 시간당 처리량을 측정. 초당 몇 번의 작업이 처리되었는지를 본다.
- **AverageTime**: 작업 하나를 처리하는 데 걸리는 **평균 시간**을 측정.
- **SampleTime**: 샘플링된 **실행 시간 분포**를 측정해 성능 변동성을 분석.
- **SingleShotTime**: 한 번만 실행한 후 그 시간을 측정. **콜드 스타트** 성능을 분석할 때 유용하다.

```java
@Benchmark
@BenchmarkMode(Mode.Throughput)  // 초당 처리량 측정
public void testMethod() {
    // 성능을 측정할 메서드
}
```

#### 4. **State(상태 관리)**

벤치마크를 실행할 때, 공유 자원이나 특정 상태를 유지하면서 측정해야 할 경우가 있다. JMH는 `@State` 어노테이션을 통해 벤치마크 간에 데이터를 유지할 수 있다. **Scope**를 설정하여 상태를 메서드, 스레드, 클래스 간에 어떻게 공유할지를 지정할 수 있다.

- **Thread**: 각 스레드가 독립적인 상태를 가진다.
- **Benchmark**: 벤치마크 전체에서 하나의 상태를 공유한다.

```java
@State(Scope.Thread)
public class MyState {
    int x = 42;
}

@Benchmark
public void testMethod(MyState state) {
    int y = state.x;
}
```

#### 5. **Fork(포크)**

벤치마크 실행 시 **JVM의 초기 상태**는 성능에 영향을 줄 수 있다. 이를 방지하기 위해, JMH는 여러 번 JVM 프로세스를 새로 시작하여 각각 독립적으로 벤치마크를 실행하는 **포크(fork)** 기능을 제공한다. 이를 통해 JVM 시작 시점의 성능 변동을 배제하고 더 신뢰성 있는 결과를 얻는다.

```java
@Benchmark
@Fork(value = 3)  // 3번의 JVM 포크 실행
public void testMethod() {
    // 벤치마크 메서드
}
```

---

### JMH 벤치마크 실행 흐름

JMH 벤치마크는 보통 다음과 같은 순서로 실행된다.

1. **웜업 단계**: 벤치마크 코드를 여러 번 반복 실행하여 JVM이 코드에 최적화를 수행할 시간을 준다.
2. **측정 단계**: 웜업 후 실제 성능을 측정하기 위해 반복 실행하며 데이터를 수집한다.
3. **결과 출력**: 여러 번의 실행 결과를 바탕으로 평균 실행 시간, 처리량 등 원하는 성능 지표를 출력한다.

---

### 예제 코드

다음은 JMH 벤치마크의 기본 예제 코드다.

```java
import org.openjdk.jmh.annotations.Benchmark;
import org.openjdk.jmh.annotations.BenchmarkMode;
import org.openjdk.jmh.annotations.Fork;
import org.openjdk.jmh.annotations.Measurement;
import org.openjdk.jmh.annotations.Mode;
import org.openjdk.jmh.annotations.State;
import org.openjdk.jmh.annotations.Warmup;
import org.openjdk.jmh.annotations.Scope;

@State(Scope.Thread)
public class MyBenchmark {

    int x = 0;

    @Benchmark
    @BenchmarkMode(Mode.AverageTime)  // 평균 실행 시간 측정
    @Warmup(iterations = 5)  // 5번의 웜업
    @Measurement(iterations = 10)  // 10번의 측정 실행
    @Fork(3)  // 3번의 JVM 포크
    public void testMethod() {
        for (int i = 0; i < 1000; i++) {
            x++;
        }
    }
}
```

---

### JMH 사용 시 주의사항

1. **환경 설정**: JMH 벤치마크 결과는 테스트 환경에 따라 크게 달라질 수 있으므로, **항상 동일한 환경**에서 실행하는 것이 중요하다.
2. **결과 해석**: 벤치마크 결과는 여러 요인에 의해 영향을 받을 수 있다. 단일 실행 결과에 의존하기보다는 **반복적인 실행과 분석**을 통해 성능 트렌드를 파악하는 것이 좋다.
3. **GC와 같은 외부 요인**: 가비지 컬렉션 등의 외부 요인으로 인해 성능 측정이 왜곡될 수 있으므로, 이러한 요인들을 고려해 결과를 해석해야 한다.

---

JMH는 JVM의 특성을 정확하게 반영하여 신뢰성 있는 성능 데이터를 제공하는 도구다. 자바 애플리케이션 성능 최적화에 관심이 있는 개발자에게 매우 유용한 도구이며, 특히 낮은 수준의 성능 특성을 분석하고 개선하는 데 강력한 도움을 준다.

```toc

```
