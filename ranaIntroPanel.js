/// <reference path="../docs/js/foo_spider_monkey_panel.js" />
/// <reference path="../docs/Callbacks.js" />
/// <reference path="../docs/Flags.js" />
/// <reference path="../docs/Helpers.js" />

'use strict';

/* ↓ Definitions ↓ */

class IntroPanel {
	constructor() {
		this.bgColor = RGB(50, 50, 50);
		/** @type {Object<string, UI>} */
		this.elems = {};
		/** @type {FbMetadbHandle} */
		this.currentHandle = null;
		this.cursorPos = [0, 0];
	}
	draw(gr) {
		gr.FillSolidRect(0, 0, pWindow.Width, pWindow.Height, this.bgColor);
		this.elems.isEmpty() && this.createElements();
		Object.values(this.elems).forEach(elem => {
			elem.draw && elem.draw(gr);
		});
	}
	createElements() {
		const winW = pWindow.Width, winH = pWindow.Height;
		const topH = 30, btnS = 30;
		this.elems.topBar = new Fill(0, 0, winW - winH, topH, ['resize'], RGB(0, 84, 167));
		this.elems.playlist = new Label(0, 0, 250, topH,
				['select', 'switch'], '- [ - / - ]', colours.White, util.getFont(), null);
		this.elems.time = new Label(
				300, 0, 200, topH, ['select', 'time', 'stop'], '--:-- / --:-- (-%)', colours.White, util.getFont(), null);
		this.elems.buttonBar = new Fill(0, topH, winW - winH, btnS, ['resize'], RGB(230, 230, 230));
		this.elems.stop = new Button(5, topH, btnS, btnS, 'stop.png', funcs['stop']);
		this.elems.play = new Button(45, topH, btnS, btnS, 'play.png', funcs['play']);
		this.elems.pause = new Button(85, topH, btnS, btnS, 'pause.png', funcs['pause']);
		this.elems.prev = new Button(125, topH, btnS, btnS, 'prev.png', funcs['prev']);
		this.elems.next = new Button(165, topH, btnS, btnS, 'next.png', funcs['next']);
		this.elems.setting = new Button(205, topH, btnS, btnS, 'gear.png', funcs['setting']);
		this.elems.tweet = new Button(245, topH, btnS, btnS, 'twibird.png', funcs['tweet']);
		this.elems.yearType = new Label(0, 65, winW - winH, 40,
				['select', 'stop', 'resize'], '', RGB(230, 230, 230), util.getFont(null, 18, FontStyle.Bold), null);
		this.elems.tieUp = new Label(0, 90, winW - winH, 50,
				['select', 'stop', 'resize'], '', colours.White, util.getFont(null, 24, FontStyle.Bold), funcs['tieUp']);
		this.elems.title = new Label(0, 135, winW - winH, 55,
				['select', 'stop', 'resize'], '', colours.White, util.getFont(null, 30, FontStyle.Bold), funcs['title']);
		this.elems.artist = new Label(0, 190, winW - winH, 50,
				['select', 'stop', 'resize'], '', colours.White, util.getFont(null, 24, FontStyle.Bold), funcs['artist']);
		this.elems.artwork = new Artwork(winW - winH, 0, winH, winH, ['select', 'stop', 'resize'], colours.White);
	}
	getElement(id) {
		return this.elems[id];
	}
	clicked(x, y) {
		Object.values(this.elems).forEach(elem => {
			elem.hover(x, y) && elem.clicked();
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
		if (middlePlayFlg) {
			fb.PlaybackTime = util.calcMiddlePosition(fb.PlaybackLength);
		}
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
		const year = util.evalTitleFormat('%date%', this.currentHandle);
		const type = util.evalTitleFormat('%type%', this.currentHandle);
		this.elems.yearType.setText(util.formatYearType(year, type));
		this.elems.tieUp.setText(util.evalTitleFormat('%tie_up%', this.currentHandle));
		this.elems.title.setText(util.evalTitleFormat('%title%', this.currentHandle));
		this.elems.artist.setText(util.evalTitleFormat('%artist%', this.currentHandle));
		this.elems.artwork.setImage(utils.GetAlbumArtEmbedded(this.currentHandle.RawPath));
	}
	clearSongInfo() {
		this.elems.yearType.setText('');
		this.elems.tieUp.setText('');
		this.elems.title.setText('');
		this.elems.artist.setText('');
		this.elems.artwork.setImage(null);
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
	getCursorPos() {
		return this.cursorPos;
	}
	getHoveringElem() {
		return Object.values(this.elems).find(elem => elem.hover(...this.cursorPos));
	}
	toggleCursor(x, y) {
		this.cursorPos = [x, y];
		pWindow.SetCursor(this.getHoveringElem() ? IDC_HAND : IDC_ARROW);
	}
	recordSabi() {
		if (fb.PlaybackTime === 0) {
			return;
		}
		const handleList = new FbMetadbHandleList();
		handleList.Add(this.currentHandle);
		handleList.UpdateFileInfoFromJSON(JSON.stringify({
			sabi: fb.PlaybackTime
		}));
		fb.ShowPopupMessage(`sabi : ${util.formatTime(fb.PlaybackTime)}`);
	}
	jumpToSabi() {
		const sabiPos = Number(util.evalTitleFormat('%sabi%', this.currentHandle));
		if (isNaN(sabiPos)) {
			return;
		}
		fb.PlaybackTime = Number(sabiPos);
	}
	onScroll(direction) {
		if (!utils.IsKeyPressed(VK_CONTROL)) {
			return;
		}
		const elem = this.getHoveringElem();
		if (elem instanceof Label) {
			elem.changeFontSize(1 * direction);
		}
	}
	onKeyPress(vkey) {
		switch (vkey) {
			case 0x43: // Ctrl + C
				utils.IsKeyPressed(VK_CONTROL) && this.clipSongInfo();
				break;
			case 0x4a: // Alt + J
				utils.IsKeyPressed(VK_ALT) && this.jumpToSabi();
				break;
			case 0x52: // Ctrl + R
				utils.IsKeyPressed(VK_CONTROL) && pWindow.Reload();
				break;
			case 0x53: // Alt + S
				utils.IsKeyPressed(VK_ALT) && this.recordSabi();
				break;
		}
	}
}

class UI {
	constructor(x, y, w, h, events, func) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.coord = [x, y, w, h];
		this.events = events;
		this.callback = func;
	}
	getPosition(edge) {
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
	repaint(event) {
		if (Array.isArray(this.events) && this.events.includes(event)) {
			pWindow.RepaintRect(...this.coord);
		}
	}
	hover(x, y) {
		if (!this.callback) {
			return false;
		}
		return this.x <= x && x <= this.x + this.w 
				&& this.y <= y && y <= this.y + this.h;
	}
	clicked() {
		this.callback && this.callback();
	}
}

class Fill extends UI {
	constructor(x, y, w, h, events, bgColor) {
		super(x, y, w, h, events, null);
		this.bgColor = bgColor;
	}
	/** @param {GdiGraphics} gr */
	draw(gr) {
		this.bgColor && gr.FillSolidRect(...this.coord, this.bgColor);
	}
}

class Button extends UI {
	constructor(x, y, w, h, imgName, func) {
		super(x, y, w, h, null, func);
		this.img = gdi.Image(ImgPath + imgName);
	}
	/** @param {GdiGraphics} gr */
	draw(gr) {
		gr.DrawImage(this.img, ...this.coord, 0, 0, this.img.Width, this.img.Height);
	}
}

class Label extends UI {
	constructor(x, y, w, h, events, text, color, font, func) {
		super(x, y, w, h, events, func);
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
		gr.GdiDrawText(this.text, this.font, this.color,
				this.x + 10, this.y + 5, this.w - 10, this.h - 5, DT_NOPREFIX | DT_END_ELLIPSIS);
	}
	hover(x, y) {
		if (!panel.handling()) {
			return false;
		}
		return super.hover(x, y);
	}
	changeFontSize(delta) {
		this.font = util.getFont(this.font.Name, this.font.Size + delta, this.font.Style);
		pWindow.RepaintRect(...this.coord);
	}
	setText(text) {
		this.text = text;
	}
}

class Artwork extends UI {
	constructor(x, y, w, h, events, bgColor) {
		super(x, y, w, h, events, null);
		this.bgColor = bgColor;
		/** @type {GdiBitmap} */
		this.img = null;
		this.noImage = gdi.Image(ImgPath + 'no_image.jpg');
	}
	/** @param {GdiGraphics} gr */
	draw(gr) {
		this.bgColor && gr.FillSolidRect(...this.coord, this.bgColor);
		const showImg = this.img || this.noImage;
		const imgCoord = this.calcImgCoord(showImg.Width, showImg.Height);
		gr.DrawImage(showImg, ...imgCoord, 0, 0, showImg.Width, showImg.Height);
	}
	calcImgCoord(imgW, imgH) {
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
	setImage(img) {
		this.img = img;
	}
}

class Twitter {
	constructor(screenName) {
		this.screenName = screenName;
		const credential = util.getJSON(`${RootPath}data\\credentials.json`)[this.screenName];
		if (credential) {
			pWindow.SetProperty('TWITTER_CONSUMER_KEY', credential.consumer_key);
			pWindow.SetProperty('TWITTER_CONSUMER_SECRET', credential.consumer_secret);
			pWindow.SetProperty('TWITTER_TOKEN_KEY', credential.access_token_key);
			pWindow.SetProperty('TWITTER_TOKEN_SECRET', credential.access_token_secret);
		}
		this.consumerKey = pWindow.GetProperty('TWITTER_CONSUMER_KEY');
		this.consumerSecret = pWindow.GetProperty('TWITTER_CONSUMER_SECRET');
		this.tokenKey = pWindow.GetProperty('TWITTER_TOKEN_KEY');
		this.tokenSecret = pWindow.GetProperty('TWITTER_TOKEN_SECRET');
		this.tweetFormat = pWindow.GetProperty('TWEET_FORMAT', `${copyFormat} #NowPlaying`);
	}
	postNowPlaying() {
		if (!this.consumerKey) {
			return;
		}
		const currentHandle = fb.GetNowPlaying();
		if (currentHandle === null) {
			return;
		}
		this.postTweet(util.evalTitleFormat(this.tweetFormat, currentHandle), null);
	}
	async postNowPlayingWithImg() {
		if (!this.consumerKey) {
			return;
		}
		const currentHandle = fb.GetNowPlaying();
		if (currentHandle === null) {
			return;
		}
		const text = util.evalTitleFormat(this.tweetFormat, currentHandle);
		const img = utils.GetAlbumArtEmbedded(currentHandle.RawPath);
		if (!img) {
			this.postTweet(text, null);
			return;
		}
		const tmpImgPath = `${RootPath}tmp\\artwork_${Date.now()}.png`;
		img.SaveAs(tmpImgPath, 'image/png');
		const mediaId = await this.getMediaId(tmpImgPath).catch(() => null);
		this.postTweet(text, mediaId);
		const fso = new ActiveXObject('Scripting.FileSystemObject');
		fso.DeleteFile(tmpImgPath);
	}
	postTweet(text, mediaId) {
		const url = this.getUrl(this.getTweetMessage(util.truncate(text, 280), mediaId));
		const xhr = new ActiveXObject('MSXML2.XMLHTTP');
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		xhr.onreadystatechange = () => {
			if (xhr.readyState !== 4) {
				return;
			}
			if (xhr.status === 200) {
				const response = JSON.parse(xhr.responseText);
				console.log(JSON.stringify(response, null, 2));
				fb.ShowPopupMessage(`Tweet Posted.\n\n${this.screenName}: ${response.text}`);
			} else {
				fb.ShowPopupMessage(`Could not post tweet. (Status Code: ${status}, Status Text: ${xhr.statusText})`);
			}
		};
		xhr.send(null);
	}
	getMediaId(tmpImgPath) {
		const mediaData = util.encodeBase64(tmpImgPath);
		const boundary = Math.random().toString(36).slice(2);
		const body = `--${boundary}\r\nContent-Disposition: form-data; name="media_data"; \r\n\r\n${mediaData}\r\n--${boundary}--\r\n\r\n`;
		const url = this.getUrl(this.getMediaMessage());
		const xhr = new ActiveXObject('MSXML2.XMLHTTP');
		return new Promise((resolve, reject) => {
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', `multipart/form-data; boundary=${boundary}`);
			xhr.onreadystatechange = () => {
				if (xhr.readyState !== 4) {
					return;
				}
				if (xhr.status === 200) {
					const response = JSON.parse(xhr.responseText);
					console.log(JSON.stringify(response, null, 4));
					resolve(response.media_id_string);
				} else {
					reject(xhr.statusText);
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
		if (mediaId) {
			message.parameters.media_ids = mediaId;
		}
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
		const accessor = {
			consumerSecret: this.consumerSecret,
			tokenSecret: this.tokenSecret
		};
		OAuth.setTimestampAndNonce(message);
		OAuth.SignatureMethod.sign(message, accessor);
		return OAuth.addToURL(message.action, message.parameters);
	}
}

const funcs = {
	stop: () => fb.Stop(),
	play: () => fb.Play(),
	pause: () => fb.Pause(),
	prev: () => fb.Prev(),
	next: () => fb.Next(),
	setting: () => {
		const mainMenu = pWindow.CreatePopupMenu();
		mainMenu.AppendMenuItem(pauseFlg ? MF_CHECKED : MF_UNCHECKED, 1, 'PAUSE_SELECT');
		mainMenu.AppendMenuItem(middlePlayFlg ? MF_CHECKED : MF_UNCHECKED, 2, 'MIDDLE_PLAY');
		const elem = panel.getElement('setting');
		switch (mainMenu.TrackPopupMenu(elem.getPosition('left'), elem.getPosition('bottom'))) {
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
		const tieUp = encodeURIComponent(util.evalTitleFormat('%tie_up%', fb.GetNowPlaying()));
		switch (util.showPopupMenu(menus.search)) {
			case 1:
				util.openUrl(`https://www.google.com/search?q=${tieUp}`);
				break;
			case 2:
				util.openUrl(`http://anison.info/data/n.php?m=pro&q=${tieUp}`);
				break;
			case 3:
				util.openUrl(`https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/kensaku.php?category=game&word_category=name&word=${tieUp}`);
				break;
			case 4:
				util.openUrl(`https://ja.wikipedia.org/w/index.php?search=${tieUp}`);
				break;
		}
	},
	title: () => {
		const title = encodeURIComponent(util.evalTitleFormat('%title%', fb.GetNowPlaying()));
		switch (util.showPopupMenu(menus.search)) {
			case 1:
				util.openUrl(`https://www.google.com/search?q=${title}`);
				break;
			case 2:
				util.openUrl(`http://anison.info/data/n.php?m=song&q=${title}`);
				break;
			case 3:
				util.openUrl(`https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/kensaku.php?category=music&word_category=name&word=${title}`);
				break;
			case 4:
				util.openUrl(`https://ja.wikipedia.org/w/index.php?search=${title}`);
				break;
		}
	},
	artist: () => {
		const artist = encodeURIComponent(util.evalTitleFormat('%artist%', fb.GetNowPlaying()));
		switch (util.showPopupMenu(menus.search)) {
			case 1:
				util.openUrl(`https://www.google.com/search?q=${artist}`);
				break;
			case 2:
				util.openUrl(`http://anison.info/data/n.php?m=person&q=${artist}`);
				break;
			case 3:
				util.openUrl(`https://erogamescape.dyndns.org/~ap2/ero/toukei_kaiseki/kensaku.php?category=creater&word_category=name&word=${artist}`);
				break;
			case 4:
				util.openUrl(`https://ja.wikipedia.org/w/index.php?search=${artist}`);
				break;
		}
	}
};

const util = {
	// evalPosition: (coord) => {
	// 	return coord.map(v => {
	// 		if (typeof v !== 'string') {
	// 			return v;
	// 		}
	// 		const [id, edge, margin] = v.split(',');
	// 	});
	// },
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
		return ('0'.repeat(length) + val).slice(length * -1);
	},
	getJSON: (path) => {
		const text = utils.ReadTextFile(path, 65001);
		return text ? JSON.parse(text) : {};
	},
	evalTitleFormat: (query, handle) => {
		const tf = fb.TitleFormat(query);
		return handle ? tf.EvalWithMetadb(handle) : tf.Eval(true);
	},
	formatYearType: (year, type) => {
		const match = year.match(/^(\d{4})(\w+)$/);
		return match === null ? `${year}  ${type}` : `${match[1]}  ${match[2]}-${type}`;
	},
	calcMiddlePosition: (length) => {
		const match = middlePlayPos.match(/^(\d+)_(\d+)%$/);
		if (match === null) {
			return 0;
		}
		const from = parseInt(match[1], 10);
		const to = parseInt(match[2], 10);
		const percent = from + (to - from) * Math.random();
		return length * percent / 100;
	},
	truncate: (str, length) => {
		let count = 0;
		const chars = [];
		for (let i = 0; i < str.length; i++) {
			const char = str[i];
			count += Math.ceil(encodeURIComponent(char).length / 6);
			if (length < count) {
				break;
			}
			chars.push(char);
		}
		return chars.join('');
	},
	createMenus: () => {
		return {
			search: (() => {
				const menu = pWindow.CreatePopupMenu();
				menu.AppendMenuItem(MF_ENABLED, 1, 'Google');
				menu.AppendMenuItem(MF_ENABLED, 2, 'Anison Generation');
				menu.AppendMenuItem(MF_ENABLED, 3, 'ErogameScape');
				menu.AppendMenuItem(MF_ENABLED, 4, 'Wikipedia');
				return menu;
			})()
		};
	},
	showPopupMenu: (menu) => {
		return menu.TrackPopupMenu(...panel.getCursorPos());
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
		const elem = new ActiveXObject('MSXML2.DOMDocument').createElement('base64');
		elem.dataType = 'bin.base64';
		elem.nodeTypedValue = binaryData;
		return elem.text;
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

let pauseFlg = pWindow.GetProperty('PAUSE_SELECT', true);
let middlePlayFlg = pWindow.GetProperty('MIDDLE_PLAY', false);
let middlePlayPos = pWindow.GetProperty('MIDDLE_PLAY_POSITION', '10_90%');
let copyFormat = pWindow.GetProperty('COPY_FORMAT', '%title% / %artist%');
let screenName = pWindow.GetProperty('TWITTER_SCREEN_NAME', 'rana_intro');

const menus = util.createMenus();
const panel = new IntroPanel();
const twitter = new Twitter(screenName);

/* ↓ Callbacks ↓ */

function on_paint(gr) {
	// console.log('on_paint');
	panel.draw(gr);
}

function on_playback_new_track(handle) {
	panel.showPlaylistInfo();
	panel.onSongSelect(handle);
	panel.showTime();
	panel.repaint('select');
}

function on_playback_time(time) {
	panel.showTime();
	panel.repaint('time');
}

function on_playback_stop(reason) {
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

function on_mouse_lbtn_up(x, y, mask) {
	panel.clicked(x, y);
}

function on_mouse_move(x, y, mask) {
	panel.toggleCursor(x, y);
}

function on_mouse_wheel(step) {
	panel.onScroll(step);
}

function on_key_down(vkey) {
	console.log(`on_key_down: 0x${vkey.toString(16)}`);
	panel.onKeyPress(vkey);
}

function on_size(w, h) {
	panel.repaint('resize');
}
