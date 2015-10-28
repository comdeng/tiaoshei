(function(H){
	var 
	tb = function(info, callback){
		var ret = [], exists;
		H.array.each(info.images, function(i, s) {
			s = s.replace(/\_\d+x\d+\.(jpe?g|png|gif)/i, '');
			
			exists = false;
			H.array.each(ret, function(i, os) {
				if (os == s) {
					exists = true
					return false;
				}
			});
			if (!exists) {
				ret.push(s);
				callback(s);
			}
		});
	},
	imgLoader = {
		'360buy': function(info, callback) {
			if (info.line.item_host != 'book.360buy.com') {
				H.array.each(info.images, function(i, s) {
					if (s.indexOf('/n5/') > -1) {
						s = s.replace('/n5/', '/n0/')
						callback(s);
					}
				});
			} else {
				H.array.each(info.images, function(i, s){
					callback(s);
				})
			}
		},
		'tmall': tb,
		'taobao': tb,
		'okbuy': function(info, callback) {
			var item_id = info.item_id, reg = new RegExp('\/' + item_id + '_');
			H.array.each(info.images, function(i, s){
				if (reg.test(s)) {
					loadSrc(s);
				}
			});
		},
		'yihaodian': function(info, callback){
			var reg = /_\d+x\d+\./, ret = [], exists;
			H.array.each(info.images, function(i, s){
				if (!reg.test(s)) {
					return;
				}
				s = s.replace(reg, '.');
				exists = false;
				H.array.each(ret, function(i, os){
					if (os == s) {
						exists = true;
						return false;
					}
				})
				if (!exists) {
					ret.push(s);
					callback(s);
				}
			});
		},
		'dangdang': function(info, callback){
			var reg = new RegExp(info.item_id + '\\-\\d+_[av]\.jpg');
			H.array.each(info.images, function(i, s){
				if (reg.test(s)) {
					s = s.replace('_v.jpg', '_h.jpg');
					s = s.replace('_a.jpg', '_b.jpg');
					callback(s);
				}
			});
		},
		'paipai': function(info, callback) {
			var reg = new RegExp('\\b' + info.item_id + '\\.', 'i');
			H.array.each(info.images, function(i, s){
				var m = reg.exec(s);
				if (m) {
					s = s.replace(/\.jpg\.\d+\.jpg$/, '.300x300.jpg');
					callback(s);
				}
			});
		}
	}, 
	loadSrc = function(src, ul) {
		H.ui.load(src, function(){
			if (this.width > 140 && this.height > 140) {
				eImgList.append('<li><a><img src="' + this.src + '"/></a></li>');
			}
		});
	}, eImgList;
	hapj.set('my', {
		'addProductImgs': function(info, ul) {
			eImgList = ul;
			if (info.line.site_ename && info.line.site_ename in imgLoader) {
				imgLoader[info.line.site_ename].call(null, info, loadSrc);
			} else {
				H.array.each(info.images, function(i, s){
					loadSrc(s);
				});
			}
		}
	});
})(hapj);