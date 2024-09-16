---
emoji: 📖
title: JMH를 통한 마이크로벤치마킹
date: '2021-03-22 23:00:00'
author: 에디
tags: benchmark
categories: benchmark
---

**JMH(Java Microbenchmark Harness)**는 자바에서 마이크로벤치마크를 작성하고 실행하는 도구로, 고성능 애플리케이션의 성능을 정확하게 측정하기 위해 사용됩니다. JMH는 자바 애플리케이션 성능을 미세하게 분석할 수 있도록 돕는 툴로, 특히 메소드 호출, 객체 생성, 컬렉션 처리와 같은 낮은 수준의 성능 특성을 측정하는 데 적합합니다.

JMH는 자바의 표준 라이브러리로 제공되는 것이 아니라, OpenJDK에서 개발된 별도의 라이브러리입니다. 정확한 성능 측정을 위해 다양한 벤치마크 모드, 쓰레드 모델, 타이머 제어 등을 지원합니다.

###  JMH가 필요한 이유
일반적으로 자바에서의 성능 테스트는 복잡합니다. 자바는 Just-In-Time (JIT) 컴파일러, Garbage Collection (GC), 클래스 로딩, 그리고 기본적인 스레드 관리 등의 요소가 포함되어 있어 성능 측정 시 잡음이 생길 수 있습니다. 이러한 환경적 변수를 처리하지 않고 일반적인 방식으로 성능을 측정하면, 매우 부정확한 결과를 얻을 수 있습니다.

JMH는 이러한 문제를 해결하기 위해 만들어졌으며, 다양한 설정을 통해 정확한 성능을 측정할 수 있습니다.

### JMH의 주요 개념과 특징

#### 1. **Warmup(웜업)**
JVM은 JIT 컴파일러를 사용하여 자주 실행되는 메서드를 네이티브 코드로 변환하는 최적화 작업을 합니다. 이 과정에서 코드가 처음 실행될 때와 나중에 반복적으로 실행될 때의 성능이 다를 수 있습니다. JMH는 이를 반영하기 위해 벤치마크 실행 전에 "웜업" 단계를 둡니다. 웜업 단계에서 여러 번 실행하여 JIT 컴파일러가 코드를 최적화할 시간을 제공한 후, 실제 벤치마크 결과를 측정합니다.

```java
@Benchmark
@Warmup(iterations = 5)  // 5번의 웜업 반복
public void testMethod() {
    // 성능을 측정할 메서드
}
```

#### 2. **Iteration(반복 실행)**
JMH는 벤치마크를 여러 번 반복 실행하여 성능 데이터를 수집합니다. 단일 실행의 결과는 JVM의 일시적인 상태(예: GC 발생, JIT 최적화 상태 등)에 영향을 받을 수 있기 때문에, 여러 번의 반복 실행을 통해 신뢰성 있는 평균값을 얻습니다.

```java
@Benchmark
@Measurement(iterations = 10)  // 10번의 반복 실행
public void testMethod() {
    // 측정 대상 메서드
}
```

#### 3. **Mode(측정 모드)**
JMH는 다양한 측정 모드를 제공합니다. 이 중 대표적인 몇 가지 모드는 다음과 같습니다.

- **Throughput**: 단위 시간당 작업 처리량을 측정하는 모드. 초당 몇 번의 작업이 처리되었는지를 측정합니다.
- **AverageTime**: 평균 실행 시간을 측정하는 모드. 작업 하나를 처리하는 데 걸리는 평균 시간을 측정합니다.
- **SampleTime**: 샘플링된 실행 시간을 측정하는 모드. 실행 시간 분포를 분석할 수 있습니다.
- **SingleShotTime**: 한 번만 실행한 후 그 실행 시간을 측정하는 모드. 주로 콜드 스타트(초기 실행) 성능을 분석할 때 사용됩니다.

```java
@Benchmark
@BenchmarkMode(Mode.Throughput)  // 초당 작업 처리량을 측정
public void testMethod() {
    // 성능을 측정할 메서드
}
```

#### 4. **State(상태 관리)**
벤치마크를 실행할 때, 클래스나 메서드 수준에서 특정 상태를 관리할 필요가 있을 수 있습니다. JMH는 `@State` 어노테이션을 통해 공유 자원이나 데이터를 벤치마크 간에 유지하면서 성능을 측정할 수 있게 해줍니다. 상태는 `Scope`를 통해 메서드, 스레드 또는 클래스 간에 어떻게 공유될지를 지정할 수 있습니다.

- **Thread**: 각 스레드가 독립적인 상태를 가집니다.
- **Benchmark**: 벤치마크 전체에서 하나의 상태를 공유합니다.

```java
@State(Scope.Thread)
public class MyState {
    int x = 42;
}

@Benchmark
public void testMethod(MyState state) {
    // 상태를 활용하여 벤치마크 수행
    int y = state.x;
}
```

#### 5. **Fork(포크)**
벤치마크 실행 시 JVM의 초기 상태는 성능에 영향을 미칠 수 있습니다. 따라서 JMH는 여러 번의 JVM 프로세스를 시작하여 각각 독립적으로 벤치마크를 실행하는 "포크(fork)" 기능을 제공합니다. 이를 통해 JVM 시작 시점의 성능 변화를 배제하고 더 신뢰성 있는 결과를 얻을 수 있습니다.

```java
@Benchmark
@Fork(value = 3)  // 3번의 JVM 포크 실행
public void testMethod() {
    // 벤치마크 메서드
}
```

### JMH 벤치마크 실행 흐름
JMH 벤치마크는 보통 다음과 같은 흐름으로 실행됩니다.
1. **웜업 단계**: 벤치마크 코드를 일정 횟수 반복 실행하여 JVM이 코드에 대해 최적화를 수행할 시간을 줍니다.
2. **측정 단계**: 웜업 후에 실제 성능 측정을 위한 반복 실행을 수행하여 성능 데이터를 수집합니다.
3. **결과 출력**: 여러 번의 실행 결과를 바탕으로 평균 실행 시간, 처리량 등 원하는 성능 지표를 출력합니다.

### 예제 코드
다음은 JMH 벤치마크의 기본적인 예제 코드입니다.

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
    @BenchmarkMode(Mode.AverageTime)  // 평균 실행 시간을 측정
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

### JMH 사용 시 주의사항
1. **환경 설정**: JMH 벤치마크 결과는 테스트 환경에 따라 크게 달라질 수 있으므로, 항상 동일한 환경에서 벤치마크를 실행하는 것이 중요합니다.
2. **결과 해석**: 벤치마크 결과는 여러 요인에 의해 영향을 받을 수 있으므로 단일 실행 결과에 의존하지 않고 반복적인 실행과 분석을 통해 성능 트렌드를 파악하는 것이 좋습니다.
3. **GC와 같은 외부 요인**: 가비지 컬렉션 같은 외부 요인으로 인해 성능 측정이 왜곡될 수 있으므로, 측정 시 이러한 요인들을 고려하는 것이 필요합니다.

JMH는 JVM의 특성을 정확히 반영하여 신뢰할 수 있는 성능 측정 도구로, 성능 최적화에 관심이 있는 개발자들에게 매우 유용한 도구입니다.

```toc

```