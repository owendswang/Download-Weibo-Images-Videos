**中文介绍：[README.zh.md](README.zh.md)**

# Download Weibo Images & Videos
A Tampermonkey script to download weibo images and videos.
- Only support new version weibo UI.
- Supported in Chinese and English.
- Support downloading live photos (only if add '.mov' to the download whitelist in Tampermonkey's advance setting)
- Support downloading images and videos
- Customize download files' name
- Support on 's.weibo.com'
- Display download progress and queue at the bottom left corner of the page
- Support packing all download files as a ZIP file
- Support downloading by Aria2c
- Support downloading images without watermarks

## Screenshot:
![1.jpg](res/1.JPG?raw=true)

## Download:
- Go to [Greasy Fork](https://greasyfork.org/scripts/430877).

Or
- Go to [Release Page](https://github.com/owendswang/Download-Weibo-Images-Videos/releases).

## Platform:
(Only listed those versions I tested. You could try it on other platforms by yourself.)
- **Tampermonkey** (tested on v4.18.1)
- Firefox (tested on v108.0.2 64-bit)
- Windows 7 SP1, Windows 10 22H2 (which I tested on)

## Usage:
Install from [Greasy Fork](https://greasyfork.org/scripts/430877).

Or Install manually:
1. Download the newest release ZIP file (from [here](https://github.com/owendswang/Download-Weibo-Images-Videos/releases)).
2. Open Tampermonkey. -> Switch to 'Utilities' tab. -> 'Zip' -> 'Import': Browse -> Choose the ZIP file -> 'Install'.

## Tutorial:
1. First time, this setting would show up. Choose any one you like. You can find the "Download Settings" button on the top left corner on the screen.\
   ![2.jpg](res/2.JPG?raw=true)
2. Add RPC host to XHR white list.\
   ![6.png](res/6.png?raw=true)
   ![7.png](res/7.png?raw=true)
