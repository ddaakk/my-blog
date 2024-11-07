---
emoji: 📖
title: Kotlin 지연과 위임
date: '2024-05-02 19:21:54'
author: 에디
tags: kotlin
categories: kotlin
---

Kotlin의 lateinit과 lazy()는 각각 지연 초기화와 관련된 기능으로, 변수나 프로퍼티가 필요할 때만 초기화되는 특징을 가지고 있습니다. 

## `lateinit`

`lateinit`은 `var`로 선언된 mutable(변경 가능한) 프로퍼티에 대해 사용할 수 있으며, 나중에 해당 프로퍼티를 초기화할 수 있도록 도와줍니다.
- 주로 nullable하지 않고, 나중에 초기화될 변수에 사용됩니다.
- 초기화하기 전에 접근하면 `UninitializedPropertyAccessException`이 발생합니다.

```kotlin
class Example {
    lateinit var name: String

    fun initialize() {
        name = "Hello"
    }

    fun printName() {
        if (::name.isInitialized) {
            println(name)
        } else {
            println("Name is not initialized")
        }
    }
}
```
`lateinit`은 nullable하지 않은 프로퍼티에서만 사용할 수 있으며, 원시 타입 (Int, Boolean 등)에서는 사용할 수 없습니다.

## `lazy()`

`lazy()`는 `val`로 선언된 불변 프로퍼티에 대해 사용할 수 있으며, 해당 프로퍼티가 최초로 접근될 때 초기화됩니다. 이는 주로 비용이 큰 초기화를 지연시키고 싶을 때 사용합니다.

```kotlin
class Example {
    val name: String by lazy {
        println("Lazy initialized")
        "Hello"
    }
}
```

- `lazy()`는 싱글톤 패턴처럼 프로퍼티가 한 번만 초기화되도록 보장합니다.
- 기본적으로 thread-safe하며, 첫 번째 접근 시 단일 스레드에서만 초기화가 이루어집니다.

## `by lazy`의 원리와 위임 프로퍼티

`by lazy`는 **위임 프로퍼티(delegated property)**의 한 형태로, 프로퍼티의 get() 호출을 특정 방식으로 위임합니다. `lazy` 함수는 `Lazy<T>` 인터페이스를 반환하며, 이 인터페이스의 `getValue()` 메소드가 호출될 때 프로퍼티의 초기화가 이루어집니다.

### 원리
`lazy()`는 호출될 때 전달된 람다를 저장하고, 프로퍼티에 접근할 때 그 람다가 실행되어 값을 계산한 후 저장해 둡니다. 이후로는 동일한 값을 반환합니다.

`by lazy`로 사용하는 프로퍼티는 지연 초기화된 값을 관리하는 `Lazy<T>` 인스턴스에 의해 관리됩니다.

### 위임 프로퍼티(Delegated Property)란?

위임 프로퍼티는 프로퍼티의 값을 직접 소유자가 관리하지 않고, 외부 객체에 위임하는 방식입니다. `by` 키워드를 사용해 위임을 설정할 수 있으며, `lazy`도 위임 프로퍼티의 한 예입니다.

```kotlin
class Example {
    val name: String by lazy {
        "Hello"
    }
}
```

이때 `name` 프로퍼티는 직접 값을 저장하지 않고, `Lazy<T>` 객체가 값을 관리합니다.

## `lazy()`의 기본 사용법

`lazy()` 함수는 다음 세 가지 모드로 사용할 수 있습니다.

- SYNCHRONIZED (기본값): 여러 스레드에서 동시에 접근해도 초기화가 한 번만 일어나도록 보장합니다.
- PUBLICATION: 여러 스레드가 접근할 수 있고, 여러 번 초기화될 수 있지만, 최종적으로 동일한 값이 저장됩니다.
- NONE: 동기화 없이 단일 스레드에서 사용하도록 보장합니다.

```kotlin
val name: String by lazy(LazyThreadSafetyMode.SYNCHRONIZED) {
    "Hello"
}
```

이런 방식으로 `lazy`의 동작을 커스터마이즈할 수 있습니다.

## 표준 위임 객체

표준 위임 객체는 특정 프로퍼티의 값을 다른 객체에 위임해 관리할 수 있도록 도와주는 기능입니다. 

### notNull

lateinit과 유사하게, 초기화 전에는 null일 수 있지만, 이후에는 반드시 초기화되어야 하는 변수를 처리할 때 사용합니다. 해당 변수는 초기화되지 않은 상태에서 접근하면 **IllegalStateException**이 발생합니다.

```kotlin
var name: String by Delegates.notNull<String>()

fun initialize() {
    name = "Kotlin"
}

fun printName() {
    println(name)  // 초기화 전 접근 시 IllegalStateException 발생
}
```

### observable

프로퍼티의 값이 변경될 때마다 호출되는 콜백을 설정할 수 있습니다. observable은 새로운 값이 설정되기 전과 후의 값을 감지하여 콜백으로 전달합니다.
특정 값이 변경될 때마다 이벤트를 처리해야 하는 경우 유용합니다.

```kotlin
var name: String by Delegates.observable("Initial Name") { property, oldValue, newValue ->
    println("Name changed from $oldValue to $newValue")
}
```
여기서, observable은 프로퍼티 값이 변할 때마다 변경 전 값과 새로운 값을 제공하며, 이를 통해 변경 이벤트를 처리할 수 있습니다.

### vetoable

값이 변경되기 전에 조건을 확인하고, 특정 조건이 만족되지 않으면 변경을 막을 수 있습니다. vetoable은 변경 전과 후의 값을 감지하고, true를 반환하면 값이 변경되고, false를 반환하면 값이 유지됩니다.
값이 특정 조건을 만족해야만 변경이 허용되는 경우 유용합니다.

```kotlin
var age: Int by Delegates.vetoable(0) { property, oldValue, newValue ->
    newValue >= 0  // 나이가 0 이상일 때만 값 변경 허용
}
```

이 예시에서는 나이가 0 이상일 경우에만 변경이 허용되며, 음수 값은 무시됩니다.

### 다른 프로퍼티로 위임 (by this::num)

한 프로퍼티를 다른 프로퍼티에 위임할 수 있습니다. by this::num처럼 선언하여 프로퍼티의 값을 다른 프로퍼티에 위임합니다.
이때, `@Deprecated` 애노테이션을 사용하면 특정 프로퍼티가 더 이상 사용되지 않음을 명시할 수 있습니다.

```kotlin
var num: Int = 10

@Deprecated("Use num instead", ReplaceWith("num"))
var deprecatedNum: Int by this::num
```

이 경우 deprecatedNum을 사용할 때 경고가 나타나며, num으로 값을 위임하여 동일한 값이 저장됩니다.

### Map 위임

프로퍼티를 맵에 위임할 수 있으며, 맵의 키-값 쌍을 통해 프로퍼티 값을 가져오거나 설정할 수 있습니다. 주로 데이터 클래스나 설정 파일 등에서 유용하게 사용됩니다.
맵을 사용해 프로퍼티 값을 저장하고 이를 쉽게 접근할 수 있도록 할 때 유용합니다.

```kotlin
class User(map: Map<String, Any?>) {
    val name: String by map
    val age: Int by map
}

val user = User(mapOf(
    "name" to "Alice",
    "age" to 30
))

println(user.name)  // "Alice"
println(user.age)   // 30
```

이 코드는 Map을 통해 데이터를 위임받아, 프로퍼티 값을 저장하거나 참조할 수 있습니다.

### 클래스 위임

클래스 위임은 어떤 클래스가 특정 작업을 "직접" 하지 않고, "다른 클래스"에게 그 일을 맡기는 것을 의미해요. 즉, 자신이 할 일을 다른 객체에게 넘겨서 대신 처리하게 만드는 것입니다.

예를 들어, 친구가 숙제를 도와달라고 해서 친구가 하기로 한 부분을 대신 해준다고 생각하면 됩니다. 이처럼, 코틀린에서는 by 키워드를 사용해서 이 작업을 쉽게 할 수 있습니다.

친구가 숙제를 하고 숙제 결과를 저장하는 상황을 가정해 볼게요.

```kotlin
// 숙제하기 인터페이스 정의
interface Homework {
    fun doHomework()
    val result: String  // 숙제 결과를 저장하는 필드
}

// FriendA는 숙제를 직접 하고 결과를 저장
class FriendA : Homework {
    override fun doHomework() {
        println("FriendA가 숙제를 하고 있어요")
    }

    override val result: String = "FriendA의 숙제 완료"
}

// FriendB는 직접 숙제를 안 하고 FriendA에게 맡김, 그리고 결과를 받음
class FriendB(homework: Homework) : Homework by homework {
    fun checkResult() {
        println("FriendB가 확인한 결과: $result")
    }
}

fun main() {
    val friendA = FriendA()  // FriendA 객체 생성 (숙제를 실제로 할 친구)
    val friendB = FriendB(friendA)  // FriendB는 FriendA에게 숙제 위임

    friendB.doHomework()  // FriendB가 숙제를 하는 것처럼 보이지만 FriendA가 숙제함
    friendB.checkResult() // FriendB가 숙제 결과를 확인함
}
```

1. **Homework 인터페이스**: `doHomework()` 함수 외에도 `result`라는 **필드**(변수)를 추가했습니다. 이 `result`는 숙제를 완료한 후 그 결과를 저장하는 공간입니다.

2. **FriendA 클래스**: 
   - `doHomework()` 메서드를 오버라이드하여 실제로 숙제를 하고 있습니다.
   - `result` 필드는 `"FriendA의 숙제 완료"`라는 값으로 저장되어 있습니다.

3. **FriendB 클래스**: 
   - `by homework`로 **위임**하여, `FriendA`가 맡은 숙제를 대신 처리합니다.
   - `FriendB`는 직접 `doHomework()`를 구현하지 않지만, `FriendA`가 대신 일을 하고, `result`도 **위임받은** 데이터를 활용합니다.
   - `checkResult()`라는 추가 함수에서 `result` 필드의 값을 출력하여 숙제 결과를 확인합니다.

```kotlin
// 실행 결과:
FriendA가 숙제를 하고 있어요
FriendB가 확인한 결과: FriendA의 숙제 완료
```

**필드를 위임받은 클래스에서 사용하는 방법**

1. **필드도 함께 위임**: `FriendB`는 `FriendA`에게 숙제를 위임하는 것뿐 아니라, `FriendA`의 **필드(result)** 값도 함께 사용하고 있습니다. 즉, `FriendB`는 `FriendA`의 데이터를 가져다 쓸 수 있는 것이죠.

2. **필드와 메서드 동시 사용**: `FriendB`는 `doHomework()` 같은 함수뿐만 아니라, `result`라는 데이터(필드)도 함께 위임받아 사용할 수 있습니다.

이처럼 클래스 위임과 필드를 함께 사용하면 객체 간의 책임을 나누면서도, 데이터를 일관되게 관리할 수 있습니다.

### Iterable

**`Iterable`**은 코틀린의 기본적인 컬렉션 처리 인터페이스입니다. 컬렉션의 모든 요소를 메모리에 로드한 후 순차적으로 하나씩 처리합니다. 대부분의 컬렉션(List, Set, Map 등)은 기본적으로 `Iterable`을 구현하고 있으며, 이를 통해 각 요소를 쉽게 순회할 수 있습니다.

#### 특징:

1. **즉시 실행(Eager Evaluation)**:
   - `Iterable`에서의 모든 연산(map, filter 등)은 즉시 처리됩니다. 즉, 각 연산을 수행할 때마다 컬렉션의 모든 요소를 메모리에 로드하고 처리하여 결과를 즉시 반환합니다.
   - 예를 들어 `map`, `filter` 등의 연산을 연달아 사용할 때마다 새로운 중간 컬렉션이 생성되고 처리됩니다. 이렇게 되면 데이터 크기가 커질수록 메모리 사용량이 많아집니다.

2. **다수의 중간 연산 시 비효율적**:
   - 여러 개의 연산(map, filter 등)을 사용할 경우, 각 연산마다 새 컬렉션을 만들어야 하기 때문에 성능 면에서 비효율적일 수 있습니다.
   - 각각의 중간 연산이 끝날 때마다 새로운 컬렉션이 생성되고, 그 컬렉션이 다시 다음 연산의 입력으로 사용됩니다. 이는 메모리와 처리 시간을 낭비할 수 있습니다.

#### 예시:

```kotlin
val numbers = listOf(1, 2, 3, 4, 5)
val result = numbers
    .map { it * 2 }   // 모든 요소에 곱하기 2를 적용
    .filter { it > 5 } // 5보다 큰 요소만 필터링

println(result) // 출력: [6, 8, 10]
```

이 코드에서 `map`과 `filter`는 **즉시 실행**되며, `map` 연산이 끝난 후 새로운 리스트 `[2, 4, 6, 8, 10]`이 생성되고, 그 리스트에서 `filter`가 적용되어 최종 결과 `[6, 8, 10]`이 나옵니다.

#### 즉시 실행의 문제점:
- 예를 들어 수백만 개의 요소가 있는 큰 컬렉션에서 위와 같은 연산을 하면, `map`에서 일단 전체 데이터를 메모리에 로드한 후 필터링합니다. 이렇게 중간 컬렉션을 생성하면 메모리 사용량이 급격히 증가할 수 있습니다.

### Sequence

**`Sequence`**는 지연 연산(Lazy Evaluation)을 제공하는 방식으로, 컬렉션의 모든 요소를 한 번에 처리하는 것이 아니라 필요할 때마다 하나씩 처리합니다. `Sequence`는 중간 연산(map, filter 등)이 즉시 실행되지 않고, 최종 연산(예: `toList()`, `forEach()`)이 호출될 때 모든 연산을 한꺼번에 처리합니다.

**특징**

1. **지연 실행(Lazy Evaluation)**:
   - `Sequence`는 중간 연산이 있을 때마다 새로운 컬렉션을 즉시 생성하지 않고, 최종적으로 모든 연산이 완료되는 시점에서 데이터를 한꺼번에 처리합니다. 이로 인해 메모리 사용이 최소화되고, 큰 데이터셋을 처리할 때 매우 효율적입니다.

2. **효율적 처리**:
   - `Sequence`는 필요한 순간에만 각 요소를 순차적으로 처리하기 때문에, 여러 연산을 거치더라도 중간 컬렉션이 생성되지 않고 메모리 효율이 매우 좋습니다.
   - 특히 대용량 데이터셋을 다룰 때 메모리 오버헤드를 줄일 수 있는 강력한 도구입니다.

**예시**

```kotlin
val numbers = listOf(1, 2, 3, 4, 5)
val result = numbers.asSequence()
    .map { it * 2 }   // 요소를 곱하기 2
    .filter { it > 5 } // 5보다 큰 요소만 필터링
    .toList() // 최종 연산이 필요할 때 지연 연산이 수행됨

println(result) // 출력: [6, 8, 10]
```

위의 코드에서는 `asSequence()`를 사용하여 `Iterable`을 `Sequence`로 변환했습니다. `map`과 `filter`는 즉시 실행되지 않고, `toList()`와 같은 최종 연산이 호출될 때 각 요소가 순차적으로 처리됩니다.

**Sequence의 장점**
- 대용량 데이터셋을 처리할 때 **중간 컬렉션을 생성하지 않기 때문에 메모리 효율이 좋습니다**.
- 중간 연산이 많아도 각 요소를 하나씩 처리하기 때문에 **필요한 순간에만 데이터를 처리**할 수 있습니다.

**Sequence의 처리 방식**
`Sequence`는 기본적으로 **단일 요소 스트림**처럼 작동합니다. 즉, 데이터가 흘러가는 것처럼 요소가 하나씩 처리되며, 모든 연산이 하나의 요소에 대해 동시에 이루어집니다. 이를 통해 중간 결과물이 메모리에 남지 않고 처리의 효율성을 극대화합니다.

```kotlin
val sequence = sequenceOf(1, 2, 3, 4, 5)
val result = sequence
    .map { it * 2 }
```

```toc

```
