# 赛博斩杀线 - 小程序部署指南

## 项目结构

```
Kill-Line-Phone-Web/
├── miniprogram/           # 微信小程序代码
│   ├── app.js             # 小程序入口
│   ├── app.json           # 全局配置
│   ├── app.wxss           # 全局样式
│   ├── pages/
│   │   ├── index/         # 入口页（中转页）
│   │   │   ├── index.wxml
│   │   │   ├── index.wxss
│   │   │   ├── index.js
│   │   │   └── index.json
│   │   └── game/          # 游戏页（WebView）
│   │       ├── game.wxml
│   │       ├── game.wxss
│   │       ├── game.js
│   │       └── game.json
│   ├── sitemap.json
│   └── project.config.json
├── platform/              # H5 平台适配层
│   ├── index.ts           # 统一入口
│   ├── env.ts             # 环境检测
│   ├── share.ts           # 分享功能
│   ├── backButton.ts      # 返回按钮
│   └── message.ts         # 小程序通信
├── components/
│   └── BackToMiniProgram.tsx  # 返回小程序按钮组件
└── ...（原有 H5 项目文件）
```

## 部署步骤

### 第一步：配置 H5 部署地址

编辑 `miniprogram/app.js`，修改为你的 H5 部署地址：

```javascript
globalData: {
  h5Url: 'https://你的腾讯云域名.com'
}
```

### 第二步：部署 H5 项目

1. 确保 H5 项目已配置微信 JSSDK（如需要分享功能）
2. 构建 H5 项目：`npm run build`
3. 将构建产物部署到你的腾讯云服务器
4. 确保域名已备案且支持 HTTPS

### 第三步：配置微信小程序

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 注册/登录小程序账号
3. 进入「开发」→「开发管理」→「开发设置」
4. 添加服务器域名：
   - request 合法域名: `https://你的腾讯云域名.com`
   - uploadFile 合法域名: `https://你的腾讯云域名.com`
   - downloadFile 合法域名: `https://你的腾讯云域名.com`
   - socket 合法域名: `wss://你的腾讯云域名.com`

### 第四步：修改小程序 appid

编辑 `miniprogram/project.config.json`：

```json
{
  "appid": "wx你的小程序appid"
}
```

### 第五步：导入并测试小程序

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具
3. 选择「导入项目」
4. 选择 `miniprogram` 目录
5. 填入你的小程序 appid
6. 点击「导入」

### 第六步：真机测试

1. 在微信开发者工具中点击「预览」
2. 用手机微信扫描二维码
3. 测试以下功能：
   - 入口页显示是否正常
   - 点击「访问官网」是否正常跳转
   - 游戏是否加载正常
   - 返回按钮是否正常工作
   - 分享功能是否正常

### 第七步：提交审核

1. 点击「上传」按钮上传代码
2. 登录微信公众平台
3. 进入「版本管理」
4. 提交审核
5. 等待审核通过

## 配置微信 JSSDK（可选，用于分享）

如果你需要自定义分享内容，需要配置后端签名接口：

1. 编辑 `platform/share.ts` 中的 `fetchWxConfig` 函数
2. 实现后端接口 `/api/wx-config`，返回格式：

```json
{
  "appId": "wx你的appid",
  "timestamp": 1234567890,
  "nonceStr": "随机字符串",
  "signature": "生成的签名"
}
```

签名生成方法参考 [微信官方文档](https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#62)

## 重要配置项

### 小程序入口页 ICP 备案号

编辑 `miniprogram/pages/index/index.wxml` 第 35 行：

```xml
<text class="icp-text" bindtap="showPrivacy">京ICP备xxxxxxxx号-1X</text>
```

替换为你的实际备案号。

### 隐私政策和用户协议

编辑 `miniprogram/pages/index/index.js` 中的 `showPrivacy` 和 `showTerms` 函数，或替换为跳转到网页版隐私政策。

### 分享封面图

在 `miniprogram/images/share-cover.jpg` 放置 500x400 像素的分享封面图。

## 小程序与 H5 通信

### H5 向小程序发送消息

```typescript
import { saveProgress, clearProgress, requestShare } from './platform';

// 保存进度
saveProgress();

// 清除进度
clearProgress();

// 请求分享
requestShare('赛博斩杀线 - 我的生存记录');
```

### 小程序接收消息

已在 `miniprogram/pages/game/game.js` 中实现，支持的消息类型：
- `saveProgress`: 保存游戏进度标记
- `clearProgress`: 清除游戏进度
- `share`: 触发分享
- `navigateBack`: 返回上一页

## 注意事项

1. **域名备案**: H5 域名必须完成 ICP 备案
2. **HTTPS**: 必须使用 HTTPS 协议
3. **WebView 限制**: 小程序 WebView 不支持 `localStorage` 跨域访问，H5 的 `localStorage` 仍然可用但仅限当前域名
4. **返回按钮**: 小程序会自动注入 `wx.miniProgram` 对象，H5 通过它调用返回功能
5. **分享限制**: 分享必须通过用户主动触发（点击分享按钮），不能自动触发

## 常见问题

### Q: H5 在小程序中无法加载？
A: 检查服务器域名是否已添加到小程序后台的「request 合法域名」列表中。

### Q: 返回按钮不显示？
A: 检查 `isMiniProgram()` 检测逻辑，可能需要通过 URL 参数 `?from=miniprogram` 标识。

### Q: 分享功能不生效？
A: 需要在小程序后台配置「分享到朋友圈」权限，且用户必须主动触发分享。

### Q: 游戏进度无法保存？
A: H5 的 `localStorage` 在小程序 WebView 中正常工作，但清理小程序缓存时会一并清除。
