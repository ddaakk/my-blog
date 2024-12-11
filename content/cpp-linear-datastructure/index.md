---
emoji: 📖
title: CPP 선형 자료구조 정리
date: '2024-12-11 15:49:25'
author: 에디
tags: cpp
categories: cpp
---

```c++
#include <iostream>
#include <vector>

using namespace std;

vector<int> v;
for (int i = 0; i < 100; i++)
{ 
    v.push_back(i);
    cout << v[i] << " " << v.size() << " " << v.capacity() << endl;
}

v.clear();
cout << v.size() << " " << v.capacity() << endl;
```

    0 1 1
    1 2 2
    2 3 4
    3 4 4
    4 5 8
    5 6 8
    6 7 8
    7 8 8
    8 9 16
    9 10 16
    10 11 16
    11 12 16
    12 13 16
    13 14 16
    14 15 16
    15 16 16
    16 17 32
    17 18 32
    18 19 32
    19 20 32
    20 21 32
    21 22 32
    22 23 32
    23 24 32
    24 25 32
    25 26 32
    26 27 32
    27 28 32
    28 29 32
    29 30 32
    30 31 32
    31 32 32
    32 33 64
    33 34 64
    34 35 64
    35 36 64
    36 37 64
    37 38 64
    38 39 64
    39 40 64
    40 41 64
    41 42 64
    42 43 64
    43 44 64
    44 45 64
    45 46 64
    46 47 64
    47 48 64
    48 49 64
    49 50 64
    50 51 64
    51 52 64
    52 53 64
    53 54 64
    54 55 64
    55 56 64
    56 57 64
    57 58 64
    58 59 64
    59 60 64
    60 61 64
    61 62 64
    62 63 64
    63 64 64
    64 65 128
    65 66 128
    66 67 128
    67 68 128
    68 69 128
    69 70 128
    70 71 128
    71 72 128
    72 73 128
    73 74 128
    74 75 128
    75 76 128
    76 77 128
    77 78 128
    78 79 128
    79 80 128
    80 81 128
    81 82 128
    82 83 128
    83 84 128
    84 85 128
    85 86 128
    86 87 128
    87 88 128
    88 89 128
    89 90 128
    90 91 128
    91 92 128
    92 93 128
    93 94 128
    94 95 128
    95 96 128
    96 97 128
    97 98 128
    98 99 128
    99 100 128
    0 128



```c++
template<typename T>
class Vector
{
public:
    Vector()
    {
        
    }

    ~Vector()
    {
       if (_data)
           delete[] _data;
    }

    void push_back(const T& value)
    {
        if (_size == _capacity)
        {
            int newCapacity = static_cast<int>(_capacity * 1.5);
            if (newCapacity == _capacity)
                newCapacity++;

            reserve(newCapacity);
        }

        _data[_size] = value;
        _size++;
    }

    void reserve(int capacity)
    {
        if (_capacity >= capacity)
            return;

        _capacity = capacity;
        T* newData = new T[_capacity];

        for (int i = 0; i < _size; i++)
            newData[i] = _data[i];

        if (_data)
            delete[] _data;

        _data = newData;
    }

    T& operator[](const int pos) { return _data[pos]; }
    int size() { return _size; }
    int capacity() { return _capacity; }
    
    void clear()
    {
        if (_data)
        {
            delete[] _data;
            _data = new T[_capacity];
        }
        
        _size = 0;
    }

private:
    T* _data = nullptr;
    int _size = 0;
    int _capacity = 0;
};
```


```c++
#include <iostream>

using namespace std;

Vector<int> v;
for (int i = 0; i < 100; i++)
{ 
    v.push_back(i);
    cout << v[i] << " " << v.size() << " " << v.capacity() << endl;
}

v.clear();
cout << v.size() << " " << v.capacity() << endl;
```

    0 1 1
    1 2 2
    2 3 3
    3 4 4
    4 5 6
    5 6 6
    6 7 9
    7 8 9
    8 9 9
    9 10 13
    10 11 13
    11 12 13
    12 13 13
    13 14 19
    14 15 19
    15 16 19
    16 17 19
    17 18 19
    18 19 19
    19 20 28
    20 21 28
    21 22 28
    22 23 28
    23 24 28
    24 25 28
    25 26 28
    26 27 28
    27 28 28
    28 29 42
    29 30 42
    30 31 42
    31 32 42
    32 33 42
    33 34 42
    34 35 42
    35 36 42
    36 37 42
    37 38 42
    38 39 42
    39 40 42
    40 41 42
    41 42 42
    42 43 63
    43 44 63
    44 45 63
    45 46 63
    46 47 63
    47 48 63
    48 49 63
    49 50 63
    50 51 63
    51 52 63
    52 53 63
    53 54 63
    54 55 63
    55 56 63
    56 57 63
    57 58 63
    58 59 63
    59 60 63
    60 61 63
    61 62 63
    62 63 63
    63 64 94
    64 65 94
    65 66 94
    66 67 94
    67 68 94
    68 69 94
    69 70 94
    70 71 94
    71 72 94
    72 73 94
    73 74 94
    74 75 94
    75 76 94
    76 77 94
    77 78 94
    78 79 94
    79 80 94
    80 81 94
    81 82 94
    82 83 94
    83 84 94
    84 85 94
    85 86 94
    86 87 94
    87 88 94
    88 89 94
    89 90 94
    90 91 94
    91 92 94
    92 93 94
    93 94 94
    94 95 141
    95 96 141
    96 97 141
    97 98 141
    98 99 141
    99 100 141
    0 141



```c++
#include <iostream>
#include <list>

using namespace std;

list<int> li;

for (int i = 0; i < 10; i++)
{
    li.push_back(i);
    // li.push_front
}
```


```c++
#include <iostream>
#include <list>

using namespace std;

list<int> li;
list<int>::iterator eraseIt;

for (int i = 0; i < 10; i++)
{
    if (i == 5)
    {
        eraseIt = li.insert(li.end(), i);
    }
    else
    {
        li.push_back(i);
    }
}

li.pop_back();

li.erase(eraseIt);

for (list<int>::iterator it = li.begin(); it != li.end(); ++it)
{
    cout << *it << " ";
}
```

    0 1 2 3 4 6 7 8 


```c++
template<typename T>
class Node
{

public:
    Node() : _prev(nullptr), _next(nullptr), _data(T())
    {
        
    }

    Node(const T& value) : _prev(nullptr), _next(nullptr), _data(value)
    {
    }


public:
    Node* _prev;
    Node* _next;
    T _data;
};
```


```c++
template<typename T>
class Iterator
{
public:
    Iterator() : _node(nullptr)
    {
    }
    Iterator(Node<T>* node) : _node(node)
    {
    }

    // ++it
    Iterator& operator++()
    {
        _node = _node->_next;
        return *this;
    }

    // it++
    Iterator operator++(int)
    {
        Iterator<T> temp = *this;
        _node = _node->_next;
        return temp;
    }

    Iterator& operator--()
    {
        _node = _node->_prev;
        return *this;
    }

    Iterator operator--(int)
    {
        Iterator<T> temp = *this;
        _node = _node->_prev;
        return temp;
    }

    T& operator*()
    {
        return _node->_data;
    }

    bool operator==(const Iterator& other)
    {
        return _node == other._node;
    }

    bool operator!=(const Iterator& other)
    {
        return _node != other._node;
    }
public:
    Node<T>* _node;
};
```


```c++
template<typename T>
class List
{
public: 
    List() : _size(0)
    {
        _head = new Node<T>();
        _tail = new Node<T>();
        _head->_next = _tail;
        _tail->_prev = _head;
    }

    ~List()
    {
        while (_size > 0)
            pop_back();
        
        delete _head;
        delete _tail;
    }

void push_back(const T& value)
{
    AddNode(_tail, value);
}

void pop_back()
{
    RemoveNode(_tail->_prev);
}

private:
    Node<T>* AddNode(Node<T>* before, const T& value)
    {
        Node<T>* newNode = new Node<T>(value);
        Node<T>* prevNode = before->_prev;

        prevNode->_next = newNode;
        newNode->_prev = prevNode;

        newNode->_next = before;
        before->_prev = newNode;

        _size++;

        return newNode;
    }

    Node<T>* RemoveNode(Node<T>* node)
    {
        Node<T>* prevNode = node->_prev;
        Node<T>* nextNode = node->_next;

        prevNode->_next = nextNode;
        nextNode->_prev = prevNode;

        delete node;

        _size--;
        
        return nextNode;
    }

    int size() { return _size; }
public:
    using iterator = Iterator<T>;

    iterator begin() { return iterator(_head->_next); }
    iterator end() { return iterator(_tail); }
    iterator insert(iterator it, const T& value) {
        Node<T>* node = AddNode(it._node, value);
        return iterator(node);
    }
    iterator erase(iterator it)
    {
        Node<T>* node = RemoveNode(it._node);
        return iterator(node);
    }

public:
    Node<T>* _head;
    Node<T>* _tail;
    int _size;
};
```


```c++
#include <iostream>

using namespace std;

List<int> li;
List<int>::iterator eraseIt;

for (int i = 0; i < 10; i++)
{
    if (i == 5)
    {
        eraseIt = li.insert(li.end(), i);
    }
    else
    {
        li.push_back(i);
    }
}

li.pop_back();

li.erase(eraseIt);

for (List<int>::iterator it = li.begin(); it != li.end(); ++it)
{
    cout << *it << " ";
}
```

    0 1 2 3 4 6 7 8 


```c++
#include <iostream>
#include <vector>
#include <list>
#include <stack>
using namespace std;

stack<int> s;

s.push(1);
s.push(2);
s.push(3);

while(s.empty() == false)
{
    int data = s.top();
    s.pop();

    cout << data << endl;
}

int size =  s.size();
```

    3
    2
    1



```c++
#include <vector>
using namespace std;
```


```c++
template<typename T>
class Stack
{
public:
    void push(const T& value)
    {
        _container.push_back(value);
    }

    void pop()
    {
        _container.pop_back();
    }

    T& top()
    {
        return _container.back();
    }

    bool empty() { return _container.empty(); }
    int size() { return _container.size(); }
private:
    vector<T> _container;
};
```


```c++
#include <iostream>
#include <vector>
#include <list>
#include <stack>
using namespace std;

Stack<int> s;

s.push(1);
s.push(2);
s.push(3);

while(s.empty() == false)
{
    int data = s.top();
    s.pop();

    cout << data << endl;
}

int size =  s.size();
```

    3
    2
    1



```c++
#include <iostream>
#include <queue>
using namespace std;

queue<int> q;

for (int i = 0; i < 10; ++i)
    q.push(i);

while(q.empty() == false)
{
    int value = q.front();
    q.pop();
    cout << value << endl;
}

int size = q.size();
```

    0
    1
    2
    3
    4
    5
    6
    7
    8
    9



```c++
#include <iostream>
#include <vector>
#include <list>

using namespace std;
```


```c++
#include <iostream>
#include <vector>
#include <list>

using namespace std;
```


```c++
template<typename T>
class ArrayQueue
{
public:
    void push(const T& value)
    {
        // TODO: 꽉 찼는지 체크

        if (_size == _container.size())
        {
            int newSize = max(1, _size * 2);
            vector<T> newData;
            newData.resize(newSize);

            for (int i = 0; i < _size; ++i)
            {
                int index = (_front + i) % _container.size();
                newData[i] = _container[index];
            }

            _container.swap(newData);
            _front = 0;
            _back = _size;
        }
            
        _container[_back] = value;
        _back = (_back + 1) % _container.size();
        _size++;
    }

    void pop()
    {
        _front = (_front + 1) % _container.size();
        _size--;
    }

    T& front()
    {
        return _container[_front];
    }

    bool empty() { return _size == 0; }
    int size() { return _size; }
private:
    vector<T> _container;

    int _front = 0;
    int _back = 0;
    int _size = 0;
};
```


```c++
template<typename T>
class ListQueue
{
public:
    void push(const T& value)
    {
        _container.push_back(value);
    }

    void pop()
    {
        _container.pop_front();
    }

    T& front()
    {
        return _container.front();
    }

    bool empty() { return _container.empty(); }
    int size() { return _container.size(); }
private:
    list<T> _container;
};
```


```c++
#include <iostream>
#include <queue>
using namespace std;

ListQueue<int> q;

for (int i = 0; i < 10; ++i)
    q.push(i);

while(q.empty() == false)
{
    int value = q.front();
    q.pop();
    cout << value << endl;
}

int size = q.size();
```

    0
    1
    2
    3
    4
    5
    6
    7
    8
    9



```c++
#include <iostream>
#include <queue>
using namespace std;

ArrayQueue<int> q;

for (int i = 0; i < 10; ++i)
    q.push(i);

while(q.empty() == false)
{
    int value = q.front();
    q.pop();
    cout << value << endl;
}

int size = q.size();
```

    0
    1
    2
    3
    4
    5
    6
    7
    8
    9

