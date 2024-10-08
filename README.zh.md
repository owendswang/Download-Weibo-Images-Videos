English Version: [README.md](README.md)

# 下载微博图片和视频
用于从微博网站上下载图片和视频的Tampermonkey脚本。
- 仅支持新版微博页面
- 支持中英双语
- 支持下载live photo（前提是必须在Tampermonkey的高级设置中，将“mov”后缀添加到下载白名单里）
- 支持下载图片和视频
- 自定义下载文件名称
- 支持搜索页面“s.weibo.com”
- 页面右下角显示下载进度和队列
- 支持打包下载
- 支持使用Aria2c下载
- 支持下载无水印图片

## 页面截图：
![1.jpg](res/1.JPG?raw=true)

## 下载:
- 前往[Greasy Fork](https://greasyfork.org/scripts/430877)。
- 或前往[发布页面](https://github.com/owendswang/Download-Weibo-Images-Videos/releases)。

## 使用平台：
（仅列出了我测试并使用的平台版本。）
- **Tampermonkey** (测试于v4.18.1)
- Firefox (测试于v108.0.2 64-bit)
- Windows 7 SP1，Windows 10 22H2 (我测试用的版本)

## 使用方法:
从[Greasy Fork](https://greasyfork.org/scripts/430877)直接安装。

或手动安装：
1. 下载最新的ZIP包 (从[这里](https://github.com/owendswang/Download-Weibo-Images-Videos/releases)下载).
2. 打开Tampermonkey -> 切换至'实用工具'选项卡. -> 选择'压缩包' -> '导入': 浏览 -> 选择刚下载的ZIP文件 -> 选择'安装'。

## 使用教程:
1. 首次打开时，会弹出设置窗口，以后可以点击页面左上角的“下载设置”按钮打开设置；\
   ![2.jpg](res/2.JPG?raw=true)
3. 将RPC地址添加到XHR白名单方法：\
   ![6.png](res/6.png?raw=true)
   ![7.png](res/7.png?raw=true)
   
