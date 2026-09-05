# 去哪遛 · 宠物交友社区 Web Demo

参考宠物日常记录与交友产品的功能方向，使用独立名称、视觉和文案制作的响应式交互演示。

## 本地运行

```sh
npm install
npm run dev
```

访问开发服务器输出的地址。构建命令为 `npm run build`，检查项目业务代码使用 `npx oxlint app`，类型检查使用 `npx tsc --noEmit`。

## 演示流程

1. 在社区切换推荐 / 同城 / 关注与内容分类，搜索动态。
2. 点开动态进行点赞、收藏、评论，或关注作者。
3. 发布日常，可选择本地 JPG / PNG / WebP 照片（小于 1 MB）。
4. 在附近页切换友好地图和宠友卡片，查看并收藏地点。
5. 查看宠友主页，进入模拟聊天，发送消息并发起约遛。
6. 在邀请卡片模拟对方接受或拒绝，或取消邀请。
7. 在我的页面编辑宠物资料、打卡、查看日记、自己的动态、收藏和邀请。

## 实现边界

这是前端演示。初始人物、地点、距离、天气和会话均为演示数据，不会发送消息或约遛通知给真实用户。示意地图没有真实定位或导航能力。

使用浏览器 localStorage 保存演示操作，键为 `qunaliu-demo-v1`。上传照片以 data URL 保存在当前浏览器。清除该站点的浏览器数据可重置演示。没有注册登录、跨设备数据同步、真实即时通讯、后台审核、AI 生图或推送服务。

对外展示的托管版本默认仅创建者可访问。若需要发给其他人，应另行配置并确认访问范围。

## 图片来源

照片未随项目下载或打包，由 Unsplash CDN 加载，遵循 Unsplash License。

- 柯基近景：Alvan Nee — https://unsplash.com/photos/a-happy-corgi-dog-looking-up-outdoors-qB3alM7r6_g
- 草地金毛：Zach Shup — https://unsplash.com/photos/golden-retriever-sitting-on-green-grass-R6SdnJnLJEg
- 猫咪肖像：Daniel Mačura — https://unsplash.com/photos/brown-tabby-cat-in-black-background-74TmvN2xMgU
- 公园柯基：Alvan Nee — https://unsplash.com/photos/a-corgi-dog-rests-on-green-grass-under-trees-PTgY6XY9ZNg

## 验证说明

运行类型检查、业务代码静态检查、部署构建和 HTTP 页面检查。未执行浏览器自动化点击测试。

生成器附带的组件目录存在已有 lint 报告；业务代码检查范围为 `app`，未修改第三方组件来消除这些既有报告。
