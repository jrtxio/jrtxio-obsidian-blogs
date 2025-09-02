---
{"dg-publish":true,"dg-path":"车载技术/中间件开发中的 Linux 高级命令.md","permalink":"/车载技术/中间件开发中的 Linux 高级命令/","created":"2023-12-13T16:10:03.000+08:00","updated":"2024-11-13T16:30:51.065+08:00"}
---

#Technomous #Linux 

1. 将挂载点为 `/app` 的设备内容复制到 `/opt/update/app.img`。

```
mount | grep -w /app | awk '{print $1}'| xargs -n1 -I dev dd if=dev of=/opt/update/app.img
```

- `mout | grep -w /app`：首先利用 `mount` 列出当前系统中的挂载信息，然后通过 `grep -w /app` 过滤出挂载点为 `/app` 的设备信息。
- `awk '{print $1}'`：通过 `awk` 命令取得前一个命令输出的结果的第一个字段，即设备的路径。
- `xargs -n1 -I dev`：使用 `xargs`命令，`-n1`表示每次传递一个参数，`-I dev`表示将参数替换为`dev`。这样可以将前一个命令得到的设备路径作为参数传递给后续的命令。
- `dd if=dev of=/opt/update/app.img`：最后使用 `dd` 命令进行复制操作。`if=dev`指定输入文件为之前提取的设备路径，`of=/opt/update/app.img` 指定输出文件为 `/opt/update/app.img`。这一步的目的是将挂载点为 `/app` 的设备内容复制到指定的镜像文件。

2. 使用 `df` 命令查看挂载在 `/app` 目录下的文件系统信息，并通过 `grep` 过滤出包含 `/app` 的行。

```
df /app | grep -w "/app"
```
 
- `df /app`：使用 `df` 命令查看挂载在 `/app` 目录下的文件系统信息。这将显示 `/app` 所在的文件系统的使用情况，包括磁盘空间、使用量等。
- `grep -w "/app"`：通过 `grep` 命令过滤包含 `/app` 的行。`-w` 选项表示只匹配整个单词，以确保只匹配到 `/app` 而不是类似于 `/appdata` 的字符串。

3. 查找已挂载到 `/app` 目录的 `ext4` 文件系统信息。

```
mount | grep "on /app type ext4"
```

- `mount`：列出当前系统中的挂载信息。
- `grep "on /app type ext4"`：通过 `grep` 过滤包含 "on /app type ext4" 的行，即筛选出已经挂载到 `/app` 目录的 `ext4` 文件系统的信息。

4. 查找 /app 目录挂载的 ext4 文件系统信息。

```
cat /etc/mtab | grep "/app ext4"
```

- `cat /etc/mtab`：`/etc/mtab` 是一个包含当前已挂载文件系统信息的文件。`cat` 命令用于将其内容显示在终端上。
- `grep "/app ext4"`：通过 `grep` 过滤包含 "/app ext4" 的行，即筛选出与 `/app` 目录挂载到 ext4 文件系统的信息。

5. 列出当前进程中与 /app 相关的挂载信息。

```
cat /proc/self/mounts | grep /app
```

- `cat /proc/self/mounts`：`/proc/self/mounts` 是一个特殊的文件，包含了当前进程的挂载信息。`cat` 命令用于显示将其内容显示在终端上。
- `grep /app`：通过 `grep` 过滤包含 "/app" 的行，即筛选出与 `/app` 相关的挂载信息。

6. 将 `/app` 文件系统重新挂载为可写模式。

```
mount -o remount,rw /app
```

- `mount`：是用于挂载文件系统的命令。
- `-o remount,rw`：通过 `-o` 选项指定挂载选项，`remount` 表示重新挂载，`rw` 表示可读写（read-write）模式。
- `/app` 是指定的文件系统，这里表示 `/app` 目录。

> [!WARNING]
> `df` 主要关注文件系统的磁盘空间使用情况。
> `mount` 提供了有关有关文件系统挂载点的详细信息，包含文件系统类型、挂载点和其他选项。
> `/etc/mtab` 文件是一个记录已挂载文件系统信息的静态文件，`cat /etc/mtab` 会显示其中的内容。在某些系统上，`/etc/mtab` 可能是一个符号链接，指向 `/proc/self/mounts`，它是一个虚拟文件，提供了一个与 `cat /etc/mtab` 相似的信息。

7. 终止与 `/app` 相关的进程。

```
ps -ef | grep /app | grep -v grep | awk '{print $2}' | xargs -n1 -I {} sudo kill -9 {}
```

- `ps -ef`：列出系统上所有进程的详细信息。
- `grep /app`：通过 `grep` 过滤包含 `/app` 的行，筛选出于 `/app` 相关的进程。
- `grep -v grep`：通过 `grep -v grep` 排除掉 grep 自身的进程，以确保只匹配到实际与 `/app` 相关的进程。
- `awk '{print $2}`：通过 `awk` 取得进程列表中的第二行，即进程 ID。
- `xargs -n1 -I {}`：使用 `xargs` 将进程 ID 传递给后续的命令，`-n1` 表示每次传递一个参数，`-I {}` 表示将参数替换为 `{}`。
- `sudo kill -9 {}` 使用 `sudo kill -9` 命令终止指定进程 ID 的进程。

8. 显示指定进程打开的文件列表。

```
lsof -p PID
```

- `lsof`：是一个用于列出打开文件的工具，它显示当前系统上进程所打开的文件、目录和网络连接等信息。
- `-p PID`：通过 `-p` 选项指定要列出文件信息的进程 ID（PID）。

9. 关闭正在使用 `/app` 目录的任何进程。

```
fuser -ck /app
```

- `fuser`：是用于查找和向用户显示指定文件或目录的进程的命令。
- `-ck`：这两个选项的组合的含义如下：
	- `-c`：以进程 ID 的形式显示结果。
	- `-k`：向相关的进程发送信号以关闭它们。
- `/app`：是指定的文件或目录，这里表示 `/app` 目录。

10. 列出带有 FOTA 字符串的进程的优先级、进程 ID 和进程名。

```
ps ax -o nice,pid,comm | grep FOTA
```

- `ps ax`：使用 `ps` 命令显示系统上所有进程的信息。
	- `-o nice,pid,comm`：通过 `-o` 选项指定输出的列，即显示优先级（nice 值）、进程 ID（pid）和进程名（comm）。
- `grep FOTA`：通过 `grep` 过滤出包含 "FOTA" 字符串的行，即筛选出带有 "FOTA" 字符串的进程。

11. 在 systemd 系统上禁用 motionwise 服务的自启动。

```
systemctl disable motionwise
```

- `systemctl`：用于检查和控制系统服务的命令。
- `disable`：表示禁用一个服务，即阻止它在系统启动时自启动。
- `motionwise`：需要禁用的服务的名称。

12. 筛选处于监听状态的网络连接。

```
netstat -anlt ｜grep LISTEN
```

- `netstat`：是一个用于显示网络连接、路由表和接口等信息的命令。
- `-anlt`：是 netstat 命令的一组选项：
	- `-a`：显示所有连接和监听中的套接字。
	- `-n`：以数字形式显示地址和端口。
	- `-l`：仅显示监听中的套接字。
	- `-t`：仅显示 TCP 连接。
- `l`：是管道符，将 `netstat` 的输出传递给下一个命令。
- `grep LISTEN`：通过 `grep` 命令过滤出包含 "LISTEN" 的行，即筛选处于监听状态的连接。

13. 拒绝发送的 IGMP 协议数据包。

```
iptables -A OUTPUT -p igmp -j DROP
```

- `iptables`：是一个用于配置 Linux 内核防火墙的工具。
- `-A OUTPUT`：表示将规则添加到 OUTPUT 链，即出站数据流。
- `-p igmp`：指定协议类型为 IGMP。
- `-j DROP`：表示对匹配的数据包执行 DROP 操作，即拒绝该数据包。

> [!WARNING]
> 如果要确保规则在系统重启后仍然生效，你可能需要将规则保存到防火墙配置中。

14. 拒绝发送的 TCP RST 数据包。

```
iptables -A OUTPUT -p tcp --tcp-flags RST RST -j DROP
```

- `iptables`：是一个用于配置 Linux 内核防火墙规则的工具。
- `-A OUTPUT`：表示将规则添加到 OUTPUT 链，即出站数据流。
- `-p tcp`：指定协议类型为 TCP。
- `--tcp-flags RST RST`：用于匹配 TCP 标志中的 RST（复位）标志。
- `-j DROP`：表示对匹配的数据包执行 DROP 操作，即拒绝该数据包。

15. 通过 `sysctl` 修改内核套接字接收缓冲区的最大大小。

```
sysctl -w net.core.rmem_max=17039360
```

- `sysctl`：是用于在运行时动态地修改内核参数的命令。
- `-w`：表示写入操作，用于设置指定内核参数的值。
- `net.core.rmem_max=17039360`：是指要修改的内核参数和设置的值。在这里，`net.core.rmem_max`是控制套接字接收缓冲区最大大小的内核参数，而 `17039360` 是将其设置的值，表示字节的数量。

16. 每隔一秒显示一次系统中关于 UDP 协议的统计信息。

```
watch -n 1 netstat -s udp
```

- `watch -n 1`：`watch` 命令用于周期性地运行一个命令并显示结果。`-n 1` 表示每隔一秒刷新一次。
- `netstat -s udp`：`netstat` 是一个用于显示网络连接、路由表和接口等信息的命令。`-s udp` 选项表示显示有关 UDP 协议的统计信息。