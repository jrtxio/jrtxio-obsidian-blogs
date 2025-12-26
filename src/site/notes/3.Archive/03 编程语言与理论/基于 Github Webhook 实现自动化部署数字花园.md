---
{"dg-publish":true,"dg-path":"03 编程语言与理论/基于 Github Webhook 实现自动化部署数字花园.md","permalink":"/03 编程语言与理论/基于 Github Webhook 实现自动化部署数字花园/"}
---

#Innolight #Lisp #Racket 

> 基于 Racket + Nginx 实现，替代 Vercel

## 系统概述

本教程提供**三种部署方案**，从简单到复杂，从测试到生产，根据你的需求选择。

### 方案对比

|方案|复杂度|HTTPS|安全性|适用场景|
|---|---|---|---|---|
|**方案一：直接 HTTP**|⭐ 简单|❌|⚠️ 低|测试、内网|
|**方案二：Nginx 代理**|⭐⭐ 中等|✅|✅ 高|单服务器生产|
|**方案三：分离部署**|⭐⭐⭐ 复杂|✅|✅ 最高|多服务器生产|

### 方案一：直接 HTTP 部署（最简单）

所有服务运行在一台服务器上，Racket 直接对外提供 HTTP 服务。

```
Obsidian (本地)
    ↓ Digital Garden 插件
GitHub 仓库
    ↓ Webhook (HTTP - 不加密)
Racket HTTP 服务 (0.0.0.0:8080)
    ↓ 拉取代码 + 构建
    ↓ 生成静态文件到本地
Nginx (80/443 或其他端口)
    ↓ 提供静态文件
博客网站
```

**优点**：

- ✅ 配置最简单
- ✅ 不需要 SSL 证书
- ✅ 不需要配置 Nginx 反向代理
- ✅ 快速测试和验证

**缺点**：

- ❌ 无 HTTPS 加密
- ❌ GitHub Webhook 必须禁用 SSL 验证
- ❌ 安全性较低

### 方案二：Nginx 反向代理（单服务器生产）

所有服务运行在一台服务器上，但使用 Nginx 提供 HTTPS。

```
Obsidian (本地)
    ↓ Digital Garden 插件
GitHub 仓库
    ↓ Webhook (HTTPS - 加密)
Nginx (8443 - HTTPS)
    ↓ SSL 终端 + 反向代理
Racket HTTP 服务 (127.0.0.1:8080)
    ↓ 拉取代码 + 构建
    ↓ 生成静态文件到本地
Nginx (80/443)
    ↓ 提供静态文件
博客网站
```

**优点**：

- ✅ HTTPS 加密传输
- ✅ 可启用 GitHub SSL 验证
- ✅ 安全性高
- ✅ 单服务器易于管理

**缺点**：

- ⚠️ 需要配置 Nginx
- ⚠️ 需要 SSL 证书
- ⚠️ 构建可能影响网站访问

### 方案三：分离式部署（多服务器生产）

构建服务器和 Web 服务器分离，构建完成后自动同步。

```
构建服务器：
Obsidian (本地)
    ↓ Digital Garden 插件
GitHub 仓库
    ↓ Webhook (HTTPS)
Nginx (8443 - HTTPS) 或 Racket (0.0.0.0:8080)
    ↓ SSL 终端 + 反向代理（可选）
Racket HTTP 服务
    ↓ 拉取代码 + 构建
    ↓ rsync 自动同步
    
Web 服务器：
    ↓ 接收同步的文件
Nginx (80/443)
    ↓ 提供静态文件
博客网站
```

**优点**：

- ✅ 构建和服务分离
- ✅ Web 服务器资源占用少
- ✅ 更好的安全性
- ✅ 易于扩展和维护

**缺点**：

- ⚠️ 需要两台服务器
- ⚠️ 需要配置 SSH 密钥
- ⚠️ 配置相对复杂

## 一、环境准备

### 1.1 服务器要求

#### 所有方案通用要求

- **操作系统**: Ubuntu 20.04+ / Debian 11+
- **存储**: 10GB+

#### 方案一（直接 HTTP）

- **服务器数量**: 1 台
- **内存**: 2GB+
- **端口**: 80/443（博客）, 8080（Webhook）

#### 方案二（Nginx 代理）

- **服务器数量**: 1 台
- **内存**: 2GB+
- **端口**: 80/443（博客）, 8443（Webhook HTTPS）

#### 方案三（分离部署）

- **构建服务器**: 2GB+，端口 8080 或 8443
- **Web 服务器**: 512MB+，端口 80/443

### 1.2 安装基础软件

#### 构建服务器（或方案一、二的单服务器）

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 安装必要工具
sudo apt install -y git curl wget vim

# 安装 Node.js (v22)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # v22.x
npm --version   # 10.x+

# 安装 Racket
sudo apt install -y racket

# 验证安装
racket --version  # 8.x+

# 安装 rsync（方案三需要）
sudo apt install -y rsync

# 安装 Nginx（方案二、三需要）
sudo apt install -y nginx
```

#### Web 服务器（仅方案三需要）

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 安装 Nginx 和 rsync
sudo apt install -y nginx rsync
```

## 二、部署 Racket Webhook 服务

### 2.1 克隆项目

```bash
# 创建目录
mkdir -p ~/racket-deployer
cd ~/racket-deployer

# 克隆项目
git clone https://github.com/yourusername/racket-deployer.git .
```

### 2.2 克隆博客仓库

```bash
# 创建目录
sudo mkdir -p /var/www/blog
sudo chown -R $USER:$USER /var/www/blog

# 克隆仓库
git clone https://github.com/你的用户名/你的仓库.git /var/www/blog

# 安装依赖
cd /var/www/blog
npm install

# 测试构建
npm run build

# 验证输出
ls -la /var/www/blog/dist
```

### 2.3 配置 Webhook

#### 生成 GitHub Secret

```bash
# 生成强密钥
openssl rand -hex 32
# 复制输出的密钥
```

#### 方案一：直接 HTTP 配置

```bash
cd ~/racket-deployer
cp config.example.json config.json
nano config.json
```

配置内容：

```json
{
  "github-secret": "粘贴刚才生成的密钥",
  "port": 8080,
  "listen-ip": "0.0.0.0",
  "repo-path": "/var/www/blog",
  "repo-url": "https://github.com/你的用户名/你的仓库.git",
  "build-output": "/var/www/blog/dist"
}
```

**关键配置**：

- `"listen-ip": "0.0.0.0"` - 监听所有网络接口，直接对外提供服务

#### 方案二：Nginx 代理配置

```bash
cd ~/racket-deployer
cp config.example.json config.json
nano config.json
```

配置内容：

```json
{
  "github-secret": "粘贴刚才生成的密钥",
  "port": 8080,
  "listen-ip": "127.0.0.1",
  "repo-path": "/var/www/blog",
  "repo-url": "https://github.com/你的用户名/你的仓库.git",
  "build-output": "/var/www/blog/dist"
}
```

**关键配置**：

- `"listen-ip": "127.0.0.1"` - 只监听本地，需要通过 Nginx 访问

#### 方案三：分离部署配置

```bash
cd ~/racket-deployer
cp config.example.json config.json
nano config.json
```

配置内容：

```json
{
  "github-secret": "粘贴刚才生成的密钥",
  "port": 8080,
  "listen-ip": "0.0.0.0",
  "repo-path": "/var/www/blog",
  "repo-url": "https://github.com/你的用户名/你的仓库.git",
  "build-output": "/var/www/blog/dist",
  "deploy": {
    "enabled": true,
    "remote-host": "root@你的Web服务器IP",
    "remote-path": "/var/www/blog/dist",
    "ssh-key": "/home/你的用户名/.ssh/id_rsa",
    "rsync-options": "-avz --delete"
  }
}
```

**关键配置**：

- `"listen-ip": "0.0.0.0"` 或 `"127.0.0.1"`（取决于是否使用 Nginx）
- `"deploy.enabled": true` - 启用远程部署
- 配置远程服务器信息

### 2.4 配置 SSH 密钥（仅方案三）

#### 在构建服务器上生成密钥

```bash
# 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""

# 查看公钥
cat ~/.ssh/id_rsa.pub
```

#### 在 Web 服务器上添加公钥

```bash
# SSH 登录到 Web 服务器
ssh root@你的Web服务器IP

# 添加公钥
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# 粘贴构建服务器的公钥，保存

chmod 600 ~/.ssh/authorized_keys
exit
```

#### 测试 SSH 连接

```bash
# 在构建服务器上测试
ssh -i ~/.ssh/id_rsa root@你的Web服务器IP "echo 'SSH connection successful'"
```

### 2.5 测试运行

```bash
cd ~/racket-deployer
racket main.rkt
```

#### 方案一输出示例：

```
✓ Config loaded from config.json

========================================
  Blog Deploy Webhook Server
========================================
Port: 8080
Listen: 0.0.0.0
Repo: /var/www/blog
========================================

Starting HTTP server on 0.0.0.0:8080...
Server accessible from: http://YOUR_SERVER_IP:8080
⚠ WARNING: Server is exposed to public network
⚠ GitHub webhook should use: http://YOUR_DOMAIN:8080/
⚠ SSL verification must be DISABLED (not secure)
```

#### 方案二输出示例：

```
✓ Config loaded from config.json

========================================
  Blog Deploy Webhook Server
========================================
Port: 8080
Listen: 127.0.0.1
Repo: /var/www/blog
========================================

Starting HTTP server on 127.0.0.1:8080...
Server accessible from: http://localhost:8080 (local only)
Use Nginx as reverse proxy for public HTTPS access
```

#### 方案三输出示例：

```
✓ Config loaded from config.json

========================================
  Blog Deploy Webhook Server
========================================
Port: 8080
Listen: 0.0.0.0
Repo: /var/www/blog
✓ Deploy: Enabled → root@47.101.152.163:/var/www/blog/dist
========================================

Starting HTTP server on 0.0.0.0:8080...
Server accessible from: http://YOUR_SERVER_IP:8080
```

#### 测试服务

另开终端测试：

```bash
# 方案一、三（0.0.0.0）
curl http://localhost:8080/
# 返回：Blog Deploy Webhook
#       Status: Running

# 方案二（127.0.0.1）
curl http://localhost:8080/
# 返回：Blog Deploy Webhook
#       Status: Running

# 健康检查
curl http://localhost:8080/health
# 返回：Status: idle
```

## 三、配置 Nginx

### 3.1 方案一：直接 HTTP（跳过此步骤）

方案一不需要配置 Webhook 的 Nginx，只需要配置博客站点的 Nginx（见 3.4）。

### 3.2 方案二：Nginx 反向代理（单服务器）

#### 配置 Webhook 代理

##### 如果可以使用 443 端口（已备案）

```bash
sudo nano /etc/nginx/sites-available/webhook
```

内容：

```nginx
# HTTP 重定向
server {
    listen 80;
    server_name webhook.你的域名.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Webhook
server {
    listen 443 ssl http2;
    server_name webhook.你的域名.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/webhook.你的域名.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webhook.你的域名.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 日志
    access_log /var/log/nginx/webhook-access.log;
    error_log /var/log/nginx/webhook-error.log;

    # 反向代理到 Racket
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

##### 如果不能使用 443 端口（未备案）

使用非标准端口 8443：

```bash
sudo nano /etc/nginx/sites-available/webhook
```

内容：

```nginx
# HTTPS Webhook (8443)
server {
    listen 8443 ssl http2;
    server_name webhook.你的域名.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/webhook.你的域名.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webhook.你的域名.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 日志
    access_log /var/log/nginx/webhook-access.log;
    error_log /var/log/nginx/webhook-error.log;

    # 反向代理到 Racket
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**开放防火墙 8443 端口**：

```bash
# 阿里云：在控制台安全组添加规则
# 或使用 ufw
sudo ufw allow 8443/tcp
```

#### 申请 SSL 证书

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot certonly --nginx -d webhook.你的域名.com
```

#### 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/webhook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3.3 方案三：分离部署 Nginx

构建服务器只需要配置 Webhook 代理（可选，也可以不用 Nginx 直接暴露），Web 服务器只需要配置博客站点。

#### 构建服务器（可选）

如果希望 Webhook 使用 HTTPS，参考方案二的 Nginx 配置。

如果不使用 Nginx，跳过此步骤，直接使用 `listen-ip: "0.0.0.0"`。

#### Web 服务器

只需要配置博客站点（见 3.4）。

**创建目标目录**：

```bash
# 在 Web 服务器上执行
sudo mkdir -p /var/www/blog/dist
sudo chown -R www-data:www-data /var/www/blog
```

### 3.4 配置博客站点 Nginx（所有方案）

#### 方案一、二：在单服务器上配置

```bash
sudo nano /etc/nginx/sites-available/blog
```

#### 方案三：在 Web 服务器上配置

```bash
# 登录 Web 服务器
ssh root@你的Web服务器IP

sudo nano /etc/nginx/sites-available/blog
```

#### 配置内容

##### 有 443 端口的配置：

```nginx
# HTTP 重定向
server {
    listen 80;
    server_name 你的域名.com www.你的域名.com;
    return 301 https://你的域名.com$request_uri;
}

# HTTPS 博客站点
server {
    listen 443 ssl http2;
    server_name 你的域名.com www.你的域名.com;
    
    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/你的域名.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/你的域名.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # 网站根目录
    root /var/www/blog/dist;
    index index.html;
    charset utf-8;
    
    # 日志
    access_log /var/log/nginx/blog-access.log;
    error_log /var/log/nginx/blog-error.log;
    
    # 路由配置（SPA 支持）
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript
               image/svg+xml;
}
```

##### 没有 443 端口的配置：

```nginx
# HTTP 博客站点（80 端口）
server {
    listen 80;
    server_name 你的域名.com;
    
    root /var/www/blog/dist;
    index index.html;
    charset utf-8;
    
    access_log /var/log/nginx/blog-access.log;
    error_log /var/log/nginx/blog-error.log;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript
               image/svg+xml;
}
```

#### 启用配置

```bash
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

#### 申请博客 SSL 证书（如果使用 HTTPS）

```bash
sudo certbot certonly --nginx -d 你的域名.com -d www.你的域名.com
```

## 四、配置 GitHub Webhook

### 4.1 设置 Webhook

1. 进入仓库 **Settings** → **Webhooks** → **Add webhook**
2. 根据你的方案配置：

#### 方案一：直接 HTTP

- **Payload URL**: `http://你的服务器IP:8080/`
- **Content type**: `application/json`
- **Secret**: 填写 `config.json` 中的 `github-secret`
- **SSL verification**: ❌ **Disable SSL verification**
- **Events**: Just the `push` event

**注意**：必须禁用 SSL 验证！

#### 方案二：Nginx 代理（443 端口）

- **Payload URL**: `https://webhook.你的域名.com/`
- **Content type**: `application/json`
- **Secret**: 填写 `config.json` 中的 `github-secret`
- **SSL verification**: ✅ **Enable SSL verification**
- **Events**: Just the `push` event

#### 方案二：Nginx 代理（8443 端口）

- **Payload URL**: `https://webhook.你的域名.com:8443/`
- **Content type**: `application/json`
- **Secret**: 填写 `config.json` 中的 `github-secret`
- **SSL verification**: ✅ **Enable SSL verification**
- **Events**: Just the `push` event

#### 方案三：分离部署

根据构建服务器是否使用 Nginx：

**使用 Nginx**：同方案二  
**不使用 Nginx**：同方案一

3. **Add webhook**

### 4.2 测试

#### 方案一、二测试

```bash
# 查看 Racket 日志
sudo journalctl -u blog-deploy -f

# 在 Obsidian 中推送一篇文章
# 应该看到：
# === Webhook received ===
# ✓ Signature verified
# === Building site ===
# ✓ Build completed

# 访问博客查看更新
curl https://你的域名.com  # 或 http://你的域名.com
```

#### 方案三测试

```bash
# 构建服务器 - 查看 Racket 日志
sudo journalctl -u blog-deploy -f

# 应该看到：
# === Webhook received ===
# ✓ Signature verified
# === Building site ===
# ✓ Build completed
# === Deploying to remote ===
# ✓ Deploy completed

# Web 服务器 - 检查文件
ssh root@Web服务器IP "ls -lt /var/www/blog/dist/ | head"
```

## 五、配置 systemd 服务

### 5.1 创建服务文件

```bash
sudo nano /etc/systemd/system/blog-deploy.service
```

内容：

```ini
[Unit]
Description=Blog Deploy Webhook Server
After=network.target

[Service]
Type=simple
User=你的用户名
Group=你的用户名
WorkingDirectory=/home/你的用户名/racket-deployer
Environment="PATH=/usr/bin:/bin:/usr/local/bin"
ExecStart=/usr/bin/racket /home/你的用户名/racket-deployer/main.rkt
Restart=always
RestartSec=10
StandardOutput=append:/var/log/blog-deploy.log
StandardError=append:/var/log/blog-deploy-error.log

[Install]
WantedBy=multi-user.target
```

### 5.2 启动服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable blog-deploy
sudo systemctl start blog-deploy
sudo systemctl status blog-deploy
```

### 5.3 查看日志

```bash
# 实时日志
sudo journalctl -u blog-deploy -f

# 最近 50 条
sudo journalctl -u blog-deploy -n 50

# 或查看日志文件
sudo tail -f /var/log/blog-deploy.log
```

## 六、完整工作流程

### 6.1 日常使用（所有方案）

1. **Obsidian 编辑** → 添加 `dg-publish: true`
2. **Digital Garden 推送** → GitHub
3. **GitHub Webhook** → Racket 服务
4. **自动构建** → `git pull` + `npm run build`
5. **（方案三）自动同步** → rsync 到 Web 服务器
6. **访问博客** → 查看更新

### 6.2 故障排查

#### Webhook 未触发

```bash
# 检查服务状态
sudo systemctl status blog-deploy

# 查看日志
sudo journalctl -u blog-deploy -n 50

# 测试本地服务
curl http://localhost:8080/

# 方案一、三（0.0.0.0）- 测试外部访问
curl http://你的服务器IP:8080/

# 方案二 - 测试 Nginx 代理
curl https://webhook.你的域名.com:8443/
```

#### 构建失败

```bash
# 手动构建测试
cd /var/www/blog
npm run build

# 检查资源
free -h
df -h

# 查看 Node.js 版本
node --version
npm --version
```

#### 网站未更新

```bash
# 检查 dist 目录
ls -lt /var/www/blog/dist/ | head

# 手动拉取代码
cd /var/www/blog
git pull

# 清除浏览器缓存
# 按 Ctrl+Shift+R 强制刷新
```

#### 远程部署失败（仅方案三）

```bash
# 测试 SSH 连接
ssh -i ~/.ssh/id_rsa root@Web服务器IP "echo 'Test OK'"

# 手动测试 rsync
rsync -avz --delete -e 'ssh -i ~/.ssh/id_rsa' \
  /var/www/blog/dist/ \
  root@Web服务器IP:/var/www/blog/dist

# 检查 SSH 密钥权限
ls -la ~/.ssh/id_rsa
# 应该是 -rw------- (600)

# 修正权限
chmod 600 ~/.ssh/id_rsa
```

## 七、方案对比总结

### 架构对比

#### 方案一：直接 HTTP

```
┌────────────────────────────────────────┐
│          单台服务器 (All-in-One)        │
│                                        │
│  GitHub → Racket (0.0.0.0:8080)        │
│              ↓                         │
│  构建 → /var/www/blog/dist/            │
│              ↓                         │
│  Nginx (80/443) → 访客                 │
└────────────────────────────────────────┘
```

**评分**：

- 复杂度: ⭐
- 安全性: ⭐⭐
- 可扩展性: ⭐⭐
- 推荐场景: 测试、内网

#### 方案二：Nginx 代理

```
┌────────────────────────────────────────┐
│          单台服务器 (Secure)            │
│                                        │
│  GitHub → Nginx (8443 HTTPS)           │
│              ↓                         │
│  Racket (127.0.0.1:8080)               │
│              ↓                         │
│  构建 → /var/www/blog/dist/            │
│              ↓                         │
│  Nginx (80/443) → 访客                 │
└────────────────────────────────────────┘
```

**评分**：

- 复杂度: ⭐⭐
- 安全性: ⭐⭐⭐⭐
- 可扩展性: ⭐⭐⭐
- 推荐场景: 单服务器生产

#### 方案三：分离部署

```
┌─────────────────────────┐      ┌─────────────────────────┐
│   构建服务器 (Build)     │      │   Web 服务器 (Serve)     │
│                         │      │                         │
│  GitHub → Racket        │      │                         │
│       ↓                 │      │                         │
│  构建 dist/             │      │                         │
│       ↓                 │ rsync│                         │
│  ─────────────────────────────→│  /var/www/blog/dist/   │
│                         │      │       ↓                 │
│                         │      │  Nginx (80/443)         │
└─────────────────────────┘      └─────────────────────────┘
```

**评分**：

- 复杂度: ⭐⭐⭐
- 安全性: ⭐⭐⭐⭐⭐
- 可扩展性: ⭐⭐⭐⭐⭐
- 推荐场景: 多服务器生产

### 配置对比表

|配置项|方案一|方案二|方案三|
|---|---|---|---|
|`listen-ip`|`0.0.0.0`|`127.0.0.1`|`0.0.0.0` 或 `127.0.0.1`|
|Nginx Webhook|❌|✅|✅（可选）|
|Nginx Blog|✅|✅|✅（Web 服务器）|
|SSL 证书|仅博客|Webhook + 博客|根据配置|
|SSH 密钥|❌|❌|✅|
|`deploy.enabled`|`false`|`false`|`true`|
|GitHub SSL 验证|❌ 禁用|✅ 启用|根据配置|
|服务器数量|1|1|2+|

## 八、常用命令

### Webhook 服务

```bash
sudo systemctl start blog-deploy      # 启动
sudo systemctl stop blog-deploy       # 停止
sudo systemctl restart blog-deploy    # 重启
sudo systemctl status blog-deploy     # 状态
sudo journalctl -u blog-deploy -f     # 实时日志
```

### Nginx

```bash
sudo nginx -t                         # 测试配置
sudo systemctl reload nginx           # 重载配置
sudo systemctl restart nginx          # 重启
sudo systemctl status nginx           # 状态
```

### 手动构建

```bash
cd /var/www/blog
git pull
npm install  # 如果需要
npm run build
```

### 手动同步（方案三）

```bash
rsync -avz --delete -e 'ssh -i ~/.ssh/id_rsa' \
  /var/www/blog/dist/ \
  root@Web服务器IP:/var/www/blog/dist
```

### 证书续期

```bash
# 自动续期（certbot 会自动配置 cron）
sudo certbot renew --dry-run  # 测试
```

## 九、安全建议

### 所有方案通用

1. **保护密钥**：

```bash
# 确保 config.json 不被提交
echo "config.json" >> .gitignore

# 使用强密钥
openssl rand -hex 32
```

2. **防火墙配置**：

#### 方案一

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS（如果有）
sudo ufw allow 8080/tcp # Webhook
sudo ufw enable
```

#### 方案二

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS（如果有）
sudo ufw allow 8443/tcp # Webhook HTTPS
sudo ufw enable
# 不要开放 8080（Racket 只监听本地）
```

#### 方案三（构建服务器）

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 8080/tcp # Webhook（如果不用 Nginx）
# 或
sudo ufw allow 8443/tcp # Webhook HTTPS（如果用 Nginx）
sudo ufw enable
```

#### 方案三（Web 服务器）

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 方案三额外安全

3. **SSH 密钥安全**：

```bash
# 正确的权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
chmod 600 ~/.ssh/authorized_keys
```

4. **限制 Racket 监听**：

- 方案二配置中已经设置为 `127.0.0.1`，不会暴露到公网

## 十、方案选择指南

### 如何选择合适的方案？

#### 选择方案一（直接 HTTP）的情况：

- ✅ 只是测试或学习
- ✅ 内网环境使用
- ✅ 快速验证想法
- ✅ 不在意安全性
- ✅ 没有域名或 SSL 证书

#### 选择方案二（Nginx 代理）的情况：

- ✅ 生产环境使用
- ✅ 只有一台服务器
- ✅ 需要 HTTPS 安全
- ✅ 有域名和 SSL 证书
- ✅ 流量不大

#### 选择方案三（分离部署）的情况：

- ✅ 生产环境使用
- ✅ 有多台服务器
- ✅ 需要最高安全性
- ✅ 构建和服务分离
- ✅ 需要扩展性
- ✅ 流量较大

### 推荐路径

**新手学习**：

1. 先用方案一测试 → 2. 再升级到方案二 → 3. 最后迁移到方案三

**直接生产**：

- 单服务器：选择方案二
- 多服务器：选择方案三

## 结语

本教程提供了从简单到复杂的三种部署方案：

- **方案一** - 快速上手，适合测试
- **方案二** - 安全可靠，适合单服务器生产
- **方案三** - 专业架构，适合多服务器生产

核心优势：

- ✅ 灵活的部署选项
- ✅ 完全自动化
- ✅ 易于维护
- ✅ 安全可控

选择适合你的方案，享受自动化博客部署的便利！🎉