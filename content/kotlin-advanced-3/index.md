---
emoji: 📖
title: Kotlin 함수형 프로그래밍
date: '2024-05-03 18:04:13'
author: 에디
tags: kotlin
categories: kotlin
---

### 1. 고차 함수 (Higher-order Functions)
고차 함수는 **다른 함수를 매개변수로 받거나 반환값으로 사용하는 함수**를 말합니다. 코틀린에서는 함수가 일급 시민(First-class Citizen)으로 취급되기 때문에, 함수 자체를 변수처럼 넘기거나 반환할 수 있습니다.

#### 고차 함수 예시:
```kotlin
fun calculate(x: Int, y: Int, operation: (Int, Int) -> Int): Int {
    return operation(x, y)
}

fun main() {
    val sum = calculate(4, 5, { a, b -> a + b }) // 람다식을 넘김
    println(sum)  // 출력: 9
}
```
위에서 `calculate`는 고차 함수로, `operation`이라는 함수를 인자로 받습니다.

추가적으로, 만약 calculate 함수와 같이 마지막 인자가 함수인 경우에는
다음 코드와 같이 함수 호출 부로 뺄 수 있습니다.

```kotlin
fun calculate(x: Int, y: Int, operation: (Int, Int) -> Int): Int {
    return operation(x, y)
}

fun main() {
    val sum = calculate(4, 5) { a, b -> a + b } // 이런식으로 사용 가능
    println(sum)
}
```

---

### 2. 람다식 (Lambda Expressions)
람다식은 **익명 함수**의 일종으로, **이름이 없는 간단한 함수 표현**입니다. 자바 8의 람다와 유사하며, 코틀린에서는 함수형 프로그래밍에서 매우 자주 사용됩니다.

#### 람다식 기본 문법:
```kotlin
{ parameterList -> body }
```
- 파라미터 리스트와 함수의 본체가 `->`로 구분됩니다.
- 람다식은 `{}` 중괄호로 감싸고, 파라미터 타입은 추론될 수 있어 생략 가능합니다.

#### 람다식 예시:
```kotlin
val sum: (Int, Int) -> Int = { x, y -> x + y }
println(sum(3, 4))  // 출력: 7
```

람다식은 간결하지만 특정 상황에서 **`return` 키워드**를 사용하지 못하는 특성이 있습니다. 이와 관련된 개념인 **비지역적 반환(non-local return)**이 중요한 이유입니다.

#### 람다식에서의 `return` 사용 제한과 비지역적 반환:
- 코틀린에서 람다식 내부에서는 일반적인 `return` 문을 사용해 함수 자체에서 반환할 수 없습니다.
- 람다식에서 `return`을 사용할 때, 이는 **포함된 함수**에서 반환을 의미합니다. 이를 **비지역적 반환**이라고 합니다.

#### 예시:
```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    
    numbers.forEach {
        if (it == 3) return  // 람다식에서 반환되지만, main 함수 자체를 반환함
        println(it)
    }
    
    println("이 메시지는 출력되지 않음")  // 출력되지 않음
}
```
위 코드에서는 `forEach` 내부에서 `return`이 호출되면, 람다식 내부에서만 반환되는 것이 아니라 **메인 함수 자체**가 종료됩니다. 이를 **비지역적 반환**이라고 합니다.

람다식 내부에서 **지역적 반환**만 하고 싶다면, `return@label`과 같은 방법으로 라벨을 명시하여 특정 람다식에서만 반환할 수 있습니다.

#### 지역적 반환 예시:
```kotlin
fun main() {
    val numbers = listOf(1, 2, 3, 4, 5)
    
    numbers.forEach {
        if (it == 3) return@forEach  // forEach 블록에서만 반환됨
        println(it)
    }
    
    println("이 메시지는 출력됨")  // 출력됨
}
```

---

### 3. 익명 함수 (Anonymous Functions)
익명 함수는 람다식과 유사하지만, **함수의 몸체(body)가 명확히 선언된 형태**입니다. 이는 이름이 없는 함수지만 일반적인 함수처럼 `return`을 사용할 수 있습니다. 익명 함수는 주로 **명확하게 로컬 반환**을 하고 싶을 때 사용됩니다.

#### 익명 함수 예시:
```kotlin
val sum = fun(x: Int, y: Int): Int { 
    return x + y 
}
println(sum(3, 4))  // 출력: 7
```
익명 함수에서는 `return`이 함수 본체 내에서만 작동하며, 포함된 함수 전체를 종료하지 않습니다.

---

### 4. 코틀린에서 1급 시민 함수 (First-class Function)
코틀린에서 함수는 **1급 시민**입니다. 이는 다음을 의미합니다:
- 함수를 변수처럼 전달할 수 있음.
- 함수를 다른 함수의 인자로 넘길 수 있음.
- 함수를 함수의 반환값으로 사용할 수 있음.

#### 1급 시민 함수 예시:
```kotlin
fun multiplyByTwo(x: Int): Int {
    return x * 2
}

fun applyFunction(f: (Int) -> Int, x: Int): Int {
    return f(x)
}

fun main() {
    val result = applyFunction(::multiplyByTwo, 5) // multiplyByTwo 함수 자체를 넘김
    println(result)  // 출력: 10
}
```

---

### 5. 자바의 `BiFunction`과 코틀린 1급 함수 비교
자바 8부터 함수형 프로그래밍을 도입했으며, `BiFunction`은 자바에서 두 개의 입력을 받아 하나의 출력을 반환하는 함수형 인터페이스입니다. 자바에서는 람다식을 통해 `BiFunction`을 사용할 수 있지만, 코틀린의 1급 시민 함수와는 차이점이 있습니다.

- **자바의 `BiFunction`**: 함수형 인터페이스로 정의된 함수, 함수 표현은 람다식을 사용하되 인터페이스로 제한.
- **코틀린의 1급 시민 함수**: 함수가 독립적인 일급 객체로, 인터페이스 없이 변수처럼 자유롭게 넘길 수 있음.

#### 자바의 `BiFunction` 예시:
```java
import java.util.function.BiFunction;

public class Main {
    public static void main(String[] args) {
        BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
        System.out.println(add.apply(3, 4));  // 출력: 7
    }
}
```

#### 코틀린의 1급 시민 함수 예시:
```kotlin
val add: (Int, Int) -> Int = { a, b -> a + b }
println(add(3, 4))  // 출력: 7
```

### 고차 함수 사용 시 오버헤드 발생

고차 함수는 함수를 인자로 받거나 함수를 반환하는 함수입니다. 고차 함수를 사용하면 내부적으로 `FunctionN` 클래스의 인스턴스가 생성됩니다. 이는 추가적인 메모리 할당과 같은 오버헤드를 발생시킵니다.

```kotlin
// 고차 함수를 사용하는 예제
fun applyFunction(x: Int, func: (Int) -> Int): Int {
    return func(x)
}

fun main() {
    val result = applyFunction(5) { it * 2 }
    println(result)  // 출력: 10
}
```

이 코드에서 `applyFunction`은 고차 함수로, `func`라는 함수를 인자로 받습니다. 이때 코틀린은 `(Int) -> Int` 형태의 함수가 `Function1` 클래스의 인스턴스로 변환되어 처리됩니다. 이 과정에서 함수가 객체로 만들어져 힙에 할당되므로, 메모리 관리와 관련된 오버헤드가 발생합니다.

### 클로저에서 변수 포획과 오버헤드

클로저는 외부 함수의 변수를 포획할 수 있습니다. 코틀린에서 클로저가 외부 변수를 포획할 때 해당 변수는 `Ref` 객체로 감싸져 값의 변경을 추적할 수 있게 합니다. 이는 기본형 타입에도 적용되며, 그로 인해 추가적인 메모리 할당 및 오버헤드가 발생합니다.

```kotlin
fun main() {
    var counter = 0

    // 람다 함수가 외부 변수 counter를 포획
    val incrementCounter = {
        counter++
        println("Counter: $counter")
    }

    // 람다 함수 호출
    incrementCounter()  // 출력: Counter: 1
    incrementCounter()  // 출력: Counter: 2
}
```

이 코드에서 `incrementCounter`는 외부 변수 `counter`를 포획하고 있습니다. 이 경우 코틀린은 `counter`를 `Ref` 객체로 감싸서 클로저 내에서 변수를 안전하게 변경할 수 있게 합니다. 따라서 `counter`는 원래 기본형 타입인 `Int`이지만, 클로저 내에서 사용되므로 객체로 변환되고, 이는 성능에 영향을 미칠 수 있는 오버헤드를 유발합니다.

### Ref 객체 내부 구현 예시
코틀린에서 람다식이나 익명 함수가 외부 변수를 포획하면 내부적으로 `Ref` 객체로 감싸져서 관리됩니다. 예를 들어, 포획된 `Int` 값은 다음과 같은 방식으로 처리됩니다.

```kotlin
class IntRef(var value: Int)

fun main() {
    val ref = IntRef(0)  // Int가 객체로 감싸짐
    val lambda = {
        ref.value++
        println("Ref value: ${ref.value}")
    }

    lambda()  // 출력: Ref value: 1
    lambda()  // 출력: Ref value: 2
}
```

이 코드에서 `IntRef`는 `Int` 값을 감싸는 역할을 합니다. 이는 포획된 변수가 원시 타입일 경우에도 객체화되어 오버헤드를 발생시키는 예시입니다.

위 예시들을 통해 고차 함수와 클로저 사용 시 오버헤드가 발생하는 원리와 그 이유를 알 수 있습니다. 이러한 오버헤드는 일반적으로 큰 문제가 되지는 않지만, 성능이 중요한 환경에서는 고려할 필요가 있습니다.

## `inline` 함수와 고차 함수의 인라인 처리

`inline` 함수는 일반적으로 고차 함수에서 람다 함수를 인자로 받을 때, 해당 람다 함수까지 인라인 처리할 수 있습니다. 하지만 람다 함수의 인라인 처리 여부는 특정 조건에 따라 다를 수 있습니다.

### 인라인 처리되는 경우

람다 함수가 인라인 함수에 전달되었을 때, 해당 람다가 함수의 실행 경로 내에서 직접 실행되면 인라인 처리가 이루어집니다. 이는 불필요한 함수 호출이나 객체 생성 오버헤드를 방지하여 성능을 향상시킵니다.

#### 예시: 인라인 처리되는 경우

```kotlin
inline fun applyInline(x: Int, func: (Int) -> Int): Int {
    return func(x)
}

fun main() {
    val result = applyInline(5) { it * 2 }
    println(result)  // 출력: 10
}
```

위 예시에서 `applyInline` 함수는 `inline` 키워드로 선언된 고차 함수입니다. `func`로 전달된 람다 함수도 함께 인라인 처리됩니다. 즉, 컴파일 시점에 `applyInline` 함수의 호출 부분에 해당 함수의 본문과 람다가 모두 복사되어 함수 호출의 오버헤드 없이 실행됩니다. 이렇게 하면 함수 호출과 람다 객체 생성이 생략되므로 성능이 향상됩니다.

### 인라인 처리되지 않는 경우

모든 람다가 인라인 처리되는 것은 아닙니다. 람다가 함수 내부에서 비동기적으로 호출되거나, 람다가 전달된 함수 외부에서 저장되거나 나중에 실행될 경우, 인라인 처리가 불가능합니다. 이러한 경우는 오히려 성능 상의 이점을 제공하지 않으며, 람다는 인스턴스화되고 힙에 저장되어 관리됩니다.

##### 예시: 인라인 처리되지 않는 경우 (비동기 호출)

```kotlin
inline fun performAsync(action: () -> Unit) {
    Thread {
        action()  // 비동기적으로 호출되므로 인라인 처리 불가
    }.start()
}

fun main() {
    performAsync {
        println("비동기 작업 실행")
    }
}
```

이 예시에서는 `performAsync` 함수가 `inline`으로 선언되었지만, 람다 `action`은 새로운 스레드에서 비동기적으로 호출됩니다. 이 경우 람다는 즉시 실행되지 않고, 나중에 비동기적으로 실행되므로 인라인 처리가 되지 않습니다. 람다는 객체로 만들어져 비동기 작업 중에 사용되며, 이는 오버헤드를 발생시킬 수 있습니다.

또한 아래와 같은 코드도 인라인 처리 되지 않습니다.

```kotlin
inline fun applyInline(x: Int, func: (Int) -> Int): Int {
    return func(x)
}

fun main() {
    val result = applyInline(5, exec)
    println(result)  // 출력: 10
}
```

위의 plusOne은 전역 함수 객체이기 때문에 인라인 처리되지 않습니다.
그러나, applyInline 함수에 람다를 직접 전달하면 그 람다는 인라인 처리됩니다.
전역적으로 선언된 함수 객체는 인라인 함수와 달리 객체로 생성되므로, 인라인 처리에 의한 성능 최적화가 이루어지지 않습니다.

따라서, plusOne 함수는 인라인 처리되지 않으며, 이를 인라인 처리하려면 applyInline 함수에 직접 람다 표현식을 전달하는 것이 좋습니다.

### `noinline` 키워드를 사용한 인라인 처리 방지

인라인 함수에서 일부 람다만 인라인 처리가 필요 없을 때는 `noinline` 키워드를 사용할 수 있습니다. `noinline` 키워드는 특정 람다에 대해 인라인 처리를 방지하고, 해당 람다가 객체로 생성되어 처리되게 만듭니다.

#### 예시: `noinline`을 사용하여 인라인 처리 방지

```kotlin
inline fun processFunctions(
    inlineFunc: () -> Unit,
    noinline nonInlineFunc: () -> Unit
) {
    inlineFunc()  // 인라인 처리됨
    nonInlineFunc()  // 인라인 처리되지 않음
}

fun main() {
    processFunctions(
        { println("인라인 처리됨") },
        { println("인라인 처리되지 않음") }
    )
}
```

위 예시에서 `processFunctions` 함수는 두 개의 람다를 인자로 받습니다. 첫 번째 람다 `inlineFunc`는 인라인 처리되고, 두 번째 람다 `nonInlineFunc`는 `noinline` 키워드로 인해 인라인 처리되지 않습니다. `noinline`으로 지정된 람다는 객체로 만들어져 힙에 저장되며 나중에 실행될 수 있습니다.

### SAM (Single Abstract Method)과 함수 참조 정리

#### **SAM 변환 (Single Abstract Method 변환)**

**SAM(Single Abstract Method)** 변환은 하나의 추상 메서드만을 가진 **함수형 인터페이스**를 람다 표현식으로 쉽게 구현할 수 있도록 하는 기능입니다. Kotlin에서는 자바의 함수형 인터페이스를 지원하기 위해 SAM 변환을 제공하며, 이는 특히 자바와의 상호 운용성을 높이는 데 중요한 역할을 합니다.

#### SAM 변환 예시:
```kotlin
val runnable = Runnable { println("Runnable 실행") }
runnable.run()
```
위 예시에서 `Runnable`은 자바에서 온 함수형 인터페이스이며, Kotlin에서는 람다 표현식으로 간단히 구현할 수 있습니다.

#### **Kotlin의 `fun interface`**:
Kotlin은 자바의 함수형 인터페이스를 지원할 뿐만 아니라, 자체적으로 함수형 인터페이스를 만들 수 있도록 **`fun interface`**라는 구문을 제공합니다. 이 구문을 사용하면 Kotlin에서 SAM 변환을 사용할 수 있습니다.

```kotlin
fun interface StringFilter {
    fun isValid(s: String): Boolean
}

val filter = StringFilter { it.startsWith("K") }
println(filter.isValid("Kotlin"))  // true
```

이처럼 `fun interface`를 사용하면 Kotlin에서도 자바의 함수형 인터페이스처럼 사용할 수 있으며, 이를 통해 함수형 프로그래밍의 이점을 누릴 수 있습니다.

### **함수 참조 (Function References)**

Kotlin에서 **함수 참조**는 함수나 생성자를 참조할 수 있도록 해주는 기능입니다. 함수 참조는 함수 이름 앞에 **`::`** 연산자를 붙여 사용하며, 이를 통해 함수 자체를 값으로 전달하거나 반환할 수 있습니다. 이는 고차 함수나 람다를 사용할 때 매우 유용합니다.

#### **함수 참조의 종류**:
1. **일반 함수 참조**: 특정 함수에 대한 참조
   ```kotlin
   fun greet() = println("Hello")
   val greeting: () -> Unit = ::greet
   greeting()  // Hello
   ```

2. **확장 함수 참조**: 확장 함수에 대한 참조
   ```kotlin
   fun String.shout() = this.toUpperCase()
   val shout: (String) -> String = String::shout
   println(shout("hello"))  // HELLO
   ```

3. **생성자 참조**: 클래스 생성자를 참조
   ```kotlin
   class User(val name: String)
   val createUser: (String) -> User = ::User
   val user = createUser("Alice")
   println(user.name)  // Alice
   ```

4. **멤버 참조**: 클래스의 멤버 함수나 속성에 대한 참조
   ```kotlin
   class Person(val name: String) {
       fun sayHello() = println("Hello, my name is $name")
   }
   val person = Person("Bob")
   val helloRef = person::sayHello
   helloRef()  // Hello, my name is Bob
   ```

마지막으로 Java에서는 호출 가능 참조 결과 값이 Consumer / Supplier 같은 함수형 인터페이스이지만,
Kotlin에서는 리플렉션 객체입니다.

```toc

```
