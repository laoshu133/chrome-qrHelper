/**
* 根据图片解析 二维码
* @author admin@laoshu133.com
* @date   2015.03.20
*
* @dep https://github.com/LazarSoft/jsqrcode
*/

// Import dependencies for service worker
importScripts('./jsqrcode.js', './config.js');

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === 'configChanged') {
		QRHelper.fire('config');
	}
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId === 'qr_read_context_menu') {
		showLoading();

		qrcode.decode(info.srcUrl, function(text, data){
			setClipboard(text);
			hideLoading();

			var rurl = /^(?:https?|ftp|file|chrome):\/\/\w+/i;
			if(rurl.test(text)){
				chrome.tabs.create({ url:text });
			}
			else{
				alert(QRHelper.getLang('read_qr_txt_tips') +'\n\n' + text + '');
			}
		}, function(code, msg){
			hideLoading();
			alert(msg);
		});
	}
});

;(function(){
	QRHelper.on('config', function(){
		updateConfig();
	});
	updateConfig();

	function updateConfig(configs){
		QRHelper.getConfig(null, (configs) => {
			removeContextMenu();
			if(configs['qr_read_enabled']){
				addContextMenu();
			}
		});
	}

	function addContextMenu(){
		chrome.contextMenus.create({
			id: 'qr_read_context_menu',
			type: 'normal',
			contexts: ['image'],
			title: QRHelper.getLang('read_qr_title')
		});
	}

	function removeContextMenu(){
		chrome.contextMenus.removeAll();
	}

	function setClipboard(text){
		// Use the new clipboard API for service workers
		chrome.action.setBadgeText({ text: '✓' });
		setTimeout(() => {
			chrome.action.setBadgeText({ text: '' });
		}, 1000);
		
		// Copy to clipboard using chrome.scripting API
		chrome.tabs.query({active: true, currentWindow: true}).then(tabs => {
			if (tabs[0]) {
				chrome.scripting.executeScript({
					target: { tabId: tabs[0].id },
					func: (textToCopy) => {
						navigator.clipboard.writeText(textToCopy);
					},
					args: [text]
				});
			}
		});
	}

	function showLoading(){
		var count = 4, currInx = showLoading.currInx || 0;
		var txt = new Array(currInx+1).join('.') + new Array(count-currInx+1).join(' ');
		chrome.action.setBadgeText({ text:txt });

		showLoading.timer = setTimeout(showLoading, 400);
		showLoading.currInx = ++currInx % count;
	}

	function hideLoading(){
		clearTimeout(showLoading.timer);
		chrome.action.setBadgeText({ text:'' });
	}
})();



/**
* qrcode, online
*
* @deprecated http://tool.oschina.net/action/qrcode/decode
*
*/
;(function(){
	var qrcode = self.qrcode;

	var _decode = qrcode.decode;
	qrcode.decode = function(url, onsuccess, onerror) {
		qrcode.callback = function(msg) {
			var errMsg = '';
			var hasErr = false;

			if(msg && msg.indexOf('error decoding') > -1) {
				hasErr = true;
				errMsg = msg;
			}

			if(hasErr) {
				onerror && onerror(3, QRHelper.getLang('read_qr_error_2') + '\n' + errMsg);
				return;
			}

			if(onsuccess) {
				onsuccess(msg);
			}
		};

		_decode.call(qrcode, url);
	};

	// // deprecated
	// // http://tool.oschina.net/action/qrcode/decode
	// var qrcode = {
	// 	decodeUrl: 'http://tool.oschina.net/action/qrcode/decode',
	// 	decode: function(url, success, error){
	// 		var self = this;
	// 		this.loadImageByXHR(url, function(blob, xhr){
	// 			self.decodeByFile(blob, success, error);
	// 		}, function(){
	// 			self.throwError(1, error);
	// 		});
	// 	},
	// 	decodeByFile: function(blob, success, error){
	// 		var
	// 		self = this,
	// 		formData = new FormData(),
	// 		xhr = new XMLHttpRequest();

	// 		xhr.onload = function(){
	// 			var data;
	// 			try{
	// 				data = JSON.parse(xhr.responseText);
	// 			}
	// 			catch(_){
	// 				self.throwError(2, error);
	// 				return;
	// 			}

	// 			if(data && data[0] && data[0].text){
	// 				success && success(data[0].text, data[0]);
	// 			}
	// 			else{
	// 				self.throwError(3, error);
	// 			}
	// 		};
	// 		xhr.onerror = function(){
	// 			self.throwError(2, error);
	// 		};

	// 		formData.append('qrcode', blob);
	// 		xhr.open('POST', this.decodeUrl, true);
	// 		xhr.send(formData);
	// 	},
	// 	loadImageByXHR: function(url, success, error){
	// 		var xhr = new XMLHttpRequest();
	// 		xhr.responseType = 'blob';
	// 		xhr.onload = function(){
	// 			success && success(xhr.response, xhr);
	// 		};
	// 		xhr.onerror = function(){
	// 			error && error(xhr);
	// 		};
	// 		xhr.open('GET', url, true);
	// 		xhr.send(null);
	// 	},
	// 	loadImage: function(url, success, error){
	// 		console.log(url);
	// 		var img = new Image();
	// 		img.onload = function(){
	// 			img.onload = img.onerror = null;

	// 			success && success(img.url, img);
	// 		};
	// 		img.onerror = function(){
	// 			img.onload = img.onerror = null;

	// 			error && error();
	// 		}
	// 		img.src = url;
	// 	},
	// 	throwError: function(code, callback){
	// 		var errMsgs = [
	// 			QRHelper.getLang('read_qr_error_0'),
	// 			QRHelper.getLang('read_qr_error_1'),
	// 			QRHelper.getLang('read_qr_error_2')
	// 		];

	// 		callback && callback(code, errMsgs[code - 1]);
	// 	}
	// };

	self.qrcode = qrcode;
})();