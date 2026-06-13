# 永久部署说明

当前临时分享链接来自 `localhost.run`，只适合预览，不适合长期使用。要获得永久网址，需要部署到云平台。

## 推荐方案：Render

1. 把这个项目上传到 GitHub。
2. 打开 Render，创建 New Web Service。
3. 选择这个 GitHub 仓库。
4. Render 会读取 `render.yaml` 和 `Dockerfile`。
5. 部署完成后会得到一个类似下面的永久地址：

```txt
https://haoxiao-couple-game-site.onrender.com
```

## Railway

1. 打开 Railway，创建 New Project。
2. 选择 Deploy from GitHub repo。
3. 选择这个仓库。
4. Railway 会读取 `railway.json` 和 `Dockerfile`。
5. 部署完成后在 Settings / Networking 里生成公网域名。

## 重要说明

- 当前版本使用内存房间状态，服务重启后房间会清空。
- 如果要真正长期运营，需要下一步接 PostgreSQL 保存用户、房间和对局记录。
- 免费托管平台可能会休眠，第一次打开可能慢几秒。
