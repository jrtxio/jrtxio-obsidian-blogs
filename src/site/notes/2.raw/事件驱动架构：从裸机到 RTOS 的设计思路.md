---
{"dg-publish":true,"dg-path":"事件驱动架构：从裸机到 RTOS 的设计思路.md","permalink":"/事件驱动架构：从裸机到 RTOS 的设计思路/","dg-note-properties":{"slug":"event-driven-architecture-from-bare-metal-to-rtos","author":"吉人","created":"2026-04-06","source":null}}
---

> RTOS 不是从天而降的，它是裸机里每一个 `if (flag)` 一步步长出来的。

大多数嵌入式项目走的是同一条路：一开始 main 函数很清爽，后来需求不断加，你引入中断、加 flag、加 `if-else` 分支。某天回头看，主循环已经变成一碗意大利面。你觉得该上 RTOS 了。但 RTOS 不是凭空变出来的魔法，它解决的核心问题——事件的捕获、排队、调度——你其实一直在做，只是没有系统化。事件驱动架构，就是这条从裸机到 RTOS 的演化主线。

## 从 flag 到队列

前后台系统大家都熟悉：中断置位 flag，主循环检查 flag 再处理。两个事件时很清晰，二十个事件时，flag 散落成一片全局变量，`if-else` 链越拉越长。更要命的是，flag 只能表达「发生了」，没法表达「发生了什么」——串口收到了什么？ADC 采样值是多少？

解决思路是把事件统一成结构体，排成队列，中断负责入队，主循环负责出队和分派。

```c
typedef struct {
    uint8_t type;   // 事件类型
    uint32_t data;  // 事件数据
} Event;

#define QUEUE_SIZE 64
Event queue[QUEUE_SIZE];
uint8_t head = 0, tail = 0;

void Event_Post(uint8_t type, uint32_t data) {
    queue[tail].type = type;
    queue[tail].data = data;
    tail = (tail + 1) % QUEUE_SIZE;
}

Event Event_Get(void) {
    Event e = queue[head];
    head = (head + 1) % QUEUE_SIZE;
    return e;
}
```

这一步的质变在于：事件有了统一的格式，可以被队列化、传递、甚至按策略丢弃。FNET 协议栈就是这么做的——它实现了一个服务管理器，各模块在初始化时注册自己，服务管理器周期性调用已注册的服务，每个服务内部用状态机驱动。这就是一个**协作式的事件驱动框架**：没有 RTOS，但骨架已经齐了。

## 优先级：从协作到抢占

队列方案有一个致命问题：所有事件平等排队。紧急报警和普通日志享受同样的待遇，先来后到，谁也不能插队。

```c
// 无优先级：严格 FIFO
while (Event_Available()) {
    Event e = Event_Get();
    Dispatch(e);
}

// 有优先级：紧急事件立即处理
while (1) {
    if (alarm_active) { HandleAlarm(); continue; }
    if (Event_Available()) {
        Event e = Event_Get();
        Dispatch(e);
    }
}
```

一旦你让高优先级事件打断低优先级的处理过程，就不再是轮询了——这是抢占式调度的雏形。再加上独立的栈空间和上下文保存恢复，就得到了 RTOS 的内核。OSEK OS 就是这条路径的产物：它为汽车电子定义了任务、事件、资源、定时器等标准服务，本质上就是一个带优先级的事件驱动调度器。

回过头看整条链路：flag 标记 → 事件队列 → 优先级调度 → 上下文切换。**每一层都是对上一层的自然扩展，RTOS 是这条演化链的终点，不是起点。**

## 状态机：给事件装上记忆

事件驱动解决了「什么时候响应」的问题，但同一个事件在不同场景下往往需要不同的处理。收到串口数据时，系统可能处于空闲状态直接处理，也可能处于等待应答状态触发超时重传。状态机解决的就是这个问题——记住当前状态，结合收到的事件，决定下一步做什么。

```c
typedef enum { S_IDLE, S_WAIT_ACK, S_ERROR } State;
State state = S_IDLE;

void OnEvent(Event e) {
    switch (state) {
        case S_IDLE:
            if (e.type == EV_TX_REQ) {
                SendPacket();
                state = S_WAIT_ACK;
            }
            break;
        case S_WAIT_ACK:
            if (e.type == EV_RX && e.data == ACK)
                state = S_IDLE;
            else if (e.type == EV_TIMEOUT)
                RetryOrError();
            break;
    }
}
```

事件驱动和状态机是天然搭档：前者负责把外部信号翻译成结构化事件，后者负责根据当前状态解释事件含义。FNET 里每个服务模块内部就是一个状态机，由服务管理器周期投喂事件来驱动转移。这种组合在嵌入式开发中无处不在：通信协议栈（TCP 状态机、CAN 状态机）、驱动生命周期管理（初始化→运行→错误恢复）、AUTOSAR 的 BSW 模块，底层都是同一套设计。理解了这个骨架，回头看这些系统就不再是 API 的堆砌，而是同一套设计思路的不同实现。
