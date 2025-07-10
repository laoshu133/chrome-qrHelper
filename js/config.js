/**
* QRHelper config
* @author admin@laoshu133.com
* @date   2014.02.26
*/
;(function(){
	var 
	QRHelper = globalThis.QRHelper = {
		config_key: 'qr_helper_config',
		_defaults: {
			qr_read_enabled: true
		},
		getConfig: function(name, callback){
			chrome.storage.local.get(this.config_key).then((result) => {
				let configs = result[this.config_key];
				if(!configs){
					this.setConfig(this._defaults, () => {
						chrome.storage.local.get(this.config_key).then((result) => {
							configs = result[this.config_key];
							if (callback) callback(name ? configs[name] : configs);
						});
					});
				} else {
					if (callback) callback(name ? configs[name] : configs);
				}
			});
		},
		setConfig: function(name, val, callback){
			chrome.storage.local.get(this.config_key).then((result) => {
				let configs = result[this.config_key];
				if(!configs){
					configs = {};
					for(var k in this._defaults){
						configs[k] = this._defaults[k];
					}
				}
				
				if(typeof name === 'object'){
					for(var k in name){
						configs[k] = name[k];
					}
				}
				else{
					configs[name] = val;
				}
				
				chrome.storage.local.set({[this.config_key]: configs}).then(() => {
					if(typeof importScripts === 'undefined'){
						// Not in service worker, send message to service worker
						chrome.runtime.sendMessage({type: 'configChanged'});
					} else {
						// In service worker, fire event directly
						this.fire('config');
					}
					if (callback) callback();
				});
			});
		},
		
		//getLang
		getLang: function(name){
			return chrome.i18n.getMessage(name);
		},

		//Events
		on: function(type, callback){
			var
			events = this._events || (this._events = {}),
			handlers = events[type] || (events[type] = []);
			if(typeof callback === 'function'){
				handlers.push(callback);
			}
			return this;
		},
		off: function(type, callback){
			var events;
			if(type && (events = this._events)){
				if(!callback){
					events[type] = [];
				}
				else{
					for(var i = events[type].length; i>=0; i--){
						if(callback === events[type][i]){
							events[type].splice(i, 1);
						}
					}
				}
			}
			return this;
		},
		fire: function(evtent, data){
			var evt = { target: this };
			if(typeof evtent === 'string'){
				evt.type = evtent;
			}
			else if(typeof evtent === 'object'){
				for(var k in evtent){
					evt[k] = evtent[k];
				}
			}
			
			if(!evt.type){ throw 'Param type error'; }

			var
			ops = this.ops,
			events = this._events || {},
			handlers = [].concat(events[evt.type] || []);
			if(handlers.length > 0){
				for(var i = 0,len=handlers.length; i<len; i++){
					if(handlers[i].call(this, evt, data) === false){
						return;
					}
				}
			}
		}
	};
})();