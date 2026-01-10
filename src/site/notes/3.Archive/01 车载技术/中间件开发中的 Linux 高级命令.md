---
{"dg-publish":true,"dg-path":"01 车载技术/中间件开发中的 Linux 高级命令.md","permalink":"/01 车载技术/中间件开发中的 Linux 高级命令/"}
---

#linux 

## 1. 复制挂载在 `/app` 的设备内容

```bash
mount | grep -w /app | awk '{print $1}' | xargs -n1 -I dev dd if=dev of=/opt/update/app.img
```

说明：

- `mount | grep -w /app`：过滤挂载点为 `/app` 的条目
- `awk '{print $1}'`：取设备名
- `xargs -n1 -I dev`：将设备名传给后续命令
- `dd if=dev of=/opt/update/app.img`：复制设备内容到 `/opt/update/app.img`
## 2. 查看 `/app` 的文件系统占用情况（df）

```bash
df /app | grep -w "/app"
```

说明：

- `df /app`：查看 `/app` 所在文件系统的磁盘占用
- `grep -w "/app"`：只显示挂载点为 `/app` 的行

## 3. 查找 `/app` 上挂载的 ext4 文件系统（mount）

```bash
mount | grep "on /app type ext4"
```

说明：过滤出挂载到 `/app` 且文件系统类型为 `ext4` 的条目。

## 4. 从 `/etc/mtab` 中查找 `/app` 对应的 ext4 条目

```bash
cat /etc/mtab | grep "/app ext4"
```

说明：

- `/etc/mtab` 记录当前挂载的文件系统
- 通过 `grep` 筛选 `/app ext4` 条目

## 5. 查看当前进程使用的 `/app` 挂载信息

```bash
cat /proc/self/mounts | grep /app
```

说明：显示当前 **进程视角** 下的挂载信息。

## 6. 重新以可写方式挂载 `/app` 文件系统

```bash
mount -o remount,rw /app
```

说明：

- `remount`：重新挂载
- `rw`：读写模式

> [!WARNING]
> 
> - `df`：关注磁盘空间占用
>     
> - `mount`：关注挂载点、文件系统类型与参数
>     
> - `/etc/mtab`：可能是 `/proc/self/mounts` 的软链接
>     

## 7. 杀死与 `/app` 有关的进程

```bash
ps -ef | grep /app | grep -v grep | awk '{print $2}' | xargs -n1 -I {} sudo kill -9 {}
```

说明：

- `ps -ef`：列出所有进程
- `grep /app`：过滤与 `/app` 相关的进程
- `awk '{print $2}'`：获取 PID
- `sudo kill -9`：强制终止进程

## 8. 查看指定进程打开的文件（lsof）

```bash
lsof -p PID
```

说明：显示该 PID 打开的文件/目录/端口等。

## 9. 关闭正在使用 `/app` 的进程（fuser）

```bash
fuser -ck /app
```

说明：

- `-c`：显示进程 PID
- `-k`：发送信号杀死相关进程

## 10. 筛选带“FOTA”字样的进程及其 nice 值

```bash
ps ax -o nice,pid,comm | grep FOTA
```

## 11. 禁用 motionwise 服务自启动（systemd）

```bash
systemctl disable motionwise
```

## 12. 查找处于监听状态的网络连接

```bash
netstat -anlt | grep LISTEN
```

说明：

- `-a` 所有连接
- `-n` 数字显示地址端口
- `-l` 监听
- `-t` TCP

## 13. 拒绝发送 IGMP 数据包

```bash
iptables -A OUTPUT -p igmp -j DROP
```

> 要跨重启生效需保存防火墙规则。

## 14. 拒绝发送 TCP RST 数据包

```bash
iptables -A OUTPUT -p tcp --tcp-flags RST RST -j DROP
```

## 15. 调整 UDP 接收缓冲区最大值

```bash
sysctl -w net.core.rmem_max=17039360
```

## 16. 每秒统计 UDP 协议信息（watch）

```bash
watch -n 1 netstat -s udp
```