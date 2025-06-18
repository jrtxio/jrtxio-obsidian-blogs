---
{"dg-publish":true,"dg-path":"02 - 编程语言/C++ 关键概念与实战解析.md","permalink":"/02 - 编程语言/C++ 关键概念与实战解析/","created":"2022-09-06T16:59:20.000+08:00","updated":"2025-04-02T11:04:24.541+08:00"}
---

#Ofilm

1. 引用与指针的区别
   
``` cpp
#include <iostream>
using namespace std;

void pointerExample() {
    int a = 10;
    int* p = &a;  // 指针
    cout << "指针指向的值: " << *p << endl;
}

void referenceExample() {
    int b = 20;
    int& r = b;  // 引用
    cout << "引用的值: " << r << endl;
}

int main() {
    pointerExample();
    referenceExample();
    return 0;
}
```

2. C 和 C++的一些区别

``` cpp
// C语言
#include <stdio.h>

int main() {
    int a = 10;
    printf("C语言：%d\n", a);
    return 0;
}

// C++语言
#include <iostream>
using namespace std;

int main() {
    int a = 20;
    cout << "C++语言：" << a << endl;
    return 0;
}
```

3. 虚机制：虚函数、虚函数表、纯虚函数

``` cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void show() { cout << "Base class" << endl; }
    virtual ~Base() {}  // 虚析构函数
};

class Derived : public Base {
public:
    void show() override { cout << "Derived class" << endl; }
};

int main() {
    Base* b = new Derived();
    b->show();  // 动态绑定
    delete b;
    return 0;
}
```

4. 继承、虚继承、菱形继承等

``` cpp
#include <iostream>
using namespace std;

class A {
public:
    void show() { cout << "Class A" << endl; }
};

class B : public A {
public:
    void show() { cout << "Class B" << endl; }
};

class C : public A {
public:
    void show() { cout << "Class C" << endl; }
};

class D : public B, public C {
public:
    void show() { cout << "Class D" << endl; }
};

int main() {
    D d;
    d.show();  // 菱形继承的问题
    return 0;
}
```
   
5. 多态：动态绑定、静态多态

``` cpp
#include <iostream>
using namespace std;

// 动态多态
class Base {
public:
    virtual void show() { cout << "Base class" << endl; }
};

class Derived : public Base {
public:
    void show() override { cout << "Derived class" << endl; }
};

int main() {
    Base* b = new Derived();
    b->show();  // 动态绑定
    delete b;
    return 0;
}
```

6. 重写、重载

``` cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void func() { cout << "Base func()" << endl; }
};

class Derived : public Base {
public:
    void func() override { cout << "Derived func()" << endl; }  // 重写
};

void func(int x) { cout << "func(int) : " << x << endl; }  // 重载
void func(double x) { cout << "func(double) : " << x << endl; }

int main() {
    Base* b = new Derived();
    b->func();  // 重写
    delete b;
    
    func(10);    // 重载
    func(10.5);  // 重载
    return 0;
}
```

7. 智能指针原理：引用计数、RAII（资源获取即初始化）思想

``` cpp
#include <iostream>
#include <memory>
using namespace std;

class Resource {
public:
    Resource() { cout << "Resource acquired" << endl; }
    ~Resource() { cout << "Resource released" << endl; }
};

int main() {
    {
        unique_ptr<Resource> p1 = make_unique<Resource>();  // RAII原则
    }  // p1超出作用域，资源自动释放
    return 0;
}
```

8. 智能指针使用：shared_ptr、weak_ptr、unique_ptr等

``` cpp
#include <iostream>
#include <memory>
using namespace std;

int main() {
    shared_ptr<int> p1 = make_shared<int>(10);
    weak_ptr<int> p2 = p1;  // weak_ptr不增加引用计数
    cout << "p1 value: " << *p1 << endl;
    cout << "p2 expired: " << (p2.expired() ? "Yes" : "No") << endl;
    return 0;
}
```

9. 四种类型转换：static_cast、dynamic_cast、const_cast，reinterpret_cast

``` cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void show() { cout << "Base class" << endl; }
};

class Derived : public Base {
public:
    void show() override { cout << "Derived class" << endl; }
};

int main() {
    Base* b = new Derived();
    
    // static_cast
    Derived* d1 = static_cast<Derived*>(b);
    d1->show();
    
    // dynamic_cast
    Derived* d2 = dynamic_cast<Derived*>(b);
    if (d2) d2->show();

    // const_cast
    const int a = 10;
    int* ptr = const_cast<int*>(&a);
    *ptr = 20;  // 在某些情况下是未定义的行为

    // reinterpret_cast
    long long int largeValue = reinterpret_cast<long long int>(b);
    cout << "Reinterpreted value: " << largeValue << endl;
    
    delete b;
    return 0;
}
```

10. STL部分容器的实现原理，如 vector、deque、map、hashmap

``` cpp
#include <iostream>
#include <vector>
#include <deque>
#include <map>
#include <unordered_map>
using namespace std;

int main() {
    // vector
    vector<int> vec = {1, 2, 3, 4};
    vec.push_back(5);
    for (int v : vec) cout << v << " ";
    cout << endl;

    // deque
    deque<int> deq = {1, 2, 3};
    deq.push_front(0);
    deq.push_back(4);
    for (int v : deq) cout << v << " ";
    cout << endl;

    // map
    map<string, int> m;
    m["one"] = 1;
    m["two"] = 2;
    for (auto& p : m) cout << p.first << ": " << p.second << endl;

    // unordered_map
    unordered_map<string, int> um;
    um["apple"] = 10;
    um["banana"] = 20;
    for (auto& p : um) cout << p.first << ": " << p.second << endl;

    return 0;
}
```

11. 模板特化、偏特化，萃取 traits 技巧

``` cpp
#include <iostream>
using namespace std;

// 完全特化
template <typename T>
struct MyType {
    void show() { cout << "Generic template" << endl; }
};

template <>
struct MyType<int> {
    void show() { cout << "Specialized for int" << endl; }
};

// 偏特化
template <typename T, typename U>
struct MyType<T, U*> {
    void show() { cout << "Pointer specialization" << endl; }
};

int main() {
    MyType<double> obj1;
    obj1.show();  // Generic template

    MyType<int> obj2;
    obj2.show();  // Specialized for int

    MyType<int, double*> obj3;
    obj3.show();  // Pointer specialization

    return 0;
}
```

12. 编译连接机制、内存布局（memory layout）、对象模型

``` cpp
#include <iostream>
using namespace std;

class A {
public:
    int x;
    virtual void show() { cout << "Class A" << endl; }
};

class B : public A {
public:
    int y;
    void show() override { cout << "Class B" << endl; }
};

int main() {
    A a;
    B b;

    cout << "Size of A: " << sizeof(a) << endl;
    cout << "Size of B: " << sizeof(b) << endl;
    
    A* ptr = &b;
    ptr->show();  // 虚函数机制
    return 0;
}
```

13. C++11 部分新特性，比如右值引用、完美转发等

``` cpp
#include <iostream>
#include <utility>
using namespace std;

void print(int&& x) {
    cout << "Rvalue: " << x << endl;
}

template <typename T>
void forwardTest(T&& arg) {
    print(forward<T>(arg));  // 完美转发
}

int main() {
    int x = 10;
    forwardTest(x);  // Lvalue转发
    forwardTest(20); // Rvalue转发
    return 0;
}
```