// ==UserScript==
// @name         Download Weibo Images & Videos (Only support new version weibo UI)
// @name:zh-CN   下载微博图片和视频（仅支持新版界面）
// @version      0.8.1
// @description  Download images and videos from new version weibo UI webpage.
// @description:zh-CN 从新版微博界面下载图片和视频。
// @author       OWENDSWANG
// @match        https://weibo.com/*
// @match        https://s.weibo.com/weibo*
// @match        https://s.weibo.com/realtime*
// @match        https://s.weibo.com/video*
// @exclude      https://weibo.com/tv/*
// @exclude      https://weibo.com/p/*
// @icon         https://weibo.com/favicon.ico
// @license      MIT
// @homepage     https://greasyfork.org/scripts/430877
// @supportURL   https://github.com/owendswang/Download-Weibo-Images-Videos
// @grant        GM_download
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      wx1.sinaimg.cn
// @connect      wx2.sinaimg.cn
// @connect      wx3.sinaimg.cn
// @connect      wx4.sinaimg.cn
// @connect      g.us.sinaimg.cn
// @connect      f.video.weibocdn.com
// @namespace    http://tampermonkey.net/
// @run-at       document-end
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.9.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js
// ==/UserScript==

(function() {
    'use strict';

    let text = [];
    let text_zh = [
        '添加下载按钮',
        '欢迎使用“下载微博图片”脚本',
        '请选择添加下载按钮的方式：',
        '点击“添加下载按钮”来添加下载按钮。',
        '当鼠标位于浏览器页面时添加下载按钮，但这种方式会占用很多CPU资源。',
        '确定',
        '下载设置',
        '下载文件名称',
        '{original} - 原文件名\n{username} - 原博主名称\n{userid} - 原博主ID\n{mblogid} - 原博mblogid\n{uid} - 原博uid\n{ext} - 文件后缀\n{index} - 图片序号\n{YYYY} {MM} {DD} {HH} {mm} {ss} - 原博发布时\n间的年份、月份、日期、小时、分钟、秒，可\n分开独立使用',
        '下载队列',
        '重试',
        '关闭',
        '取消',
        '打包下载',
        '打包文件名',
        '与“下载文件名”规则相同，但{original}、{ext}、{index}除外',
    ];
    let text_en = [
        'Add Download Buttons',
        'Welcome Using \'Download Weibo Images\' Script',
        'Which way do you like to add download buttons to each weibo post?',
        'Click \'Add Download Buttons\' button to add download buttons.',
        'When mouse over browser page, add download buttons automatically. But it takes a lot of CPU usage.',
        'OK',
        'Download Setting',
        'Download File Name',
        '{original} - Original file name\n{username} - Original user name\n{userid} - Original user ID\n{mblogid} - original mblogid\n{uid} - original uid\n{ext} - File extention\n{index} - Image index\n{YYYY} {MM} {DD} {HH} {mm} {ss} - "Year", \n"Month", "Date", "Hour", "Minute", "Second" \nof the created time of the original post',
        'Download Queue',
        'Retry',
        'Close',
        'Cancel',
        'Pack download files as a ZIP file',
        'ZIP File Name',
        'The same rules as "Download File Name" except {original}, {ext} and {index}',
    ];
    if(navigator.language.substr(0, 2) == 'zh') {
        text = text_zh;
    } else {
        text = text_en;
    }

    function httpGet(theUrl) {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    function downloadError(e, url, name, headerFlag, progress, zipMode = false) {
        console.log(e, url);
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
                downloadWrapper(url, name, headerFlag);
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
                        'Referer': 'https://weibo.com/',
                        'Origin': 'https://weibo.com/'
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
                        resolve(response);
                    },
                    onabort: (e) => { downloadError(e, url, name, headerFlag, progress); resolve(null); },
                    onerror: (e) => { downloadError(e, url, name, headerFlag, progress); resolve(null); },
                    ontimeout: (e) => { downloadError(e, url, name, headerFlag, progress); resolve(null); },
                });
                progress.lastChild.onclick = function(e) {
                    download.abort();
                    this.parentNode.remove();
                    if(downloadQueueCard.childElementCount == 1) downloadQueueTitle.style.display = 'none';
                };
            });
        } else {
            const download = GM_download({
                url,
                name,
                headers: headerFlag ? {
                    'Referer': 'https://weibo.com/',
                    'Origin': 'https://weibo.com/'
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
            };
        }
    }

    function getName(nameSetting, originalName, ext, userName, userId, postId, postUid, index, postTime) {
        let setName = nameSetting;
        setName = setName.replace('{ext}', ext);
        setName = setName.replace('{original}', originalName);
        setName = setName.replace('{username}', userName);
        setName = setName.replace('{userid}', userId);
        setName = setName.replace('{mblogid}', postId);
        setName = setName.replace('{uid}', postUid);
        setName = setName.replace('{index}', index);
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
        return setName.replace(/[<>|\|*|"|\/|\|:|?]/g, '_');
    }

    function handleDownloadList(downloadList, packName) {
        if (GM_getValue('zipMode', false)) {
            let zip = new JSZip();
            // console.log('zip', zip);
            let promises = downloadList.map(async function(ele, idx) {
                return await downloadWrapper(ele.url, ele.name, ele.headerFlag, true).then(function(data) {
                    // console.log('data', data);
                    if (data) zip.file(downloadList[idx].name, data);
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

    function addDlBtn(footer) {
        let dlBtnDiv = document.createElement('div');
        dlBtnDiv.className = 'woo-box-item-flex toolbar_item_1ky_D';
        let divInDiv = document.createElement('div');
        divInDiv.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_likebox_1rLfZ';
        let dlBtn = document.createElement('button');
        dlBtn.className = 'woo-like-main toolbar_btn_Cg9tz download-button';
        dlBtn.setAttribute('tabindex', '0');
        dlBtn.setAttribute('title', '下载');
        dlBtn.innerHTML = '<span class="woo-like-iconWrap"><svg class="woo-like-icon"><use xlink:href="#woo_svg_download"></use></svg></span><span class="woo-like-count">下载</span>';
        dlBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            const article = this.parentElement.parentElement.parentElement.parentElement.parentElement;
            if( article.tagName.toLowerCase() == 'article') {
                // let contentRow = article.getElementsByClassName('content_row_-r5Tk')[0];
                const header = article.getElementsByTagName('header')[0];
                const postLink = header.getElementsByClassName('head-info_time_6sFQg')[0];
                let postId = postLink.href.split('/')[postLink.href.split('/').length - 1];
                const response = httpGet('https://weibo.com/ajax/statuses/show?id=' + postId);
                const resJson = JSON.parse(response);
                // console.log(resJson);
                let picInfos = [];
                let userName, userId, postUid, postTime;
                let status = resJson;
                if(resJson.hasOwnProperty('retweeted_status')) {
                    status = resJson.retweeted_status;
                }
                postId = status.mblogid;
                picInfos = status.pic_infos;
                userName = status.user.screen_name;
                userId = status.user.idstr;
                postUid = status.idstr;
                postTime = status.created_at;
                let downloadList = [];
                if(footer.parentElement.getElementsByTagName('video').length > 0) {
                    // console.log('download video');
                    if(resJson.hasOwnProperty('page_info')) {
                        let mediaInfo = resJson.page_info.media_info;
                        let largeVidUrl = mediaInfo.playback_list[0].play_info.url;
                        let vidName = largeVidUrl.split('?')[0];
                        vidName = vidName.split('/')[vidName.split('/').length - 1].split('?')[0];
                        let originalName = vidName.split('.')[0];
                        let ext = vidName.split('.')[1];
                        let setName = getName(GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, 1, postTime);
                        downloadList.push({ url: largeVidUrl, name: setName });
                    }
                }
                if (picInfos) {
                    // console.log('download images');
                    let index = 0;
                    let padLength = Object.entries(picInfos).length.toString().length;
                    for (const [id, pic] of Object.entries(picInfos)) {
                        index += 1;
                        let largePicUrl = pic.largest.url;
                        let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
                        let originalName = picName.split('.')[0];
                        let ext = picName.split('.')[1];
                        let setName = getName(GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime);
                        downloadList.push({ url: largePicUrl, name: setName, headerFlag: true });
                        if(pic.hasOwnProperty('video')) {
                            let videoUrl = pic.video;
                            let videoName = videoUrl.split('%2F')[videoUrl.split('%2F').length - 1].split('?')[0];
                            videoName = videoName.split('/')[videoName.split('/').length - 1].split('?')[0];
                            if (!videoName.includes('.')) videoName = videoUrl.split('/')[videoUrl.split('/').length - 1].split('?')[0];
                            // console.log(videoUrl, videoName);
                            let originalName = videoName.split('.')[0];
                            let ext = videoName.split('.')[1];
                            let setName = getName(GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime);
                            downloadList.push({ url: videoUrl, name: setName });
                        }
                    }
                }
                handleDownloadList(downloadList, getName(GM_getValue('packFileName', '{mblogid}.zip'), '{original}', '{ext}', userName, userId, postId, postUid, '{index}'));
            }
        });
        divInDiv.appendChild(dlBtn);
        dlBtnDiv.appendChild(divInDiv);
        footer.firstChild.appendChild(dlBtnDiv);
        // console.log('added download button');
    }

    function sAddDlBtn(footer) {
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
        dlBtn.addEventListener('click', function(event) {
            // console.log('download');
            event.preventDefault();
            const card = this.parentElement.parentElement.parentElement.parentElement;
            const cardWrap = card.parentElement;
            // console.log(card, cardWrap);
            const mid = cardWrap.getAttribute('mid');
            // console.log(mid);
            if(mid) {
                const response = httpGet('https://weibo.com/ajax/statuses/show?id=' + mid);
                const resJson = JSON.parse(response);
                // console.log(resJson);
                let picInfos = [];
                let userName, userId, postUid, postId, postTime;
                let status = resJson;
                if(resJson.hasOwnProperty('retweeted_status')) {
                    status = resJson.retweeted_status;
                }
                postId = status.mblogid;
                picInfos = status.pic_infos;
                userName = status.user.screen_name;
                userId = status.user.idstr;
                postUid = status.idstr;
                postTime = status.created_at;
                let downloadList = [];
                if(footer.parentElement.getElementsByTagName('video').length > 0) {
                    // console.log('download video');
                    if(resJson.hasOwnProperty('page_info')) {
                        let mediaInfo = resJson.page_info.media_info;
                        let largeVidUrl = mediaInfo.playback_list[0].play_info.url;
                        let vidName = largeVidUrl.split('?')[0];
                        vidName = vidName.split('/')[vidName.split('/').length - 1].split('?')[0];
                        if (!vidName.includes('.')) vidName = largeVidUrl.split('/')[largeVidUrl.split('/').length - 1].split('?')[0];
                        let originalName = vidName.split('.')[0];
                        let ext = vidName.split('.')[1];
                        let setName = getName(GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, 1, postTime);
                        downloadList.push({ url: largeVidUrl, name: setName });
                    }
                }
                if (picInfos) {
                    // console.log('download images');
                    let index = 0;
                    let padLength = Object.entries(picInfos).length.toString().length;
                    for (const [id, pic] of Object.entries(picInfos)) {
                        index += 1;
                        let largePicUrl = pic.largest.url;
                        let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
                        let originalName = picName.split('.')[0];
                        let ext = picName.split('.')[1];
                        let setName = getName(GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'));
                        downloadList.push({ url: largePicUrl, name: setName, headerFlag: true });
                        if(pic.hasOwnProperty('video')) {
                            let videoUrl = pic.video;
                            let videoName = videoUrl.split('%2F')[videoUrl.split('%2F').length - 1].split('?')[0];
                            videoName = videoName.split('/')[videoName.split('/').length - 1].split('?')[0];
                            // console.log(videoUrl, videoName);
                            let originalName = videoName.split('.')[0];
                            let ext = videoName.split('.')[1];
                            let setName = getName(GM_getValue('dlFileName', '{original}.{ext}'), originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'));
                            downloadList.push({ url: videoUrl, name: setName });
                        }
                    }
                }
                handleDownloadList(downloadList, getName(GM_getValue('packFileName', '{mblogid}.zip'), '{original}', '{ext}', userName, userId, postId, postUid, '{index}'));
            }
        });
        aInLi.appendChild(dlBtn);
        dlBtnLi.appendChild(dlBtn);
        footer.firstChild.appendChild(dlBtnLi);
        // console.log('added download button');
    }

    function bodyMouseOver(event) {
        let svg = document.getElementById('__SVG_SPRITE_NODE__');
        let symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
        symbol.id = 'woo_svg_download';
        symbol.setAttribute('viewBox', '0 0 100 100');
        symbol.innerHTML = '<path d="m25,0l50,0l0,50l25,0l-50,50l-50,-50l25,0l0,-50" fill="currentColor"></path><path d="m30,5l40,0l0,50l20,0l-40,40l-40,-40l20,0l0,-50" fill="white"></path>';
        svg.appendChild(symbol);

        if (location.host == 'weibo.com') {
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

    let addDlBtnMode = GM_getValue('addDlBtnMode', 0);

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
        modal.style.zIndex = 600;
        modal.style.backgroundColor = 'white';
        modal.style.borderStyle = 'solid';
        modal.style.borderWidth = '0.2rem';
        modal.style.borderRadius = '0.5rem';
        modal.style.borderColor = 'black';
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
        let question1 = document.createElement('p');
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
        chooseButton.style.marginTop = '0.5rem';
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
        chooseEvent.style.marginTop = '0.5rem';
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
        modal.appendChild(question1);
        let question2 = document.createElement('p');
        question2.style.paddingLeft = '2rem';
        question2.style.paddingRight = '2rem';
        question2.style.marginTop = '1rem';
        question2.style.marginBottom = '1rem';
        let labelFileName = document.createElement('label');
        labelFileName.textContent = text[7];
        labelFileName.setAttribute('for', 'dlFileName');
        question2.appendChild(labelFileName);
        let inputFileName = document.createElement('input');
        inputFileName.type = 'text';
        inputFileName.id = 'dlFileName';
        inputFileName.name = 'dlFileName';
        inputFileName.style.marginTop = '0.5rem';
        inputFileName.style.width = 'calc(100% - 1rem)';
        inputFileName.defaultValue = GM_getValue('dlFileName', '{original}.{ext}');
        question2.appendChild(inputFileName);
        let fileNameExplain = document.createElement('p');
        fileNameExplain.textContent = text[8];
        fileNameExplain.style.marginTop = '0.5rem';
        fileNameExplain.style.whiteSpace = 'pre';
        fileNameExplain.style.color = 'gray';
        question2.appendChild(fileNameExplain);
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
        question3.appendChild(labelZipMode);
        let inputZipMode = document.createElement('input');
        inputZipMode.type = 'checkbox';
        inputZipMode.id = 'zipMode';
        inputZipMode.checked = GM_getValue('zipMode', false);
        question3.appendChild(inputZipMode);
        let labelPackName = document.createElement('label');
        labelPackName.textContent = text[14];
        labelPackName.setAttribute('for', 'packFileName');
        labelPackName.style.display = 'block';
        labelPackName.style.marginTop = '0.5rem';
        labelPackName.style.color = GM_getValue('zipMode', false) ? null : 'gray';
        // labelPackName.style.display = GM_getValue('zipMode', false) ? 'block' : 'none';
        question3.appendChild(labelPackName);
        let inputPackName = document.createElement('input');
        inputPackName.type = 'text';
        inputPackName.id = 'packFileName';
        inputPackName.name = 'packFileName';
        inputPackName.style.marginTop = '0.5rem';
        inputPackName.style.width = 'calc(100% - 1rem)';
        inputPackName.defaultValue = GM_getValue('packFileName', '{mblogid}.zip');
        // inputPackName.style.display = GM_getValue('zipMode', false) ? 'block' : 'none';
        inputPackName.disabled = GM_getValue('zipMode', false) ? false : true;
        question3.appendChild(inputPackName);
        let filePackExplain = document.createElement('p');
        filePackExplain.textContent = text[15];
        filePackExplain.style.marginTop = '0.5rem';
        filePackExplain.style.marginBottom = '0';
        filePackExplain.style.color = 'gray';
        // filePackExplain.style.display = GM_getValue('zipMode', false) ? 'block' : 'none';
        inputZipMode.addEventListener('change', function(event) {
            if (event.currentTarget.checked) {
                // labelPackName.style.display = 'block';
                // inputPackName.style.display = 'block';
                // filePackExplain.style.display = 'block';
                inputPackName.disabled = false;
                labelPackName.style.color = null;
            } else {
                // labelPackName.style.display = 'none';
                // inputPackName.style.display = 'none';
                // filePackExplain.style.display = 'none';
                inputPackName.disabled = true;
                labelPackName.style.color = 'gray';
            }
        });
        question3.appendChild(filePackExplain);
        modal.appendChild(question3);
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
            if(document.getElementById('chooseButton').checked == true) {
                GM_setValue('addDlBtnMode', 1);
                addDlBtnMode = 1;
                addStartButton();
            } else {
                GM_setValue('addDlBtnMode', 2);
                addDlBtnMode = 2;
                addEventListener();
            }
            GM_setValue('dlFileName', document.getElementById('dlFileName').value);
            GM_setValue('zipMode', document.getElementById('zipMode').checked);
            GM_setValue('packFileName', document.getElementById('packFileName').value);
            document.body.removeChild(modal);
            document.body.removeChild(bg);
            window.removeEventListener('resize', resizeWindow);
        });
        modal.appendChild(okButton);
        document.body.appendChild(modal);
        bg.addEventListener('click', function(event) {
            document.body.removeChild(modal);
            document.body.removeChild(bg);
            window.removeEventListener('resize', resizeWindow);
        });
        resizeWindow();
        window.addEventListener('resize', resizeWindow);
    }

    if(addDlBtnMode == 0) {
        showModal();
    } else if (addDlBtnMode == 1) {
        addStartButton();
    } else if (addDlBtnMode == 2) {
        addEventListener();
    }

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
})();
