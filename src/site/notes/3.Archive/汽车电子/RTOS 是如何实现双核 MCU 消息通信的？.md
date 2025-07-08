---
{"dg-publish":true,"dg-path":"汽车电子/RTOS 是如何实现双核 MCU 消息通信的？.md","permalink":"/汽车电子/RTOS 是如何实现双核 MCU 消息通信的？/","created":"2025-07-08T14:35:00.512+08:00","updated":"2025-07-08T15:06:25.213+08:00"}
---

#Innolight

手机、电脑多核的 CPU 你可能经常看见，但多核的单片机相对来说就不那么常见了。随着需求的增加、技术的进步，单片机已不再局限于单核了，因此，近几年陆续出现了双核的单片机了。

你可能会好奇，双核单片机之间怎么通信？其实，通信的方式和方法有很多种。本文就给大家描述一下：使用 FreeRTOS 消息缓冲区，实现简单的非对称多处理（AMP）核心到核心通信，结合STM32H7（M4 和 M7） 双核处理器为例。

# 概述

实现 STM32H7 双核之间通信是 FreeRTOS 官方提供的一个方案，是基于 FreeRTOS 消息缓冲区，该消息缓冲区是无锁循环缓冲区，可以将大小不同的数据包从单个发送方传递到单个接收方。


> [!NOTE]
> 说明，该消息缓冲区仅提供数据的传输，不提供通信相关协议处理。

# 基本原理

实现双核之间通信基本原理：发送和接收任务位于非对称多处理器（AMP）配置中的多核微控制器（MCU）的不同内核上，这意味着每个内核都运行自己的 FreeRTOS 程序。

同时，一个内核在另一个内核中具有生成中断的能力，以及两个内核都有访问的内存区域（共享内存）。消息缓冲区以每个内核上运行在应用程序已知的地址置在共享内存中，如下图：

![Pasted image 20250708143813.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250708143813.png)

理想情况下，还将有一个内存保护单元（MPU），以确保只能通过内核的消息缓冲区 API 来访问消息缓冲区，并最好将共享内存标记为不可被其他程序占用。

# 单消息代码描述

这里官方提供了实现该方案的基础代码（仅供参考）。

将数据发送到流缓冲区的代码：

``` c
xMessageBufferSend()
{    
    /* If a time out is specified and there isn't enough    
    space in the message buffer to send the data, then    
    enter the blocked state to wait for more space. */    
    if( time out != 0 )    
    {        
        while( there is insufficient space in the buffer &&            
            not timed out waiting )        
        {            
            Enter the blocked state to wait for space in the buffer        
        }    
    }
    
    if( there is enough space in the buffer )    
    {        
       write data to buffer        
       sbSEND_COMPLETED()    
    }
}
```

从流缓冲区读取数据的代码

``` c
xMessageBufferReceive()
{    
    /* If a time out is specified and the buffer doesn't    
    contain any data that can be read, then enter the    
    blocked state to wait for the buffer to contain data. */    
    if( time out != 0 )    
    {        
        while( there is no data in the buffer &&               
            not timed out waiting )        
        {            
            Enter the blocked state to wait for data        
        }    
    }
    
   if( there is data in the buffer )    
    {        
       read data from buffer        
       sbRECEIVE_COMPLETED()    
    }
}
```

如果任务在 xMessageBufferReceive() 中进入阻塞状态以等待缓冲区包含数据，则将数据发送到缓冲区必须取消阻塞该任务，以便它可以完成其操作。

当 xMessageBufferSend() 调用 sbSEND_COMPLETED() 时，任务将不受阻碍。

![[SingleBuffer.excalidraw]]

![Pasted image 20250708143814.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250708143814.png)

ISR 通过将消息缓冲区的句柄作为参数传递给 xMessageBufferSendCompletedFromISR() 函数来解除对任务的阻塞。

如图箭头所示，其中发送和接收任务位于不同的 MCU 内核上：

1. 接收任务尝试从空的消息缓冲区中读取数据，并进入阻止状态以等待数据到达。
2. 发送任务将数据写入消息缓冲区。
3. sbSEND_COMPLETED() 在正在执行接收任务的内核中触发一个中断。
4. 中断服务例程调用 xMessageBufferSendCompletedFromISR() 来解除阻止接收任务，该任务现在可以从缓冲区读取，因为缓冲区不再为空。

# 多消息代码描述

当只有一个消息缓冲区时，很容易将消息缓冲区的句柄传递到 xMessageBufferSendCompletedFromISR() 中。

但是要考虑有两个或更多消息缓冲区的情况，ISR 必须首先确定哪个消息缓冲区包含数据。如果消息缓冲区的数量很少，则有几种方法可以实现：

- 如果硬件允许，则每个消息缓冲区可以使用不同的中断线，从而使中断服务程序和消息缓冲区之间保持一对一的映射。
- 中断服务例程可以简单地查询每个消息缓冲区以查看其是否包含数据。
- 可以通过传递元数据（消息是什么，消息的预期接收者是什么等等）以及实际数据的单个消息缓冲区来代替多个消息缓冲区。

但是，如果存在大量或未知的消息缓冲区，则这些技术效率不高。

在这种情况下，可伸缩的解决方案是引入单独的控制消息缓冲区。如下面的代码所示， sbSEND_COMPLETED() 使用控制消息缓冲区将包含数据的消息缓冲区的句柄传递到中断服务例程中。  

使用 sbSEND_COMPLETED() 的实现：

``` c
/* Added to FreeRTOSConfig.h to override the default implementation. */
#define sbSEND_COMPLETED( pxStreamBuffer ) vGenerateCoreToCoreInterrupt( pxStreamBuffer )
/* Implemented in a C file. */
void vGenerateCoreToCoreInterrupt( MessageBufferHandle_t xUpdatedBuffer )
{
  size_t BytesWritten.
  /* Called by the implementation of sbSEND_COMPLETED() in FreeRTOSConfig.h.    
  If this function was called because data was written to any message buffer    
  other than the control message buffer then write the handle of the message    
  buffer that contains data to the control message buffer, then raise an    
  interrupt in the other core.  If this function was called because data was    
  written to the control message buffer then do nothing. */    
  if( xUpdatedBuffer != xControlMessageBuffer )    
  {        
     BytesWritten = xMessageBufferSend(  xControlMessageBuffer,                                            
                         &xUpdatedBuffer,                                            
                         sizeof( xUpdatedBuffer ),                                            
                         0 );
     /* If the bytes could not be written then the control message buffer        
     is too small! */        
      configASSERT( BytesWritten == sizeof( xUpdatedBuffer );
      
     /* Generate interrupt in the other core (pseudocode). */        
     GenerateInterrupt();    
    }
}
```

然后，ISR 读取控制消息缓冲区以获得句柄，将句柄作为参数传递到 xMessageBufferSendCompletedFromISR() 中：

``` c
void InterruptServiceRoutine( void )
{
  MessageBufferHandle_t xUpdatedMessageBuffer;
  BaseType_t xHigherPriorityTaskWoken = pdFALSE;
   
  /* Receive the handle of the message buffer that contains data from the    
  control message buffer.  Ensure to drain the buffer before returning. */    
  while( xMessageBufferReceiveFromISR( xControlMessageBuffer,                                         
                      &xUpdatedMessageBuffer,                                         
                      sizeof( xUpdatedMessageBuffer ),                                         
                      &xHigherPriorityTaskWoken )                                           
                      == sizeof( xUpdatedMessageBuffer ) )    
    {        
      /* Call the API function that sends a notification to any task that is        
      blocked on the xUpdatedMessageBuffer message buffer waiting for data to        
      arrive. */        
      xMessageBufferSendCompletedFromISR( xUpdatedMessageBuffer,                                            
                         &xHigherPriorityTaskWoken );    
    }
   
  /* Normal FreeRTOS "yield from interrupt" semantics, where    
  xHigherPriorityTaskWoken is initialised to pdFALSE and will then get set to    
  pdTRUE if the interrupt unblocks a task that has a priority above that of    
  the currently executing task. */    
  portYIELD_FROM_ISR( xHigherPriorityTaskWoken );
}
```

![[MultiBuffer.excalidraw]]

![Pasted image 20250708143815.png|650](/img/user/0.Asset/resource/Pasted%20image%2020250708143815.png)

如图，使用控制消息缓冲区时的顺序：

1. 接收任务尝试从空的消息缓冲区中读取数据，并进入阻止状态以等待数据到达。
2. 发送任务将数据写入消息缓冲区。
3. sbSEND_COMPLETED() 将现在包含数据的消息缓冲区的句柄发送到控制消息缓冲区。
4. sbSEND_COMPLETED() 在正在执行接收任务的内核中触发一个中断。
5. 中断服务例程从控制消息缓冲区中读取包含数据的消息缓冲区的句柄，然后将该句柄传递给 xMessageBufferSendCompletedFromISR() 的 API 函数以取消阻止接收任务，该任务现在可以从缓冲区读取，因为缓冲区不再存在空的。

当然，以上仅提供基础原理和方法，具体实现需结合项目实际情况。更多相关内容，请参看官方相关资料。