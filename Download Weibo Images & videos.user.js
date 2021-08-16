// ==UserScript==
// @name         Download Weibo Images & Videos
// @name:zh-CN   下载微博图片和视频
// @version      0.1
// @description  Download weibo images and videos.
// @description:zh-CN 下载微博图片和视频。
// @author       OWENDSWANG
// @match        https://weibo.com/*
// @icon         https://weibo.com/favicon.ico
// @license      MIT
// @homepage     https://greasyfork.org/scripts/430877-download-weibo-images-videos?locale_override=1
// @supportURL   https://github.com/owendswang/Download-Weibo-Images-Videos
// @grant        GM_download
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    var text = [];
    var text_zh = [
        '添加下载按钮',
        '欢迎使用“下载微博图片”脚本',
        '请选择添加下载按钮的方式：',
        '点击“添加下载按钮”来添加下载按钮。',
        '当鼠标位于浏览器页面时添加下载按钮，但这种方式会占用很多CPU资源。',
        '确定',
        '下载设置'
    ];
    var text_en = [
        'Add Download Buttons',
        'Welcome Using \'Download Weibo Images\' Script',
        'Which way do you like to add download buttons to each weibo post?',
        'Click \'Add Download Buttons\' button to add download buttons.',
        'When mouse over browser page, add download buttons automatically. But it takes a lot of CPU usage.',
        'OK',
        'Download Setting'
    ];
    if(navigator.language.substr(0, 2) == 'zh') {
        text = text_zh;
    } else {
        text = text_en;
    }

    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    function addDlImgBtn(footer) {
        var div = document.createElement('div');
        div.className = 'woo-box-item-flex toolbar_item_1ky_D';
        var divInDiv = document.createElement('div');
        divInDiv.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_likebox_1rLfZ';
        var downloadButton = document.createElement('button');
        downloadButton.className = 'woo-like-main toolbar_btn_Cg9tz';
        downloadButton.setAttribute('tabindex', '0');
        downloadButton.setAttribute('title', '下载');
        downloadButton.innerHTML = '<span class="woo-like-iconWrap">\
<svg class="woo-like-icon">\
<use xlink:href="#woo_svg_download">\
</use>\
</svg>\
</span>\
<span class="woo-like-count">下载</span>';
        downloadButton.addEventListener('click', function(event) {
            var article = this.parentElement.parentElement.parentElement.parentElement.parentElement;
            if( article.tagName.toLowerCase() == 'article') {
                var contentRow = article.getElementsByClassName('content_row_-r5Tk')[0];
                if(contentRow.getElementsByClassName('picture_picNum_3r6Z2').length > 0) {
                    // console.log('more than 9 images');
                    var header = article.getElementsByTagName('header')[0];
                    var postLink = header.getElementsByClassName('head-info_time_6sFQg')[0];
                    var postId = postLink.href.split('/')[postLink.href.split('/').length - 1];
                    var response = httpGet('https://weibo.com/ajax/statuses/show?id=' + postId);
                    var resJson = JSON.parse(response);
                    // console.log(resJson);
                    var picInfos = [];
                    if(resJson.hasOwnProperty('retweeted_status')) {
                        picInfos = resJson['retweeted_status']['pic_infos'];
                    } else {
                        picInfos = resJson['pic_infos'];
                    }
                    for (const [id, pic] of Object.entries(picInfos)) {
                        var largePicUrl = pic['largest']['url'];
                        var picName = largePicUrl.split('/')[largePicUrl.split('/').length - 1];
                        GM_download(largePicUrl, picName);
                        // console.log(largePicUrl);
                    }
                } else {
                    var imgsList = contentRow.getElementsByTagName('img');
                    imgsList.forEach(function(img) {
                        var imgUrl = img.src;
                        var imgName = imgUrl.split('/')[imgUrl.split('/').length - 1];
                        var parser = document.createElement('a');
                        parser.href = imgUrl;
                        var imgUrlHost = parser.origin;
                        var largeImgUrl = imgUrlHost + '/large/' + imgName;
                        GM_download(largeImgUrl, imgName);
                        // console.log(largeImgUrl);
                    });
                }
            }
        });
        divInDiv.appendChild(downloadButton);
        div.appendChild(divInDiv);
        footer.firstChild.appendChild(div);
        footer.classList.add('addedDlBtn');
        // console.log('added download button');
    }

    function addDlVidBtn(footer) {
        var div = document.createElement('div');
        div.className = 'woo-box-item-flex toolbar_item_1ky_D';
        var divInDiv = document.createElement('div');
        divInDiv.className = 'woo-box-flex woo-box-alignCenter woo-box-justifyCenter toolbar_likebox_1rLfZ';
        var downloadButton = document.createElement('button');
        downloadButton.className = 'woo-like-main toolbar_btn_Cg9tz';
        downloadButton.setAttribute('tabindex', '0');
        downloadButton.setAttribute('title', '下载');
        downloadButton.innerHTML = '<span class="woo-like-iconWrap">\
<svg class="woo-like-icon">\
<use xlink:href="#woo_svg_download">\
</use>\
</svg>\
</span>\
<span class="woo-like-count">下载</span>';
        downloadButton.addEventListener('click', function(event) {
            var article = this.parentElement.parentElement.parentElement.parentElement.parentElement;
            if( article.tagName.toLowerCase() == 'article') {
                var contentRow = article.getElementsByClassName('content_row_-r5Tk')[0];
                var header = article.getElementsByTagName('header')[0];
                var postLink = header.getElementsByClassName('head-info_time_6sFQg')[0];
                var postId = postLink.href.split('/')[postLink.href.split('/').length - 1];
                var response = httpGet('https://weibo.com/ajax/statuses/show?id=' + postId);
                var resJson = JSON.parse(response);
                // console.log(resJson);
                var mediaInfo = resJson['page_info']['media_info'];
                var largeVidUrl = mediaInfo['playback_list'][0]['play_info']['url'];
                var vidName = largeVidUrl.split('?')[0];
                vidName = vidName.split('/')[vidName.split('/').length - 1];
                GM_download(largeVidUrl, vidName);
                // console.log(largeVidUrl);
            }
        });
        divInDiv.appendChild(downloadButton);
        div.appendChild(divInDiv);
        footer.firstChild.appendChild(div);
        footer.classList.add('addedDlBtn');
        // console.log('added download button');
    }

    function bodyMouseOver(event) {
        var svg = document.getElementById('__SVG_SPRITE_NODE__');
        var symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
        symbol.id = 'woo_svg_download';
        symbol.setAttribute('viewBox', '0 0 100 100');
        symbol.innerHTML = '<path d="m25,0l50,0l0,50l25,0l-50,50l-50,-50l25,0l0,-50" fill="currentColor"></path>\
<path d="m30,5l40,0l0,50l20,0l-40,40l-40,-40l20,0l0,-50" fill="white"></path>';
        svg.appendChild(symbol);

        var arts = document.getElementsByTagName('article');
        var footers = document.getElementsByTagName('footer');
        footers.forEach(function(footer) {
            if(footer.classList.contains('addedDlBtn')) {
                // console.log('already added download button');
            } else {
                if(footer.parentElement.tagName.toLowerCase() == 'article') {
                    var imgs = footer.parentElement.getElementsByTagName('img');
                    if(imgs.length > 0) {
                        var addFlag = false;
                        imgs.forEach(function(img) {
                            if(img.className == 'woo-picture-img') {
                                addFlag = true;
                            }
                        });
                        if(addFlag == true) {
                            addDlImgBtn(footer);
                        }
                    }
                    var videos = footer.parentElement.getElementsByTagName('video');
                    if(videos.length > 0) {
                        addDlVidBtn(footer);
                    }
                }
            }
        });
    }

    var startButton = document.createElement('button');
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
    startButton.style.borderSize = '0.2rem';
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

    var addDlBtnMode = GM_getValue('addDlBtnMode', 0);

    function showModal(event) {
        // console.log(addDlBtnMode);
        var bg = document.createElement('div');
        bg.style.position = 'fixed';
        bg.style.top = 0;
        bg.style.left = 0;
        bg.style.zIndex = 500;
        bg.style.backgroundColor = 'black';
        bg.style.opacity = 0.5;
        var modal = document.createElement('div');
        document.body.appendChild(bg);
        modal.style.position = 'fixed';
        modal.style.width = '25rem';
        modal.style.height = '20rem';
        modal.style.zIndex = 600;
        modal.style.backgroundColor = 'white';
        modal.style.borderStyle = 'solid';
        modal.style.borderWidth = '0.2rem';
        modal.style.borderRadius = '0.5rem';
        modal.style.borderColor = 'black';
        var titleBar = document.createElement('div');
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
        var question = document.createElement('p');
        question.textContent = text[2];
        question.style.paddingLeft = '2rem';
        question.style.paddingRight = '2rem';
        modal.appendChild(question);
        var chooseButton = document.createElement('input');
        chooseButton.type = 'radio';
        chooseButton.id = 'chooseButton';
        chooseButton.name = 'chooseSetting';
        chooseButton.value = 1;
        var labelForChooseButton = document.createElement('label');
        labelForChooseButton.htmlFor = 'chooseButton';
        labelForChooseButton.textContent = text[3];
        var divForChooseButton = document.createElement('div');
        divForChooseButton.style.paddingLeft = '2rem';
        divForChooseButton.style.paddingRight = '2rem';
        divForChooseButton.appendChild(chooseButton);
        divForChooseButton.appendChild(labelForChooseButton);
        modal.appendChild(divForChooseButton);
        var chooseEvent = document.createElement('input');
        chooseEvent.type = 'radio';
        chooseEvent.id = 'chooseEvent';
        chooseEvent.name = 'chooseSetting';
        chooseEvent.value = 2;
        if (addDlBtnMode == 2) {
            chooseEvent.checked = true;
        } else {
            chooseButton.checked = true;
        }
        var labelForChooseEvent = document.createElement('label');
        labelForChooseEvent.htmlFor = 'chooseEvent';
        labelForChooseEvent.textContent = text[4];
        var divForChooseEvent = document.createElement('div');
        divForChooseEvent.style.paddingLeft = '2rem';
        divForChooseEvent.style.paddingRight = '2rem';
        divForChooseEvent.appendChild(chooseEvent);
        divForChooseEvent.appendChild(labelForChooseEvent);
        modal.appendChild(divForChooseEvent);
        var okButton = document.createElement('button');
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

    var settingButton = document.createElement('button');
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
