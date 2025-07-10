/**
 * Content script for QR code decoding
 * This runs in the page context where DOM APIs are available
 */

// Prevent multiple injections
if (!window.qrHelperContentScript) {
	window.qrHelperContentScript = true;

	// Listen for messages from background script
	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === 'showAlert') {
			alert(message.message);
		} else if (message.type === 'decodeQR') {
			decodeQRFromImage(message.imageUrl).then(result => {
				sendResponse(result);
			}).catch(error => {
				sendResponse({ success: false, error: error.message });
			});
			return true; // Keep message channel open for async response
		}
	});

	// QR code decoding function that runs in page context
	function decodeQRFromImage(imageUrl) {
		return new Promise((resolve) => {
			try {
				const img = new Image();
				img.crossOrigin = 'anonymous';
				
				img.onload = function() {
					try {
						const canvas = document.createElement('canvas');
						const ctx = canvas.getContext('2d');
						canvas.width = img.width;
						canvas.height = img.height;
						ctx.drawImage(img, 0, 0);
						
						// Use jsqrcode library if available globally
						if (typeof qrcode !== 'undefined' && qrcode.decode) {
							// Set up callback for qrcode library
							qrcode.callback = function(result) {
								if (result && typeof result === 'string' && !result.includes('error')) {
									resolve({ success: true, text: result });
								} else {
									resolve({ success: false, error: 'QR decode failed: ' + result });
								}
							};
							
							try {
								// Decode using canvas data URL
								qrcode.decode(canvas.toDataURL());
							} catch (e) {
								resolve({ success: false, error: 'QR decode error: ' + e.message });
							}
						} else {
							resolve({ success: false, error: 'QR decoding library not available' });
						}
					} catch (e) {
						resolve({ success: false, error: 'Failed to process image: ' + e.message });
					}
				};
				
				img.onerror = function() {
					resolve({ success: false, error: 'Failed to load image' });
				};
				
				img.src = imageUrl;
			} catch (e) {
				resolve({ success: false, error: 'Error: ' + e.message });
			}
		});
	}
}