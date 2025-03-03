---
{"dg-publish":true,"dg-path":"软件工程/如何用 C++ 测量代码运行时间.md","permalink":"/软件工程/如何用 C++ 测量代码运行时间/","created":"2023-02-05T21:34:05.000+08:00","updated":"2025-01-12T18:28:50.067+08:00"}
---

#Technomous 

``` cpp
#include <iostream>
#include <chrono>
#include <thread>
 
int main()
{
    using namespace std::chrono_literals;
    std::cout << "Hello waiter\n" << std::flush;
    auto start = std::chrono::high_resolution_clock::now();
    std::this_thread::sleep_for(2000ms);
    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = end-start;
    std::cout << "Waited " << elapsed.count() << " ms\n";
}
```
