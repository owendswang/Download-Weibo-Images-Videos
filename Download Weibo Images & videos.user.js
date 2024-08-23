// ==UserScript==
// @name         Download Weibo Images & Videos (Only support new version weibo UI)
// @name:zh-CN   下载微博图片和视频（仅支持新版界面）
// @version      1.3.0
// @description  Download images and videos from new version weibo UI webpage.
// @description:zh-CN 从新版微博界面下载图片和视频。
// @author       OWENDSWANG
// @match        https://weibo.com/*
// @match        https://www.weibo.com/*
// @match        https://s.weibo.com/weibo*
// @match        https://s.weibo.com/realtime*
// @match        https://s.weibo.com/video*
// @exclude      https://weibo.com/tv/*
// @exclude      https://www.weibo.com/tv/*
// @exclude      https://weibo.com/p/*
// @exclude      https://www.weibo.com/p/*
// @icon         https://weibo.com/favicon.ico
// @license      MIT
// @homepage     https://greasyfork.org/scripts/430877
// @supportURL   https://github.com/owendswang/Download-Weibo-Images-Videos
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      weibo.com
// @connect      www.weibo.com
// @connect      sinaimg.cn
// @connect      weibocdn.com
// @connect      localhost
// @namespace    http://tampermonkey.net/
// @run-at       document-end
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js
// @downloadURL https://update.greasyfork.org/scripts/430877/Download%20Weibo%20Images%20%20Videos%20%28Only%20support%20new%20version%20weibo%20UI%29.user.js
// @updateURL https://update.greasyfork.org/scripts/430877/Download%20Weibo%20Images%20%20Videos%20%28Only%20support%20new%20version%20weibo%20UI%29.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const settingVersion = 1;

    let text = [];
    let text_zh = [
/*0*/   '添加下载按钮',
/*1*/   '欢迎使用“下载微博图片”脚本',
/*2*/   '请选择添加下载按钮的方式：',
/*3*/   '点击“添加下载按钮”来添加下载按钮。',
/*4*/   '当鼠标位于浏览器页面时添加下载按钮，但这种方式会占用很多CPU资源。',
/*5*/   '确定',
/*6*/   '下载设置',
/*7*/   '下载文件名称',
/*8*/   '{original} - 原文件名\n{username} - 原博主名称\n{userid} - 原博主ID\n{mblogid} - 原博mblogid\n{uid} - 原博uid\n{ext} - 文件后缀\n{index} - 图片序号\n{YYYY} {MM} {DD} {HH} {mm} {ss} - 原博发布时\n间的年份、月份、日期、小时、分钟、秒，可\n分开独立使用\n{content} - 博文内容（最多前25个字符）',
/*9*/   '下载队列',
/*10*/  '重试',
/*11*/  '关闭',
/*12*/  '取消',
/*13*/  '打包下载',
/*14*/  '打包文件名',
/*15*/  '与“下载文件名称”规则相同，但{original}、{ext}、{index}除外',
/*16*/  '单独设置转发微博下载文件名称',
/*17*/  '转发微博下载文件名称',
/*18*/  '除“下载文件名”规则外，额外标签如下：\n{re.mblogid} - 转博mblogid\n{re.username} - 转发博主名称\n{re.userid} - 转发博主ID\n{re.uid} - 转博uid\n{re.content} - 转发博文内容（最多前25个字符）\n{re.YYYY} {re.MM} {re.DD} {re.HH} {re.mm} {re.ss}\n - 原博发布时间的年份、月份、日期、小时、\n分钟、秒，可分开独立使用',
/*19*/  '转发微博打包文件名',
/*20*/  '与“转发微博下载文件名称”规则相同，但{original}、{ext}、{index}除外',
/*21*/  '使用Aria2c远程下载',
/*22*/  'RPC接口地址',
/*23*/  '使用此方式下载，无法使用打包功能，无法在页面右下角显示下载进度和结果。',
/*24*/  '如果接口地址不是localhost，需手动将地址添加到XHR白名单。',
/*25*/  '设置',
/*26*/  '<b>注意</b>：',
/*27*/  '启用“打包下载”时，需区分多文件名称，\n避免重复而导致打包后只有一个文件，文件命\n名时，必须包含{original}、{index}中至少一个\n标签。',
/*28*/  '下载视频封面',
/*29*/  '下载无水印图片',
/*30*/  '图片质量会下降',
    ];
    let text_en = [
/*0*/   'Add Download Buttons',
/*1*/   'Welcome Using \'Download Weibo Images\' Script',
/*2*/   'Which way do you like to add download buttons to each weibo post?',
/*3*/   'Click \'Add Download Buttons\' button to add download buttons.',
/*4*/   'When mouse over browser page, add download buttons automatically. But it takes a lot of CPU usage.',
/*5*/   'OK',
/*6*/   'Download Setting',
/*7*/   'Download File Name',
/*8*/   '{original} - Original file name\n{username} - Original user name\n{userid} - Original user ID\n{mblogid} - Original mblogid\n{uid} - Original uid\n{ext} - File extention\n{index} - Image index\n{YYYY} {MM} {DD} {HH} {mm} {ss} - "Year", \n"Month", "Date", "Hour", "Minute", "Second" \nof the created time of the original post\n{content} - Original post content (limited to \nfirst 25 characters)',
/*9*/   'Download Queue',
/*10*/  'Retry',
/*11*/  'Close',
/*12*/  'Cancel',
/*13*/  'Pack download files as a ZIP file',
/*14*/  'ZIP File Name',
/*15*/  'The same rules as "Download File Name" except {original}, {ext} and {index}',
/*16*/  'Different File Name for Retweets',
/*17*/  'Retweet Download File Name',
/*18*/  'Except the rules for "Download File Name", there are additional tags as below.\n{re.mblogid} - Retweet mblogid\n{re.username} - Retweet user name\n{re.userid} - Retweet user ID\n{re.uid} - Retweet uid\n{re.content} - Retweet post content (limited to first 25 characters)\n{re.YYYY} {re.MM} {re.DD} {re.HH} {re.mm} {re.ss} - "Year", "Month", "Date", "Hour", "Minute", "Second" of the created time of the retweet post',
/*19*/  'Retweet Zip File Name',
/*20*/  'The same rules as "Retweet Download File Name" except {original}, {ext} and {index}',
/*21*/  'Use Aria2c remote download API',
/*22*/  'RPC Url',
/*23*/  'In this mode, You would not be able to download in ZIP mode and to observe download progress and result.',
/*24*/  'If it\'s not \'localhost\', you would have to add it to \'XHR white list\'.',
/*25*/  'Settings',
/*26*/  '<b>Attention</b>: ',
/*27*/  'When \'ZIP mode\' enabled, you have \nto include one of the tags {original} or {index} \nto avoid duplicated ones being overwritten.',
/*28*/  'Download video cover image',
/*29*/  'Download Images without watermarks',
/*29*/  'Image quality is lower than those \nwith watermarks',
    ];
    if(navigator.language.substr(0, 2) == 'zh') {
        text = text_zh;
    } else {
        text = text_en;
    }

    let downloadQueueCard = document.createElement('div');
    downloadQueueCard.style.position = 'fixed';
    downloadQueueCard.style.bottom = '0.5rem';
    downloadQueueCard.style.left = '0.5rem';
    downloadQueueCard.style.maxHeight = '50vh';
    downloadQueueCard.style.overflowY = 'auto';
    downloadQueueCard.style.overflowX = 'hidden';
    let downloadQueueTitle = document.createElement('div');
    downloadQueueTitle.textContent = text[9];
    downloadQueueTitle.style.fontSize = '0.8rem';
    downloadQueueTitle.style.color = 'gray';
    downloadQueueTitle.style.display = 'none';
    downloadQueueCard.appendChild(downloadQueueTitle);
    document.body.appendChild(downloadQueueCard);
    let progressBar = document.createElement('div');
    progressBar.style.height = '1.4rem';
    progressBar.style.width = '23rem';
    // progressBar.style.background = 'linear-gradient(to right, red 100%, transparent 100%)';
    progressBar.style.borderStyle = 'solid';
    progressBar.style.borderWidth = '0.1rem';
    progressBar.style.borderColor = 'grey';
    progressBar.style.borderRadius = '0.5rem';
    progressBar.style.boxSizing = 'content-box';
    progressBar.style.marginTop = '0.5rem';
    progressBar.style.marginRight = '1rem';
    progressBar.style.position = 'relative';
    let progressText = document.createElement('div');
    // progressText.textContent = 'test.test';
    progressText.style.mixBlendMode = 'screen';
    progressText.style.width = '100%';
    progressText.style.textAlign = 'center';
    progressText.style.color = 'orange';
    progressText.style.fontSize = '0.7rem';
    progressText.style.lineHeight = '1.4rem';
    progressText.style.overflow = 'hidden';
    progressBar.appendChild(progressText);
    let progressCloseBtn = document.createElement('button');
    progressCloseBtn.style.border = 'unset';
    progressCloseBtn.style.background = 'unset';
    progressCloseBtn.style.color = 'orange';
    progressCloseBtn.style.position = 'absolute';
    progressCloseBtn.style.right = '0';
    progressCloseBtn.style.top = '0.1rem';
    progressCloseBtn.style.fontSize = '1rem';
    progressCloseBtn.style.lineHeight = '1rem';
    progressCloseBtn.style.cursor = 'pointer';
    progressCloseBtn.textContent = '×';
    progressCloseBtn.title = text[12];
    progressCloseBtn.onmouseover = function(e){
        this.style.color = 'red';
    }
    progressCloseBtn.onmouseout = function(e){
        this.style.color = 'orange';
    }
    progressBar.appendChild(progressCloseBtn);
    // downloadQueueCard.appendChild(progressBar);

    function saveAs(blob, name) {
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        const timeout = setTimeout(() => {
            URL.revokeObjectURL(link.href);
            link.parentNode.removeChild(link);
        }, 1000);
    }

    function send2Aria2c(url, fileName, headerFlag) {
        // console.log(downloadUrl);
        return new Promise(function(resolve, reject) {
            let header = [ 'User-Agent: ' + window.navigator.userAgent ];
            if (headerFlag) {
                header.push('Referer: https://' + location.host);
                header.push('Origin: https://' + location.host);
            }
            downloadQueueTitle.style.display = 'block';
            let progress = downloadQueueCard.appendChild(progressBar.cloneNode(true));
            progress.firstChild.textContent = fileName;
            GM_xmlhttpRequest({
                method: 'POST',
                url: GM_getValue('ariaRpcUrl','http://localhost:6800/jsonrpc'),
                data: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'weibo',
                    method: 'aria2.addUri',
                    params: [ [ url ], { header, out: fileName } ],
                }),
                headers: {"Content-Type": "application/json"},
                onload: function(response) {
                    // console.log(response.responseText);
                    progress.style.background = 'green';
                    const timeout = setTimeout(() => {
                        progress.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    }, 1000);
                    progress.lastChild.onclick = function(e) {
                        clearTimeout(timeout);
                        this.parentNode.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    }
                    resolve(response);
                },
                onabort: function(e) { resolve(null); },
                onerror: function(e) { downloadError(e, url, fileName, headerFlag, progress); resolve(null); },
                ontimeout: function(e) { downloadError(e, url, fileName, headerFlag, progress); resolve(null); },
            });
            // 下面这种原生的方法，因为安全原因，不被浏览器允许，属于跨域，且在https页面上请求http。
            /*let oReq = new XMLHttpRequest();
            oReq.open("POST", GM_getValue('ariaRpcUrl','http://localhost:6800/jsonrpc'));
            oReq.setRequestHeader('Content-Type', 'application/json')
            oReq.onload = (e) => {
                // console.log(response.responseText);
                progress.style.background = 'green';
                const timeout = setTimeout(() => {
                    progress.remove();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                }, 1000);
                progress.lastChild.onclick = function(e) {
                    clearTimeout(timeout);
                    this.parentNode.remove();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                }
                resolve(oReq.response);
            };
            oReq.onerror = (e) => { downloadError(e, url, fileName, headerFlag, progress); resolve(null); };
            oReq.onabort = (e) => { resolve(null); };
            oReq.ontimeout = (e) => { downloadError(e, url, fileName, headerFlag, progress); resolve(null); };
            oReq.send(JSON.stringify({
                jsonrpc: '2.0',
                id: 'weibo',
                method: 'aria2.addUri',
                params: [ [ url ], { header, out: fileName } ],
            }));
            progress.lastChild.onclick = function(e) {
                oReq.abort();
                this.parentNode.remove();
                if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
            };*/
        });
    }

    function httpRequest(url, method = 'GET', data = null) {
        return new Promise(function(resolve, reject) {
            let oReq = new XMLHttpRequest();
            oReq.open(method, url);
            oReq.responseType = 'json';
            oReq.onload = (e) => { resolve(oReq.response); };
            oReq.onerror = (e) => { resolve(null); };
            oReq.onabort = (e) => { resolve(null); };
            oReq.ontimeout = (e) => { resolve(null); };
            if(typeof(data) === 'string') {
                oReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                oReq.send(data);
            } else if(typeof(data) === 'object') {
                oReq.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                oReq.send(JSON.stringify(data));
            } else {
                oReq.send();
            }
        });
    }

    function gmHttpRequest(url, method = 'GET', data = null) {
        return new Promise(function(resolve, reject) {
            GM_xmlhttpRequest({
                method: 'GET',
                url,
                responseType: 'json',
                headers: {
                    'Referer': 'https://' + location.host,
                    'Origin': 'https://' + location.host
                },
                onload: ({ status, response }) => {
                    // console.log(response);
                    resolve(response)
                },
                onabort: function(e) { resolve(null); },
                onerror: function(e) { resolve(null); },
                ontimeout: function(e) { resolve(null); },
            });
        });
    }

    function downloadError(e, url, name, headerFlag, progress, zipMode = false, ariaMode = false) {
        // console.log(e, url);
        /*GM_notification({
            title: 'Download error',
            text: 'Error: ' + e.error + '\nUrl: ' + url,
            silent: true,
            timeout: 3,
        });*/
        progress.style.background = 'red';
        progress.firstChild.textContent = name + ' [' + (e.error || 'Unknown') + ']';
        progress.firstChild.style.color = 'yellow';
        progress.firstChild.style.mixBlendMode = 'unset';
        if (!zipMode) {
            let progressRetryBtn = document.createElement('button');
            progressRetryBtn.style.border = 'unset';
            progressRetryBtn.style.background = 'unset';
            progressRetryBtn.style.color = 'yellow';
            progressRetryBtn.style.position = 'absolute';
            progressRetryBtn.style.right = '1.2rem';
            progressRetryBtn.style.top = '0.05rem';
            progressRetryBtn.style.fontSize = '1rem';
            progressRetryBtn.style.lineHeight = '1rem';
            progressRetryBtn.style.cursor = 'pointer';
            progressRetryBtn.style.letterSpacing = '-0.2rem';
            progressRetryBtn.textContent = '⤤⤦';
            progressRetryBtn.title = text[10];
            progressRetryBtn.onmouseover = function(e){
                this.style.color = 'white';
            }
            progressRetryBtn.onmouseout = function(e){
                this.style.color = 'yellow';
            }
            progressRetryBtn.onclick = function(e) {
                this.parentNode.remove();
                if (ariaMode) {
                    send2Aria2c(url, name, headerFlag);
                } else {
                    downloadWrapper(url, name, headerFlag);
                }
            }
            progress.insertBefore(progressRetryBtn, progress.lastChild);
        }
        progress.lastChild.title = text[11];
        progress.lastChild.style.color = 'yellow';
        progress.lastChild.onmouseover = function(e){
            this.style.color = 'white';
        };
        progress.lastChild.onmouseout = function(e){
            this.style.color = 'yellow';
        };
        progress.lastChild.onclick = function(e) {
            this.parentNode.remove();
            if(progress.parent.childElementCount == 1) progress.parent.firstChild.style.display = 'none';
        };
        // setTimeout(() => { progress.remove(); if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none'; }, 1000);
    }

    function downloadWrapper(url, name, headerFlag = false, zipMode = false) {
        // console.log(url);
        downloadQueueTitle.style.display = 'block';
        let progress = downloadQueueCard.appendChild(progressBar.cloneNode(true));
        progress.firstChild.textContent = name + ' [0%]';
        if (zipMode) {
            return new Promise(function(resolve, reject) {
                const download = GM_xmlhttpRequest({
                    method: 'GET',
                    url,
                    responseType: 'blob',
                    headers: headerFlag ? {
                        'Referer': 'https://' + location.host,
                        'Origin': 'https://' + location.host
                    } : null,
                    onprogress: (e) => {
                        // e = { int done, finalUrl, bool lengthComputable, int loaded, int position, int readyState, response, str responseHeaders, responseText, responseXML, int status, statusText, int total, int totalSize }
                        const percent = e.done / e.total * 100;
                        progress.style.background = 'linear-gradient(to right, green ' + percent + '%, transparent ' + percent + '%)';
                        progress.firstChild.textContent = name + ' [' + percent.toFixed(0) + '%]';
                    },
                    onload: ({ status, response }) => {
                        const timeout = setTimeout(() => {
                            progress.remove();
                            if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                        }, 1000);
                        progress.lastChild.onclick = function(e) {
                            clearTimeout(timeout);
                            this.parentNode.remove();
                            if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                        };
                        resolve(response);
                    },
                    onabort: function(e) { resolve(null); },
                    onerror: function(e) { downloadError(e, url, name, headerFlag, progress); resolve(null); },
                    ontimeout: function(e) { downloadError(e, url, name, headerFlag, progress); resolve(null); },
                });
                progress.lastChild.onclick = function(e) {
                    download.abort();
                    this.parentNode.remove();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                };
                // 下面这种原生的方法，可以正常下载非V+的资源，遇到V+的资源会报错。
                /*let oReq = new XMLHttpRequest();
                oReq.open("GET", url);
                oReq.responseType = 'blob';
                oReq.onprogress = (e) => {
                    // console.log(e);
                    const percent = e.loaded / e.total * 100;
                    progress.style.background = 'linear-gradient(to right, green ' + percent + '%, transparent ' + percent + '%)';
                    progress.firstChild.textContent = name + ' [' + percent.toFixed(0) + '%]';
                };
                oReq.onload = (e) => {
                    const timeout = setTimeout(() => {
                        progress.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    }, 1000);
                    progress.lastChild.onclick = function(e) {
                        clearTimeout(timeout);
                        this.parentNode.remove();
                        oReq.abort();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    };
                    resolve(oReq.response);
                };
                oReq.onerror = (e) => { downloadError(e, url, name, headerFlag, progress); resolve(null); };
                oReq.onabort = (e) => { resolve(null); };
                oReq.ontimeout = (e) => { downloadError(e, url, name, headerFlag, progress); resolve(null); };
                oReq.send();
                progress.lastChild.onclick = function(e) {
                    this.parentNode.remove();
                    oReq.abort();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                };*/
            });
        } else {
            /*const download = GM_download({
                url,
                name,
                headers: headerFlag ? {
                    'Referer': 'https://' + location.host,
                    'Origin': 'https://' + location.host
                } : null,
                onprogress: (e) => {
                    // e = { int done, finalUrl, bool lengthComputable, int loaded, int position, int readyState, response, str responseHeaders, responseText, responseXML, int status, statusText, int total, int totalSize }
                    const percent = e.done / e.total * 100;
                    progress.style.background = 'linear-gradient(to right, green ' + percent + '%, transparent ' + percent + '%)';
                    progress.firstChild.textContent = name + ' [' + percent.toFixed(0) + '%]';
                },
                onload: ({ status, response }) => {
                    const timeout = setTimeout(() => {
                        progress.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    }, 1000);
                    progress.lastChild.onclick = function(e) {
                        clearTimeout(timeout);
                        this.parentNode.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    }
                },
                onerror: (e) => { downloadError(e, url, name, headerFlag, progress); },
                ontimeout: (e) => { downloadError(e, url, name, headerFlag, progress); },
            });
            progress.lastChild.onclick = function(e) {
                download.abort();
                this.parentNode.remove();
                if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
            };*/
            // 这个方法也可以，而且不是走GM_download，不会被油猴设置里的下载选项影响。
            const download = GM_xmlhttpRequest({
                method: 'GET',
                url,
                responseType: 'blob',
                headers: headerFlag ? {
                    'Referer': 'https://' + location.host,
                    'Origin': 'https://' + location.host
                } : null,
                onprogress: (e) => {
                    // e = { int done, finalUrl, bool lengthComputable, int loaded, int position, int readyState, response, str responseHeaders, responseText, responseXML, int status, statusText, int total, int totalSize }
                    const percent = e.done / e.total * 100;
                    progress.style.background = 'linear-gradient(to right, green ' + percent + '%, transparent ' + percent + '%)';
                    progress.firstChild.textContent = name + ' [' + percent.toFixed(0) + '%]';
                },
                onload: ({ status, response }) => {
                    const timeout = setTimeout(() => {
                        progress.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    }, 1000);
                    progress.lastChild.onclick = function(e) {
                        clearTimeout(timeout);
                        this.parentNode.remove();
                        if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    };
                    saveAs(response, name);
                },
            });
            progress.lastChild.onclick = function(e) {
                download.abort();
                this.parentNode.remove();
                if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
            };
            // 下面这种原生的方法，可以正常下载非V+的资源，遇到V+的资源会报错。
            /*let oReq = new XMLHttpRequest();
            oReq.open("GET", url);
            oReq.responseType = 'blob';
            oReq.onprogress = (e) => {
                // console.log(e);
                const percent = e.loaded / e.total * 100;
                progress.style.background = 'linear-gradient(to right, green ' + percent + '%, transparent ' + percent + '%)';
                progress.firstChild.textContent = name + ' [' + percent.toFixed(0) + '%]';
            };
            oReq.onload = (e) => {
                const timeout = setTimeout(() => {
                    progress.remove();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                }, 1000);
                progress.lastChild.onclick = function(e) {
                    clearTimeout(timeout);
                    this.parentNode.remove();
                    oReq.abort();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                };
                saveAs(oReq.response, name);
            };
            oReq.onerror = (e) => { downloadError(e, url, name, headerFlag, progress); };
            oReq.ontimeout = (e) => { downloadError(e, url, name, headerFlag, progress); };
            oReq.send();
            progress.lastChild.onclick = function(e) {
                this.parentNode.remove();
                oReq.abort();
                if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
            };*/
            // 下面fetch的方法，感觉不是很好写，所以就不用下面的方法。
            /*(async function () {
                let controller = new AbortController();
                const response = await fetch(url, { signal: controller.signal });
                progress.lastChild.onclick = function(e) {
                    controller.abort();
                    this.parentNode.remove();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                }
                const contentLength = response.headers.get('content-length');
                const total = parseInt(contentLength, 10);
                let loaded = 0;
                const reader = response.body.getReader();
                const res = new Response(new ReadableStream({
                    async start(controller) {
                        while(true) {
                            const { done, value } = await reader.read();
                            if (value) loaded += value.length;
                            const percent = loaded / total * 100;
                            progress.style.background = 'linear-gradient(to right, green ' + percent + '%, transparent ' + percent + '%)';
                            progress.firstChild.textContent = name + ' [' + percent.toFixed(0) + '%]';
                            if (done) {
                                break;
                                controller.close();
                            }
                        }
                    }
                }));
                const blob = await res.blob();
                const link = document.createElement("a");
                link.style.display = "none";
                link.href = URL.createObjectURL(blob);
                link.download = name;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                progress.style.background = 'green';
                const timeout = setTimeout(() => {
                    progress.remove();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                    URL.revokeObjectURL(link.href);
                    link.parentNode.removeChild(link);
                }, 1000);
                progress.lastChild.onclick = function(e) {
                    clearTimeout(timeout);
                    this.parentNode.remove();
                    URL.revokeObjectURL(link.href);
                    link.parentNode.removeChild(link);
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                }
            })();*/
        }
    }

    function getName(nameSetting, originalName, ext, userName, userId, postId, postUid, index, postTime, content, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetContent) {
        let setName = nameSetting;
        setName = setName.replace('{ext}', ext);
        setName = setName.replace('{original}', originalName);
        setName = setName.replace('{username}', userName);
        setName = setName.replace('{userid}', userId);
        setName = setName.replace('{mblogid}', postId);
        setName = setName.replace('{uid}', postUid);
        setName = setName.replace('{index}', index);
        setName = setName.replace('{content}', content.substring(0, 25));
        let YYYY, MM, DD, HH, mm, ss;
        const postAt = new Date(postTime);
        if (postTime) {
            YYYY = postAt.getFullYear().toString();
            MM = (postAt.getMonth() + 1).toString().padStart(2, '0');
            DD = postAt.getDate().toString().padStart(2, '0');
            HH = postAt.getHours().toString().padStart(2, '0');
            mm = postAt.getMinutes().toString().padStart(2, '0');
            ss = postAt.getSeconds().toString().padStart(2, '0');
        }
        setName = setName.replace('{YYYY}', YYYY);
        setName = setName.replace('{MM}', MM);
        setName = setName.replace('{DD}', DD);
        setName = setName.replace('{HH}', HH);
        setName = setName.replace('{mm}', mm);
        setName = setName.replace('{ss}', ss);
        if (retweetPostId && GM_getValue('retweetMode', false)) {
            setName = setName.replace('{re.mblogid}', retweetPostId);
            setName = setName.replace('{re.username}', retweetUserName);
            setName = setName.replace('{re.userid}', retweetUserId);
            setName = setName.replace('{re.uid}', retweetPostUid);
            setName = setName.replace('{re.content}', retweetContent.substring(0, 25));
            let reYYYY, reMM, reDD, reHH, remm, ress;
            const retweetPostAt = new Date(retweetPostTime);
            if (retweetPostTime) {
                reYYYY = retweetPostAt.getFullYear().toString();
                reMM = (retweetPostAt.getMonth() + 1).toString().padStart(2, '0');
                reDD = retweetPostAt.getDate().toString().padStart(2, '0');
                reHH = retweetPostAt.getHours().toString().padStart(2, '0');
                remm = retweetPostAt.getMinutes().toString().padStart(2, '0');
                ress = retweetPostAt.getSeconds().toString().padStart(2, '0');
            }
            setName = setName.replace('{re.YYYY}', reYYYY);
            setName = setName.replace('{re.MM}', reMM);
            setName = setName.replace('{re.DD}', reDD);
            setName = setName.replace('{re.HH}', reHH);
            setName = setName.replace('{re.mm}', remm);
            setName = setName.replace('{re.ss}', ress);
        }
        return setName.replace(/[<|>|*|"|\/|\|:|?|\n]/g, '_');
    }

    function handleDownloadList(downloadList, packName) {
        if (GM_getValue('ariaMode', false)) {
            for (const item of downloadList) {
                send2Aria2c(item.url, item.name, item.headerFlag);
            }
        } else if (GM_getValue('zipMode', false)) {
            let zip = new JSZip();
            // console.log('zip', zip);
            let promises = downloadList.map(async function(ele, idx) {
                return await downloadWrapper(ele.url, ele.name, ele.headerFlag, true).then(function(data) {
                    // console.log(ele, idx, 'data', data);
                    const currDate = new Date();
                    const dateWithOffset = new Date(currDate.getTime() - currDate.getTimezoneOffset() * 60000);
                    if (data) zip.file(downloadList[idx].name, data, { date: dateWithOffset });
                });
            });
            // console.log('promises', promises);
            Promise.all(promises).then(async function(responseList) {
                // console.log('responseList', responseList);
                // console.log('zip', zip);
                // console.log('generateAsync', zip.generateAsync());
                const content = await zip.generateAsync({ type: 'blob', streamFiles: true }/*, function({ percent, currentFile }) { console.log(percent); }*/);
                // console.log('content', content);
                if (zip.files && Object.keys(zip.files).length > 0) saveAs(content, packName);
            });
        } else {
            for (const item of downloadList) {
                downloadWrapper(item.url, item.name, item.headerFlag);
            }
        }
    }

    async function handleVideo(mediaInfo, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText) {
        const newList = [];
        let largeVidUrl = mediaInfo.playback_list ? mediaInfo.playback_list[0].play_info.url : ( mediaInfo.mp4_hd_url || mediaInfo.stream_url_hd || mediaInfo.stream_url );
        if(mediaInfo.hasOwnProperty('h5_url') && mediaInfo.h5_url) {
            const urlObj = new URL(mediaInfo.h5_url); // e.g. 'https://video.weibo.com/show?fid=1034:4924511439749139'
            const fid = urlObj.searchParams.get('fid');
            let url = 'https://' + location.host + '/tv/api/component?page=/tv/show/' + fid; // e.g. 'https://weibo.com/tv/api/component?page=/tv/show/1034:4924511439749139'
            let data = 'data={"Component_Play_Playinfo":{"oid":"' + fid + '"}}'; // e.g. 'data={"Component_Play_Playinfo":{"oid":"1034:4924511439749139"}}'
            let tvRes = await httpRequest(url, 'POST', data);
            // console.log(tvRes);
            if(tvRes && tvRes.data && tvRes.data.Component_Play_Playinfo && tvRes.data.Component_Play_Playinfo.urls && Object.keys(tvRes.data.Component_Play_Playinfo.urls).length > 0) {
                largeVidUrl = tvRes.data.Component_Play_Playinfo.urls[Object.keys(tvRes.data.Component_Play_Playinfo.urls)[0]];
                if(largeVidUrl.startsWith('//')) {
                    largeVidUrl = 'http:' + largeVidUrl;
                }
            }
        }
        // console.log(largeVidUrl);
        let vidName = largeVidUrl.split('?')[0];
        vidName = vidName.split('/')[vidName.split('/').length - 1].split('?')[0];
        let originalName = vidName.split('.')[0];
        let ext = vidName.split('.')[1];
        const setName = getName((GM_getValue('retweetMode', false) && retweetPostId) ? GM_getValue('retweetFileName', '{original}.{ext}') : GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText);
        newList.push({ url: largeVidUrl, name: setName, headerFlag: true });
        if(mediaInfo.hasOwnProperty('pic_info')) {
            let picUrl = mediaInfo.pic_info.pic_big.url;
            let largePicUrl = picUrl.replace('/orj480/', GM_getValue('rmWtrMrk', false) ? '/oslarge/' : '/large/');
            let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
            let originalName = picName.split('.')[0];
            let ext = picName.split('.')[1];
            const setName = getName((GM_getValue('retweetMode', false) && retweetPostId) ? GM_getValue('retweetFileName', '{original}.{ext}') : GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText);
            newList.push({url: largePicUrl, name: setName, headerFlag: true });
        }
        return newList;
    }

    function handlePic(pic, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText) {
        let newList = [];
        let picUrl = pic.largest?.url || pic.pic_big?.url;
        let picSize = picUrl.split('/')[3];
        let largePicUrl = picUrl.replace('/' + picSize + '/', GM_getValue('rmWtrMrk', false) ? '/oslarge/' : '/large/');
        let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
        let originalName = picName.split('.')[0];
        let ext = picName.split('.')[1];
        const setName = getName((GM_getValue('retweetMode', false) && retweetPostId) ? GM_getValue('retweetFileName', '{original}.{ext}') : GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText);
        newList.push({ url: largePicUrl, name: setName, headerFlag: true });
        if(pic.hasOwnProperty('video')) {
            let videoUrl = pic.video;
            let videoName = videoUrl.split('%2F')[videoUrl.split('%2F').length - 1].split('?')[0];
            videoName = videoName.split('/')[videoName.split('/').length - 1].split('?')[0];
            if (!videoName.includes('.')) videoName = videoUrl.split('/')[videoUrl.split('/').length - 1].split('?')[0];
            // console.log(videoUrl, videoName);
            let originalName = videoName.split('.')[0];
            let ext = videoName.split('.')[1];
            const setName = getName((GM_getValue('retweetMode', false) && retweetPostId) ? GM_getValue('retweetFileName', '{original}.{ext}') : GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText);
            newList.push({ url: videoUrl, name: setName, headerFlag: true });
        }
        return newList;
    }

    function addDlBtn(footer) {
        // console.log('add download button');
        let dlBtnDiv = document.createElement('div');
        dlBtnDiv.className = 'woo-box-item-flex toolbar_item_1ky_D toolbar_cursor_34j5V';
        let divInDiv = document.createElement('div');
        divInDiv.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_like_20yPI toolbar_likebox_1rLfZ toolbar_wrap_np6Ug';
        let dlBtn = document.createElement('button');
        dlBtn.className = 'woo-like-main toolbar_btn_Cg9tz download-button';
        dlBtn.setAttribute('tabindex', '0');
        dlBtn.setAttribute('title', '下载');
        // dlBtn.innerHTML = '<span class="woo-like-iconWrap"><svg class="woo-like-icon"><use xlink:href="#woo_svg_download"></use></svg></span><span class="woo-like-count">下载</span>';
        dlBtn.innerHTML = '<span class="woo-like-iconWrap"><i class="woo-font woo-font--imgSave woo-like-icon"></i></span><span class="woo-like-count">下载</span>';
        dlBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            const article = this.closest('article.woo-panel-main');
            if(article) {
                // let contentRow = article.getElementsByClassName('content_row_-r5Tk')[0];
                const header = article.getElementsByTagName('header')[0];
                const postLink = header.getElementsByClassName('head-info_time_6sFQg')[0];
                let postId = postLink.href.split('/')[postLink.href.split('/').length - 1];
                const resJson = await httpRequest('https://' + location.host + '/ajax/statuses/show?id=' + postId);
                // console.log(resJson);
                let status = resJson;
                let retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText;
                if(resJson.hasOwnProperty('retweeted_status')) {
                    status = resJson.retweeted_status;
                    retweetPostId = resJson.mblogid;
                    retweetUserName = resJson.user.screen_name;
                    retweetUserId = resJson.user.idstr;
                    retweetPostUid = resJson.idstr;
                    retweetPostTime = resJson.created_at;
                    retweetText = resJson.text_raw;
                }
                postId = status.mblogid;
                const picInfos = status.pic_infos;
                const mixMediaInfo = status.mix_media_info;
                const userName = status.user.screen_name;
                const userId = status.user.idstr;
                const postUid = status.idstr;
                const postTime = status.created_at;
                const text = status.text_raw;
                let downloadList = [];
                if(footer.parentElement.getElementsByTagName('video').length > 0) {
                    // console.log('download video');
                    if(resJson.page_info?.media_info) {
                        downloadList = downloadList.concat(await handleVideo(resJson.page_info.media_info, 1, userName, userId, postId, postUid, 1, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                    }
                    if(resJson.page_info?.pic_info && GM_getValue('dlVidCov', true)) {
                        downloadList = downloadList.concat(handlePic(resJson.page_info.pic_info, 1, userName, userId, postId, postUid, 1, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                    }
                }
                if (picInfos) {
                    // console.log('download images');
                    let index = 0;
                    let padLength = Object.entries(picInfos).length.toString().length;
                    for (const [id, pic] of Object.entries(picInfos)) {
                        index += 1;
                        downloadList = downloadList.concat(handlePic(pic, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                    }
                }
                if (mixMediaInfo && mixMediaInfo.items) {
                    // console.log('mix media');
                    let index = 0;
                    let padLength = Object.entries(mixMediaInfo.items).length.toString().length;
                    for (const [id, media] of Object.entries(mixMediaInfo.items)) {
                        index += 1;
                        if(media.type === 'video') {
                            downloadList = downloadList.concat(await handleVideo(media.data.media_info, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                            if (GM_getValue('dlVidCov', true)) {
                                downloadList = downloadList.concat(handlePic(media.data.pic_info, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                            }
                        } else if (media.type === 'pic') {
                            downloadList = downloadList.concat(handlePic(media.data, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                        }
                    }
                }
                const packName = getName((GM_getValue('retweetMode', false) && retweetPostId) ? GM_getValue('retweetPackFileName', '{mblogid}.zip') : GM_getValue('packFileName', '{mblogid}.zip'), '{original}', '{ext}', userName, userId, postId, postUid, '{index}', postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText);
                handleDownloadList(downloadList, packName);
            }
        });
        divInDiv.appendChild(dlBtn);
        dlBtnDiv.appendChild(divInDiv);
        footer.firstChild.firstChild.firstChild.appendChild(dlBtnDiv);
        // console.log('added download button');
    }

    function addSingleDlBtn(img, idx = 0) {
        // console.log(img);
        const imgCtn = img.parentElement;
        const dlBtn = document.createElement('div');
        dlBtn.style.position = 'absolute';
        dlBtn.style.bottom = '0';
        dlBtn.style.left = '0';
        dlBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        dlBtn.style.padding = '0.3rem';
        dlBtn.style.borderRadius = '0 8px';
        dlBtn.style.width = '1rem';
        dlBtn.style.height = '1rem';
        dlBtn.style.cursor = 'pointer';
        dlBtn.style.zIndex = '11';
        dlBtn.innerHTML = '<i class="woo-font woo-font--imgSave"></i>';
        dlBtn.addEventListener('mouseenter', (event) => { dlBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; });
        dlBtn.addEventListener('mouseleave', (event) => { dlBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'; });
        dlBtn.addEventListener('click', async function(event) {
            event.stopPropagation();
            const article = this.closest('article.woo-panel-main');
            if(article) {
                // let contentRow = article.getElementsByClassName('content_row_-r5Tk')[0];
                const header = article.getElementsByTagName('header')[0];
                const postLink = header.getElementsByClassName('head-info_time_6sFQg')[0];
                let postId = postLink.href.split('/')[postLink.href.split('/').length - 1];
                const resJson = await httpRequest('https://' + location.host + '/ajax/statuses/show?id=' + postId);
                // console.log(resJson);
                let status = resJson;
                let retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText;
                if(resJson.hasOwnProperty('retweeted_status')) {
                    status = resJson.retweeted_status;
                    retweetPostId = resJson.mblogid;
                    retweetUserName = resJson.user.screen_name;
                    retweetUserId = resJson.user.idstr;
                    retweetPostUid = resJson.idstr;
                    retweetPostTime = resJson.created_at;
                    retweetText = resJson.text_raw;
                }
                postId = status.mblogid;
                const picInfos = status.pic_infos;
                const mixMediaInfo = status.mix_media_info;
                const userName = status.user.screen_name;
                const userId = status.user.idstr;
                const postUid = status.idstr;
                const postTime = status.created_at;
                const text = status.text_raw;
                let downloadList = [];
                if (picInfos) {
                    // console.log('download images');
                    let padLength = Object.entries(picInfos).length.toString().length;
                    // console.log(idx, picInfos);
                    const pic = Object.entries(picInfos)[idx][1];
                    downloadList = downloadList.concat(handlePic(pic, padLength, userName, userId, postId, postUid, idx + 1, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                }
                if (mixMediaInfo && mixMediaInfo.items) {
                    // console.log('mix media');
                    // console.log(mixMediaInfo.items);
                    let padLength = Object.entries(mixMediaInfo.items).length.toString().length;
                    const media = Object.entries(mixMediaInfo.items)[idx][1];
                    if(media.type === 'video') {
                        downloadList = downloadList.concat(await handleVideo(media.data.media_info, padLength, userName, userId, postId, postUid, idx + 1, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                        if(GM_getValue('dlVidCov', true)) {
                            downloadList = downloadList.concat(handlePic(media.data.pic_info, padLength, userName, userId, postId, postUid, idx + 1, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                        }
                    } else if (media.type === 'pic') {
                        downloadList = downloadList.concat(handlePic(media.data, padLength, userName, userId, postId, postUid, idx + 1, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                    }
                }
                const packName = getName((GM_getValue('retweetMode', false) && retweetPostId) ? GM_getValue('retweetPackFileName', '{mblogid}.zip') : GM_getValue('packFileName', '{mblogid}.zip'), '{original}', '{ext}', userName, userId, postId, postUid, '{index}', postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText);
                handleDownloadList(downloadList, packName);
            }
        });
        imgCtn.appendChild(dlBtn);
    }

    function sAddDlBtn(footer) {
        // console.log('add download button on search');
        const lis = footer.getElementsByTagName('li');
        for (const li of lis) {
            li.style.width = '25%';
        }
        let dlBtnLi = document.createElement('li');
        dlBtnLi.style.width = '25%';
        let aInLi = document.createElement('a');
        aInLi.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter';
        aInLi.setAttribute('title', '下载');
        aInLi.setAttribute('href', 'javascript:void(0);');
        let dlBtn = document.createElement('button');
        dlBtn.className = 'woo-like-main toolbar_btn download-button';
        dlBtn.innerHTML = '<span class="woo-like-iconWrap"><svg class="woo-like-icon"><use xlink:href="#woo_svg_download"></use></svg></span><span class="woo-like-count">下载</span>';
        aInLi.addEventListener('click', function(event) { event.preventDefault(); });
        dlBtn.addEventListener('click', async function(event) {
            // console.log('download');
            event.preventDefault();
            const cardWrap = this.closest('div.card-wrap');
            // console.log(cardWrap);
            const mid = cardWrap.getAttribute('mid');
            // console.log(mid);
            if(mid) {
                // console.log('https://' + location.host + '/ajax/statuses/show?id=' + mid);
                const resJson = await gmHttpRequest('https://weibo.com/ajax/statuses/show?id=' + mid);
                // console.log(resJson);
                let status = resJson;
                let retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText;
                if(resJson.hasOwnProperty('retweeted_status')) {
                    status = resJson.retweeted_status;
                    retweetPostId = resJson.mblogid;
                    retweetUserName = resJson.user.screen_name;
                    retweetUserId = resJson.user.idstr;
                    retweetPostUid = resJson.idstr;
                    retweetPostTime = resJson.created_at;
                    retweetText = resJson.text_raw;
                }
                const postId = status.mblogid;
                const picInfos = status.pic_infos;
                const mixMediaInfo = status.mix_media_info;
                const userName = status.user.screen_name;
                const userId = status.user.idstr;
                const postUid = status.idstr;
                const postTime = status.created_at;
                const text = status.text_raw;
                let downloadList = [];
                if(footer.parentElement.getElementsByTagName('video').length > 0) {
                    // console.log('download video');
                    if(resJson.page_info?.media_info) {
                        downloadList = downloadList.concat(await handleVideo(resJson.page_info.media_info, 1, userName, userId, postId, postUid, 1, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                    }
                    if(resJson.page_info?.pic_info && GM_getValue('dlVidCov', true)) {
                        downloadList = downloadList.concat(handlePic(resJson.page_info.pic_info, 1, userName, userId, postId, postUid, 1, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                    }
                }
                if (picInfos) {
                    // console.log('download images');
                    let index = 0;
                    let padLength = Object.entries(picInfos).length.toString().length;
                    for (const [id, pic] of Object.entries(picInfos)) {
                        index += 1;
                        downloadList = downloadList.concat(handlePic(pic, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                    }
                }
                if (mixMediaInfo && mixMediaInfo.items) {
                    // console.log('mix media');
                    let index = 0;
                    let padLength = Object.entries(mixMediaInfo.items).length.toString().length;
                    for (const [id, media] of Object.entries(mixMediaInfo.items)) {
                        index += 1;
                        if(media.type === 'video') {
                            downloadList = downloadList.concat(await handleVideo(media.data.media_info, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                            if(GM_getValue('dlVidCov', true)) {
                                downloadList = downloadList.concat(handlePic(media.data.pic_info, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                            }
                        } else if (media.type === 'pic') {
                            downloadList = downloadList.concat(handlePic(media.data, padLength, userName, userId, postId, postUid, index, postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText));
                        }
                    }
                }
                const packName = getName((GM_getValue('retweetMode', false) && retweetPostId) ? GM_getValue('retweetPackFileName', '{mblogid}.zip') : GM_getValue('packFileName', '{mblogid}.zip'), '{original}', '{ext}', userName, userId, postId, postUid, '{index}', postTime, text, retweetPostId, retweetUserName, retweetUserId, retweetPostUid, retweetPostTime, retweetText);
                handleDownloadList(downloadList, packName);
            }
        });
        aInLi.appendChild(dlBtn);
        dlBtnLi.appendChild(dlBtn);
        footer.firstChild.appendChild(dlBtnLi);
        // console.log('added download button');
    }
/*
    function bodyMouseOver(event) {
        if (location.host == 'weibo.com' || location.host == 'www.weibo.com') {
            // let arts = document.getElementsByTagName('article');
            const footers = document.getElementsByTagName('footer');
            for (const footer of footers) {
                if(footer.getElementsByClassName('download-button').length > 0) {
                    // console.log('already added download button');
                } else {
                    // console.log(footer.parentElement);
                    if(footer.parentElement.tagName.toLowerCase() == 'article') {
                        const article = footer.parentElement;
                        const imgs = article.getElementsByTagName('img');
                        let added = false;
                        // console.log(imgs);
                        if(imgs.length > 0) {
                            let addFlag = false;
                            for (const img of imgs) {
                                if(['woo-picture-img', 'picture_focusImg_1z5In', 'picture-viewer_pic_37YQ3'].includes(img.className)) {
                                    addFlag = true;
                                }
                            }
                            if(addFlag == true) {
                                addDlBtn(footer);
                                added = true;
                            }
                        }
                        let videos = article.getElementsByTagName('video');
                        if(videos.length > 0 && added == false) {
                            addDlBtn(footer);
                        }
                    }
                }
            }
        }
        if (location.host == 's.weibo.com') {
            // let cards = document.querySelectorAll('#pl_feedlist_index .card-wrap');
            const footers = document.querySelectorAll('#pl_feedlist_index .card-act');
            for (const footer of footers) {
                if(footer.getElementsByClassName('download-button').length > 0) {
                    // console.log('already added download button');
                } else {
                    // console.log(footer.parentElement);
                    if(footer.parentElement.className == 'card' && footer.parentElement.parentElement.className == 'card-wrap') {
                        const card = footer.parentElement;
                        let added = false;
                        const media_prev = card.querySelector('div[node-type="feed_list_media_prev"]');
                        // console.log(media_prev);
                        if (media_prev) {
                            const imgs = media_prev.getElementsByTagName('img');
                            // console.log(imgs);
                            if(imgs.length > 0) {
                                sAddDlBtn(footer);
                                added = true;
                            }
                            const videos = card.getElementsByTagName('video');
                            if(videos.length > 0 && added == false) {
                                sAddDlBtn(footer);
                            }
                        }
                    }
                }
            }
        }
    }
*/
    function handleCard(card) {
        // console.log(card);
        const footer = card.querySelectorAll('footer')[1] || card.querySelector('footer');
        const imgs = card.querySelectorAll('img.woo-picture-img,img.picture_focusImg_1z5In,img.picture-viewer_pic_37YQ3,video.picture-viewer_pic_37YQ3');
        // console.log(imgs);
        if (footer) {
            if (footer.getElementsByClassName('download-button').length > 0) {
                // console.log('already added download button');
            } else {
                // console.log(footer.parentElement);
                let added = false;
                if (imgs.length > 0) {
                    addDlBtn(footer);
                    added = true;
                    if (imgs.length > 1) {
                        for (const [ idx, img ] of Object.entries(imgs)) {
                            if (img.parentElement.getElementsByClassName('download-single-button').length === 0) {
                                if (img.className.includes('picture-viewer_pic_37YQ3')) {
                                    const previews = card.querySelectorAll('div.picture-viewer_preview_2wOSq');
                                    for (const [ index, preview ] of Object.entries(previews)) {
                                        if (preview.className.includes('picture-viewer_cur_anUEY')) {
                                            addSingleDlBtn(img, parseInt(index));
                                        }
                                    }
                                } else {
                                    addSingleDlBtn(img, parseInt(idx));
                                }
                            }
                        }
                    }
                }
                let videos = card.getElementsByTagName('video');
                if(videos.length > 0 && added == false) {
                    addDlBtn(footer);
                }
            }
        }
    }
/*
    let startButton = document.createElement('button');
    startButton.textContent = text[0];
    startButton.id = 'startButton';
    startButton.style.position = 'fixed';
    startButton.style.top = '14rem';
    startButton.style.left = '1rem';
    startButton.style.zIndex = 400;
    startButton.style.backgroundColor = 'black';
    startButton.style.color = 'lightgray';
    startButton.style.paddingLeft = '1rem';
    startButton.style.paddingRight = '1rem';
    startButton.style.paddingTop = '0.5rem';
    startButton.style.paddingBottom = '0.5rem';
    startButton.style.fontWeight = 'bold';
    startButton.style.borderWidth = '0.15rem';
    startButton.style.borderColor = 'lightgray';
    startButton.style.borderRadius = '0.4rem';
    startButton.style.borderStyle = 'solid';
    startButton.addEventListener('mouseover', function(event) {
        startButton.style.backgroundColor = 'lightgray';
        startButton.style.color = 'black';
        startButton.style.borderColor = 'black';
    });
    startButton.addEventListener('mouseout', function(event) {
        startButton.style.backgroundColor = 'black';
        startButton.style.color = 'lightgray';
        startButton.style.borderColor = 'lightgray';
    });
    startButton.addEventListener('mousedown', function(event) {
        startButton.style.backgroundColor = 'gray';
    });
    startButton.addEventListener('mouseup', function(event) {
        startButton.style.backgroundColor = 'lightgray';
    });
    startButton.addEventListener('click', bodyMouseOver);

    function addStartButton() {
        document.body.appendChild(startButton);
        document.body.removeEventListener('mouseover', bodyMouseOver)
    }

    function addEventListener() {
        document.body.addEventListener('mouseover', bodyMouseOver);
        if(document.getElementById('startButton')) {
            document.body.removeChild(startButton);
        }
    }
*/
    // let addDlBtnMode = GM_getValue('addDlBtnMode', 0);

    function showModal(event) {
        // console.log(addDlBtnMode);
        let bg = document.createElement('div');
        bg.style.position = 'fixed';
        bg.style.top = 0;
        bg.style.left = 0;
        bg.style.zIndex = 500;
        bg.style.backgroundColor = 'black';
        bg.style.opacity = 0.5;
        let modal = document.createElement('div');
        document.body.appendChild(bg);
        modal.style.position = 'fixed';
        modal.style.width = '25rem';
        modal.style.height = 'auto';
        modal.style.maxHeight = '80vh';
        modal.style.zIndex = 600;
        modal.style.backgroundColor = 'white';
        modal.style.borderStyle = 'solid';
        modal.style.borderWidth = '0.2rem';
        modal.style.borderRadius = '0.5rem';
        modal.style.borderColor = 'black';
        modal.style.overflowX = 'hidden';
        modal.style.overflowY = 'auto';
        modal.style.fontSize = '1rem';
        let titleBar = document.createElement('div');
        titleBar.textContent = text[1];
        titleBar.style.width = '100%';
        titleBar.style.textAlign = 'center';
        titleBar.style.backgroundColor = 'black';
        titleBar.style.color = 'white';
        titleBar.style.fontSize = '1rem';
        titleBar.style.fontWeight = 'bold';
        titleBar.style.paddingTop = '0.5rem';
        titleBar.style.paddingBottom = '0.5rem';
        titleBar.style.borderTopLeftRadius = '0.3rem';
        titleBar.style.borderTopRightRadius = '0.3rem';
        modal.appendChild(titleBar);
        /*let question1 = document.createElement('p');
        question1.textContent = text[2];
        question1.style.paddingLeft = '2rem';
        question1.style.paddingRight = '2rem';
        question1.style.marginTop = '1rem';
        question1.style.marginBottom = '1rem';
        let chooseButton = document.createElement('input');
        chooseButton.type = 'radio';
        chooseButton.id = 'chooseButton';
        chooseButton.name = 'chooseSetting';
        chooseButton.value = 1;
        chooseButton.style.margin = '0.5rem 0.5rem 0 0.5rem';
        let labelForChooseButton = document.createElement('label');
        labelForChooseButton.htmlFor = 'chooseButton';
        labelForChooseButton.textContent = text[3];
        let divForChooseButton = document.createElement('div');
        divForChooseButton.appendChild(chooseButton);
        divForChooseButton.appendChild(labelForChooseButton);
        question1.appendChild(divForChooseButton);
        let chooseEvent = document.createElement('input');
        chooseEvent.type = 'radio';
        chooseEvent.id = 'chooseEvent';
        chooseEvent.name = 'chooseSetting';
        chooseEvent.value = 2;
        chooseEvent.style.margin = '0.5rem 0.5rem 0 0.5rem';
        if (addDlBtnMode == 2) {
            chooseEvent.checked = true;
        } else {
            chooseButton.checked = true;
        }
        let labelForChooseEvent = document.createElement('label');
        labelForChooseEvent.htmlFor = 'chooseEvent';
        labelForChooseEvent.textContent = text[4];
        let divForChooseEvent = document.createElement('div');
        divForChooseEvent.appendChild(chooseEvent);
        divForChooseEvent.appendChild(labelForChooseEvent);
        question1.appendChild(divForChooseEvent);
        modal.appendChild(question1);*/
        let question2 = document.createElement('p');
        question2.style.paddingLeft = '2rem';
        question2.style.paddingRight = '2rem';
        question2.style.marginTop = '1rem';
        question2.style.marginBottom = '1rem';
        let labelFileName = document.createElement('label');
        labelFileName.textContent = text[7];
        labelFileName.setAttribute('for', 'dlFileName');
        labelFileName.style.color = "black";
        question2.appendChild(labelFileName);
        let inputFileName = document.createElement('input');
        inputFileName.type = 'text';
        inputFileName.id = 'dlFileName';
        inputFileName.name = 'dlFileName';
        inputFileName.style.marginTop = '0.5rem';
        inputFileName.style.width = 'calc(100% - 1rem)';
        inputFileName.style.padding = '0.1rem 0.2rem 0.1rem 0.2rem';
        inputFileName.style.borderStyle = 'solid';
        inputFileName.style.borderColor = 'gray';
        inputFileName.style.borderWidth = '0.14rem';
        inputFileName.style.borderRadius = '0.2rem';
        inputFileName.defaultValue = GM_getValue('dlFileName', '{original}.{ext}');
        question2.appendChild(inputFileName);
        let fileNameExplain1 = document.createElement('p');
        fileNameExplain1.innerHTML = text[8];
        fileNameExplain1.style.marginTop = '0.5rem';
        fileNameExplain1.style.marginBottom = '0';
        fileNameExplain1.style.whiteSpace = 'pre';
        fileNameExplain1.style.color = 'gray';
        question2.appendChild(fileNameExplain1);
        let fileNameExplain2 = document.createElement('p');
        fileNameExplain2.innerHTML = text[26] + text[27];
        fileNameExplain2.style.marginTop = '0.5rem';
        fileNameExplain2.style.whiteSpace = 'pre';
        fileNameExplain2.style.color = 'gray';
        question2.appendChild(fileNameExplain2);
        modal.appendChild(question2);
        let question3 = document.createElement('p');
        question3.style.paddingLeft = '2rem';
        question3.style.paddingRight = '2rem';
        question3.style.marginTop = '1rem';
        question3.style.marginBottom = '0';
        let labelZipMode = document.createElement('label');
        labelZipMode.setAttribute('for', 'zipMode');
        labelZipMode.textContent = text[13];
        labelZipMode.style.display = 'inline-block';
        labelZipMode.style.paddingRight = '0.2rem';
        labelZipMode.style.color = GM_getValue('ariaMode', false) ? "gray" : "black";
        question3.appendChild(labelZipMode);
        let inputZipMode = document.createElement('input');
        inputZipMode.type = 'checkbox';
        inputZipMode.id = 'zipMode';
        inputZipMode.checked = GM_getValue('zipMode', false);
        inputZipMode.disabled = GM_getValue('ariaMode', false);
        question3.appendChild(inputZipMode);
        let labelPackName = document.createElement('label');
        labelPackName.textContent = text[14];
        labelPackName.setAttribute('for', 'packFileName');
        labelPackName.style.display = 'block';
        labelPackName.style.marginTop = '0.5rem';
        labelPackName.style.color = (GM_getValue('zipMode', false) && !GM_getValue('ariaMode', false)) ? "black" : "gray";
        // labelPackName.style.display = GM_getValue('zipMode', false) ? 'block' : 'none';
        question3.appendChild(labelPackName);
        let inputPackName = document.createElement('input');
        inputPackName.type = 'text';
        inputPackName.id = 'packFileName';
        inputPackName.name = 'packFileName';
        inputPackName.style.marginTop = '0.5rem';
        inputPackName.style.width = 'calc(100% - 1rem)';
        inputPackName.style.padding = '0.1rem 0.2rem 0.1rem 0.2rem';
        inputPackName.style.borderStyle = 'solid';
        inputPackName.style.borderColor = (GM_getValue('zipMode', false) && !GM_getValue('ariaMode', false)) ? 'black' : 'gray';
        inputPackName.style.borderWidth = '0.14rem';
        inputPackName.style.borderRadius = '0.2rem';
        inputPackName.defaultValue = GM_getValue('packFileName', '{mblogid}.zip');
        // inputPackName.style.display = GM_getValue('zipMode', false) ? 'block' : 'none';
        inputPackName.disabled = (GM_getValue('zipMode', false) && !GM_getValue('ariaMode', false)) ? false : true;
        question3.appendChild(inputPackName);
        let filePackExplain = document.createElement('p');
        filePackExplain.textContent = text[15];
        filePackExplain.style.marginTop = '0.5rem';
        filePackExplain.style.marginBottom = '0';
        filePackExplain.style.color = 'gray';
        // filePackExplain.style.display = GM_getValue('zipMode', false) ? 'block' : 'none';
        question3.appendChild(filePackExplain);
        modal.appendChild(question3);
        let question4 = document.createElement('p');
        question4.style.paddingLeft = '2rem';
        question4.style.paddingRight = '2rem';
        question4.style.marginTop = '1rem';
        question4.style.marginBottom = '0';
        let labelRetweetMode = document.createElement('label');
        labelRetweetMode.setAttribute('for', 'retweetMode');
        labelRetweetMode.textContent = text[16];
        labelRetweetMode.style.display = 'inline-block';
        labelRetweetMode.style.paddingRight = '0.2rem';
        labelRetweetMode.style.color = "black";
        question4.appendChild(labelRetweetMode);
        let inputRetweetMode = document.createElement('input');
        inputRetweetMode.type = 'checkbox';
        inputRetweetMode.id = 'retweetMode';
        inputRetweetMode.checked = GM_getValue('retweetMode', false);
        question4.appendChild(inputRetweetMode);
        let labelRetweetFileName = document.createElement('label');
        labelRetweetFileName.textContent = text[17];
        labelRetweetFileName.setAttribute('for', 'retweetFileName');
        labelRetweetFileName.style.display = 'block';
        labelRetweetFileName.style.marginTop = '0.5rem';
        labelRetweetFileName.style.color = GM_getValue('retweetMode', false) ? "black" : 'gray';
        // labelPackName.style.display = GM_getValue('retweetMode', false) ? 'block' : 'none';
        question4.appendChild(labelRetweetFileName);
        let inputRetweetFileName = document.createElement('input');
        inputRetweetFileName.type = 'text';
        inputRetweetFileName.id = 'retweetFileName';
        inputRetweetFileName.name = 'retweetFileName';
        inputRetweetFileName.style.marginTop = '0.5rem';
        inputRetweetFileName.style.width = 'calc(100% - 1rem)';
        inputRetweetFileName.style.padding = '0.1rem 0.2rem 0.1rem 0.2rem';
        inputRetweetFileName.style.borderStyle = 'solid';
        inputRetweetFileName.style.borderColor = 'lightgray';
        inputRetweetFileName.style.borderWidth = '0.14rem';
        inputRetweetFileName.style.borderRadius = '0.2rem';
        inputRetweetFileName.defaultValue = GM_getValue('retweetFileName', '{original}.{ext}');
        // inputRetweetFileName.style.display = GM_getValue('retweetMode', false) ? 'block' : 'none';
        inputRetweetFileName.disabled = GM_getValue('retweetMode', false) ? false : true;
        question4.appendChild(inputRetweetFileName);
        let retweetFileNameExplain = document.createElement('p');
        retweetFileNameExplain.textContent = text[18];
        retweetFileNameExplain.style.marginTop = '0.5rem';
        retweetFileNameExplain.style.whiteSpace = 'pre';
        retweetFileNameExplain.style.marginBottom = '0';
        retweetFileNameExplain.style.color = 'gray';
        // retweetFileNameExplain.style.display = GM_getValue('retweetMode', false) ? 'block' : 'none';
        question4.appendChild(retweetFileNameExplain);
        let labelRetweetPackName = document.createElement('label');
        labelRetweetPackName.textContent = text[19];
        labelRetweetPackName.setAttribute('for', 'retweetPackFileName');
        labelRetweetPackName.style.display = 'block';
        labelRetweetPackName.style.marginTop = '0.5rem';
        labelRetweetPackName.style.color = (GM_getValue('zipMode', false) && GM_getValue('retweetMode', false) && !GM_getValue('ariaMode', false)) ? "black" : 'gray';
        // labelRetweetPackName.style.display = GM_getValue('zipMode', false) ? 'block' : 'none';
        question4.appendChild(labelRetweetPackName);
        let inputRetweetPackName = document.createElement('input');
        inputRetweetPackName.type = 'text';
        inputRetweetPackName.id = 'retweetPackFileName';
        inputRetweetPackName.name = 'retweetPackFileName';
        inputRetweetPackName.style.marginTop = '0.5rem';
        inputRetweetPackName.style.width = 'calc(100% - 1rem)';
        inputRetweetPackName.style.padding = '0.1rem 0.2rem 0.1rem 0.2rem';
        inputRetweetPackName.style.borderStyle = 'solid';
        inputRetweetPackName.style.borderColor = 'lightgray';
        inputRetweetPackName.style.borderWidth = '0.14rem';
        inputRetweetPackName.style.borderRadius = '0.2rem';
        inputRetweetPackName.defaultValue = GM_getValue('retweetPackFileName', '{mblogid}.zip');
        // inputRetweetPackName.style.display = (GM_getValue('zipMode', false) && GM_getValue('retweetMode', false) && !GM_getValue('ariaMode', false)) ? 'block' : 'none';
        inputRetweetPackName.disabled = (GM_getValue('zipMode', false) && GM_getValue('retweetMode', false) && !GM_getValue('ariaMode', false)) ? false : true;
        question4.appendChild(inputRetweetPackName);
        let retweetPackExplain = document.createElement('p');
        retweetPackExplain.textContent = text[20];
        retweetPackExplain.style.marginTop = '0.5rem';
        retweetPackExplain.style.marginBottom = '0';
        retweetPackExplain.style.color = 'gray';
        // retweetPackExplain.style.display = (GM_getValue('zipMode', false) && GM_getValue('retweetMode', false) && !GM_getValue('ariaMode', false)) ? 'block' : 'none';
        question4.appendChild(retweetPackExplain);
        modal.appendChild(question4);
        let question5 = document.createElement('p');
        question5.style.paddingLeft = '2rem';
        question5.style.paddingRight = '2rem';
        question5.style.marginTop = '1rem';
        question5.style.marginBottom = '0';
        let labelAriaMode = document.createElement('label');
        labelAriaMode.setAttribute('for', 'ariaMode');
        labelAriaMode.textContent = text[21];
        labelAriaMode.style.display = 'inline-block';
        labelAriaMode.style.paddingRight = '0.2rem';
        labelAriaMode.style.color = 'black';
        question5.appendChild(labelAriaMode);
        let inputAriaMode = document.createElement('input');
        inputAriaMode.type = 'checkbox';
        inputAriaMode.id = 'ariaMode';
        inputAriaMode.checked = GM_getValue('ariaMode', false);
        question5.appendChild(inputAriaMode);
        let ariaModeExplain = document.createElement('p');
        ariaModeExplain.textContent = text[23];
        ariaModeExplain.style.marginTop = '0.5rem';
        ariaModeExplain.style.marginBottom = '0';
        ariaModeExplain.style.color = 'gray';
        question5.appendChild(ariaModeExplain);
        let labelAriaRpcUrl = document.createElement('label');
        labelAriaRpcUrl.textContent = text[22];
        labelAriaRpcUrl.setAttribute('for', 'ariaRpcUrl');
        labelAriaRpcUrl.style.display = 'block';
        labelAriaRpcUrl.style.marginTop = '0.5rem';
        labelAriaRpcUrl.style.color = GM_getValue('ariaMode', false) ? "black" : "gray";
        question5.appendChild(labelAriaRpcUrl);
        let inputAriaRpcUrl = document.createElement('input');
        inputAriaRpcUrl.type = 'text';
        inputAriaRpcUrl.id = 'ariaRpcUrl';
        inputAriaRpcUrl.name = 'ariaRpcUrl';
        inputAriaRpcUrl.style.marginTop = '0.5rem';
        inputAriaRpcUrl.style.width = 'calc(100% - 1rem)';
        inputAriaRpcUrl.style.padding = '0.1rem 0.2rem 0.1rem 0.2rem';
        inputAriaRpcUrl.style.borderStyle = 'solid';
        inputAriaRpcUrl.style.borderColor = 'lightgray';
        inputAriaRpcUrl.style.borderWidth = '0.14rem';
        inputAriaRpcUrl.style.borderRadius = '0.2rem';
        inputAriaRpcUrl.defaultValue = GM_getValue('ariaRpcUrl', 'http://localhost:6800/jsonrpc');
        // inputAriaRpcUrl.style.display = GM_getValue('ariaMode', false) ? 'block' : 'none';
        inputAriaRpcUrl.disabled = GM_getValue('ariaMode', false) ? false : true;
        question5.appendChild(inputAriaRpcUrl);
        let inputAriaExplain = document.createElement('p');
        inputAriaExplain.textContent = text[24];
        inputAriaExplain.style.marginTop = '0.5rem';
        inputAriaExplain.style.marginBottom = '0';
        inputAriaExplain.style.color = 'gray';
        question5.appendChild(inputAriaExplain);
        modal.appendChild(question5);
        let question6 = document.createElement('p');
        question6.style.paddingLeft = '2rem';
        question6.style.paddingRight = '2rem';
        question6.style.marginTop = '1rem';
        question6.style.marginBottom = '0';
        let labelDlVidCov = document.createElement('label');
        labelDlVidCov.setAttribute('for', 'dlVidCov');
        labelDlVidCov.textContent = text[28];
        labelDlVidCov.style.display = 'inline-block';
        labelDlVidCov.style.paddingRight = '0.2rem';
        labelDlVidCov.style.color = "black";
        question6.appendChild(labelDlVidCov);
        let inputDlVidCov = document.createElement('input');
        inputDlVidCov.type = 'checkbox';
        inputDlVidCov.id = 'dlVidCov';
        inputDlVidCov.checked = GM_getValue('dlVidCov', true);
        question6.appendChild(inputDlVidCov);
        modal.appendChild(question6);
        let question7 = document.createElement('p');
        question7.style.paddingLeft = '2rem';
        question7.style.paddingRight = '2rem';
        question7.style.marginTop = '1rem';
        question7.style.marginBottom = '0';
        let labelRmWtrMrk = document.createElement('label');
        labelRmWtrMrk.setAttribute('for', 'rmWtrMrk');
        labelRmWtrMrk.textContent = text[29];
        labelRmWtrMrk.style.display = 'inline-block';
        labelRmWtrMrk.style.paddingRight = '0.2rem';
        labelRmWtrMrk.style.color = "black";
        question7.appendChild(labelRmWtrMrk);
        let inputRmWtrMrk = document.createElement('input');
        inputRmWtrMrk.type = 'checkbox';
        inputRmWtrMrk.id = 'rmWtrMrk';
        inputRmWtrMrk.checked = GM_getValue('rmWtrMrk', false);
        question7.appendChild(inputRmWtrMrk);
        let rmWtrMrkExplain = document.createElement('p');
        rmWtrMrkExplain.innerHTML = text[30];
        rmWtrMrkExplain.style.marginTop = '0.5rem';
        rmWtrMrkExplain.style.marginBottom = '0';
        rmWtrMrkExplain.style.whiteSpace = 'pre';
        rmWtrMrkExplain.style.color = 'gray';
        question7.appendChild(rmWtrMrkExplain);
        modal.appendChild(question7);
        inputRetweetMode.addEventListener('change', function(event) {
            if (event.currentTarget.checked) {
                // labelRetweetFileName.style.display = 'block';
                // inputRetweetFileName.style.display = 'block';
                // retweetFileNameExplain.style.display = 'block';
                inputRetweetFileName.disabled = false;
                labelRetweetFileName.style.color = "black";
                inputRetweetFileName.style.borderColor = 'gray';
            } else {
                // labelRetweetFileName.style.display = 'none';
                // inputRetweetFileName.style.display = 'none';
                // retweetFileNameExplain.style.display = 'none';
                inputRetweetFileName.disabled = true;
                labelRetweetFileName.style.color = 'gray';
                inputRetweetFileName.style.borderColor = 'lightgray';
            }
            if (event.currentTarget.checked && inputZipMode.checked && !inputAriaMode.checked) {
                inputRetweetPackName.disabled = false;
                labelRetweetPackName.style.color = "black";
                inputRetweetPackName.style.borderColor = 'gray';
            } else {
                inputRetweetPackName.disabled = true;
                labelRetweetPackName.style.color = 'gray';
                inputRetweetPackName.style.borderColor = 'lightgray';
            }
        });
        inputZipMode.addEventListener('change', function(event) {
            if (event.currentTarget.checked) {
                // labelPackName.style.display = 'block';
                // inputPackName.style.display = 'block';
                // filePackExplain.style.display = 'block';
                inputPackName.disabled = false;
                labelPackName.style.color = "black";
                inputPackName.style.borderColor = 'gray';
                inputAriaMode.disabled = true;
                labelAriaMode.style.color = "gray";
                // inputAriaMode.checked = false;
            } else {
                // labelPackName.style.display = 'none';
                // inputPackName.style.display = 'none';
                // filePackExplain.style.display = 'none';
                inputPackName.disabled = true;
                labelPackName.style.color = 'gray';
                inputPackName.style.borderColor = 'lightgray';
                inputAriaMode.disabled = false;
                labelAriaMode.style.color = "black";
            }
            if (event.currentTarget.checked && inputRetweetMode.checked) {
                inputRetweetPackName.disabled = false;
                labelRetweetPackName.style.color = "black";
                inputRetweetPackName.style.borderColor = 'gray';
            } else {
                inputRetweetPackName.disabled = true;
                labelRetweetPackName.style.color = 'gray';
                inputRetweetPackName.style.borderColor = 'lightgray';
            }
        });
        inputAriaMode.addEventListener('change', function(event) {
            if (event.currentTarget.checked) {
                // labelAriaRpcUrl.style.display = 'block';
                // inputAriaRpcUrl.style.display = 'block';
                inputAriaRpcUrl.disabled = false;
                labelAriaRpcUrl.style.color = "black";
                inputAriaRpcUrl.style.borderColor = 'gray';
                inputZipMode.disabled = true;
                labelZipMode.style.color = 'gray';
                // inputZipMode.checked = false;
            } else {
                // labelAriaRpcUrl.style.display = 'none';
                // inputAriaRpcUrl.style.display = 'none';
                inputAriaRpcUrl.disabled = true;
                labelAriaRpcUrl.style.color = 'gray';
                inputAriaRpcUrl.style.borderColor = 'lightgray';
                inputZipMode.disabled = false;
                labelZipMode.style.color = "black";
            }
            if (!event.currentTarget.checked && inputZipMode.checked) {
                inputPackName.disabled = false;
                labelPackName.style.color = "black";
                inputPackName.style.borderColor = 'gray';
            } else {
                inputPackName.disabled = true;
                labelPackName.style.color = 'gray';
                inputPackName.style.borderColor = 'lightgray';
            }
            if (!event.currentTarget.checked && inputZipMode.checked && inputRetweetMode.checked) {
                inputRetweetPackName.disabled = false;
                labelRetweetPackName.style.color = "black";
                inputRetweetPackName.style.borderColor = 'gray';
            } else {
                inputRetweetPackName.disabled = true;
                labelRetweetPackName.style.color = 'gray';
                inputRetweetPackName.style.borderColor = 'lightgray';
            }
        });
        let okButton = document.createElement('button');
        okButton.textContent = text[5];
        okButton.style.paddingTop = '0.5rem';
        okButton.style.paddingBottom = '0.5rem';
        okButton.style.margin = '2rem';
        okButton.style.backgroundColor = 'darkblue';
        okButton.style.color = 'white';
        okButton.style.fontSize = '1.5rem';
        okButton.style.fontWeight = 'bold';
        okButton.style.width = '21rem';
        okButton.style.borderStyle = 'solid';
        okButton.style.borderRadius = '0.5rem';
        okButton.style.borderColor = 'black';
        okButton.style.borderWidth = '0.2rem';
        okButton.addEventListener('mouseover', function(event) {
            okButton.style.backgroundColor = 'blue';
        });
        okButton.addEventListener('mouseout', function(event) {
            okButton.style.backgroundColor = 'darkblue';
        });
        okButton.addEventListener('mousedown', function(event) {
            okButton.style.backgroundColor = 'darkblue';
        });
        okButton.addEventListener('mouseover', function(event) {
            okButton.style.backgroundColor = 'blue';
        });
        function resizeWindow(event) {
            // console.log('resize');
            bg.style.width = document.documentElement.clientWidth.toString() + 'px';
            bg.style.height = document.documentElement.clientHeight.toString() + 'px';
            modal.style.top = (( document.documentElement.clientHeight - modal.offsetHeight ) / 2).toString() + 'px';
            modal.style.left = (( document.documentElement.clientWidth - modal.offsetWidth ) / 2).toString() + 'px';
        }
        okButton.addEventListener('click', function(event) {
            /*if(document.getElementById('chooseButton').checked == true) {
                GM_setValue('addDlBtnMode', 1);
                addDlBtnMode = 1;
                addStartButton();
            } else {
                GM_setValue('addDlBtnMode', 2);
                addDlBtnMode = 2;
                addEventListener();
            }*/
            if (document.getElementById('zipMode').checked && !document.getElementById('dlFileName').value.includes('{original}') && !document.getElementById('dlFileName').value.includes('{index}')) {
                alert(text[27].replaceAll(/\n/g, ''));
                document.getElementById('dlFileName').focus();
                return;
            }
            GM_setValue('dlFileName', document.getElementById('dlFileName').value);
            GM_setValue('retweetMode', document.getElementById('retweetMode').checked);
            GM_setValue('retweetFileName', document.getElementById('retweetFileName').value);
            GM_setValue('zipMode', document.getElementById('zipMode').checked);
            GM_setValue('packFileName', document.getElementById('packFileName').value);
            GM_setValue('retweetPackFileName', document.getElementById('retweetPackFileName').value);
            GM_setValue('ariaMode', document.getElementById('ariaMode').checked);
            GM_setValue('ariaRpcUrl', document.getElementById('ariaRpcUrl').value);
            GM_setValue('dlVidCov', document.getElementById('dlVidCov').checked);
            GM_setValue('rmWtrMrk', document.getElementById('rmWtrMrk').checked);
            GM_setValue('isSet', settingVersion);
            document.body.removeChild(modal);
            document.body.removeChild(bg);
            window.removeEventListener('resize', resizeWindow);
        });
        modal.appendChild(okButton);
        document.body.appendChild(modal);
        /*bg.addEventListener('click', function(event) {
            document.body.removeChild(modal);
            document.body.removeChild(bg);
            window.removeEventListener('resize', resizeWindow);
        });*/
        resizeWindow();
        window.addEventListener('resize', resizeWindow);
    }

    let svg = document.getElementById('__SVG_SPRITE_NODE__');
    let symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    symbol.id = 'woo_svg_download';
    symbol.setAttribute('viewBox', '0 0 100 100');
    symbol.innerHTML = '<path d="m25,0l50,0l0,50l25,0l-50,50l-50,-50l25,0l0,-50" fill="currentColor"></path><path d="m30,5l40,0l0,50l20,0l-40,40l-40,-40l20,0l0,-50" fill="white"></path>';
    svg.appendChild(symbol);
/*
    if(addDlBtnMode == 0) {
        showModal();
    } else if (addDlBtnMode == 1) {
        addStartButton();
    } else if (addDlBtnMode == 2) {
        addEventListener();
    }
*/
    if(GM_getValue('isSet', null) !== settingVersion) {
        showModal();
    }
    new MutationObserver((mutationList, observer) => {
        // console.log(mutationList);
        if (location.host == 'weibo.com' || location.host == 'www.weibo.com') {
            const cards = document.body.querySelectorAll('article.woo-panel-main');
            // console.log(cards);
            for (const card of cards) {
                handleCard(card);
            }
            for (const mutation of mutationList) {
                // console.log(mutation.target);
                if (mutation.type === 'childList' && mutation.target.tagName === 'DIV' && (mutation.target.className.includes('wbpro-feed-content') || mutation.target.className.includes('Feed_retweet_JqZJb'))) {
                    for (const node of mutation.addedNodes) {
                        // console.log(node);
                        const imgs = node.querySelectorAll('img.woo-picture-img,img.picture_focusImg_1z5In,img.picture-viewer_pic_37YQ3,video.picture-viewer_pic_37YQ3');
                        // console.log(imgs);
                        for (const [ idx, img ] of Object.entries(imgs)) {
                            if (img.parentElement.getElementsByClassName('download-single-button').length === 0) {
                                if (img.className.includes('picture-viewer_pic_37YQ3')) {
                                    const previews = node.querySelectorAll('div.picture-viewer_preview_2wOSq');
                                    for (const [ index, preview ] of Object.entries(previews)) {
                                        if (preview.className.includes('picture-viewer_cur_anUEY')) {
                                            addSingleDlBtn(img, parseInt(index));
                                        }
                                    }
                                } else {
                                    addSingleDlBtn(img, parseInt(idx));
                                }
                            }
                        }
                    }
                }
            }
        } else if (location.host == 's.weibo.com') {
            // let cards = document.querySelectorAll('#pl_feedlist_index .card-wrap');
            const footers = document.querySelectorAll('#pl_feedlist_index .card-act');
            for (const footer of footers) {
                if(footer.getElementsByClassName('download-button').length > 0) {
                    // console.log('already added download button');
                } else {
                    // console.log(footer.parentElement);
                    if(footer.parentElement.className == 'card' && footer.parentElement.parentElement.className == 'card-wrap') {
                        const card = footer.parentElement;
                        let added = false;
                        const media_prev = card.querySelector('div[node-type="feed_list_media_prev"]');
                        // console.log(media_prev);
                        if (media_prev) {
                            const imgs = media_prev.getElementsByTagName('img');
                            // console.log(imgs);
                            if(imgs.length > 0) {
                                sAddDlBtn(footer);
                                added = true;
                            }
                            const videos = card.getElementsByTagName('video');
                            if(videos.length > 0 && added == false) {
                                sAddDlBtn(footer);
                            }
                        }
                    }
                }
            }
        }
    }).observe(document.body, { attributes: false, childList: true, subtree: true });

    let settingButton = document.createElement('button');
    settingButton.textContent = text[6];
    settingButton.style.position = 'fixed';
    settingButton.style.top = '4rem';
    settingButton.style.left = '0rem';
    settingButton.style.fontSize = '0.7rem';
    settingButton.style.backgroundColor = 'gray';
    settingButton.style.color = 'white';
    settingButton.style.borderWidth = '0.2rem';
    settingButton.style.borderStyle = 'solid';
    settingButton.style.borderRadius = '0.5rem';
    settingButton.style.borderColor = 'lightgrey';
    settingButton.style.zIndex = 400;
    settingButton.style.paddingLeft = '1rem';
    settingButton.style.paddingRight = '1rem';
    settingButton.style.paddingTop = '0.2rem';
    settingButton.style.paddingBottom = '0.2rem';
    settingButton.addEventListener('mouseover', function(event) {
        settingButton.style.backgroundColor = 'darkgray';
        settingButton.style.color = 'black';
    });
    settingButton.addEventListener('mouseout', function(event) {
        settingButton.style.backgroundColor = 'gray';
        settingButton.style.color = 'white';
    });
    settingButton.addEventListener('mousedown', function(event) {
        settingButton.style.backgroundColor = 'gray';
        settingButton.style.color = 'white';
    });
    settingButton.addEventListener('mouseup', function(event) {
        settingButton.style.backgroundColor = 'darkgray';
        settingButton.style.color = 'black';
    });
    settingButton.addEventListener('click', showModal);
    document.body.appendChild(settingButton);
    GM_registerMenuCommand(text[25], showModal, "0");
    // console.log(GM_info.downloadMode);
})();
