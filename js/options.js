Zepto(function($){
	QRHelper.getConfig(null, (configs) => {
		for(var k in configs){
			var elem = $('#' + k)[0];
			if(elem && elem.type === 'checkbox' || elem.type === 'radio'){
				elem.checked = !!configs[k];
			}
			else if(elem){
				elem.value = configs[k];
			}
		}
	});

	function setConfig(elem){
		var val = elem.value;
		if(elem.type === 'checkbox' || elem.type === 'radio'){
			val = elem.checked;
		}

		QRHelper.setConfig(elem.id, val);
	}
	
	$('#content').delegate('input', 'change input', function(){
		setConfig(this);
	});
});