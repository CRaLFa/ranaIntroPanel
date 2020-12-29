/// <reference path="../docs/js/foo_spider_monkey_panel.js" />
/// <reference path="../docs/Callbacks.js" />
/// <reference path="../docs/Flags.js" />
/// <reference path="../docs/Helpers.js" />

'use strict';

/* ↓ Definitions ↓ */

class IntroPanel {
    constructor() {
        this.bgColor = RGB(50, 50, 50);
        this.panelSize = [0, 0];
        this.cursorPos = [0, 0];
        /** @type {Object<string, UI>} */
        this.elems = {};
        /** @type {FbMetadbHandle} */
        this.currentHandle = null;
        this.repaintFlg = false;
    }
    /** @param {GdiGraphics} gr */
    draw(gr) {
        gr.FillSolidRect(0, 0, ...this.panelSize, this.bgColor);
        this.elems.isEmpty() && this.createElements();
        if (this.repaintFlg) {
            Object.values(this.elems).forEach(elem => elem.draw(gr));
        } else {
            Object.values(this.elems).forEach(elem => {
                elem instanceof Label && elem.setWidth(gr);
                elem.draw(gr);
            });
            pWindow.Repaint();
        }
        this.repaintFlg = !this.repaintFlg;
    }
    createElements() {
        Object.entries(this.defineElements()).forEach(([id, def]) => {
            switch (def.type) {
                case 'fill':
                    this.elems[id] = new Fill(def.sizeDef, def.events, def.bgColor);
                    break;
                case 'button':
                    this.elems[id] = new Button(def.sizeDef, def.img, funcs[id]);
                    break;
                case 'label':
                    this.elems[id] = new Label(def.sizeDef, def.events, def.text, def.color, def.font, funcs[id]);
                    break;
                case 'artwork':
                    this.elems[id] = new Artwork(def.sizeDef, def.events, def.bgColor);
                    break;
            }
        });
    }
    defineElements() {
        const topH = 30, btnS = 30;
        return {
            topBar: {
                type: 'fill',
                sizeDef: [0, 0, 'winW - winH', topH],
                events: ['resize'],
                bgColor: RGB(0, 84, 167)
            },
            playlist: {
                type: 'label',
                sizeDef: [0, 0, 100, topH],
                events: ['select', 'switch'],
                text: '- [ - / - ]',
                color: colours.White,
                font: util.getFont(),
            },
            time: {
                type: 'label',
                sizeDef: ['playlist,right,25', 0, 100, topH],
                events: ['select', 'time', 'stop'],
                text: '--:-- / --:-- (-%)',
                color: colours.White,
                font: util.getFont(),
            },
            sabi: {
                type: 'label',
                sizeDef: ['time,right,25', 0, 100, topH],
                events: ['select', 'stop'],
                text: '[--:--]',
                color: colours.White,
                font: util.getFont(),
            },
            buttonBar: {
                type: 'fill',
                sizeDef: [0, 'topBar,bottom,0', 'winW - winH', btnS],
                events: ['resize'],
                bgColor: RGB(230, 230, 230)
            },
            stop: {
                type: 'button',
                sizeDef: [5, 'topBar,bottom,0', btnS, btnS],
                img: 'stop.png',
            },
            play: {
                type: 'button',
                sizeDef: ['stop,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'play.png',
            },
            pause: {
                type: 'button',
                sizeDef: ['play,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'pause.png',
            },
            prev: {
                type: 'button',
                sizeDef: ['pause,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'prev.png',
            },
            next: {
                type: 'button',
                sizeDef: ['prev,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'next.png',
            },
            next: {
                type: 'button',
                sizeDef: ['prev,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'next.png',
            },
            save: {
                type: 'button',
                sizeDef: ['next,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'save.png',
            },
            jump: {
                type: 'button',
                sizeDef: ['save,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'jump.png',
            },
            setting: {
                type: 'button',
                sizeDef: ['jump,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'gear.png',
            },
            tweet: {
                type: 'button',
                sizeDef: ['setting,right,10', 'topBar,bottom,0', btnS, btnS],
                img: 'twibird.png',
            },
            yearType: {
                type: 'label',
                sizeDef: [0, 'buttonBar,bottom,5', 'winW - winH', 40],
                events: ['select', 'stop', 'resize'],
                text: '',
                color: RGB(230, 230, 230),
                font: util.getFont(null, 18, FontStyle.Bold)
            },
            tieUp: {
                type: 'label',
                sizeDef: [0, 'yearType,bottom,-15', 'winW - winH', 50],
                events: ['select', 'stop', 'resize'],
                text: '',
                color: colours.White,
                font: util.getFont(null, 24, FontStyle.Bold)
            },
            title: {
                type: 'label',
                sizeDef: [0, 'tieUp,bottom,-5', 'winW - winH', 55],
                events: ['select', 'stop', 'resize'],
                text: '',
                color: colours.White,
                font: util.getFont(null, 30, FontStyle.Bold)
            },
            artist: {
                type: 'label',
                sizeDef: [0, 'title,bottom,0', 'winW - winH', 50],
                events: ['select', 'stop', 'resize'],
                text: '',
                color: colours.White,
                font: util.getFont(null, 24, FontStyle.Bold)
            },
            artwork: {
                type: 'artwork',
                sizeDef: ['winW - winH', 0, 'winH', 'winH'],
                events: ['select', 'stop', 'resize'],
                bgColor: colours.White
            }
        };
    }
    onResize(width, height) {
        this.panelSize = [width, height];
        this.elems.isEmpty() || this.resizeElements();
    }
    resizeElements() {
        Object.values(this.elems).forEach(elem => {
            elem.calcRect();
            elem.repaint();
        });
    }
    getElement(id) {
        return this.elems[id];
    }
    onClick(x, y) {
        Object.values(this.elems).forEach(elem => {
            elem.hover(x, y) && elem.onClick();
        });
    }
    repaint(event) {
        Object.values(this.elems).forEach(elem => elem.repaint(event));
    }
    handling() {
        return this.currentHandle !== null;
    }
    onSongSelect(handle) {
        pauseFlg && fb.Pause();
        middlePlayFlg && (fb.PlaybackTime = util.calcMiddlePos(fb.PlaybackLength));
        this.showSongInfo(handle);
    }
    showPlaylistInfo() {
        const plName = plman.GetPlaylistName(plman.ActivePlaylist);
        const index = plman.GetPlaylistFocusItemIndex(plman.ActivePlaylist) + 1;
        const count = plman.GetPlaylistItems(plman.ActivePlaylist).Count;
        const formattedIdx =  util.zeroPad(index, String(count).length);
        this.elems.playlist.setText(`${plName} [ ${formattedIdx} / ${count} ]`);
    }
    showSongInfo(handle) {
        this.currentHandle = handle;
        if (this.currentHandle === null) {
            this.clearSongInfo();
            return;
        }
        const year = util.evalTitleFormat('[%date%]', this.currentHandle);
        const type = util.evalTitleFormat('[%type%]', this.currentHandle);
        this.elems.yearType.setText(util.formatYearType(year, type));
        this.elems.tieUp.setText(util.evalTitleFormat('[%tie_up%]', this.currentHandle));
        this.elems.title.setText(util.evalTitleFormat('[%title%]', this.currentHandle));
        this.elems.artist.setText(util.evalTitleFormat('[%artist%]', this.currentHandle));
        this.elems.artwork.setImg(utils.GetAlbumArtEmbedded(this.currentHandle.RawPath));
        const sabi = util.getSabiArray(this.currentHandle).map(v => util.formatTime(v)).join(', ');
        sabi && this.elems.sabi.setText(`[${sabi}]`);
    }
    clearSongInfo() {
        this.elems.yearType.setText('');
        this.elems.tieUp.setText('');
        this.elems.title.setText('');
        this.elems.artist.setText('');
        this.elems.artwork.setImg(null);
        this.elems.sabi.setText('[--:--]');
    }
    clipSongInfo() {
        const songInfo = util.evalTitleFormat(copyFormat, this.currentHandle);
        util.clipText(songInfo);
    }
    showTime() {
        const current = util.formatTime(fb.PlaybackTime);
        const length = util.formatTime(fb.PlaybackLength);
        const ratio = Math.round(fb.PlaybackTime / fb.PlaybackLength * 100);
        this.elems.time.setText(`${current} / ${length} (${ratio}%)`);
    }
    clearTime() {
        this.elems.time.setText('--:-- / --:-- (-%)');
    }
    setCursorPos(x, y) {
        this.cursorPos = [x, y];
        pWindow.SetCursor(this.getHoveringElem() ? IDC_HAND : IDC_ARROW);
    }
    getHoveringElem() {
        return Object.values(this.elems).find(elem => elem.hover(...this.cursorPos));
    }
    saveSabi() {
        const self = this;
        const sabiPos = fb.PlaybackTime;
        if (sabiPos === 0) {
            return;
        }
        const sabiArray = util.getSabiArray(self.currentHandle);
        sabiArray.push(sabiPos);
        sabiArray.sort((a, b) => a - b);
        const handleList = new FbMetadbHandleList();
        handleList.Add(self.currentHandle);
        handleList.UpdateFileInfoFromJSON(JSON.stringify({ sabi: sabiArray }));
        setTimeout(() => self.showSongInfo(self.currentHandle), 100);
    }
    jumpToSabi() {
        const currentPos = fb.PlaybackTime;
        const nextSabiPos = util.getSabiArray(this.currentHandle).find(v => v > currentPos);
        nextSabiPos && (fb.PlaybackTime = nextSabiPos);
    }
    onScroll(direction) {
        if (utils.IsKeyPressed(VK_CONTROL)) {
            const elem = this.getHoveringElem();
            elem instanceof Label && elem.changeFontSize(1 * direction);
        }
    }
    onKeyPress(vkey) {
        switch (vkey) {
            case 0x43: // Ctrl + C
                utils.IsKeyPressed(VK_CONTROL) && this.clipSongInfo();
                break;
            case 0x4A: // Alt + J
                utils.IsKeyPressed(VK_ALT) && this.jumpToSabi();
                break;
            case 0x52: // Ctrl + R
                utils.IsKeyPressed(VK_CONTROL) && pWindow.Reload();
                break;
            case 0x53: // Alt + S
                utils.IsKeyPressed(VK_ALT) && this.saveSabi();
                break;
        }
    }
}

class UI {
    constructor(sizeDef, events, func) {
        /** @type {any[]} */
        this.sizeDef = sizeDef;
        this.calcRect();
        this.events = events;
        this.callback = func;
    }
    calcRect() {
        /** @type {number[]} */
        const rect = this.sizeDef.map(v => {
            if (typeof v !== 'string') {
                return v;
            }
            if (!v.includes(',')) {
                return Function(`'use strict'; const [winW, winH] = [${panel.panelSize}]; return ${v};`)();
            }
            const [id, edge, margin] = v.split(',');
            return panel.getElement(id).getOffset(edge) + parseFloat(margin);
        });
        [this.x, this.y, this.w, this.h] = this.rect = rect;
    }
    repaint(event) {
        if (!event || (Array.isArray(this.events) && this.events.includes(event))) {
            pWindow.RepaintRect(...this.rect);
        }
    }
    hover(x, y) {
        if (!this.callback) {
            return false;
        }
        return this.getOffset('left') <= x && x <= this.getOffset('right')
                && this.getOffset('top') <= y && y <= this.getOffset('bottom');
    }
    onClick() {
        this.callback && this.callback();
    }
    getOffset(edge) {
        switch (edge) {
            case 'left':
                return this.x;
            case 'top':
                return this.y;
            case 'right':
                return this.x + this.w;
            case 'bottom':
                return this.y + this.h;
            default:
                return NaN;
        }
    }
}

class Fill extends UI {
    constructor(sizeDef, events, bgColor) {
        super(sizeDef, events, null);
        this.bgColor = bgColor;
    }
    /** @param {GdiGraphics} gr */
    draw(gr) {
        this.bgColor && gr.FillSolidRect(...this.rect, this.bgColor);
    }
}

class Button extends UI {
    constructor(sizeDef, imgName, func) {
        super(sizeDef, null, func);
        this.img = gdi.Image(ImgPath + imgName);
    }
    /** @param {GdiGraphics} gr */
    draw(gr) {
        gr.DrawImage(this.img, ...this.rect, 0, 0, this.img.Width, this.img.Height);
    }
}

class Label extends UI {
    constructor(sizeDef, events, text, color, font, func) {
        super(sizeDef, events, func);
        this.text = text;
        this.color = color;
        /** @type {GdiFont} */
        this.font = font;
    }
    /** @param {GdiGraphics} gr */
    draw(gr) {
        gr.SetTextRenderingHint(TextRenderingHint.ClearTypeGridFit);
        gr.SetSmoothingMode(SmoothingMode.AntiAlias);
        gr.SetInterpolationMode(InterpolationMode.HighQualityBicubic);
        const textRect = [this.x + 10, this.y + 5, this.w - 10, this.h - 5];
        const format = DT_NOPREFIX | DT_END_ELLIPSIS;
        gr.GdiDrawText(this.text, this.font, this.color, ...textRect, format);
    }
    /** @param {GdiGraphics} gr */
    setWidth(gr) {
        if (typeof this.sizeDef[2] === 'number') {
            this.sizeDef[2] = gr.CalcTextWidth(this.text, this.font) + 25;
            this.calcRect();
        }
    }
    /** @override */
    hover(x, y) {
        if (!panel.handling()) {
            return false;
        }
        return super.hover(x, y);
    }
    changeFontSize(delta) {
        this.font = util.getFont(this.font.Name, this.font.Size + delta, this.font.Style);
        pWindow.RepaintRect(...this.rect);
    }
    setText(text) {
        this.text = text;
    }
}

class Artwork extends UI {
    constructor(sizeDef, events, bgColor) {
        super(sizeDef, events, null);
        this.bgColor = bgColor;
        /** @type {GdiBitmap} */
        this.img = null;
        this.noImage = gdi.Image(ImgPath + 'no_image.jpg');
    }
    /** @param {GdiGraphics} gr */
    draw(gr) {
        this.bgColor && gr.FillSolidRect(...this.rect, this.bgColor);
        const showImg = this.img || this.noImage;
        const imgRect = this.calcImgRect(showImg.Width, showImg.Height);
        gr.DrawImage(showImg, ...imgRect, 0, 0, showImg.Width, showImg.Height);
    }
    calcImgRect(imgW, imgH) {
        let dstX, dstY, dstW, dstH;
        if (imgW < imgH) {
            dstY = this.y;
            dstH = this.h;
            dstW = imgW * this.h / imgH;
            dstX = this.x + (this.w - dstW) / 2;
        } else {
            dstX = this.x;
            dstW = this.w;
            dstH = imgH * this.w / imgW;
            dstY = (this.h - dstH) / 2;
        }
        return [dstX, dstY, dstW, dstH];
    }
    setImg(img) {
        this.img = img;
    }
}

class Twitter {
    constructor(screenName) {
        this.screenName = screenName;
        const credential = util.parseJSON(`${RootPath}data\\credentials.json`)[screenName];
        credential && pWindow.SetProperty('TWITTER_CREDENTIAL', JSON.stringify(credential)); // For Debug
        this.consumerKey = credential.consumer_key;
        this.consumerSecret = credential.consumer_secret;
        this.tokenKey = credential.access_token_key;
        this.tokenSecret = credential.access_token_secret;
    }
    postNowPlaying() {
        const currentHandle = fb.GetNowPlaying();
        if (!this.consumerKey || currentHandle === null) {
            return;
        }
        const text = util.evalTitleFormat(tweetFormat, currentHandle);
        this.showTweetDialog(text, null);
    }
    async postNowPlayingWithImg() {
        const currentHandle = fb.GetNowPlaying();
        if (!this.consumerKey || currentHandle === null) {
            return;
        }
        const text = util.evalTitleFormat(tweetFormat, currentHandle);
        const img = utils.GetAlbumArtEmbedded(currentHandle.RawPath);
        if (!img) {
            this.showTweetDialog(text, null);
            return;
        }
        const tmpImgPath = `${RootPath}tmp\\artwork_${Date.now()}.jpg`;
        img.SaveAs(tmpImgPath, 'image/jpeg');
        const mediaId = await this.getMediaId(tmpImgPath).catch(() => null);
        this.showTweetDialog(text, mediaId);
        const fso = new ActiveXObject('Scripting.FileSystemObject');
        fso.DeleteFile(tmpImgPath);
    }
    showTweetDialog(text, mediaId) {
        const htmlCode = utils.ReadTextFile(`${RootPath}\\html\\tweetDialog.html`, 65001);
        utils.ShowHtmlDialog(pWindow.ID, htmlCode, {
            width: 750,
            height: 350,
            data: [text, mediaId, funcs.editTweetCallback]
        });
    }
    postTweet(text, mediaId) {
        const url = this.getUrl(this.getTweetMessage(util.truncate(text, 280), mediaId));
        const xhr = new ActiveXObject('MSXML2.XMLHTTP');
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    console.log(JSON.stringify(response, null, 4));
                    fb.ShowPopupMessage(`Tweet was successfully posted.\n\n${this.screenName}:\n${response.text}`);
                } else {
                    fb.ShowPopupMessage(`Could not post tweet. (StatusCode: ${xhr.status}, StatusText: ${xhr.statusText})`);
                }
            }
        };
        xhr.send(null);
    }
    getMediaId(path) {
        const mediaData = util.encodeBase64(path);
        const boundary = Math.random().toString(36).slice(2);
        const body = `--${boundary}\r\nContent-Disposition: form-data; name="media_data"; \r\n\r\n${mediaData}\r\n--${boundary}--\r\n\r\n`;
        const url = this.getUrl(this.getMediaMessage());
        const xhr = new ActiveXObject('MSXML2.XMLHTTP');
        return new Promise((resolve, reject) => {
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        console.log(JSON.stringify(response, null, 4));
                        resolve(response.media_id_string);
                    } else {
                        reject(xhr.statusText);
                    }
                }
            };
            xhr.send(body);
        });
    }
    getTweetMessage(text, mediaId) {
        const message = {
            method: 'POST',
            action: 'https://api.twitter.com/1.1/statuses/update.json',
            parameters: {
                oauth_version: '1.0',
                oauth_signature_method: 'HMAC-SHA1',
                oauth_consumer_key: this.consumerKey,
                oauth_token: this.tokenKey,
                status: text
            }
        };
        mediaId && (message.parameters.media_ids = mediaId);
        return message;
    }
    getMediaMessage() {
        return {
            method: 'POST',
            action: 'https://upload.twitter.com/1.1/media/upload.json',
            parameters: {
                oauth_version: '1.0',
                oauth_signature_method: 'HMAC-SHA1',
                oauth_consumer_key: this.consumerKey,
                oauth_token: this.tokenKey
            }
        };
    }
    getUrl(message) {
        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, {
            consumerSecret: this.consumerSecret,
            tokenSecret: this.tokenSecret
        });
        return OAuth.addToURL(message.action, message.parameters);
    }
}

const funcs = {
    createMenus: () => {
        const baseSearchMenu = () => {
            const menu = pWindow.CreatePopupMenu();
            menu.AppendMenuItem(MF_ENABLED, 1, 'Google');
            menu.AppendMenuItem(MF_ENABLED, 2, 'Anison Generation');
            menu.AppendMenuItem(MF_ENABLED, 3, 'ErogameScape');
            menu.AppendMenuItem(MF_ENABLED, 4, 'Wikipedia');
            return menu;
        };
        return {
            searchTieUp: baseSearchMenu(),
            searchTitle: (menu => {
                menu.AppendMenuItem(MF_ENABLED, 5, 'J-WID');
                return menu;
            })(baseSearchMenu()),
            searchArtist: baseSearchMenu()
        };
    },
    editTweetCallback: (text, mediaId) => twitter.postTweet(text, mediaId),
    stop: () => fb.Stop(),
    play: () => fb.Play(),
    pause: () => fb.Pause(),
    prev: () => fb.Prev(),
    next: () => fb.Next(),
    save: () => panel.saveSabi(),
    jump: () => panel.jumpToSabi(),
    setting: () => {
        const mainMenu = pWindow.CreatePopupMenu();
        mainMenu.AppendMenuItem(pauseFlg ? MF_CHECKED : MF_UNCHECKED, 1, 'PAUSE_SELECT');
        mainMenu.AppendMenuItem(middlePlayFlg ? MF_CHECKED : MF_UNCHECKED, 2, 'MIDDLE_PLAY');
        const btn = panel.getElement('setting');
        switch (mainMenu.TrackPopupMenu(btn.getOffset('left'), btn.getOffset('bottom'))) {
            case 1:
                pauseFlg = !pauseFlg;
                pWindow.SetProperty('PAUSE_SELECT', pauseFlg);
                break;
            case 2:
                middlePlayFlg = !middlePlayFlg;
                pWindow.SetProperty('MIDDLE_PLAY', middlePlayFlg);
                break;
        }
    },
    tweet: () => {
        // twitter.postNowPlaying();
        twitter.postNowPlayingWithImg();
    },
    tieUp: () => {
        const encodedTieUp = encodeURIComponent(util.evalTitleFormat('[%tie_up%]', fb.GetNowPlaying()));
        switch (util.showMenuOnCursor(menus.searchTieUp)) {
            case 1:
                util.openUrl(`https://www.google.com/search?q=${encodedTieUp}`);
                break;
            case 2:
                util.openUrl(`http://anison.info/data/n.php?m=pro&q=${encodedTieUp}`);
                break;
            case 3:
                util.openUrl(`https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/kensaku.php?category=game&word_category=name&word=${encodedTieUp}`);
                break;
            case 4:
                util.openUrl(`https://ja.wikipedia.org/w/index.php?search=${encodedTieUp}`);
                break;
        }
    },
    title: () => {
        const title = util.evalTitleFormat('[%title%]', fb.GetNowPlaying());
        const encodedTitle = encodeURIComponent(title);
        switch (util.showMenuOnCursor(menus.searchTitle)) {
            case 1:
                util.openUrl(`https://www.google.com/search?q=${encodedTitle}`);
                break;
            case 2:
                util.openUrl(`http://anison.info/data/n.php?m=song&q=${encodedTitle}`);
                break;
            case 3:
                util.openUrl(`https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/kensaku.php?category=music&word_category=name&word=${encodedTitle}`);
                break;
            case 4:
                util.openUrl(`https://ja.wikipedia.org/w/index.php?search=${encodedTitle}`);
                break;
            case 5:
                util.openUrl(`http://www2.jasrac.or.jp/eJwid/main?trxID=A00401-3&IN_WORKS_TITLE_NAME1=${EscapeSJIS(title)}&IN_WORKS_TITLE_OPTION1=2&IN_WORKS_TITLE_TYPE1=0&IN_DEFAULT_SEARCH_WORKS_NAIGAI=0&IN_DEFAULT_WORKS_KOUHO_MAX=20&IN_DEFAULT_WORKS_KOUHO_SEQ=1&RESULT_CURRENT_PAGE=1`);
                break;
        }
    },
    artist: () => {
        const encodedArtist = encodeURIComponent(util.evalTitleFormat('[%artist%]', fb.GetNowPlaying()));
        switch (util.showMenuOnCursor(menus.searchArtist)) {
            case 1:
                util.openUrl(`https://www.google.com/search?q=${encodedArtist}`);
                break;
            case 2:
                util.openUrl(`http://anison.info/data/n.php?m=person&q=${encodedArtist}`);
                break;
            case 3:
                util.openUrl(`https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/kensaku.php?category=creater&word_category=name&word=${encodedArtist}`);
                break;
            case 4:
                util.openUrl(`https://ja.wikipedia.org/w/index.php?search=${encodedArtist}`);
                break;
        }
    }
};

const util = {
    getFont: (name = 'Meiryo UI', size = 15, style = FontStyle.Regular) => {
        try {
            return gdi.Font(name, size, style);
        } catch (e) {
            console.log(e);
            return null;
        }
    },
    formatTime: (time) => {
        const minutes = util.zeroPad(Math.floor(time / 60), 2);
        const seconds = util.zeroPad(Math.round(time % 60), 2);
        return `${minutes}:${seconds}`;
    },
    zeroPad: (val, length) => {
        return ('0'.repeat(length) + val).slice(-length);
    },
    parseJSON: (path) => {
        try {
            return JSON.parse(utils.ReadTextFile(path, 65001));
        } catch (e) {
            console.log(e);
            return {};
        }
    },
    evalTitleFormat: (query, handle) => {
        const tf = fb.TitleFormat(query);
        return handle ? tf.EvalWithMetadb(handle) : tf.Eval(true);
    },
    getSabiArray: (handle) => {
        const savedSabi = util.evalTitleFormat('[%sabi%]', handle);
        if (!savedSabi) {
            return [];
        }
        return savedSabi.split(', ').map(s => parseFloat(s));
    },
    formatYearType: (year, type) => {
        const matched = year.match(/^(\d{4})(\w+)$/);
        return matched === null ? `${year}  ${type}` : `${matched[1]}  ${matched[2]}-${type}`;
    },
    calcMiddlePos: (length) => {
        const matched = middlePlayPos.match(/^(\d+)[_-](\d+)%$/);
        if (matched === null) {
            return 0;
        }
        const from = parseInt(matched[1], 10);
        const to = parseInt(matched[2], 10);
        const percent = from + (to - from) * Math.random();
        return length * percent / 100;
    },
    /** @param {string} str */
    truncate: (str, maxLength) => {
        str = str.trim();
        let count = 0;
        const chars = [];
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            count += Math.ceil(encodeURIComponent(char).length / 6);
            if (maxLength < count) {
                break;
            }
            chars.push(char);
        }
        return chars.join('');
    },
    /** @param {MenuObject} menu */
    showMenuOnCursor: (menu) => {
        return menu.TrackPopupMenu(...panel.cursorPos);
    },
    openUrl: (url) => {
        const wsh = new ActiveXObject('WScript.Shell');
        wsh.Run(url);
    },
    clipText: (text) => {
        const clip = new ActiveXObject('WScript.Shell').Exec('clip');
        clip.StdIn.Write(text);
        clip.StdIn.Close();
    },
    encodeBase64: (path) => {
        const stream = new ActiveXObject('ADODB.Stream');
        stream.Type = 1;
        stream.Open();
        stream.LoadFromFile(path);
        const binaryData = stream.Read(-1);
        const base64 = new ActiveXObject('MSXML2.DOMDocument').createElement('base64');
        base64.dataType = 'bin.base64';
        base64.nodeTypedValue = binaryData;
        return base64.text;
    }
};

Object.prototype.isEmpty = function () {
    return Object.keys(this).length === 0;
};

/* ↓ Main ↓ */

const pWindow = window;
pWindow.DefinePanel('ranaIntroPanel', { author: 'rana', version: '1.0.0' });
include(`${fb.ComponentPath}docs\\Flags.js`);
include(`${fb.ComponentPath}docs\\Helpers.js`);

const RootPath = `${fb.ComponentPath}ranaIntroPanel\\`;
const ImgPath = `${RootPath}img\\`;
include(`${RootPath}lib\\oauth.js`);
include(`${RootPath}lib\\sha1.js`);
include(`${RootPath}lib\\ecl.js`);

let pauseFlg = pWindow.GetProperty('PAUSE_SELECT', true);
let middlePlayFlg = pWindow.GetProperty('MIDDLE_PLAY', false);
let middlePlayPos = pWindow.GetProperty('MIDDLE_PLAY_POSITION', '10_90%');
let copyFormat = pWindow.GetProperty('COPY_FORMAT', '[%title%] / [%artist%]');
let screenName = pWindow.GetProperty('TWITTER_SCREEN_NAME', 'rana_intro');
let tweetFormat = pWindow.GetProperty('TWEET_FORMAT', `${copyFormat} #NowPlaying`);

const panel = new IntroPanel();
const twitter = new Twitter(screenName);
const menus = funcs.createMenus();

/* ↓ Callbacks ↓ */

function on_paint(gr) {
    panel.draw(gr);
}

function on_playback_new_track(handle) {
    panel.showPlaylistInfo();
    panel.onSongSelect(handle);
    panel.showTime();
    panel.repaint('select');
}

function on_playback_time(_time) {
    panel.showTime();
    panel.repaint('time');
}

function on_playback_stop(_reason) {
    panel.showSongInfo(null);
    panel.clearTime();
    panel.repaint('stop');
}

function on_playlist_switch() {
    panel.showPlaylistInfo();
    panel.repaint('switch');
}

function on_playlist_items_selection_change() {
    panel.showPlaylistInfo();
    panel.repaint('switch');
}

function on_mouse_lbtn_up(x, y, _mask) {
    panel.onClick(x, y);
}

function on_mouse_move(x, y, _mask) {
    panel.setCursorPos(x, y);
}

function on_mouse_wheel(step) {
    panel.onScroll(step);
}

/** @param {number} vkey */
function on_key_down(vkey) {
    console.log(`on_key_down: 0x${vkey.toString(16).toUpperCase()}`); // For Debug
    panel.onKeyPress(vkey);
}

function on_size(width, height) {
    panel.onResize(width, height);
}
