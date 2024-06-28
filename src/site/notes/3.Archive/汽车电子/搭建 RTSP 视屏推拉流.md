---
{"dg-publish":true,"dg-path":"汽车电子/搭建 RTSP 视屏推拉流.md","permalink":"/汽车电子/搭建 RTSP 视屏推拉流/","created":"2023-11-06T10:34:28.000+08:00","updated":"2024-02-28T13:22:28.000+08:00"}
---

#Technomous

# 协议交互

- RTSP Pusher

![Pasted image 20231109161711.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231109161711.png)

- RTSP Server

![Pasted image 20231108111320.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231108111320.png)


RTSP 协议交互过程中涉及三者，RTSP Pusher、RTSP Server、RTSP Client。RTSP Pusher 将视屏推送到 RTSP Server，RTSP Client 从 RTSP Server 拉取视频流。以下搭建的推拉流过程过程三者均包含。值得注意的是，这个三者并不一定需要同时出现，比如 RTSP Pusher。因为 RTSP Server 的视屏流的来源并不是仅来自于 RTSP Pusher，也可能直接来自于音视频设备等，所以在实际的应用过程中需要灵活选择。
# 环境搭建

我们利用 mediamtx 充当 RTSP Server，ffmpeg 包含三个组件，ffmpeg、ffplay 和 ffprobe。其中 ffmpeg 可以充当 RTSP Pusher，ffplay 可以充当 RTSP Client。

- [mediamtx](https://github.com/bluenviron/mediamtx)
- [ffmpeg](https://github.com/FFmpeg/FFmpeg)

# 推流拉流

首先启动 rtsp 服务器 mediamtx，然后使用 ffmpeg 向 mediamtx 进行推流，使用 ffmpeg 的组件 ffplay 从 mediamtx 拉流播放视屏。

- mediamtx 启动

``` shell
./mediamtx
```

- ffmpeg 推流

``` shell
ffmpeg -re -stream_loop -1 -i juren.mp4 -c copy -f rtsp rtsp://localhost:8554/stream
```

`-re` ：这个选项告诉 ffmpeg 以视屏的原生帧率播放，这对于流式传输视屏文件非常重要。
`-stream_loop -1`：此选项用于是 ffmpeg 将输入文件无限循环播放（-1 次），以便保持连续播放。
`-i juren.mp4`：这是输入文件标志，指定要流式传输的视屏文件，这里是 "juren.mp4"。
`-c copy`：此选项告诉 ffmpeg 复制视屏和音频流，而不进行重新编码。这对于保留输入文件的原始质量和格式非常有用。
`-f rtsp`：此选项指定输出格式为 RTSP （实时流式传输协议），这是常用于互联网传输音频和视屏的协议
`rtsp://localhost:8554/stream`：这是输出 URL，RTSP 流将在此 URL 上提供。在这种情况下，流将在 "`rtsp://localhost:8554/stream`" 上可用。

- ffplay 拉流

``` shell
ffplay -rtsp_transport tcp -i rtsp://localhost:8554/stream
```

`-rtsp_transport tcp`：这个选项制定了 RTSP 流的传输方式，使用 TCP。RTSP 支持多种传输方式，包括 UDP 和 TCP。使用 TCP 可以更可靠的处理数据传输，但可能会增加一些延迟。
`-i rtsp://locaohost:8554/stream`：这是 RTSP 流的 URL，其中 `rtsp://locaohost:8554/stream` 是流的位置。

# 其他方案

我们也可以利用 VLC 来搭建 rtsp 服务器，利用 VLC 或者 ffplay 来播放。

## 串流服务器 VLC

- 选择串流功能

![Pasted image 20231106153349.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106153349.png)

- 添加视屏文件

![Pasted image 20231106153434.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106153434.png)

![Pasted image 20231106153518.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106153518.png)

![Pasted image 20231106153608.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106153608.png)

- 添加串流服务器

![Pasted image 20231106153641.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106153641.png)

- 设置RTSP参数

![Pasted image 20231106154530.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106154530.png)

- 选择转码格式

![Pasted image 20231106153755.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106153755.png)

- 拼接串流地址

![Pasted image 20231106154615.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106154615.png)

最终生成的串流地址是 `rtsp://[ip]:8554/stream` ，`[ip]` 地址替换成本机的 ip 地址。

## 串流客户端 VLC

- 添加网络流

![Pasted image 20231106152243.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106152243.png)

- 添加网络地址

![Pasted image 20231106154719.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106154719.png)

![Pasted image 20231106154751.png|650](/img/user/0.Asset/resource/Pasted%20image%2020231106154751.png)

## 串流客户端 ffplay

通过执行以下命令实现串流播放：

``` shell
ffplay -i rtsp://192.168.96.2:5544/stream
```

## 车内网 RTP 传输

车内网的视频流有一些特殊的要求，并不使用 RTSP 协议，而是直接利用 RTP 对视屏流进行推送。可以参考 [RTPH264Streaming](https://github.com/tinydigger/RTPH264Streaming) 示例搭建基于 RTP 直接传输视频流。 