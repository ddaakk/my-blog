---
emoji: 📖
title: Kotlin inline 함수
date: '2021-03-22 23:00:00'
author: 에디
tags: kotlin
categories: kotlin
---

## 제네릭 공변성, 무공변성, 반공변성

Kotlin에서 **인라인 함수**란 함수 선언 앞에 `inline` 키워드를 붙여 만든 함수를 말합니다. 이게 어떤 의미이고 왜 사용하는지 간단하게 알아볼게요.

### 왜 인라인 함수가 필요한가요?

Kotlin에서는 고차 함수(다른 함수를 인자로 받거나 반환하는 함수)를 자주 사용합니다. 예를 들어, `filter`, `map`, `forEach` 같은 함수들이 그렇죠.

하지만 고차 함수를 사용하면 다음과 같은 성능 오버헤드가 발생할 수 있어요:

- 함수 호출 오버헤드: 함수 호출 자체에도 비용이 듭니다.
- 람다 객체 생성: 람다 표현식을 사용하면 매번 새로운 객체가 생성됩니다.

이런 오버헤드는 작은 규모의 앱에서는 크게 문제되지 않지만, 성능이 중요한 애플리케이션에서는 영향을 줄 수 있어요.

### 인라인 함수란 무엇인가요?

```kotlin
inline fun greet() {
    println("Hello, World!")
}

fun main() {
    greet() // 함수 호출
}
```

inline 키워드를 붙여 greet 함수를 인라인 함수로 선언했습니다.

컴파일러는 greet() 호출을 함수 본문으로 대체합니다.

즉, 컴파일된 코드는 다음과 같이 됩니다

```kotlin
fun main() {
    println("Hello, World!") // greet() 함수의 내용이 그대로 삽입됨
}
```

함수 호출이 아니라 함수의 내용이 그대로 코드에 삽입됩니다.
따라서 함수 호출 오버헤드가 사라집니다.

### 어떤 이점이 있나요?

1. 성능 향상: 함수 호출과 람다 객체 생성에 따른 오버헤드를 줄일 수 있어요.
2. 람다 캡처 비용 감소: 람다가 외부 변수를 캡처하지 않으면 추가적인 객체 생성을 피할 수 있습니다.

### 언제 사용해야 하나요?

- 빈번하게 호출되는 작은 고차 함수: 성능 최적화가 필요한 부분에 유용합니다.
- 람다를 인자로 받는 함수: 특히 람다가 성능에 영향을 줄 수 있는 경우.

```toc

```