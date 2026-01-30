# 项目云服务器部署指南

本指南详细介绍如何将 `city-survival-line` 项目部署到云服务器上，使其可以通过公网访问。

## 1. 云服务器准备

### 1.1 选择云服务器

推荐选择以下云服务提供商：
- 阿里云
- 腾讯云
- 华为云
- AWS
- Google Cloud

### 1.2 服务器配置建议

- **操作系统**：Ubuntu 20.04 LTS 或 CentOS 7+
- **CPU**：至少 1 核
- **内存**：至少 1GB
- **存储空间**：至少 20GB
- **带宽**：至少 1Mbps

### 1.3 服务器初始化

1. **登录服务器**：使用 SSH 登录服务器
   ```bash
   ssh root@your-server-ip
   ```

2. **更新系统**：
   - Ubuntu/Debian：
     ```bash
     apt update && apt upgrade -y
     ```
   - CentOS：
     ```bash
     yum update -y
     ```

3. **安装必要工具**：
   ```bash
   # Ubuntu/Debian
   apt install -y git curl wget unzip
   
   # CentOS
   yum install -y git curl wget unzip
   ```

## 2. 环境配置

### 2.1 安装 Node.js

推荐使用 Node.js 18.x 或更高版本：

```bash
# 使用 nvm 安装 Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

source ~/.bashrc

nvm install 18
nvm use 18

# 验证安装
node -v
npm -v
```

### 2.2 安装 Web 服务器

推荐使用 Nginx 作为 Web 服务器：

```bash
# Ubuntu/Debian
apt install -y nginx

# CentOS
yum install -y nginx

# 启动并设置开机自启
# Ubuntu/Debian
systemctl start nginx
systemctl enable nginx

# CentOS
systemctl start nginx
systemctl enable nginx
```

## 3. 项目部署

### 3.1 克隆项目代码

```bash
# 创建项目目录
mkdir -p /var/www/city-survival-line
cd /var/www/city-survival-line

# 克隆项目
git clone https://github.com/aaronchenhao/urban-survival.git .
```

### 3.2 安装依赖

```bash
# 安装项目依赖
npm install
```

### 3.3 构建项目

```bash
# 构建生产版本
npm run build
```

构建成功后，项目文件会生成在 `dist` 目录中。

### 3.4 配置 Nginx

创建 Nginx 配置文件：

```bash
# 创建配置文件
vi /etc/nginx/sites-available/city-survival-line
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为你的域名或服务器 IP
    
    root /var/www/city-survival-line/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

启用配置：

```bash
# 创建符号链接
ln -s /etc/nginx/sites-available/city-survival-line /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重新加载配置
systemctl reload nginx
```

### 3.5 配置防火墙

```bash
# Ubuntu/Debian
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# CentOS
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

## 4. 服务管理

### 4.1 查看服务状态

```bash
# 查看 Nginx 状态
systemctl status nginx

# 查看服务器网络状态
netstat -tuln
```

### 4.2 重启服务

```bash
# 重启 Nginx
systemctl restart nginx
```

### 4.3 项目更新

当项目代码更新时，执行以下步骤：

```bash
# 进入项目目录
cd /var/www/city-survival-line

# 拉取最新代码
git pull

# 安装依赖（如果有新依赖）
npm install

# 重新构建
npm run build

# 重启 Nginx
systemctl reload nginx
```

## 5. 域名配置（可选）

### 5.1 域名解析

1. 登录域名提供商后台
2. 添加 A 记录，将域名指向服务器 IP
3. 等待 DNS 解析生效（通常需要 10-30 分钟）

### 5.2 HTTPS 配置（推荐）

使用 Let's Encrypt 申请免费 SSL 证书：

```bash
# 安装 Certbot
# Ubuntu/Debian
apt install -y certbot python3-certbot-nginx

# CentOS
yum install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d your-domain.com

# 自动续期配置
certbot renew --dry-run
```

## 6. 安全设置

### 6.1 创建非 root 用户

```bash
# 创建用户
useradd -m deploy

# 设置密码
passwd deploy

# 授予 sudo 权限
usermod -aG sudo deploy
```

### 6.2 禁用 root 登录（可选）

```bash
# 编辑 SSH 配置
vi /etc/ssh/sshd_config

# 修改以下配置
PermitRootLogin no

# 重启 SSH 服务
systemctl restart sshd
```

### 6.3 配置 fail2ban（可选）

```bash
# 安装 fail2ban
# Ubuntu/Debian
apt install -y fail2ban

# CentOS
yum install -y epel-release
yum install -y fail2ban

# 启动服务
systemctl start fail2ban
systemctl enable fail2ban
```

## 7. 部署验证

### 7.1 访问验证

在浏览器中访问：
- 使用 IP 地址：`http://your-server-ip`
- 使用域名：`http://your-domain.com` 或 `https://your-domain.com`（如果配置了 HTTPS）

### 7.2 功能验证

1. 检查页面是否正常加载
2. 检查所有资源是否正确加载（无 404 错误）
3. 测试游戏功能是否正常
4. 检查背景图片是否显示
5. 检查音效是否正常

## 8. 常见问题排查

### 8.1 404 错误

- 检查 Nginx 配置中的根目录是否正确
- 检查 `dist` 目录是否存在且包含正确的文件
- 检查文件权限是否正确

### 8.2 502 错误

- 检查 Nginx 配置是否正确
- 检查服务器资源是否充足
- 查看 Nginx 错误日志：`tail -f /var/log/nginx/error.log`

### 8.3 资源加载失败

- 检查 `vite.config.ts` 中的 `base` 配置是否为 `'./'`
- 检查构建后的资源路径是否正确
- 检查服务器文件权限

## 9. 性能优化（可选）

### 9.1 启用 Gzip 压缩

在 Nginx 配置中添加：

```nginx
server {
    # 其他配置...
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_buffers 16 8k;
}
```

### 9.2 使用 CDN（可选）

对于静态资源，可以考虑使用 CDN 加速：
1. 将静态资源上传到 CDN
2. 修改构建配置，使用 CDN 地址

## 10. 监控与维护

### 10.1 日志监控

```bash
# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 10.2 定期维护

- 定期更新系统和依赖
- 定期备份项目文件和配置
- 监控服务器资源使用情况

## 11. 部署清单

- [ ] 云服务器已准备
- [ ] 环境已配置（Node.js、Nginx）
- [ ] 项目已克隆到服务器
- [ ] 依赖已安装
- [ ] 项目已构建
- [ ] Nginx 配置已完成
- [ ] 防火墙已配置
- [ ] 服务已启动
- [ ] 域名已配置（可选）
- [ ] HTTPS 已配置（可选）
- [ ] 安全设置已完成（可选）
- [ ] 部署验证已通过

## 12. 相关命令

### 常用 Nginx 命令

```bash
# 启动 Nginx
systemctl start nginx

# 停止 Nginx
systemctl stop nginx

# 重启 Nginx
systemctl restart nginx

# 重新加载配置
systemctl reload nginx

# 查看 Nginx 状态
systemctl status nginx
```

### 项目相关命令

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器
npm run dev

# 预览构建结果
npm run preview
```

## 13. 总结

本指南提供了将 `city-survival-line` 项目部署到云服务器的完整步骤，从服务器准备到部署验证。通过按照本指南操作，您可以成功将项目部署到云服务器，并通过公网访问。

如果在部署过程中遇到问题，请参考本指南中的「常见问题排查」部分，或咨询云服务提供商的技术支持。
