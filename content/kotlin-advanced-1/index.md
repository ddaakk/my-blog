---
emoji: 📖
title: Kotlin 제네릭
date: '2021-03-22 23:00:00'
author: 에디
tags: kotlin
categories: kotlin
---

## 제네릭 공변성, 무공변성, 반공변성

제네릭의 공변성, 무공변성, 반공변성은 제네릭 타입 간의 상속 관계와 관련된 중요한 개념입니다. 이 개념들은 클래스와 메서드(함수)에 적용되며, 코드의 안전성과 유연성을 높여줍니다. 또한, 자바에서는 **와일드카드(wildcard)**를 사용하여 제네릭 타입의 공변성과 반공변성을 표현합니다.

### 1. 무공변성(Invariance)
기본적으로 코틀린의 제네릭 타입은 무공변성을 따릅니다. 이는 제네릭 타입 사이에 상속 관계가 없음을 의미합니다.

```kotlin
open class Animal
class Dog : Animal()

class Box<T>(val item: T)

fun main() {
    val animalBox: Box<Animal> = Box(Animal())
    val dogBox: Box<Dog> = Box(Dog())

    // val box: Box<Animal> = dogBox // 오류 발생, 타입 불일치
}
```

위 코드에서 Box<Dog>는 Box<Animal>의 하위 타입이 아니므로 대입할 수 없습니다.

### 2. 공변성(Covariance)

```kotlin
class Box<out T>(val item: T)
```

공변성은 제네릭 타입의 타입 파라미터가 상위 타입으로 대체될 수 있음을 의미합니다.  `out` 키워드를 사용하여 공변성을 선언합니다.

```kotlin
open class Animal
class Dog : Animal()

class Box<out T>(val item: T) {
    // fun put(item: T) { /* 오류 발생 */ } // 입력 위치에서 T 사용 불가
}

fun main() {
    val dogBox: Box<Dog> = Box(Dog())
    val animalBox: Box<Animal> = dogBox // 공변성으로 인해 대입 가능

    val animal: Animal = animalBox.item
}
```

- `out T`는 T가 공변적임을 나타냅니다.
- T는 출력 위치에서만 사용될 수 있으며, 입력 위치에서는 사용할 수 없습니다.

### 3. 반공변성(Contravariance)

```kotlin
class Box<in T> {
    fun put(item: T) { /* 아이템을 박스에 넣음 */ }
}
```

반공변성은 제네릭 타입의 타입 파라미터가 하위 타입으로 대체될 수 있음을 의미합니다. `in` 키워드를 사용하여 반공변성을 선언합니다.

```kotlin
open class Animal
class Dog : Animal()

class Box<in T> {
    fun put(item: T) { /* 아이템을 박스에 넣음 */ }
    // fun get(): T { /* 오류 발생 */ } // 출력 위치에서 T 사용 불가
}

fun main() {
    val animalBox: Box<Animal> = Box<Animal>()
    val dogBox: Box<Dog> = animalBox // 반공변성으로 인해 대입 가능

    dogBox.put(Dog())
}

```

- `in T`는 T가 반공변적임을 나타냅니다.
- T는 입력 위치에서만 사용될 수 있으며, 출력 위치에서는 사용할 수 없습니다.

### 4. 함수의 공변성과 반공변성

```kotlin
// 공변성 함수
fun copy(from: Array<out Animal>, to: Array<Animal>) {
    for (i in from.indices) {
        to[i] = from[i]
    }
}
```

```kotlin
// 반공변성 함수
fun fill(array: Array<in Dog>, value: Dog) {
    for (i in array.indices) {
        array[i] = value
    }
}
```

함수의 파라미터와 반환 타입에서도 공변성과 반공변성을 적용할 수 있습니다.

## 자바에서의 와일드카드를 통한 공변성과 반공변성
자바에서는 제네릭 타입의 공변성과 반공변성을 표현하기 위해 와일드카드(`?`)와 `extends`, `super` 키워드를 사용합니다.

### 1. 공변성(Covariance) - `? extends T`

- `? extends T`는 T의 하위 타입을 나타냅니다.
- 주로 읽기 전용으로 사용됩니다.

```java
class Animal {}
class Dog extends Animal {}

public void copy(List<? extends Animal> from, List<Animal> to) {
    for (Animal animal : from) {
        to.add(animal);
    }
}

public void main() {
    List<Dog> dogs = new ArrayList<>();
    List<Animal> animals = new ArrayList<>();
    copy(dogs, animals); // 공변성 허용
}
```

### 2. 반공변성(Contravariance) - `? super T`

- `? super T`는 T의 상위 타입을 나타냅니다.
- 주로 쓰기 전용으로 사용됩니다.

```
class Animal {}
class Dog extends Animal {}

public void addDogs(List<? super Dog> list) {
    list.add(new Dog());
}

public void main() {
    List<Animal> animals = new ArrayList<>();
    addDogs(animals); // 반공변성 허용
}
```

## @UnsafeVariance

제네릭 타입의 공변성과 반공변성은 타입 안전성을 보장하기 위해 엄격한 규칙을 따릅니다. 그러나 때로는 이러한 규칙이 코드 작성에 제약을 줄 수 있습니다. 이럴 때 `@UnsafeVariance` 어노테이션을 사용하여 컴파일러의 변성(variance) 검사를 우회할 수 있습니다.

### 왜 @UnsafeVariance를 사용하나요?

제네릭 타입 파라미터에 `out`이나 `in` 키워드를 사용하면 해당 타입 파라미터의 사용 위치가 제한됩니다.

### @UnsafeVariance의 사용 예시

```kotlin
class Producer<out T>(private var value: T) {
    fun produce(): T = value
    fun setValue(newValue: @UnsafeVariance T) {
        value = newValue
    }
}
```

- `Producer` 클래스는 `out T`를 사용하여 공변성을 갖습니다.
- `setValue` 함수의 파라미터 `newValue`는 입력 위치에서 `T`를 사용하므로 원래는 컴파일 오류가 발생합니다.
- `@UnsafeVariance`를 사용하여 컴파일러의 변성 검사를 무시하고 입력 위치에서 `T`를 사용합니다.

### 위험성
```kotlin
open class Animal
class Dog : Animal()
class Cat : Animal()

fun main() {
    val dogProducer: Producer<Dog> = Producer(Dog())
    val animalProducer: Producer<Animal> = dogProducer // 공변성에 의해 허용됨
    animalProducer.setValue(Cat()) // 타입 안정성 문제 발생
    val dog: Dog = dogProducer.produce() // 런타임 오류 발생 가능
}
```

- `animalProducer.setValue(Cat())` 호출로 인해 `dogProducer`에 `Cat` 객체가 저장됩니다.
이후 `dogProducer.produce()`를 호출하면 `Dog` 타입으로 기대하지만, 실제로는 `Cat` 객체가 반환되어 런타임 에러가 발생할 수 있습니다.

## 제네릭 제약

제네릭을 사용할 때 타입 파라미터에 제약을 주어 특정 타입이나 인터페이스를 구현한 타입만 허용하도록 할 수 있습니다. 이를 통해 코드의 안전성과 유연성을 높일 수 있습니다.

### `T : Animal`과 같이 제약하는 방법

```kotlin
open class Animal {
    fun eat() {
        println("Animal is eating")
    }
}

class Dog : Animal() {
    fun bark() {
        println("Dog is barking")
    }
}

class AnimalHouse<T : Animal>(private val resident: T) {
    fun feed() {
        resident.eat()
    }
}

fun main() {
    val dogHouse = AnimalHouse(Dog())
    dogHouse.feed() // 출력: Animal is eating
}
```

`AnimalHouse` 클래스의 제네릭 타입 `T`는 `Animal`을 상한 경계로 가지고 있으므로 `Animal` 또는 그 하위 클래스만 타입 인수로 사용할 수 있습니다.

### `where`을 통한 제네릭 여러 클래스 제약

하나의 타입 파라미터에 여러 제약을 줄 때는 `where` 절을 사용합니다.

```kotlin
interface Runner {
    fun run()
}

interface Swimmer {
    fun swim()
}

fun <T> trainAthlete(athlete: T) where T : Runner, T : Swimmer {
    athlete.run()
    athlete.swim()
}

class Triathlete : Runner, Swimmer {
    override fun run() {
        println("Running")
    }

    override fun swim() {
        println("Swimming")
    }
}

fun main() {
    val athlete = Triathlete()
    trainAthlete(athlete)
    // 출력:
    // Running
    // Swimming
}
```

`trainAthlete` 함수는 타입 파라미터 `T`에 대해 `Runner`와 `Swimmer`를 모두 구현해야 한다는 제약을 가집니다.

### `Any`를 통한 Nullable 제약

Kotlin의 제네릭 타입 파라미터는 기본적으로 Nullable입니다. Nullable 타입을 허용하지 않으려면 `Any`를 상한 경계로 설정합니다.

```kotlin
class NonNullList<T : Any>(private val items: List<T>) {
    fun printItems() {
        items.forEach { println(it) }
    }
}

fun main() {
    val list = NonNullList(listOf("Hello", "World"))
    list.printItems()
    // 출력:
    // Hello
    // World

    // val nullableList = NonNullList(listOf("Hello", null)) // 컴파일 에러 발생
}
```

## 타입소거와 Star Projection

### Java의 Raw Type과 타입 소거

**타입 소거(Type Erasure)**란 제네릭 타입 정보가 컴파일 타임에는 존재하지만, 런타임에는 사라지는 것을 의미합니다. 이는 Java의 제네릭이 컴파일 타임에만 타입 검사를 하고, 런타임에는 타입 정보가 소거되어 호환성을 유지하기 위한 메커니즘입니다.

Raw Type은 제네릭 타입이 도입되기 전에 존재하던 클래스나 인터페이스의 비제네릭 버전을 의미합니다. 예를 들어, `List`는 `List<E>`의 raw type입니다.

```java
List list = new ArrayList(); // Raw Type 사용
list.add("Hello");
list.add(123);
```

위 코드에서 raw type을 사용하면 컴파일러가 타입 체크를 하지 않으므로, 다양한 타입의 객체를 추가할 수 있습니다. 그러나 이는 타입 안정성을 해치고, 런타임에 `ClassCastException`을 발생시킬 수 있습니다.

### Kotlin에서의 Raw Type과 타입 소거

Kotlin은 Java와 달리 raw type을 지원하지 않습니다. Kotlin에서 제네릭 타입을 사용할 때 항상 타입 인수를 명시해야 합니다.

```kotlin
val list: List<String> = listOf("Hello", "World")
// val rawList: List = listOf("Hello", "World") // 오류 발생
```

하지만 Kotlin에서도 타입 소거는 발생합니다. 이는 JVM이 Java 기반이기 때문입니다. 컴파일된 바이트코드에서는 제네릭 타입 정보가 소거됩니다.

### 스타 프로젝션(Star Projection)

Kotlin에서는 제네릭 타입 인수를 모를 때나 다양한 타입을 허용하고자 할 때 **스타 프로젝션(Star Projection)**을 사용할 수 있습니다.

```kotlin
val list: List<*> = listOf("Hello", 123, true)
```

`List<*>`는 "아무 타입이나 담을 수 있는 리스트"를 의미합니다. 하지만 이 경우 리스트의 요소를 읽을 수는 있지만, 타입이 확실하지 않기 때문에 요소를 추가할 수는 없습니다.

```kotlin
val mutableList: MutableList<*> = mutableListOf("Hello", "World")
// mutableList.add("New Item") // 컴파일 오류 발생
```

`add` 함수를 호출하려고 하면 컴파일 오류가 발생합니다. 이는 `MutableList<*>`에서 요소를 추가할 때 타입을 알 수 없기 때문에 타입 안전성을 보장할 수 없기 때문입니다.

**`List<*>`와 타입 안전성**

`List<*>`에서 요소를 가져올 때는 `Any?` 타입으로 취급됩니다.

```kotlin
val item = list[0] // item의 타입은 Any?
```

하지만 요소를 추가하거나 변경하려고 하면 컴파일러는 이를 허용하지 않습니다.

### inline과 reified 키워드

`inline` 함수는 함수의 바이트코드가 호출되는 위치에 인라인(inline)되어 성능을 향상시킵니다.

`reified` 타입 파라미터는 인라인 함수에서만 사용할 수 있으며, 타입 소거를 우회하여 런타임에 제네릭 타입의 타입 정보를 사용할 수 있게 합니다.

```kotlin
inline fun <reified T> isInstance(value: Any): Boolean {
    return value is T
}

fun main() {
    println(isInstance<String>("Hello")) // 출력: true
    println(isInstance<Int>("Hello"))    // 출력: false
}
```

`isInstance` 함수는 제네릭 타입 T에 대해 런타임에 타입 체크를 수행합니다. 일반적인 함수에서는 타입 소거로 인해 이와 같은 타입 체크가 불가능하지만, `inline`과 `reified`를 사용하여 가능합니다.

```toc

```