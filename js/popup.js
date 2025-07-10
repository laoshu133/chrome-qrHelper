/**
* 读取页面URL 创建二维码
* @author admin@laoshu133.com
* @date   2015.03.20
*
* @dep https://github.com/jeromeetienne/jquery-qrcode
*/

Zepto(function($) {
	var qrPanel = $('#qr_panel');
	var qrIcon = $('#qr_icon');

	chrome.tabs.query({active: true, currentWindow: true}).then(function(tabs) {
		var tab = tabs[0];

		qrPanel.qrcode({
			render: 'canvas',
			text: tab.url,
			height: 200,
			width: 200
		});

		if(tab.favIconUrl && tab.favIconUrl.indexOf('chrome://theme') !== 0){
			qrIcon.css('backgroundImage', 'url('+ tab.favIconUrl +')').show();
		}

		setTimeout(function() {
			qrPanel.addClass('active');
		}, 0);
	});
});
