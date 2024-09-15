---
emoji: 📖
title: Kotlin 지연과 위임
date: '2021-03-22 23:00:00'
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



```toc

```