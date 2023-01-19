// ==UserScript==
// @name         Download Weibo Images & Videos (Only support new version weibo UI)
// @name:zh-CN   下载微博图片和视频（仅支持新版界面）
// @version      0.6.2
// @description  Download images and videos from new version weibo UI webpage.
// @description:zh-CN 从新版微博界面下载图片和视频。
// @author       OWENDSWANG
// @match        https://weibo.com
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
// @grant        GM_notification
// @grant        GM_getValue
// @grant        GM_setValue
// @namespace http://tampermonkey.net/
// @run-at       document-end
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
        '{original} - 原文件名\n{username} - 原博主名称\n{userid} - 原博主ID\n{mblogid} - 原博mblogid\n{uid} - 原博uid\n{ext} - 文件后缀\n{index} - 图片序号\n{YYYY} {MM} {DD} {HH} {mm} {ss} - 原博发布时\n间的年份、月份、日期、小时、分钟、秒，可\n分开独立使用'
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
        '{original} - Original file name\n{username} - Original user name\n{userid} - Original user ID\n{mblogid} - original mblogid\n{uid} - original uid\n{ext} - File extention\n{index} - Image index\n{YYYY} {MM} {DD} {HH} {mm} {ss} - "Year", \n"Month", "Date", "Hour", "Minute", "Second" \nof the created time of the original post'
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

    function downloadError(e, url) {
        console.log(e, url);
        /*GM_notification({
            title: 'Download error',
            text: 'Error: ' + e.error + '\nUrl: ' + url,
            silent: true,
            timeout: 3,
        });*/
    }

    function getName(originalName, ext, userName, userId, postId, postUid, index, postTime) {
        let setName = GM_getValue('dlFileName', '{original}.{ext}');
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
        dlBtn.addEventListener('click', function(event) {
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
                if(resJson.hasOwnProperty('retweeted_status')) {
                    postId = resJson.retweeted_status.mblogid;
                    picInfos = resJson.retweeted_status.pic_infos;
                    userName = resJson.retweeted_status.user.screen_name;
                    userId = resJson.retweeted_status.user.idstr;
                    postUid = resJson.retweeted_status.idstr;
                    postTime = resJson.retweeted_status.created_at;
                } else {
                    postId = resJson.mblogid;
                    picInfos = resJson.pic_infos;
                    userName = resJson.user.screen_name;
                    userId = resJson.user.idstr;
                    postUid = resJson.idstr;
                    postTime = resJson.created_at;
                }
                if(footer.parentElement.getElementsByTagName('video').length > 0) {
                    // console.log('download video');
                    if(resJson.hasOwnProperty('page_info')) {
                        let mediaInfo = resJson.page_info.media_info;
                        let largeVidUrl = mediaInfo.playback_list[0].play_info.url;
                        let vidName = largeVidUrl.split('?')[0];
                        vidName = vidName.split('/')[vidName.split('/').length - 1].split('?')[0];
                        let originalName = vidName.split('.')[0];
                        let ext = vidName.split('.')[1];
                        let setName = getName(originalName, ext, userName, userId, postId, postUid, 1, postTime);
                        GM_download({
                            url: largeVidUrl,
                            name: setName,
                            onerror: (e) => { downloadError(e, largeVidUrl); },
                        });
                        // console.log(largeVidUrl);
                    }
                }
                // console.log('download images');
                let index = 0;
                let padLength = Object.entries(picInfos).length.toString().length;
                for (const [id, pic] of Object.entries(picInfos)) {
                    index += 1;
                    let largePicUrl = pic.largest.url;
                    let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
                    let originalName = picName.split('.')[0];
                    let ext = picName.split('.')[1];
                    let setName = getName(originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime);
                    GM_download({
                        url:largePicUrl,
                        name: setName,
                        headers: {
                            'Referer': 'https://weibo.com/',
                            'Origin': 'https://weibo.com/'
                        },
                        onerror: (e) => { downloadError(e, largePicUrl); },
                    });
                    // console.log(largePicUrl);
                    if(pic.hasOwnProperty('video')) {
                        let videoUrl = pic.video;
                        let videoName = videoUrl.split('%2F')[videoUrl.split('%2F').length - 1].split('?')[0];
                        videoName = videoName.split('/')[videoName.split('/').length - 1].split('?')[0];
                        // console.log(videoUrl, videoName);
                        let originalName = videoName.split('.')[0];
                        let ext = videoName.split('.')[1];
                        let setName = getName(originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'), postTime);
                        GM_download({
                            url:videoUrl,
                            name: setName,
                            onerror: (e) => { downloadError(e, videoUrl); },
                        });
                    }
                }
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
                let userName, userId, postUid, postId;
                if(resJson.hasOwnProperty('retweeted_status')) {
                    postId = resJson.retweeted_status.mblogid;
                    picInfos = resJson.retweeted_status.pic_infos;
                    userName = resJson.retweeted_status.user.screen_name;
                    userId = resJson.retweeted_status.user.idstr;
                    postUid = resJson.retweeted_status.idstr;
                } else {
                    postId = resJson.mblogid;
                    picInfos = resJson.pic_infos;
                    userName = resJson.user.screen_name;
                    userId = resJson.user.idstr;
                    postUid = resJson.idstr;
                }
                if(footer.parentElement.getElementsByTagName('video').length > 0) {
                    // console.log('download video');
                    if(resJson.hasOwnProperty('page_info')) {
                        let mediaInfo = resJson.page_info.media_info;
                        let largeVidUrl = mediaInfo.playback_list[0].play_info.url;
                        let vidName = largeVidUrl.split('?')[0];
                        vidName = vidName.split('/')[vidName.split('/').length - 1].split('?')[0];
                        let originalName = vidName.split('.')[0];
                        let ext = vidName.split('.')[1];
                        let setName = getName(originalName, ext, userName, userId, postId, postUid, 1);
                        GM_download({
                            url: largeVidUrl,
                            name: setName,
                            onerror: (e) => { downloadError(e, largeVidUrl); },
                        });
                        // console.log(largeVidUrl);
                    }
                }
                // console.log('download images');
                let index = 0;
                let padLength = Object.entries(picInfos).length.toString().length;
                for (const [id, pic] of Object.entries(picInfos)) {
                    index += 1;
                    let largePicUrl = pic.largest.url;
                    let picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1].split('?')[0];
                    let originalName = picName.split('.')[0];
                    let ext = picName.split('.')[1];
                    let setName = getName(originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'));
                    GM_download({
                        url:largePicUrl,
                        name: setName,
                        headers: {
                            'Referer': 'https://weibo.com/',
                            'Origin': 'https://weibo.com/'
                        },
                        onerror: (e) => { downloadError(e, largePicUrl); },
                    });
                    // console.log(largePicUrl);
                    if(pic.hasOwnProperty('video')) {
                        let videoUrl = pic.video;
                        let videoName = videoUrl.split('%2F')[videoUrl.split('%2F').length - 1].split('?')[0];
                        videoName = videoName.split('/')[videoName.split('/').length - 1].split('?')[0];
                        // console.log(videoUrl, videoName);
                        let originalName = videoName.split('.')[0];
                        let ext = videoName.split('.')[1];
                        let setName = getName(originalName, ext, userName, userId, postId, postUid, index.toString().padStart(padLength, '0'));
                        GM_download({
                            url:videoUrl,
                            name: setName,
                            onerror: (e) => { downloadError(e, videoUrl); },
                        });
                    }
                }
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
        let question = document.createElement('p');
        question.textContent = text[2];
        question.style.paddingLeft = '2rem';
        question.style.paddingRight = '2rem';
        question.style.marginTop = '1rem';
        question.style.marginBottom = '0.5rem';
        modal.appendChild(question);
        let chooseButton = document.createElement('input');
        chooseButton.type = 'radio';
        chooseButton.id = 'chooseButton';
        chooseButton.name = 'chooseSetting';
        chooseButton.value = 1;
        let labelForChooseButton = document.createElement('label');
        labelForChooseButton.htmlFor = 'chooseButton';
        labelForChooseButton.textContent = text[3];
        let divForChooseButton = document.createElement('div');
        divForChooseButton.style.paddingLeft = '2rem';
        divForChooseButton.style.paddingRight = '2rem';
        divForChooseButton.appendChild(chooseButton);
        divForChooseButton.appendChild(labelForChooseButton);
        modal.appendChild(divForChooseButton);
        let chooseEvent = document.createElement('input');
        chooseEvent.type = 'radio';
        chooseEvent.id = 'chooseEvent';
        chooseEvent.name = 'chooseSetting';
        chooseEvent.value = 2;
        if (addDlBtnMode == 2) {
            chooseEvent.checked = true;
        } else {
            chooseButton.checked = true;
        }
        let labelForChooseEvent = document.createElement('label');
        labelForChooseEvent.htmlFor = 'chooseEvent';
        labelForChooseEvent.textContent = text[4];
        let divForChooseEvent = document.createElement('div');
        divForChooseEvent.style.paddingLeft = '2rem';
        divForChooseEvent.style.paddingRight = '2rem';
        divForChooseEvent.appendChild(chooseEvent);
        divForChooseEvent.appendChild(labelForChooseEvent);
        modal.appendChild(divForChooseEvent);
        let question2 = document.createElement('p');
        question2.textContent = text[7];
        question2.style.paddingLeft = '2rem';
        question2.style.paddingRight = '2rem';
        question2.style.marginTop = '1rem';
        question2.style.marginBottom = '0.5rem';
        modal.appendChild(question2);
        let inputFileName = document.createElement('input');
        inputFileName.type = 'text';
        inputFileName.id = 'dlFileName';
        inputFileName.name = 'dlFileName';
        inputFileName.style.marginLeft = '2rem';
        inputFileName.style.marginRight = '2rem';
        inputFileName.style.width = 'calc(100% - 5rem)';
        inputFileName.defaultValue = GM_getValue('dlFileName', '{original}.{ext}');
        modal.appendChild(inputFileName);
        let fileNameExplain = document.createElement('p');
        fileNameExplain.textContent = text[8];
        fileNameExplain.style.paddingLeft = '2rem';
        fileNameExplain.style.paddingRight = '2rem';
        fileNameExplain.style.marginTop = '0.5rem';
        fileNameExplain.style.marginBottom = '0';
        fileNameExplain.style.whiteSpace = 'pre';
        fileNameExplain.style.color = 'gray';
        modal.appendChild(fileNameExplain);
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
