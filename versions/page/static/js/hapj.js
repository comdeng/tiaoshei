/************************----------hapj.js-------------************************************/

/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2011-12-30
 * @version 2.0 
 * @brief HapJ框架的内核代码 0.2
 **/
if (window.hapj) {
	window._hapj = window.hapj;
}	

/**
 * hapj核心代码
 */
(function(){
	var _filters = {};

	//核心执行函数
	window.hapj = function(closure, wait4load){
		if (undefined === wait4load) {
			wait4load = true;
		}
		if (typeof closure != 'function') {
			var f = hapj.hook.get('hapj.closure');
			if (f) {
				closure = f.call(f, closure);
			}
		}
		if (typeof closure != 'function') {
			throw new Error('hapj.u_closureTypeError');
		}
		if (!('__dom_is_ready' in hapj) || !wait4load) {
			return closure.call(hapj.__modules, hapj, window.jQuery);
		}
		hapj.hook.set('dom.ready', closure);
	};
	
	hapj.__version = 0.2;
	hapj.__dom_is_ready = false;
	hapj.__modules = null;
	
	// hapj0.2的新核心功能：钩子
	hapj.hook = {
		set:function(name, filter) {
			if (!(name in _filters)) {
				_filters[name] = [];
			}
			_filters[name].push(filter);
		},
		get: function(name) {
			if (!(name in _filters)) {
				return null;
			}
			return _filters[name][0];
		},
		gets: function(name) {
			if (!name in _filters) {
				return [];
			}
			return _filters[name];
		},
		remove: function(name) {
			if (name in _filters) {
				delete _filters[name];
			}
		}
	};
})();

// lib
hapj.lib = {};
hapj.ext = {};

// 兼容性函数
(function(){
	var ts = Object.prototype.toString;
	hapj.string = {
		/**
	  	 * 返回去掉前后空格的字符串
	  	 * @
	  	 */
	  	trim: function(str) {
	  		return str ? str.replace(/^\s+|\s+$/, '') : '';
	  	},
		rtrim: function(str) {
			return str ? str.replace(/\s+$/, '') : '';
		},
		ltrim: function(str) {
			return str ? str.replace(/^\s+/, '') : '';
		},
		toMd5: function(from) {
			return hapj.lib.serial.toString(from, 'md5');
		},
		toJson: function(from) {
			return hapj.lib.serial.toString(from, 'json');
		},
		toParam: function(from) {
			return hapj.lib.serial.getPair(from);
		}
	};
	hapj.array = {
		isArray: function(arr) {
			return ts.call(arr) == '[object Array]';
		},
		each:function(obj, func, me) {
			for(var i = 0, l = obj.length; i < l; i++) {
				if (obj[i] === null) continue;
				if (func.call(me || obj[i], i, obj[i]) === false) {
					break;
				}
			}
		},
		/**
		 * 合并两个数组，将arr2合并到arr1
		 * @param {Array} arr1
		 * @param {Array} arr2
		 */
		merge: function(arr1, arr2) {
			for(var i = 0, l = arr2.length; i < l; i++) {
				arr1.push(arr2[i]);
			}
			return arr1;
		}
	};
	hapj.object = {
		/**
		 * a是否包含属性b
		 * @param {Object} a
		 * @param {Object} b
		 */
		has: function(a, b) {
			return a.hasOwnProperty(b);
		},
		each: function(obj, func, me){
			for (var k in obj) {
				if (!this.has(obj, k) || obj[k] === null) continue;
				if (func.call(me || obj[k], k, obj[k]) === false) {
					break;
				}
			}
		},
		extend: function(a, b) {
			if (typeof a == 'undefined') {
				a = {};
			}
			for(var k in b) {
				a[k] = b[k];
			}
			return a;
		},
		/**
		 * 转化为参数形式
		 * @param {Object}
		 */
		toString: function(from) {
			return hapj.lib.serial.toString(from, 'pair');
		}
	};
	
	// json
	hapj.json = {
		encode: function(from) {
			return hapj.lib.serial.toString(from, 'json');
		},
		decode: function(from) {
			return hapj.lib.serial.getJson(from);
		}
	}
	
	hapj.isArray = hapj.array.isArray;
	hapj.extend = hapj.object.extend;
	hapj.trim = hapj.string.trim;
	
	hapj.each = function(obj, func, me) {
		if (!obj) return;
		if ('length' in obj) {
			return hapj.array.each(obj, func, me);
		} else {
			return hapj.object.each(obj, func, me);
		}
	};
	
	var ps,cs;
	hapj.page = {
		/**
		 * 获取页面url参数
		 * @param {String} key
		 */
		getParam: function(key) {
			if (!ps) {
				ps = hapj.page.getParams();
			} 
			return ps[key];
		},
		/**
		 * 获取所有网页参数
		 */
		getParams:function(){
			return ps ? ps : (ps = hapj.lib.serial.getPair(location.search ? location.search.substr(1) : ''));
		},
		/**
		 * 设置cookie值
		 * @param {String} key
		 * @param {String} value
		 * @param {Date | Number} expire
		 * @param {String} path
		 * @param {String} domain
		 * @param {Boolean} secure
		 */
		setCookie: function(key, value, expire, path, domain, secure) {
			document.cookie = hapj.lib.serial.toString({
				name: key,
				value: value,
				expires: expire,
				path: path,
				domain: domain,
				secure: secure
			}, 'cookie');
		},
		/**
		 * 获取cookie值
		 * @param {String} key
		 */
		getCookie: function(key) {
			if (!cs) {
				cs = hapj.page.getCookies();
			}
			return cs[key];
		},
		getCookies: function() {
			return cs ? cs : (cs = hapj.lib.serial.getCookie(document.cookie));
		}
	};
})();

// hapjId
(function(){
	var _hapjIdCount = 0,_hapjId;
	/**
	 * 获取或设置hapjId，注意，同一个页面只能设置一次，后面的设置不再起作用
	 * @param {String} id
	 * @return {String} hapjId
	 */
	hapj.id = function(id) {
		if (id && _hapjIdCount == 0) {
			_hapjId = id;
			_hapjIdCount++;
		}
		if (!_hapjId) {
			_hapjId = new Date().getTime()*1000 + parseInt(Math.random()*899 + 100);
		}
		return _hapjId;
	};
})();

// module 机制
(function(){
	var _modules = {};
	/**
	 * 获取模块
	 * @param {String} moduleName
	 */
	hapj.get = function(moduleName){
		return hapj.object.has(_modules, moduleName) ? _modules[moduleName] : null;
	};
	/**
	 * 设置模块
	 * @param {String} moduleName 必须是以字母开头，后面是字母数字或者.、_。
	 * @param {Function} module 必须是函数
	 * @return hapj
	 */
	hapj.set = function(moduleName, module) {
		if (!moduleName || !/[a-z][a-z0-9\._]+/i.test(moduleName)) {
			throw new Error('hapj.u_wrongModuleNameFormat moduleName=' + moduleName);
		}
		var type = typeof module;
		if (type != 'function' && type != 'object' ) {
			throw new Error('hapj.u_wrongModuleType type=' + type);
		}
		var parent = _modules;
		
		var nss = moduleName.split('.'), ns;
		while(nss.length > 1) {
			ns = nss.shift();
			if (!hapj.object.has(_modules, ns)) {
				parent = parent[ns] = function(){};
			} else {
				parent = parent[ns];
			}
		}
		ns = nss.shift();
		parent[ns] = module;
	};
	hapj.__modules = _modules;
})();

// 基本错误处理逻辑
(function(){
	var _we = window.onerror;
	onerror = function(msg, url, line) {
		if (line == 0) return;
		if (_we) {
			_we.call(null, msg, url, line);
		}
		var fs = hapj.hook.gets('hapj.error');
		hapj.each(fs, function(){
			this.call(null, msg, url, line);
		});
	}
})();

// 浏览器
(function(){
	/**
	 * 浏览器属性
	 */
	hapj.browser = (function(){
		var ua = navigator.userAgent.toLowerCase(),
		rwebkit = /(webkit)[ \/]([\w.]+)/,
		ropera = /(opera)(?:.*version)?[ \/]([\w.]+)/,
		rmsie = /(msie) ([\w.]+)/,
		rmozilla = /(mozilla)(?:.*? rv:([\w.]+))?/,
		match = rwebkit.exec( ua ) ||
			ropera.exec( ua ) ||
			rmsie.exec( ua ) ||
			ua.indexOf('compatible') < 0 && rmozilla.exec( ua ) ||
			[];
		return { type: match[1] || '', version: match[2] || '0', mobile: /(MIDP|WAP|UP\.Browser|Smartphone|Obigo|AU\.Browser|wxd\.Mms|WxdB\.Browser|CLDC|UP\.Link|KM\.Browser|UCWEB|SEMC\-Browser|Mini|Symbian|Palm|Nokia|Panasonic|MOT|SonyEricsson|NEC|Alcatel|Ericsson|BENQ|BenQ|Amoisonic|Amoi|Capitel|PHILIPS|SAMSUNG|Lenovo|Mitsu|Motorola|SHARP|WAPPER|LG|EG900|CECT|Compal|kejian|Bird|BIRD|G900\/V1\.0|Arima|CTL|TDG|Daxian|DAXIAN|DBTEL|Eastcom|EASTCOM|PANTECH|Dopod|Haier|HAIER|KONKA|KEJIAN|LENOVO|Soutec|SOUTEC|SAGEM|SEC|SED|EMOL|INNO55|ZTE|iPhone|Android|Windows CE|BlackBerry)/i.test(navigator.userAgent) };
	})();
	
	if (hapj.browser.mobile) {
		// 增加异步，保证能通过hook读取到内容
		setTimeout(function(){
			if (hapj.hook.get('browser.mobile')) {
				hapj.hook.get('browser.mobile').call();
			}
		}, 0);
	}
})();

/**
 * hapj 日志
 */
(function(_d){
	var _img,
	_en = encodeURIComponent,
	_firebug = (window['console'] && window['console']['trace']),
	toString = function(msg, encode) {
		if (undefined === encode) {
			encode = true;
		}
		if (typeof msg == 'object') {
			var ret = [];
			for(var p in msg) {
				ret.push(p + '=' + (encode ? _en(msg[p]) : msg[p])); 
			}
			return ret.join('&');
		}
		return msg;
	},
	_vdn,
	_vdd = {},
	_vdc = 0,
	_vdlu = location.href,
	_vdf = function(){
		var ext = hapj.get('ext');
		if (!ext || !ext.jsDecoder) {
			setTimeout(_vdf, 1000);
			return;
		}
		
		var n = hapj.ui._node('li'),code = ext.jsDecoder(hapj.lib.serial.toString(_vdd, 'json'), 4, '\t'), 
			jsc = new ext.jsColorizer();
		jsc.s = code;
		code = jsc.colorize();
		n.innerHTML = code.replace(/\n/g, '<br/>').replace(/\t/g, '&nbsp;');
		if (_vdn.lastChild.firstChild) {
			_vdn.lastChild.insertBefore(n, _vdn.lastChild.firstChild);
		} else {
			_vdn.lastChild.appendChild(n);
		}
		if (!this.hasAppend) {
			this.hasAppend = true;
			if (!_d.body) {
				setTimeout(function(){
					_d.body.appendChild(_vdn);
				}, 1000);
			} else {
				_d.body.appendChild(_vdn);
			}
		}
	}
	;
	hapj.log = {
		DEVELOP_MODE:1, // 开发模式
		ONLINE_MODE: 2, // 在线模式
		mode: this.DEVELOP_MODE,
		url : '',
		server: function(msg){
			if (!this.url) {
				return this.warn('hapj.log.server url is not defined');
			}
			var self = hapj.log;
			
			hapj(function(){
				if (!_img) {
					_img = hapj.ui._node('img', {width:0, height:0, style:'position:absolute;left:-999px;top:-999px;'});
					document.body.appendChild(_img);
				}
				_img.setAttribute('src', self.url + '?' + msg.toString());
			}, true);
		},
		/**
		 * 用于调试后台的程序
		 * @param {Object} obj
		 */
		var_dump:function(obj, fromUrl){
			if (this.mode != this.DEVELOP_MODE) {
				return;
			}
			// 如果有父窗口，则使用父窗口进行debug
			if (window.parent != window && window.parent.hapj) {
				return window.parent.hapj.log.var_dump(obj, location.href);
			}
	
			if (fromUrl && fromUrl != _vdlu) {
				_vdlu = fromUrl;
				_vdd = {};
			}			
			hapj.object.extend(_vdd, obj);
			
			if (!_vdn) {
				_vdn = hapj.ui._node('div');
				var css = {
					position: 'fixed',
					right: 0,
					bottom: 0,
					width: '500px',
					height: '500px',
					border: 'dotted 1px #999',
					background: '#FFF',
					opacity: '0.95',
					filter: 'Opacity(Alpha=95)',
					fontSize: '12px',
					fontFamily: 'Courier New',
					color: '#000'
				};
				_vdn.innerHTML = '<h3 style="height:20px;font-size:16px;background:yellow;text-align:center;font-weight:bold;">hapj.log.var_debug(双击缩小，再双击还原)</h3><ol style="overflow:auto;height:480px;"></ol>';
				for (var i in css) {
					_vdn['style'][i] = css[i];
				}
				_vdn.ondblclick = function(){
					if (_vdn.style.height == '20px') {
						_vdn.style.height = '500px';
					}
					else {
						_vdn.style.height = '20px';
					}
				};
				hapj.ui.load('http://' + hapj.staticHost + '/static/js/ext/jsdebug.js', _vdf);
			} else {
				_vdf();
			}
		}
	};
	if (_firebug) {
		hapj.object.extend(hapj.log, {
			debug: function(msg){
				if (this.mode != this.ONLINE_MODE) {
					console.log.apply(console, arguments);
				}
			},
			warn: function(msg) {
				if (this.mode != this.ONLINE_MODE) {
					console.warn.apply(console, arguments);
				}
			},
			error: function(msg) {
				if (this.url) {
					this.server(toString(msg));
				}
				if (this.mode != this.ONLINE_MODE) {
					console.error.apply(console, arguments);
					alert(toString(msg, false));
				}
			}
		});
	} else {
		var log,getElem = function(){
			if (!log) {
				var node = hapj.ui._node('textarea', {'style':'position:absolute;top:0;right:0;width:400px;height:200px;font-size:12px;font-family:verdana;padding:2px;border:solid 1px #FF0;background:#FFF;z-index:9999;'});
				_d.body.appendChild(node);
				log = node;
			}
			return log;
		}, getTime = function() {
			var now = new Date();
			return '[' + [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-') + ' ' + [now.getHours(),now.getMinutes(),now.getSeconds()].join(':') + ']';
		}, showMsg = function(msg, type) {
			H(function(){
				var el = getElem();
				el.value += (getTime() + ' ' + type + ' ' + decodeURIComponent(msg) + "\n");
			}, true);
		};
		hapj.object.extend(hapj.log, {
			debug: function(msg) {
				if (this.mode != this.ONLINE_MODE) {
					showMsg(toString(msg), 'DEBUG');
				}
			},
			warn: function(msg) {
				if (this.mode != this.ONLINE_MODE) {
					showMsg(toString(msg), 'WARN');
				}
			},
			error: function(msg) {
				var m = toString(msg, false);
				if (typeof msg == 'string') {
					msg = 'msg=' + _en(msg);
				} else {
					msg = m;
				}
				if (this.url) {
					this.server(msg);
				}
				if (this.mode != this.ONLINE_MODE) {
					showMsg(m, 'ERROR');
					alert(m);
				}
			}
		});
	}
})(document);

// hapj conf 配置
(function(undefined){
	var option = {};
	hapj.conf = {
		// 设置选项，如果有，则会覆盖
		set:function(key, value) {
			if (undefined === value && typeof key == 'object') {
				hapj.object.each(key, function(k, v){
					option[k] = v;
				})
			} else {
				option[key] = value;
			}
		},
		// 获取选项
		get:function(key, def) {
			if (hapj.object.has(option, key)) {
				return option[key];
			}
			if (undefined === def) {
				def = null;
			}
			return def;
		},
		/**
		 * 更新配置项中的值（慎用）
		 * @param {Object} key
		 * @param {Object} prefix
		 * @param {Object} value
		 */
		update: function(key, prefix, value) {
			if (!key in option) {
				return;
			}
			var o = option[key], ns = prefix.split('.'), n = ns.shift(), exp = 'option["' + key + '"]';
			while(n) {
				if (!(n in o)) return;
				o = o[n];
				exp += '["' + n + '"]';
				n = ns.shift();
			}
			if (o) {
				exp += ' = ' + value;
				eval(exp);
			}
		},
		// 删除指定选项
		remove:function(key) {
			if (hapj.object.has(option, key)) {
				delete option[key];
			}
		},
		// 获取所有
		all:function() {
			return option;
		}
	};
})();

// hapj ui 基本查询方法
(function(_d){
	var _A = hapj.array,_c = _d.getElementsByClassName ? function(cls, ctx){
		ctx = ctx || _d;
		return ctx.getElementsByClassName(cls);
	} : function(cls, ctx){
		ctx = ctx || _d;
		var ae = ctx.getElementsByTagName('*'),es = [], ce = new RegExp('(^|\s)' + cls + '(\s|$)');
		hapj.array.each(ae, function(i, s){
			if (ce.test(s.className)) {
				es.push(s);
			}
		});
		return es;
	},
	// 节点加载完后回调
	_nodeCallback = function(node, callback) {
		if (typeof node == 'string') {
			var img = new Image();
			if (typeof arguments[2] == 'funtion') {
				img.onerror = arguments[2];
			}
			img.src = node;
			if (img.complete) {
				return callback.call(img);
			}
			img.onload = function() {
				callback.call(this);
				img.onload = null;
				img.onerror && (img.onerror = null);
			};
		}
		switch(node.nodeName) {
			case 'SCRIPT':
				node.onload = node.onreadystatechange = function() {
					if( !this.readyState || this.readyState == 'loaded' || this.readyState=='complete') {
						(typeof callback == 'function') && callback.call(null);
					}
				}
				break;
		}
	},
	_head = _d.getElementsByTagName('head')[0],
	getDomNode = function(node, func, tagName) {
		var t = node[func];
		if (!tagName) {
			while(t && !t.tagName) {
				t = t[func];
			}
		} else {
			tagName = tagName.toUpperCase();
			while(t && t.tagName != tagName) {
				t = t[func];
			}
			if (!t || t.tagName != tagName) {
				t = null;
			}
		}
		return t;
	}
	;
	
	/**
	 * 获取静态文件的host
	 */
	hapj.staticHost = (function(){
		var host = '',ss = _d.getElementsByTagName('script');
		for(var i = 0, l = ss.length; i < l; i++){
			var s = ss[i];
			if (!s.src) continue;
			if (/\/hapj\./.test(s.src)) {
				if (s.src.indexOf('http://') != 0) {
					return location.host;
				}
				return /^http\:\/\/([^\/]+)\//.exec(s.src)[1];
			}
		}
		return location.host;
	})();
	
	hapj.ui = function(selector){
		if (typeof selector == 'string') {
			switch (selector.charAt(0)) {
				case '#':
					return hapj.ui.id(selector.substring(1));
				case '.':
					return hapj.ui.cls(selector.substring(1));
				default:
					return hapj.ui.tag(selector);
			}
		}
		return hapj.ui.elem(selector);
	};
	
	hapj.object.extend(hapj.ui, {
		isDom: function(obj) {
			return typeof obj == 'object' && obj.nodeType == 1;
		},
		isDoc: function(obj) {
			return typeof obj == 'object' && obj.nodeType == 9;
		},
		/**
		 * 返回指定元素的集合
		 * @param {Object} elem
		 * @return hapj.ui.node
		 */
		elem: function(elem) {
			if (elem) {
				var node = new hapj.ui.node();
				if (elem === window || elem == _d) {
					node.push(elem);
				} else if (elem.nodeName) {
					node.push(elem);
				} else if ('length' in elem) {
					node.concat(elem);
				}
				return node;
			}
			return null;
		},
		/**
		 * 返回指定的id元素的集合
		 * @param {String} id
		 */
		id: function(id) {
			var node = new hapj.ui.node();
			var elem = this._id(id);
			if (elem) {
				node.push(elem);
			}
			return node;
		},
		/**
		 * 返回指定的类别的元素集合
		 * @param {String} cls
		 * @param {Dom} ctx
		 */
		cls: function(cls, ctx) {
			var node = new hapj.ui.node();
			return node.concat(this._cls(cls, ctx));
		},
		/**
		 * 返回指定的tag元素的集合
		 * @param {String} tag
		 * @param {Dom} ctx
		 */
		tag: function(tag, ctx) {
			var node = new hapj.ui.node();
			return node.concat(this._tag(tag, ctx));
		},
		/**
		 * 返回指定的id的元素的DOM节点
		 * @param {String} id
		 */
		_id: function(id) {
			return _d.getElementById(id);
		},
		/**
		 * 返回指定的tag的元素的DOM节点
		 * @param {String} tag
		 * @param {Dom} ctx
		 */
		_tag: function(tag, ctx) {
			ctx = ctx || _d;
			return ctx.getElementsByTagName(tag);
		},
		/**
		 * 返回指定的类别的元素的DOM节点
		 * @param {String} cls
		 * @param {String | Array | Dom} ctx 
		 */
		_cls: _c,
		/**
		 * a 是否包含 b
		 * @param {Dom} a
		 * @param {Dom} b
		 */
		contains: (function() {
			if (_d.documentElement.contains) {
				return function(a, b) {
					return a !== b && (a.contains ? a.contains(b) : true);
				}
			} else if (__d.documentElement.compareDocumentPosition) {
				return function(a, b) {
					return !!(a.compareDocumentPosition(b) & 16);
				}
			} else {
				return function() {
					return false;
				}
			}
		})(),
		/**
		 * 创建节点
		 * @param {Object} name
		 * @param {Object} attr
		 */
		_node: function(name, attr) {
			var node = _d.createElement(name);
			for(var i in attr) {
				if (i && hapj.object.has(attr, i)) {
					if (i == 'class'){
						node.className = attr[i];
					}else{
						node.setAttribute(i, attr[i]);
					}
				}
			}
			return node;
		},
		/**
		 * 载入url
		 * @param {String} url
		 * @param {Function} callback
		 */
		load:function(url, callback) {
			var matches, type, node;
			if (!(matches = /.+\.([a-z0-9]+)(?:\?\d*|$)/i.exec(url)) ) {
				throw new Error('ui.u_wrongUrlFormat');
			}
			if (url.charAt(0) == '/') {
				url = 'http://' + hapj.staticHost + url;
			}
			type = matches[1].toLowerCase();
			switch(type) {
				case 'js':
					var attrs = {type:'text/javascript', src:url, defer: true};
					if (arguments.length > 2 && typeof arguments[2] == 'object') {
						hapj.object.extend(attrs, arguments[2]);
					}
					node = hapj.ui._node('script', attrs);
					_nodeCallback(node, callback);
					_head.appendChild(node);
					break;
				case 'css':
					node = hapj.ui._node('link', {rel:'stylesheet', type: 'text/css', href: url});
					_head.appendChild(node);
					break;
				case 'jpg':
				case 'jpeg':
				case 'bmp':
				case 'gif':
				case 'png':
					_nodeCallback(url, callback, typeof arguments[2] == 'function' ? arguments[2] : null);
					break;
				default:
					hapj.log.warn('this type(' + type + ') is not supported now.');
					break;
			}
			return node;
		}
	});
	
	hapj.ui.node = function() {
		this.length = 0;
	};
	hapj.ui.fn = hapj.ui.node.prototype, ap = Array.prototype;
	hapj.object.extend(hapj.ui.fn, {
		/**
		 * 添加一个元素节点
		 * @param {Object} node
		 */
		push: function(elem) {
			ap.push.call(this, elem);
			return this;
		},
		/**
		 * 将当前node对象的元素和另外一组节点组合
		 * @param {Object} node
		 */
		concat: function(elems) {
			_A.each(elems, function(i,s){
				ap.push.call(this, s);
			}, this);
			return this;
		},
		/**
		 * 循环每一个元素节点
		 * @param {Object} func
		 */
		each: function(func) {
			_A.each(this, func);
			return this;
		},
		/**
		 * 返回某元素内指定标签的元素
		 * @param {String} tag 
		 * @return hapj.ui.node
		 */
		tag: function(tag) {
			var ret = new hapj.ui.node();
			this.each(function(){
				ret.concat(hapj.ui.tag(tag, this));
			});
			return ret;
		},
		/**
		 * 返回某元素内指定类别的元素
		 * @param {String} cls
		 * @return hapj.ui.node
		 */
		cls: function(cls) {
			var ret = new hapj.ui.node();
			this.each(function(){
				ret.concat(hapj.ui.cls(cls, this));
			});
			return ret;
		},
		/**
		 * 返回元素的子元素
		 * @param {String} tag 子节点中的元素，如果指定，则返回子节点中的tagName为tag的元素
		 * @return hapj.ui.node
		 */
		childs:function(tag){
			var ret = new hapj.ui.node();
			tag = (tag || '').toUpperCase();
			this.each(function(){
				var childs = this.childNodes;
				for (var i = 0, l = childs.length; i < l; i++) {
					if (undefined === childs[i].tagName) 
						continue;
					if (!tag || childs[i].tagName == tag) {
						ret.push(childs[i]);
					}
				}
			});
			return ret;
		},
		/**
		 * 下一个元素
		 * @param {String} tag
		 */
		next: function(tag) {
			var node = new hapj.ui.node();
			this.each(function(){
				node.push(getDomNode(this, 'nextSibling', tag));
			});
			return node;
		},
		/**
		 * 上一个元素
		 * @param {String} tag
		 */
		prev: function(tag) {
			var node = new hapj.ui.node();
			this.each(function(){
				node.push(getDomNode(this, 'previousSibling', tag));
			});
			return node;
		},
		/**
		 * 父元素
		 * @param {Object} tag
		 */
		parent: function(tag) {
			var node = new hapj.ui.node();
			this.each(function(){
				node.push(getDomNode(this, 'parentNode', tag));
			});
			return node;
		}
	});
	
	hapj.load = hapj.ui.load;
})(document);

// hapj ui 样式处理
(function(_w, _d, undefined){
	var body = _d.compatMode == 'BackCompat' ? _d.body : _d.documentElement,
		/**
	 * 将html封装成节点，以数组形式返回
	 * @param {Object} html
	 */
	wrapHtml = function(html) {
		var ms = rtagName.exec(html), elems = [], depth = 0,div = hapj.ui._node('div');
		if (ms && ms[1] && wrapMap[ms[1]]) {
			var wrap = wrapMap[ms[1]];
			html = wrap[1] + html + wrap[2];
			depth = wrap[0];
		}
		div.innerHTML = html;
		while(depth--) {
			div = div.lastChild;
		}
		hapj.array.each(div.childNodes, function(){
			if (this.nodeName) {
				elems.push(this);
			}
		});
		return elems;
	},
	rCRLF = /\r?\n/g,
	rtagName = /<([\w:]+)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g,
	wrapMap = {
		option: [ 1, '<select multiple="multiple">', '</select>' ],
		legend: [ 1, '<fieldset>', '</fieldset>' ],
		thead: [ 1, '<table>', '</table>' ],
		tr: [ 2, '<table><tbody>', '</tbody></table>' ],
		td: [ 3, '<table><tbody><tr>', '</tr></tbody></table>' ],
		col: [ 2, '<table><tbody></tbody><colgroup>', '</colgroup></table>' ],
		area: [ 1, '<map>', '</map>' ],
		_default: [ 0, '', '' ]
	},
	cssreg = /([A-Z])/g,
	getStyle = (function(){
		if (_w.getComputedStyle) {
			return function(elem, name) {
				name = name.replace(cssreg, '-$1').toLowerCase();
				var cs = _w.getComputedStyle(elem, null);
				return cs.getPropertyValue(name);
			};
		} else if (_d.documentElement.currentStyle) {
			return function(elem, name) {
				var ret = elem.currentStyle[name];
				return ret == 'auto' ? 0 : ret;
			}
		} else {
			return function(elem, name) {
				return null;
			}
		}
	})(),
	indexOf = function(arr, val) {
		for(var i = 0, l = arr.length; i < l; i++) {
			if (arr[i] == val) {
				return i;
			}
		}
		return -1;
	},
	execScript = function(elem) {
		// 检查是否包含js
		if (!('length' in elem) && elem.nodeType == 1) {
			elem = [elem];
		}
		var _a = hapj.array;
		_a.each(elem, function(i, e) {
			var ss = [];
			if (e.nodeName == 'SCRIPT') {
				ss.push(this);
			} else if(e.nodeType == 1){
				ss = e.getElementsByTagName('script');
			}
			if (ss.length) {
				setTimeout(function(){
					_a.each(ss, function() {
						if (!this.src) {
							window['eval'].call(window, (this.text || this.textContent || this.innerHTML || '' ).replace( rcleanScript, '' )); 
						}
					});
				}, 0);
			}
		});
	}
	;
	wrapMap.optgroup = wrapMap.option;
	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;
	
	hapj.object.extend(hapj.ui.fn, {
		/**
		 * 设置元素的属性，支持链式操作
		 * @param {String|Object} 样式名或样式集合
	  	 * @param {String} 样式值
	  	 * @return hapj
		 */
		attr: function(attr, value) {
			if (typeof attr == 'string' && undefined === value) {
				if (attr == 'class') {
					return this.length ? this[0].className : null;
				}
				return this.length ? ( attr in this[0] ? this[0][attr] : this[0].getAttribute(attr) ) : null;
			}
			if (typeof attr == 'string') {
				var a = {};
				a[attr] = value;
				attr = a;
			}
			this.each(function(){
				var self = this;
				hapj.object.each(attr, function(a, v){
					var k = a == 'class' ? 'className' : a;
					if (k in self) {
						self[k] = v;
					} else {
						self.setAttribute(k, v);
					}
				});
			});
			return this;
		},
		/**
	  	 * 设置样式 支持链式操作
	  	 * @param {String|Object} 样式名或样式集合
	  	 * @param {String} 样式值
	  	 * @return hapj
	  	 */
	  	css: function(prop, value) {
			if (typeof prop == 'string' && undefined === value) {
				return this[0] ? (prop in this[0].style ? this[0].style[prop] : null) : null;
			}
	  		if (typeof prop == 'string') {
	  			var p = {};
	  			p[prop] = value;
	  			prop = p;
	  		}
	  		this.each(function(){
				var self = this;
				hapj.object.each(prop, function(p, v) {
					self.style[p] = v;
				})
	  		})
			
			return this;
	  	},
	  	/**
	  	 * 设置或者获取元素的html
	  	 */
	  	html: function(html) {
	  		if (undefined == html) {
	  			if (this.length) {
	  				return this[0].innerHTML;
	  			}
	  			return null;
	  		}
	  		var isScript = false;
	  		if (hapj.browser.type == 'msie' && typeof html == 'string' && /^\s*<script /.test(html)) {
				isScript = true;
				html = '<div>&nbsp;</div>' + html;
			}
  			this.each(function(){
				//清除所有节点
				while (this.firstChild) {
					this.removeChild(this.firstChild);
				}
				var elems = wrapHtml(html), self = this.tagName == 'TABLE' ? 
					(this.getElementsByTagName('tbody')[0] || this.appendChild(this.ownerDocument.createElement('tbody'))) 
					: this;	
				hapj.array.each(elems, function(i){
					if (isScript && i == 0) return;
					self.appendChild(this);
				});
				execScript(elems);
			});
	  		return this;
	  	},
		/**
		 * 追加html代码或者元素到另外一个元素下
		 * @param {Object} html
		 */
		append: function(html){
			var self = this, isScript = false;
			// ie浏览器需要做一些兼容，比如<script标签，不能直接光有script标签，否则会报错
			if (hapj.browser.type == 'msie' && typeof html == 'string' && /^\s*<script /.test(html)) {
				isScript = true;
				html = '<div>&nbsp;</div>' + html;
			}
			this.each(function(){
				if (typeof html == 'string') {
					var elems = wrapHtml(html), self = this;
					hapj.array.each(elems, function(i) {
						if (isScript && i == 0) return;
						self.appendChild(this);
					})
					execScript(elems);
				} else if (html.length && html.length > 0) {
					hapj.array.each(html, function(){
						if (this.nodeType && this.nodeType == 1) {
							elem.appendChild(this);
						}
					});
					execScript(html);
				} else if (html.nodeType && html.nodeType == 1) {
					this.appendChild(html);
					execScript(html);
				}
				return self;
			});
			return;
		},
		/**
		 * 显示
		 */
		show: function() {
			this.css('display', 'block');
			return this;
		},
		/**
		 * 隐藏
		 */
		hide:function() {
			this.css('display', 'none');
			return this;
		},
		/**
		 * 增加类别
		 * @param {Object} cls
		 */
		addClass: function(cls) {
			this.each(function(){
				var cs = this.className ? this.className.split(' ') : [];
				if (indexOf(cs, cls) == -1) {
					cs.push(cls);
				}
				this.className = cs.join(' ');
			});
			return this;
		},
		/**
		 * 删除类别
		 * @param {Object} cls
		 */
		removeClass: function(cls) {
			this.each(function(){
				var cs = this.className ? this.className.split(' ') : [],
					pos = indexOf(cs, cls);
				if (pos > -1) {
					cs.splice(pos, 1);
				}				
				this.className = cs.join(' ');
			});
			return this;
		},
		/**
		 * 获取元素的高度
		 * @param {Boolean} 是否包括margin
		 */
		height:function(margin) {
			var elem = this[0];
			if (!elem) {
				return null;
			}
			if (elem === _w) {
				return margin ? elem.screen.height : elem.screen.availHeight;
			} else if( elem.nodeType == 9) {
				return margin ? body.scrollHeight : body.clientHeight;
			}
			if (margin === false) {
				return elem.clientHeight;
			}
			return margin ? elem.offsetHeight + parseFloat(getStyle(elem, 'marginTop')) + parseFloat(getStyle(elem, 'marginBottom')) : elem.offsetHeight;
		},
		/**
		 * 获取元素的宽度 
		 * @param {Boolean} 是否包括margin
		 */
		width: function(margin) {
			var elem = this[0];
			if (!elem) {
				return null;
			}
			if (elem === _w) {
				return margin ? elem.screen.width : elem.screen.availWidth;
			} else if (elem.nodeType == 9) {
				return margin ? body.offsetWidth : body.clientWidth;
			}
			if (margin === false) {
				return elem.clientWidth;
			}
			return margin ? elem.offsetWidth + parseFloat(getStyle(elem, 'marginLeft')) + parseFloat(getStyle(elem, 'marginRight')) : elem.offsetWidth;
		},
		/**
		 * 获取元素的偏移距离
		 */
		offset: function() {
			var elem = this[0];
			if (!elem) {
				return null;
			}
			if (elem.nodeType == 9 || elem === _w) {
				return {left:body.scrollLeft || _d.body.scrollLeft, top:body.scrollTop || _d.body.scrollTop};
			}
			
			if (elem.getBoundingClientRect) {
				var pos = elem.getBoundingClientRect();
				return {
					left: pos.left + (body.scrollLeft || _d.body.scrollLeft),
					top: pos.top + (body.scrollTop || _d.body.scrollTop)
				};
			}
			
			var left = elem.offsetLeft, top = elem.offsetTop, current = elem.offsetParent;
			while(current) {
				left += current.offsetLeft;
				top += current.offsetTop;
				current = current.offsetParent;
			}
			return {left:left, top: top};
		},
		/**
		 * 序列化表单
		 */
		params: function() {
			var elements;
			this.each(function(){
				if (this.elements) {
					elements = this.elements;
					return false;
				}
			});
			if (!elements) {
				return null;
			}
			var params = {};
			for(var i = 0, l = elements.length; i < l; i++) {
				var f = elements[i];
				if (!f.name || f.disabled) continue;
				var name = f.name, multi = true;
				switch(f.type) {
					case 'select-one':
						multi = false;
            		case 'select-multiple':
						if (multi) {
							params[name] = [];
						}
		                for (var j = 0, m = f.options.length; j < m; j++) {
		                    var option = f.options[j], val = undefined === option.value ? option.text : option.value;
		                    
		                    if (option.selected) {
								if (!multi) {
									params[name] = val;
									break;
								} else {
									params[name].push(val);
								}
		                    }
		                }
	                	break;
					case undefined:
		            case 'file':
		            case 'submit':
		            case 'reset':
		            case 'button':
						break;
					case 'radio':
						multi = false;
		            case 'checkbox':
						if (f.checked) {
							if (multi) {
								if (!(name in params)) {
									params[name] = [];
								}
								params[name].push(f.value);
							} else { 
								params[name] = f.value;
							}
						}
	                    break;
					default:
						if (name in params) {
							if (!hapj.array.isArray(params[name])) {
								params[name] = [params[name]];
							}
							params[name].push(f.value.replace(rCRLF, "\r\n"));
						} else {
							params[name] = f.value.replace(rCRLF, "\r\n");
						}
						break;
				}
			}
			return params;
		},
		/**
		 * 动画
		 * @param {Object} type 类型
		 * @param {Object} from 开始值
		 * @param {Object} to   结束值
		 * @param {Object} total 总共进行的时间
		 * @param {Object} step 每次变化的值
		 */
		animate: function(type, from, to, total, step) {
			total = total || 500;
			step = step || 100;
			var type = 'alpha', setVal = function(v) {
				self.css({
					opacity: v/100,
					filter:'Alpha(Opacity=' + v + ')'
				});
			}, curVal = from,
			toFunc = function() {
				if ( (offset > 0 && curVal >= to) || (offset < 0 && curVal <= to)) {
					setVal(curVal);
					curVal -= offset
					setTimeout(toFunc, timeSize);
				}
			}, timeSize = Math.ceil(total / step),
			offset = (from - to)/ step,
			self = this;
				
			toFunc();
			return this;
		}
	});
})(window, document);

/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-02-24
 * @version 1.0 
 * @brief
 **/
(function(H){
	var getRequest = function () {
		if (typeof XMLHttpRequest !== 'undefined') {
			return new XMLHttpRequest();
		}
		try {
			return new ActiveXObject('Msxml2.XMLHTTP');
		} catch(e) {
			try {
				return new ActiveXObject('Microsoft.XMLHTTP');
			} catch(e) {
				return false;
			}
		}
	},
	defaults = {
		type:'get',
		async:true,
		dataType:'json',
		queue: false,
		timeout: 0,
		cache: true
	},
	headers = {
		'X-Requested-With': 'XMLHttpRequest'
	},
	doQueue = false,
	queue = [],
	count = 0,
	handlerNextReq = function() {
		var ajax = queue.shift();
		ajax && ajax._doSend();
	}
	;
	
	H.ajax = function(options){
		var hs = H.extend({}, headers), cfg = H.extend({}, defaults);
		H.extend(cfg, options);
		H.extend(hs, cfg.headers || {});
		cfg.headers = hs;
		if (!cfg.url) {
			throw new Error('ajax.u_urlIsRequired');
		}
		var req = getRequest(), type = cfg.type.toLowerCase(), ajax = new Ajax();
		if (type == 'get') {
			if (cfg.data) {
				var qs = '';
				if (typeof cfg.data == 'object') {
					qs = H.object.toString(cfg.data);
				} else {
					qs = cfg.data.toString();
				}
				if (qs) {
					if (cfg.url.indexOf('?') > -1) {
						cfg.url += ('&' + qs);
					} else {
						cfg.url += ('?' + qs);
					}
				}
			}
			ajax.data = null;
		} else if (type == 'post') {
			if (typeof cfg.data == 'object') {
				cfg.data = H.object.toString(cfg.data);
			} 
		}
		
		if (!cfg.cache) {
			if (cfg.url.indexOf('?') > -1) {
				cfg.url += '&' + new Date().getTime();
			} else {
				cfg.url += '?' + new Date().getTime();
			}
		}
		
		cfg.type = type;
		ajax.id = count;
		ajax.req = req;
		ajax.options = cfg;
		ajax.bindEvent();
		ajax.start();
		return ajax;
	};
	
	var Ajax = function() {};
	Ajax.prototype = {
		success: false,
		bindEvent: function() {
			// ie6 执行onreadystatechangte时，没有指向req
			var self = this, options = this.options, req = this.req;
			req.onreadystatechange = function() {
				if (req.readyState == 4) {
					if (queue.length) {
						handlerNextReq();
					}
					switch(req.status) {
						case 200:
							self.success = true;
							var code = req.responseText, pass;
							if (options.dataType == 'json') {
								try {
									code = eval('(' + code + ')');
								} catch(e) {
									var fs = hapj.hook.gets('ajax.error');
									hapj.each(fs, function(i, f){
										f.call(self.req, 'parse');
									});
									return;
								}
								// 设置一个json格式的钩子
								var fs = hapj.hook.gets('ajax.jsonParser');
								hapj.each(fs, function(i, f) {
									pass = f.call(req, code);
									if (pass === false) {
										options.failure && options.failure.call(req, code);
										return false;
									}
								});
							}
							
							if (pass !== false && options.success) {
								options.success.call(req, code);
							}
							break;
						default:
							if (req.status == 1223) {
								req.status = 204;
							}
							if (options.error) {
								options.error.call(req, req.status);
							}
							break;
					}
				}
			};
			// req.onload 用来解决firefox 3.x 版本里边 同步模式 的bug
			if (this.options.async == false && H.browser.type == 'mozilla') {
				req.onload = req.onreadystatechange; 
			}
		},
		start:function() {
			var req = this.req, options = this.options;
			req.open(options.type, options.url, options.async);
			
			if (options.type == 'post') {
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			}
			for(var i in options.headers) {
				req.setRequestHeader(i, options.headers[i]);
			}
		
			if (options.queue || doQueue) {
				queue.push(this);
			} else {
				this._doSend();
			}
		},
		_doSend: function() {
			count++
			this.id = count;
			this.req.send(this.options.data);
			
			if (this.options.timeout > 0) {
				var self = this;
				setTimeout(function(){
					if (self.success) {
						return;
					}
					self.abort();
					if (self.options.error) {
						self.options.error.call(req, 'timeout');
					} else {
						var fs = hapj.hook.gets('ajax.error');
						hapj.each(fs, function(i, f){
							f.call(self.req, 'timeout');
						});
					}
				}, this.options.timeout);
			}
		},
		abort: function() {
			this.req.abort();
		}
	};
	H.object.extend(H.ajax, {
		startQueue: function() {
			doQueue = true;
		},
		endQueue: function() {
			doQueue = false;
			handlerNextReq();
		}
	});
	H.lib.ajax = H.ajax;
})(hapj);

// 模板
(function(H){
	var re = /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g, 
	compileARe = /\\/g, 
	compileBRe = /(\r\n|\n)/g, 
	compileCRe = /'/g,
	/**
	 * 将内容作为模板进行编译，返回编译后的结果
	 * @param {Object} values 用来进行编译的变量。 如果不传入任何参数，则会返回编译后的函数
	 * @return {String}
	 */
	tmpl = function(content, values) {
		if (content.indexOf('{') < 0) {
			if (undefined === values) {
				return function(){return content;};
			} else {
				return content;
			}
		}
		if (undefined === values) {
            var bodyReturn = content.replace(compileARe, '\\\\').replace(compileBRe, '\\n').replace(compileCRe, "\\'").replace(re, function (m, name, format){
                format = "(values['" + name + "'] == undefined ? '' : ";
                return "'," + format + "values['" + name + "']) ,'";
            }),
            body = "var ret = function(values){ return ['" + bodyReturn + "'].join('');};";
            eval(body);
            return ret;
		}
		
		return content.replace(compileARe, '\\\\').replace(re, function (m, name, format, args){
            return values[name] !== undefined ? values[name] : '';
        });
	}, compile = function(content, values) {
		var funcs = [],
		pos = content.indexOf('{#foreach ');
		if (pos == -1) {
			return tmpl(content, values);
		}
		ret = '';
		while(pos > -1) {
			var sepos = content.indexOf('}', pos);
			if (sepos == -1) {
				break;
			}
			var varname = hapj.string.trim(content.substr(pos + 10, sepos - pos - 10));
			if (!varname || !values[varname] || !hapj.array.isArray(values[varname])) {
				break;
			}
			epos = content.indexOf('{#endforeach}', sepos);
			if (epos == -1) {
				break;
			}
			
			ret += tmpl(content.substr(0, pos), values);
			
			var fc = tmpl(content.substr(sepos + 1, epos - sepos - 1));
			hapj.each(values[varname], function(i, a){
				ret += fc(a);
			});
			
			content = content.substr(epos + 13);
			pos = content.indexOf('{#foreach ');
		}
		if (content) {
			ret += tmpl(content, values);
		}
		return ret;
	},render = function(url, id, packer, callback) {
		var tmpl, self = this;
		if (!hapj.ui._id(id)) {
			url += url.indexOf('?') > -1 ? '&' : '?';
			url += '_tmpl_id=' + id;
		} else {
			tmpl = hapj.ui._id(id).innerHTML;
		}
		hapj.lib.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			success: function(ret){
				if (ret.data._tmpl) {
					tmpl = ret.data._tmpl;
					delete ret.data._tmpl;
					hapj.ui(document.body).append(tmpl);
				}
				if (!tmpl) {
					throw new Error('tmpl.u_tmplNotFound');
				}
				var data = (packer && packer.call(null, ret.data)) || ret.data;
				callback && callback(compile(H.ui._id(id).innerHTML, data));
			}
		});
	};
	
	/**
	 * 将dom节点当成模板容器渲染数据
	 */
	H.ui.fn.tmpl = function(values) {
		if (!this.length) return '';
		return compile(this[0].innerHTML, values);
	};
	
	
	/**
	 * 将dom
	 */
	H.ui.fn.render = function(url, id, packer, callback) {
		var self = this;
		render(url, id, packer, function(html){
			self.html(html);
			callback && callback();
		});
		return this;
	}
	
	H.tmpl = {
		compile:compile,
		render:render
	}
})(hapj);

// hapj ui 事件
(function(_d){
	var _O = hapj.object,
	_wrapEvent = function(e){
		if (!e.target) {
			e.target = e.srcElement;
			e.preventDefault = function(){
				e.returnValue = false;
			};
			e.stopPropagation = function() {
				e.cancelBubble = true;
			}
			e.relatedTarget = e.relatedTarget || e.fromElement || e.toElement;
		}
		return e;
	},
	EVENT_ID_KEY = '__EVENT_ID__',
	eventId = 0,
	elemEventId = 0,
	eventQueue = {},
	onEventFunc = (function(){
		return _d.addEventListener ? function(elem, event, handler) {
			elem.addEventListener(event, handler, false);
		} : function(elem, event, handler){
			elem.attachEvent('on' + event, handler);
		}
	})(),
	unEventFunc = (function() {
		return _d.addEventListener ? function(elem, event, handler){
				elem.removeEventListener(event, handler, false);
			} : function(elem, event, handler){
				elem.detachEvent('on' + event, handler);
			}
	})(),
	specialEvents = {
		mouseenter: {
			event :'mouseover'
		},
		mouseleave: {
			event: 'mouseout'
		}
	};
	
	_O.each(specialEvents, function(k, v) {
		v.handler = function(e) {
			var rt = e.relatedTarget;
			if (rt !== this && !hapj.ui.contains(this, rt) ) {
				return true;
			}
			return false;
		};
	});
	
	_O.extend(hapj.ui, {
		/**
		 * 事件触发器
		 */
		on: (function(){
			var eh = function(elem, tag, handler){
				return function(e, params){
					var e = _wrapEvent(e || window.event), t = e.target;
					
					if (tag) {
						if (e.target.tagName != tag) {
							if (typeof handler != 'object' && !('default' in handler)) {
								return;
							}
						} else {
							t = e.target;
						}
					}
					
					if (handler.oriEvent && handler.oriEvent in specialEvents) {
						nEvent = specialEvents[handler.oriEvent];
						if (!nEvent.handler.call(elem, e)) {
							return;
						}
					}
					
					var ret;
					if (typeof handler == 'object') {
						var c = t.className;
						if ( !(c in handler) ) {
							c = 'default';
						}
						if (c in handler) {
							ret = handler[c].call(elem, e, params);
						}
					} else {
						ret = handler.call(elem, e, params);
					}
					if (false === ret) {
						e.preventDefault();
					}
					return ret;
				}
			};
			
			return function(elem, event, handler) {
				if (!handler) {
					throw new Error('ui.u_eventHandlerIsNull');
				}
				var tag = '', params;
				if (typeof handler == 'string') {
					tag = event.toUpperCase();
					event = handler;
					handler = arguments[3];
					params = undefined === arguments[4] ? null : arguments[4]
				} else {
					params = undefined === arguments[3] ? null : arguments[3];
				}
				
				if (elem.addEventListener && event in specialEvents) {
					handler.oriEvent = event;
					event = specialEvents[event]['event'];
				}
				
				var eeid = elem[EVENT_ID_KEY];
				if (handler[EVENT_ID_KEY]) {
					eventId = handler[EVENT_ID_KEY];
				} else {
					eventId++;
				}
				if (!eeid) {
					elemEventId++;
					eeid = elemEventId;
					elem[EVENT_ID_KEY] = elemEventId;
					eventQueue[eeid] = {};
				}
				var eq = eventQueue[eeid];
				if (! (event in eq) ) {
					eq[event] = function(e) {
						for(var p in eq[event]) {
							if (!eq[event].hasOwnProperty(p)) {
								continue;
							}
							if (eq[event][p]) {
								var eobj = eq[event][p][EVENT_ID_KEY];
								eq[event][p].call(eobj['elem'], e, eobj['params']);
							}
						}
					};
					onEventFunc(elem, event, eq[event]);
				}
				
				var newHandler = eh(elem, tag, handler);
				handler[EVENT_ID_KEY] = eventId;
				newHandler[EVENT_ID_KEY] = {
					elem: elem,
					params: params
				};
				eq[event][eventId] = newHandler;
			};
		})(),
		/**
		 * 取消绑定事件
		 * @param {HtmlElement} elem
		 * @param {String} event
		 * @param {Function} handler
		 */
		un: (function(){
			return function(elem, event, handler) {
				var eeid = elem[EVENT_ID_KEY];
				if (!eeid || !(eeid in eventQueue) || (!event in eventQueue[eeid])) {
					return;
				}
				var handlers = eventQueue[eeid][event],eventId = handler[EVENT_ID_KEY];
				delete eventQueue[eeid][event][eventId];
				
				var i = 0;
				_O.each(handlers, function(){
					i++;
				});
				if (i == 0) {
					unEventFunc(elem, event, handlers);
					delete eventQueue[eeid][event];
					delete handlers;
				}
			}
		})(),
		fire: (_d.createEvent ? function(elem, event) {
			var evt = _d.createEvent('HTMLEvents');
			evt.initEvent(event, true, true);
			elem.dispatchEvent(evt);
		} : function(elem, event) {
			elem.fireEvent('on' + event);
		})
	});
	
	_O.extend(hapj.ui.fn, {
		/**
		 * 绑定事件
		 * @param {String} event
		 * @param {Function} handler
		 */
		on: function(event, handler) {
			var tag = '';
			if (typeof handler == 'string') {
				tag = event;
				event = handler;
				handler = arguments[2];
			}
			this.each(function(i, v){
				tag ? hapj.ui.on.call(v, v, tag, event, handler, i) : hapj.ui.on.call(v, v, event, handler, i);
			});
			return this;
		},
		hover: function(hover, out) {
			if (typeof hover == 'function') {
				this.on('mouseenter', hover);
			}
			if (typeof out == 'function') {
				this.on('mouseleave', out);
			}
			return this;
		},
		/**
		 * 取消绑定
		 * @param {Object} event
		 * @param {Object} handler
		 */
		un: function(event, handler) {
			this.each(function(i){
				hapj.ui.un.call(this, this, event, handler);
			});
			return this;
		},
		/**
		 * 引起某个事件
		 * @param {String} event
		 */
		fire: function(event) {
			this.each(function(i) {
				hapj.ui.fire.call(this, this, event);
			});
			return this;
		}
	});
})(document);

// hapj com 模块
(function(){
	var conf = null,modules = {};
	/**
	 * 获取一个com模块
	 * @param string moduleName
	 * @param array options 可选，如果填写，则会覆盖在配置文件中的内容
	 */
	hapj.com = function(moduleName, options){
		if (conf == null) {
			conf = hapj.conf.get('hapj.com');
		}
		if (moduleName in modules) {
			if (undefined !== options) {
				var cfg = hapj.object.extend({}, conf[moduleName]);
				hapj.object.extend(cfg, options);
				modules[moduleName]['init'].call(null, cfg);
			}
			return modules[moduleName];
		}
		if (!conf[moduleName]) {
			throw new Error('com.u_moduleNotDefined moduleName=' + moduleName);
		}
		if (!conf[moduleName]['_link']) {
			throw new Error('com.u_linkModuleNotDefined');
		}
		// 通过_link找到对应的对象
		var link = conf[moduleName]['_link'], arr = link.split('.'), ns = arr.shift(), l = window;
		if (ns == '_hapj') {
			l = hapj.get(arr.join('.'));
			if (!l) {
				throw new Error('com.u_linkModuleNotFound moduleName=' + moduleName);
			}
		} else {
			while(ns) {
				if (!(ns in l)) {
					throw new Error('com.u_linkModuleNotFound moduleName=' + moduleName);
				}
				l = l[ns];
				ns = arr.shift();
			}
		}
		if (!l.init) {
			throw new Error('com.u_initMethodNotDefined moduleName='.moduleName);
		}
		var cfg = conf[moduleName];
		delete cfg['_link'];
		if (undefined !== options) {
			hapj.extend(cfg, options);
		}
		l.init.call(null, cfg);
		return modules[moduleName] = l;
	};
})();

// DOM加载完毕执行dom.ready钩子
(function(undefined){
	var _w = window,
	_d = document,
	_isReady = false,
	//参考jquery的ready函数
	_bindReady = function() {
		if (_d.readyState == 'complete') {
			return setTimeout(_ready, 1);
		}

		if (_d.addEventListener) {
			_d.addEventListener('DOMContentLoaded', _onDOMContentLoaded, false);
			_w.addEventListener('load', _ready, false);
		} else if (_d.attachEvent) {
			_d.attachEvent('onreadystatechange', _onDOMContentLoaded);
			_w.attachEvent('onload', _ready);
		  	
			var toplevel = false;
		    try {
		    	toplevel = (_w.frameElement == null);
		    } catch (e) {}
		
		    if (_d.documentElement.doScroll && toplevel) {
				_doScrollCheck();
			}
		}
	},
	//滚动检查
	_doScrollCheck = function() {
		if (_isReady) {
			return;
		}

		try {
			_d.documentElement.doScroll('left');
		} catch (e) {
			return setTimeout(_doScrollCheck, 1);
		}

		_ready();
	},
	//页面准备好了的事件
	_ready = function() {
		if (_isReady) {
			return;
		}
		_isReady = true;
		delete hapj.__dom_is_ready;
		
		var funcs = hapj.hook.gets('dom.ready');
		hapj.each(funcs, function(i, f) {
			f.call(hapj.__modules, hapj, window.jQuery);
		});
		hapj.hook.remove('dom.ready');
	},
	//页面载入完成后的事件
	_onDOMContentLoaded = (_d.addEventListener ? function() {
	  _d.removeEventListener('DOMContentLoaded', _onDOMContentLoaded, false);
		_ready();
	} : (_d.attachEvent ? function(){
		if (_d.readyState == 'complete') {
			_d.detachEvent('onreadystatechange', _onDOMContentLoaded);
			_ready();
		}
	} : null))
	;
	
	_bindReady();
})();

/************************----------ui/touchable.js--------------************************************/
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2011-12-30
 * @version 1.0 
 * @brief 使元素支持触控
 * @example 
 */
(function(){
	hapj.ui.fn.touchable = function(options) {
		if (!options.direction) {
			options.direction = 'h';// 默认水平方向
		}
		var startX,startY,endX,endY;
		this.on('touchstart', function(e) {
			if (e.touches.length != 1) {
				return;
			}
			var touch = e.touches[0];
			startX = touch.pageX;
			startY = touch.pageY;
		}).on('touchmove', function(e) {
			if (e.touches.length != 1) {
				return;
			}
			var touch = e.touches[0];
			endX = touch.pageX;
			endY = touch.pageY;
			if (options.direction == 'h') {
				if (Math.abs(endY-startY) < Math.abs(endX-startX)) {
					return false;
				}
			} else {
				if (Math.abs(endY-startY) > Math.abs(endX-startX)) {
					return false;
				}
			}
		}).on('touchend', function(e) {
			if (!endX && !endY) return;
			var offX = endX - startX, offY = endY - startY, toRight = offX > 0, toBottom = offY > 0;
			offX = Math.abs(offX);
			offY = Math.abs(offY);
			if (options.direction == 'h') {
				if (offX > 50 && offX > offY) {
					if (toRight) {
						options.right && options.right();
					} else {
						options.left && options.left();
					}
				}
			} else {
				if (offY > 50 && offY > offY) {
					if (toBottom) {
						options.bottom && options.bottom();
					} else {
						options.top && options.top();
					}
				}
			}
			return false;
		});
	}
})();

/************************----------ui/switchable.js-------------************************************/

/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2011-12-30
 * @version 1.0 
 * @brief 使几组相互联动的元素能互相切换
 * @example 
hapj(function(H){
	var sw = H.ui.id('cycle').switchable({
    	method:'hover',
		cycleTime: 2000,
		map:function(){
			return ui._id(this.getAttribute('href').substr(1) + 'List');
		},
		trigger: function(triggers) {
			triggers.css('color', '');
			this.style.color = 'red';
		},
		target: function(targets) {
			targets.css('display', 'none');
			this.style.display = 'block';
		}
   });
 });
 **/
(function(H, Me, undefined){

var METHOD_CLICK = 'click', METHOD_HOVER = 'hover',
_switch = function(trigger, options, i) {
	if (options.map) {
		var target = null;
		switch(typeof options.map) {
			case 'string':
				target = H.ui._id(map);
				break;
			case 'function':
				target = options.map.call(trigger, i);
				break;
			default:
				target = options.map;
				break;
		} 
		if (!target) {
			return H.log.warn('hapj.ui.switchable the target is not found.');
		}
		
		options.trigger && options.trigger.call(trigger, options.triggers, i);
		options.target && options.target.call(target, options.targets, i, trigger);
	}
};
H.ui.fn.switchable = function(opt){
	var self = this, 
	targets = new H.ui.node(), 
	options = {
		method:METHOD_CLICK, 
		map:null, 
		trigger: null, 
		target: null, 
		cycleTime: 0,
		tag: ''
	};
	H.extend(options, opt);
	
	var tag = options.tag ? options.tag.toUpperCase() : '',
	triggers = tag ? this.tag(tag) : this
	;
	
	if (typeof options.map == 'function') {
		triggers.each(function(i){
			targets.push(options.map.call(this, i));
		});
	} else {
		targets = H.ui(options.map);
	}
	
	H.extend(options, {triggers: triggers, targets: targets});
	
	var me = new Me();
	
	switch(options.method) {
		case METHOD_CLICK:
			triggers.on('click', function(e, i){
				me.current = i;
				_switch(triggers[i], options, i);
				me.stopCycle();
				return false;
			});
			
			break;
		case METHOD_HOVER:
			triggers.on('mouseenter', function(e, i) {
				if (tag && e.target.tagName != tag) {
					return;
				}
				me.current = i;
				_switch(triggers[i], options, i);
				
				return false;
			});
			this.on('mouseenter', function(e, i) {
				me.stopCycle();
			})
			targets.on('mouseenter', function(e, i) {
				if (targets.length > 1 && me.current != i) {
					return;
				}
				me.stopCycle();
			});
			break;
	}
	if (options.cycleTime > 0) {
		this.on('mouseleave', function(e, i) {
			me.startCycle();
		});
		targets.on('mouseleave', function(e, i) {
			if (targets.length > 1 && me.current != i) {
				return;
			}
			me.startCycle();
		});
		setTimeout(function(){
			me.startCycle();
		}, 0);
	}
	
	me.ui = this;
	me.options = options;
	me.total = options.triggers.length;
	
	return me;
};

Me = function(){};
Me.prototype = {
	// 元素总数
	total:0,
	// 当前所在元素数
	current:0,
	/**
	 * 切换到下一组元素
	 * @param {Function} onLast 如果传入一个函数，当轮换到最后一张时会调用此函数，如果返回false，则不会继续切换
	 * @return this
	 */
	next: function(onLast) {
		if (typeof onLast == 'function' && this.current + 1 == this.total) {
			var ret = onLast.call(null);
			if (false === ret) {
				return;
			}
		}
		this.current++;
		if (this.current >= this.total) {
			this.current = 0;
		}
		return this.to(this.current);
	},
	/**
	 * 切换到上一组元素
	 * @param {Function} onFirst 如果传入一个函数，当轮换到第一张时会调用此函数，如果返回false，则不会继续切换
	 * @return this
	 */
	prev: function(onFirst) {
		if (typeof onFirst == 'function' && this.current == 0) {
			var ret = onFirst.call(null, this.current);
			if (false === ret) {
				return;
			}
		}
		
		this.current--;
		if (this.current < 0) {
			this.current = this.total - 1;
		}
		return this.to(this.current);
	},
	/**
	 * 随机切换到一个触发器
	 */
	rand: function() {
		var i = Math.ceil(Math.random() * this.total) - 1;
		return this.to(i);
	},
	/**
	 * 切换到指定的位置
	 * @param {Number} index
	 * @return this
	 */
	to: function(index) {
		if (index < 0 || index >= this.total) {
			H.log.error('hapj.ui.switchable wrong index');
		}
		this.current = index;
		var trigger = this.options.triggers[index];
		_switch(trigger, this.options, this.current);
		return this;
	},
	/**
	 * 移动到第一个元素
	 */
	first: function(){
		return this.to(0);
	},
	/**
	 * 移动到最后一个元素
	 * @return this
	 */
	last: function() {
		return this.to(this.total);
	},
	__interval: null,
	/**
	 * 开始轮播
	 * @param {Number} ms 毫秒 
	 * @return this
	 */
	startCycle: function(ms){
		var self = this;
		if (undefined === ms) {
			if (this.options.cycleTime <= 0) {
				return;
			}
			
			ms = this.options.cycleTime;
		}
		this.stopCycle();
		this.__interval = setInterval(function(){
			self.next();
		}, ms);
	},
	/**
	 * 停止轮播
	 * @return this
	 */
	stopCycle: function() {
		if (this.__interval) {
			clearInterval(this.__interval);
			this.__interval = null;
		}
	}
};
})(hapj);

/************************----------ui/floatable.js-------------************************************/
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2011-12-30
 * @version 1.0 
 * @brief 使元素能相对另一个元素浮动起来。此代码可以使元素在整个页面居中、或浮动在页面左上角，右上角等
 * @example
hapj(function(H){
	// 设置divMenu元素处于linkMenu元素的左上角
	H.ui.id('divMenu').floatable(H.ui.id('linkMenu')).left().top();
});
 **/
(function(H, Me, undefined){
/**
 * 元素浮动
 * @param {Element} elem 作为当前元素浮动位置的参考元素 没有指定则为自己
 */
hapj.ui.fn.floatable = function(elem){
	if (undefined === elem) {
		elem = document;
	}
	var isWnd = elem === window, type = typeof elem;
	elem = H.ui(elem);
	
	this.css('position', 'absolute');

	var pos, me = new Me();
	if (isWnd) {
		pos = {left:0, top:0};
	} else {
		pos = elem.offset();
	}
	// 如果是document
	if (elem[0].nodeType == 9 || isWnd) {
		me.position = {
			width: elem.width(),
			height: elem.height()
		}
	} else {
		me.position = {
			width: elem.width(true),
			height: elem.height(true)
		};
	}
	H.extend(me.position, pos);
	me.ui = this;
	return me;
};
Me = function(){};
Me.prototype = {
	/**
	 * 在指定位置显示
	 * @param {Number} left 左边距
	 * @param {Number} top 顶边距
	 * 
	 */
	to: function(left, top) {
		var css = {};
		if (left === 0 || left) {
			css['left'] = (this.position.left + left) + 'px';
		} 
		if (top === 0 || top) {
			css['top'] = (this.position.top + top) + 'px';
		}
		this.ui.css(css);
		return this;
	},
	/**
	 * 顶部对齐
	 * @param {Number} offset 
	 */
	top:function(offset, out){
		offset = offset || 0;
		out = undefined === out ? false : out;
		this.ui.css('top', (this.position.top + offset - (out ? this.ui.height(true) : 0)) + 'px');
		return this;
	},
	/**
	 * 底部对齐
	 * @param {Number} offset 
	 */
	bottom:function(offset, out){
		var ui = this.ui, pos = this.position, height;
		offset = offset || 0;
		out = undefined === out ? false : out;
		ui.each(function(){
			if (!out) {
				height = H.ui(this).height(true);
			} else {
				height = 0;
			}
			ui.css('top', (pos.top + pos.height - height + offset) + 'px');
		});
		return this;
	},
	/**
	 * 垂直居中
	 * @param {Number} offset 
	 */
	middle:function(offset){
		var ui = this.ui, pos = this.position;
		offset = offset || 0;
		ui.each(function(){
			var height = H.ui(this).height(true);
			ui.css('top', parseInt(pos.top + (pos.height - height)/2 + offset) + 'px');
		});
		return this;
	},
	/**
	 * 左边对齐
	 * @param {Number} offset 
	 */
	left: function(offset, out) {
		var ui = this.ui, pos = this.position;
		offset = offset || 0;
		out = undefined === out ? false : out;
		ui.each(function(){
			ui.css('left', (pos.left + offset - (out ? H.ui(this).width() : 0)) + 'px');
		});
		return this;
	},
	/**
	 * 右边对齐
	 * @param {Number} offset 
	 */
	right: function(offset, out) {
		var ui = this.ui, pos = this.position,width;
		offset = offset || 0;
		out = undefined === out ? false : out;
		ui.each(function(){
			if (!out) {
				width = H.ui(this).width();
			} else {
				width = 0;
			}
			ui.css('left', (pos.left + pos.width - width + offset) + 'px');
		});
		return this;
	},
	/**
	 * 左右居中
	 * @param {Number} offset 
	 */
	center: function(offset) {
		var ui = this.ui, pos = this.position;
		offset = offset || 0;
		ui.each(function(){
			var width = H.ui(this).width();
			ui.css('left', parseInt((pos.left + pos.width - width)/2 + offset) + 'px');
		});
		return this;
	}
};
})(hapj);



/************************----------ui/menuable.js-------------************************************/
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2011-12-30
 * @version 1.0 
 * @brief 使元素能像菜单一样，通过点击或者按键显示出来以后，当鼠标点击在该元素上时，元素不会消失，但当鼠标点击在该元素以外时，元素会消失；
 * 当按esc键时，最上层的元素会消失
 * @example 
hapj(function(H){
	var dlg = H.ui.id('dialog'), menu = dlg.menuable();
	H.ui.id('linkDialog').on('click', function(e){
		menu.show(e, function(e){
			// set menu's position
			dlg.floatable(window).middle().center();
			// return false if the dialog is not allowed to show
		});
	});
});
 **/
(function(H, Me, undefined){
var elemQueue = [],
_d = document, 
_w = window,
_idKey = 'floableId',
_idCount = 1000,
_getId = function(){
	return 'FLOATBLE_' + (_idCount++);
},
_inited = false,
_init = function(){
	if (_inited) {
		return;
	}
	_inited = true;
	H.ui.on(_d, 'click', function(e){
		if (undefined !== e.button && e.button == 2) {
			return _initClicks();
		}
		
		var t = e.target;
		if (t === _from) {
			return _initClicks();
		}
		for(var e in elemQueue) {
			if (!(e in _clicks)) {
				elemQueue[e].hide();
			}
		}
		return _initClicks();
	});
	H.ui.on(_d, 'keydown', function(e) {
		var lastId = '';
		for(lastId in _currents) {}
		if (!lastId) {
			return;
		}
		
		if (e.keyCode == 27) {
			var c = elemQueue[lastId];
			c && c.hide();
		}
	});
},
_from = null,
_currents = {},
_clicks = {},
_initClicks = function() {
	_clicks = {};
}
;

H.ui.fn.menuable = function(options) {
	if (!this.length) {
		return;
	}
	_init();
	var me = new Me(options),id = _getId();
	elemQueue[id] = me;
	
	var self = this;
	this.attr(_idKey, id).on('click', function(){
		_clicks[this.getAttribute(_idKey)] = true;
	});
	me.ui = self;
	
	return me;
};

Me = function(options){
	this.options = options || {};
};
Me.prototype = {
	/**
	 * 显示元素
	 * @param {Event} e
	 * @param {Function} onShow
	 * @return menuable
	 */
	show: function(e, onShow) {
		onShow = onShow || this.options.onShow;
		var id = this.ui.attr(_idKey);
		if (id in _currents) {
			return;
		}
	
		_from = null;
		if (undefined !== e && e.target) {
			_from = e.target;
		}
		if (typeof onShow == 'function') {
			var ret = onShow.call(this, e);
			if (false === ret) {
				return this;
			}
		}
		this.ui.css('display', 'block');
		
		if (id in _currents) {
			delete _currents[id];
		}
		_currents[id] = true;
		return this;
	},
	/**
	 * 隐藏元素
	 * @param {Event} e
	 * @param {Function} onHide
	 * @return menuable
	 */
	hide: function(e, onHide) {
		onHide = onHide || this.options.onHide;
		if (typeof onHide == 'function') {
			var ret = onHide.call(this.ui, e);
			if (false === ret) {
				return this;
			}
		}
		this.ui.css('display', 'none');
		var id = this.ui.attr(_idKey);
		if (id in _currents) {
			delete _currents[id];
		}
		return this;
	}
};
//hapj.set('ui.floatble', M);
})(hapj);


/************************----------ui/ajaxable.js-------------************************************/
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-02-16
 * @version 1.0 
 * @brief 
});
 **/
(function(H){
var submitHandler = function(form, options) {
	if (typeof options.beforeSubmit == 'function') {
		options.beforeSubmit.call(form);
	}
	
	if (options.confirm) {
		switch(typeof options.confirm) {
			case 'string':
				if (confirm(options.confirm) === false) {
					return false;
				}
				break;
			case 'function':
				if (options.confirm.call(form) === false) {
					return false;
				}
				break;
			default:
				break;
		}
	}
	var action = form.action || document.URL,
	data = H.ui(form).params();
	
	// 设置debug参数
	if (location.search) {
		if (H.lib.serial.getPair(location.search.substr(1), '_d') == '1') {
			if (action.indexOf('?') > -1) {
				action += '&_d=1';
			} else {
				action += '?_d=1';
			}
		}
	}
	
	if (options.pack) {
		options.pack.call(null, data);
	} else {
		// 对type=password的字段进行加密处理
        hapj.each(data, function(name){
			if (form[name] && 'password' == form[name].type) {
				data[name] = hapj.lib.serial.toString(data[name], 'md5');
			}
        });
	}
	
    H.lib.ajax({
        type: form.method ? form.method : 'POST',
        url: action,
        dataType: 'json',
        data: data,
        success: function(data){
			if (typeof options.afterSubmit == 'function') {
				options.afterSubmit.call(form);
			}
            successHandler.call(form, data, options);
        }
    });
},
successHandler = function(data, options) {
	if (!data.err || data.err.indexOf('.ok') >= 0) {
        options.ok && options.ok.call(this, data.data);
    } else {
    	options.error && options.error.call(this, data.err);
    }
},
/**
 * 发一个ajax请求
 * @param {Object} elem
 * @param {Object} options
 */
ajaxPost = function(elem, options) {
	var href = options.href || elem.href;
	var func = function(){
		if (typeof href == 'function') {
			href = href.call(elem);
		}
		H.lib.ajax({
			url: href,
			type: 'POST',
			dataType: 'json',
			success: function(data){
				successHandler.call(elem, data, options);
			}
		});
	}
	
	var cfStr = options.confirm ? options.confirm : (elem.getAttribute('confirm') ? elem.getAttribute('confirm') : '');
	if (typeof cfStr == 'function') {
		if(cfStr.call(elem) === false){
			return false;
		}
		cfStr = cfStr.call(elem);
	}
	if (cfStr) {
		if (confirm(cfStr)) {
			func(elem, options);
		}
	} else {
		func(elem, options);
	}
};

H.ui.ajaxable = {
	ajaxForm: function(form, options) {
		options = options || {};
		if (!options['_binded_']) {
			H.ui.on(form, 'submit', function() {
				submitHandler(form, options);
				return false;
			});
		} else {
			submitHandler(form, options);
		}
	},
	ajaxImg: function(img, options) {
		var o = {
			cache:false,
			timeKey:'t'
		};
		H.extend(o, options);
		src = img.src;
		
		if (!o.cache) {
			var pos = src.indexOf('?'), 
				params = pos >= 0 ? H.lib.serial.getPair(src.substr(pos + 1)) : {};
			if (o.timeKey in params) {
				H.each(params, function(i){
					if (i == o.timeKey) {
						params[i] = new Date().getTime();
					}
				});
				src = (pos > 0 ? src.substr(0, pos) + '?' : src) + H.lib.serial.toString(params, 'pair');
			} else {
				src = src + (pos > 0 ? '&' : '?') + o.timeKey + '=' + new Date().getTime();
			}
			img.src = src;
		} else {
			img.src = '';
			img.src = src;
		}
	},
	/**
	 * ajax化一个select控件
	 * @param {Object} select
	 * @param {Object} options
	 */
	ajaxSelect: function(select, options) {
		var o = {
			url:select.getAttribute('ajax-url'), 
			dataType:'json',
			pack: null,
			type: 'get',
			success: function(ret){
				if (o.dataType == 'json' && o.target && o.target.nodeName == 'SELECT') {
					var target = o.target;
					if (ret.data) {
						var data = ret.data;
						if (typeof o.pack == 'function') {
							data = o.pack(data);
						}
						target.options.length = 0;
						H.each(data, function(key){
							target.options[target.options.length] = new Option(this.name, this.value);
						})
					}
				} else {
					if (o.dataType == 'html' && o.target) {
						H.ui(o.target).html(ret);
					}
				}
				successHandler.call(select, ret, options);
			}
		};
		H.extend(o, options);
		if (!o.target) {
			o.target = H.ui(select).next('select')[0];
		}
		var fn = function(){
			H.lib.ajax({
				url: o.url.replace('{value}', select.value),
				type: o.type,
				dataType: o.dataType,
				success: o.success
			});
		};
		H.ui.on(select, 'change', fn);
		if (select.value && select.value > 0) {
			fn();
		}
	},
	/**
	 * ajax化一个面板
	 * @param {Object} pnl
	 * @param {Object} options
	 */
	ajaxPanel: function(pnl, options) {
		var o = {area:'div.pager', dataType:'html', succss: function(html){
			H.ui.elem(pnl).html(html);
		}};
		H.extend(o, options);
		H.ui.on(pnl, 'click', function(e, t) {
			if ((t = e.target).nodeName != 'A' || (o.area && !jQuery(t).parents(o.area).length)) {
				return;
			}
			H.lib.ajax({
				url:t.href,
				type:'GET',
				dataType: o.dataType,
				success: o.succss
			});
			return false;
		});
	},
	/**
	 * ajax化一个table
	 * @param {Object} table
	 * @param {Object} options
	 */
	ajaxTable: function(table, options) {
		var rule = options.rule ? options.rule : '';
		if (rule.constructor !== RegExp) {
			rule = /\/_[^\/]\w+($|\?.*)/;
		}
		H.ui.on(table, 'click', function(e, t) {
			if ( (t= e.target).nodeName != 'A' || !rule.test(t.href)) {
				return;
			}
			ajaxPost(t, options);
			
			return false;
		});
	},
	/**
	 * ajax化一个链接
	 * @param {Object} link
	 * @param {Object} options
	 */
	ajaxLink: function(link, options) {
		H.ui.on(link, 'click', function(){
			ajaxPost(this, options);
			return false;
		});
	}
};
	
H.ui.fn.ajaxable = function(opt) {
	var options = opt || {};
	H.each(this, function() {
		switch(this.tagName) {
			case 'FORM':
				H.ui.ajaxable.ajaxForm(this, options);
				break;
			case 'IMG':
				H.ui.ajaxable.ajaxImg(this, options);
				break;
			case 'SELECT':
				H.ui.ajaxable.ajaxSelect(this, options);
				break;
			case 'TABLE':
				H.ui.ajaxable.ajaxTable(this, options);
				break;
			case 'A':
				H.ui.ajaxable.ajaxLink(this, options);
				break;
			default:
				H.ui.ajaxable.ajaxPanel(this, options);
				break;
		}
	});
}

})(hapj);

/************************----------ui/dialog.js-------------************************************/
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-02-16
 * @version 1.0 
 * @brief 
});
 **/
(function(H, me, undefined){
	var dlg,inited = false,_cb, _fl ,_mask, _sized = false,_d = H.ui.elem(document),_dlg, isIE6 = H.browser.type == 'msie' && H.browser.version < 7, _close = function(e) {
		hide(true);
		return false;
	};
	function init(){
		if (inited) {
			setTitle('');
			hideAllBtns();
			return;
		}
		inited = true;
		dlg = H.ui._node('div', {
			'class':'dialog'
		});
		dlg.style.display = 'none';
		dlg.style.position = 'absolute';
		dlg.innerHTML = '<div class="dhd"><span></span><a title="关闭"></a></div><div class="dbd"></div><div class="dft"><input type="button" class="e-btn-light" value="确定"/><input type="button" value="取消"/></div>';
		dlg.style.zIndex = 10000;
		document.body.appendChild(dlg);
		H.each(dlg.childNodes[2].childNodes, function(){
			this.onclick = _close;
		});
		dlg.childNodes[0].childNodes[1].onclick = _close;
		_dlg = H.ui.elem(dlg);
	}
	
	function getContentNode(name, attr) {
		attr = attr | {};
		H.extend(attr, {'class': 'bd'});
		switch (name) {
			case 'DIV':
				node = H.ui._node(name, attr);
				break;
			case 'IFRAME':
				var a = {
					frameBorder:'no',
					scrolling:'no',
					marginwidth:'0',
					marginheight:'0'
				};
				H.extend(a, attr);
				node = H.ui._node(name, a);
				break;
			case 'FORM':
				var a = {
					method:'POST'
				};
				node = H.ui._node(name, a);
				break;
		}
		return node;
	}
	
	function setTitle(title) {
		dlg.childNodes[0].childNodes[0].innerHTML = title;
	}
	
	function setContent(content) {
		H.ui.elem(dlg.childNodes[1]).html(content);
	}
	
	function changeDlgNodeName(name) {
		name = name.toUpperCase();
		if (dlg.childNodes[1].tagName != name) {
			dlg.replaceChild(getContentNode(name), dlg.childNodes[1]);
		}
	}
	
	function enableOkBtn(){
		dlg.childNodes[2].style.display = '';
		dlg.childNodes[2].childNodes[0].style.display = '';
	}
	
	function enableCancelBtn(){
		dlg.childNodes[2].style.display = '';
		dlg.childNodes[2].childNodes[1].style.display = '';
	}
	
	function hideAllBtns(){
		dlg.childNodes[2].style.display = 'none';
		H.each(dlg.childNodes[2].getElementsByTagName('input'), function() {
			this.style.display = 'none';
		});
	}
	
	function show() {
		dlg.style.display = 'block';
		if (!_sized) {
			dlg.childNodes[1].style.height = 'auto';
			
			// 调整高度
			var height = 0;
			H.each(dlg.childNodes, function() {
				height += H.ui(this).height(true);
			});
			dlg.style.height = height + 'px';
		} else {
			_sized = false;
		}
		
		move();
	}
	
	function move() {
		// 显示到屏幕正中央
		var w = _d.width(), h = _d.height(), os = _d.offset();
		dlg.style.left = parseInt( os.left +  (w - _dlg.width(true))/2) + 'px';
		dlg.style.top = parseInt(os.top + (h - _dlg.height(true))/2) + 'px';
	}
	
	function resizeBody() {
		dlg.childNodes[1].style.width = '100%';
		dlg.childNodes[1].style.height = (H.ui.elem(dlg).height(false) - H.ui.elem(dlg.childNodes[0]).height() - H.ui.elem(dlg.childNodes[2]).height()) + 'px';
	}
	
	function hide(hideMask) {
		if (dlg) {
			dlg.style.display = 'none';
			
			if (typeof _cb == 'function') {
				_cb.call();
			}
		}
		if (hideMask && _mask && _mask.style.display != 'none') {
			_mask.style.display = 'none';
			
			// 显示select控件
			if (isIE6) {
				H.ui.tag('select').each(function(){
					if (!this.getAttribute('ignoreHidden')) {
						this.style.visibility = 'visible';
					}
				});
			}
		}
		return false;
	}
	
	function registCallback(callback) {
		if (undefined === callback) {
			_cb = null;
		}
		switch(typeof callback) {
			case 'string':
				_cb = function(){
					window.location = callback;
					_cb = null;
				};
				break;
			case 'function':
				_cb = function(){
					callback.call();
					_cb = null;
				}
				break;
		}
	}
	
	me = {
		/**
		 * 设置标题
		 * @param {Object} title
		 */
		title:function(title){
			if (!dlg) {
				return;
			}
			setTitle(title);
			return me;
		},
		/**
		 * 设置主体内容
		 * @param {Object} ctx
		 */
		content: function(ctx) {
			init(false);
			setContent(ctx);
			resizeBody();
			show();
			return me;
		},
		/**
		 * 设置对话框的大小
		 * @param {Object} w
		 * @param {Object} h
		 */
		size: function(w, h) {
			_sized = true;
			init();
			dlg.childNodes[0].style.width = dlg.childNodes[2].style.width = w + 'px';
			dlg.childNodes[1].style.width = parseInt(w-20) + 'px';
			dlg.style.height = h + 'px';
			dlg.style.width = w + 'px';
			move();
			return me;
		},
		/**
		 * 显示OK对话框
		 * @param {Object} msg
		 * @param {Object} callback
		 */
		ok:function(msg, callback, resize){
			init();
			if (undefined === resize || resize) {
				me.size(250, 120);
			}
			changeDlgNodeName('div');
			setContent('<span class="dok">' + msg + '</span>');
			enableOkBtn();
			show();
			
			registCallback(callback);
			me.mask();
			me.title('提示');
			return me;
		},
		/**
		 * 隐藏对话框
		 * @param {Boolean} hideMask 是否隐藏mask
		 */
		hide: function(hideMask) {
			if (undefined === hideMask) {
				hideMask = true;
			}
			hide(hideMask);
			return me;
		},
		/**
		 * 显示错误对话框
		 * @param {Object} msg
		 * @param {Object} callback
		 */
		error:function(msg, callback, resize){
			init();
			if (undefined === resize || resize) {
				me.size(250, 120);
			}
			changeDlgNodeName('div');
			setContent('<span class="derr">' + msg + '</span>');
			enableOkBtn();
			show();
			
			registCallback(callback);
			me.mask();
			me.title('提示');
			return me;
		},
		/**
		 * 显示框架对话框
		 * @param {Object} url
		 */
		iframe: function(url) {
			url = url ? url : '';
			if (!url) {
				H.log.error('hapj.lib.dialog url is not supplied');
			}
			init(); 
			changeDlgNodeName('iframe');
			show();
			resizeBody();
			dlg.childNodes[1].setAttribute('src', url);
			me.mask();			
			return me;
		},
		/**
		 * 通过ajax获取一个页面，然后将内容填充到内容区
		 * @param {String} url
		 * @param {Function} onSuccess
		 * @param {Function} onClose
		 */
		ajax: function(url, onSuccess, onClose) {
			init();
			changeDlgNodeName('div');
			show();
			resizeBody();
			H.lib.ajax({
				url: url,
				type: 'get',
				dataType: 'html',
				success: function(html) {
					setContent(html);
					onSuccess && onSuccess();
				}
			});
			if (onClose) {
				registCallback(onClose);
			}
			H.ui.dialog.mask();
			return me;
		},
		mask: function() {
			if (!_mask) {
				_mask = H.ui._node('div');
				var css = {
					position:'fixed',
					left:0,
					top:0,
					zIndex:9995,
					width:'100%',
					height:'100%',
					backgroundColor: '#FFF',
					opacity: 0.5,
					filter: 'Alpha(Opacity=50)'
				};
				if (isIE6) {
					H.extend(css, {
						position:'absolute',
						height:H.ui(document).height(true)
					});
					H.ui.tag('select').each(function(){
						if (this.style.visibility == 'hidden' || this.style.display == 'none') {
							this.setAttribute('ignoreHidden', 1);
						}
					});
				}
				H.ui(_mask).css(css);
				H.ui.on(_mask, 'click', function(e) {
					e.stopPropagation();
					return false;
				});
				document.body.appendChild(_mask);
			}
			// 隐藏select控件
			if (isIE6) {
				H.ui.tag('select').each(function(){
					if (!this.getAttribute('ignoreHidden')) {
						this.style.visibility = 'hidden';
					}
				});
			}
			_mask.style.display = 'block';
			return me;
		}
	};
	H.ui.dialog = me;
})(hapj);

/************************----------ui/selectable.js-------------************************************/
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2011-12-30
 * @version 1.0 
 * @brief 映射下拉框到可定制的下拉组件
 * @example 
 * hapj.ui.tag('select').selectable();
 **/
(function(H, Me, undefined){
H.ui.fn.selectable = function(options){
	this.each(function(){
		if (this.tagName != 'SELECT') {
			return;
		}
		var s = new Select(this);
		s.options = options;
		s.init();
	});
	return this;
};

var Select = function(elem) {
	this.elem = elem;
	this.length = this.elem.options.length;
};
Select.prototype = {
	init: function() {
		// 获取原有select控件的基本属性
		this.dom = H.ui.elem(H.ui._node('dl', {'class': this.elem.className}));
		this.dom.html(this.buildHtml());
		
		this.elem.parentNode.insertBefore(this.dom[0], this.elem);
		var offset = H.ui.elem(this.elem).offset();
		this.bindEvents();
		this.elem.style.display = 'none';
		
		if (this.elem.selectedIndex > -1) {
			this.select(this.elem.selectedIndex);
		}
	},
	length:0,
	buildHtml: function() {
		var ret = [], lh = '';
		if (this.length > 8) {
			lh = ' style="height:150px;overflow:auto;overflow-x:hidden;"';
		}
		ret.push('<dt><label></label><a></a></dt>');
		ret.push('<dd><ul' + lh + '>');
		for(var i = 0; i < this.length; i++) {
			ret.push('<li index="' + i + '">' + this.elem.options[i].text + '</li>')
		}
		ret.push('</ul></dd>');
		return ret.join('');
	},
	bindEvents: function(){
		var self = this, index = 0;
		// 绑定dt事件
		this.dom.tag('dt').on('click', function(e) {
			self.dom.tag('dd').show();
			e.stopPropagation();
		})
		H.ui.on(document, 'click', function() {
			self.dom.tag('dd').hide();
		})
		
		// 绑定dd事件
		this.dom.on('li', 'click', function(e) {
			self.select(e.target.getAttribute('index'));
			e.stopPropagation();
			self.dom.tag('dd').hide();
		});
		this.dom.on('li', 'mouseover', function(e) {
			e.target.className = 'on';
		});
		this.dom.on('li', 'mouseout', function(e) {
			e.target.className = '';
		});
	},
	select: function(i) {
		var option = this.elem.options[i], txt;
		this.elem.selectedIndex = i;
		if (this.options.pack) {
			txt = this.options.pack(option);
		} else {
			txt = option.text;
		}
		this.dom.tag('dt').tag('label').html(txt);
		
		if (document.createEvent) {
			var evt = document.createEvent('HTMLEvents');
			evt.initEvent('change', true, true);
			this.elem.dispatchEvent(evt);
		} else {
			this.elem.fireEvent('onchange');
		}
	}
};
})(hapj);

/************************----------ui/cal.js-------------************************************/
(function(H){
	var wds = ['日','一','二','三','四','五','六'],
	/**
	 * 获取日期
	 * @param {Object} elem
	 */
	getDate = function(elem) {
		var ds = elem.getAttribute('cinfo').split(',');
		ds[0] = parseInt(ds[0]);
		ds[1] = parseInt(ds[1]) + 1;
		ds[2] = parseInt(ds[2]);
		return ds;
	},
	/**
	 * 得到某个月的所有格子
	 * @param {Object} year
	 * @param {Object} month
	 * @param {Object} day
	 */
	getMonthGrids = function(year, month, day, sdt, edt) {
		// 获取
		var	fd = getMonthFirstDay(year, month),//上个月的天数
			dt = getMonthDayNum(year, month),//一个月的天数
			gt = 7*5, //格子数
			i = 0,
			r = 0,
			c = 0,
			d = 0,
			nm,
			pm,
			pmd,
			arr = new Array(5),
			now = new Date(),
			isCmonth = year == now.getFullYear() && month == now.getMonth();

		if (fd > 0) {
			pm = getPrevMonth(year, month);
			pmd = getMonthDayNum(pm[0], pm[1]);
		}
		if (fd + dt < gt) {
			nm = getNextMonth(year, month);
		}

		for(; i < gt; i++) {
			var curY,curM,curD,curCs;
			c = i % 7;
			if (i >= fd) {
				d++;
			}
			if (undefined === arr[r]) {
				arr[r] = new Array(7);
			}
			
			if (d > dt) {//下一月
				curY = nm[0];
				curM = nm[1];
				curD = d - dt;
				curCs = 'cn';
				//arr[r][c] = [nm[0], nm[1], d - dt, 'cn'];
			} else {
				if (d == 0) {//上一月
					curY = pm[0];
					curM = pm[1];
					curD = pmd - (fd - i) + 1;
					curCs = 'cp';
					//arr[r][c] = [pm[0], pm[1], pmd - (fd - i) + 1, 'cp'];
				} else {//当前月
					curY = year;
					curM = month;
					curD = d;
					curCs = 'cc';
					if (isCmonth && day == d &&  d > 0 && d <= dt) {//今天
						curCs += ' cd';
					}
					//arr[r][c] = [year, month, d, cs];
				}
			}
			var dateStr = curY+'-'+(curM+1)+'-'+curD;
			if( sdt !== undefined && compareDate(sdt,dateStr) > 0 ){
				curCs += ' co';
			}
			
			if( edt !== undefined && compareDate(dateStr,edt) > 0 ){
				curCs += ' co';
			}
			
			arr[r][c] = [curY, curM, curD, curCs];

			if (c == 6) {
				r++;
			}
		}
		
		return arr;
	},
	compareDate = function(a,b) {
	    var sArr=a.split("-");
	    var sTime=new Date(sArr[0],sArr[1],sArr[2]);
	    	sTime=sTime.getTime();
	    var eArr=b.split("-");
	    var eTime=new Date(eArr[0],eArr[1],eArr[2]);
	    	eTime=eTime.getTime();
	    if( sTime > eTime ) {
	        return 1;
	    }else{
	        return -1;
	    }
	},
	/**
	 * 根据格子提供的数据创建日历
	 * @param {Array} grids
	 * @param {Number} year
	 * @param {Number} month
	 */
	renderCalendar = function(grids, year, month) {
		var code = [];
		
		// 生成头部控制
		code.push('<ul class="g hd">');
		code.push('<li class="g-1-8"><a class="cpy" title="上一年">&lt;&lt;</a></li>');
		code.push('<li class="g-1-8"><a class="cpm" title="上一月">&lt;</a></li>');
		code.push('<li class="g-1-2"><div class="g ct">' + renderYearList(year) + renderMonthList(month) + '</div></li>');
		code.push('<li class="g-1-8"><a class="cnm" title="下一月">&gt;</a></li>');
		code.push('<li class="g-1-8"><a class="cny" title="下一年">&gt;&gt;</a></li>');
		code.push('</ul>');
		
		
		code.push('<ul class="g bd">');
		
		// 生成星期
		for(var i = 0; i < 7; i++) {
			code.push('<li class="g-1-7 cw">' + wds[i] + '</li>');
		}
		
		// 生成日历
		for(var i = 0, l = grids.length; i < l; i++) {
			for(var j = 0, m = grids[i].length; j < m; j++) {
				var day = grids[i][j],d = day[2], cs = day.pop(), cdaycs = '';
				
				if(cs.indexOf("co") < 0){
					cdaycs = 'cday';
				}
				code.push('<li class="g-1-' + m + ' ' + cs + '" cinfo="' + day.join(',') + '"><a class="'+cdaycs+'">' + d + '</a></li>');
			}
		}
		code.push('</ul>');
		return code.join('');
	},
	renderYearList = function(year) {
		var code = [];
		code.push('<dl class="g-1-2 slt">');
		for(var i = 10; i > 0; i--) {
			code.push('<dd style="display:none"><a class="cyl">' + (year - i) + '</a></dd>');
		}
		code.push('<dd><a class="cy" title="点击选择年份">' + year + '</a></dd>');
		for(var i = 1; i <= 10; i++) {
			code.push('<dd style="display:none"><a class="cyl">' + (year + i) + '</a></dd>');
		}
		code.push('</dl>');
		return code.join('');
	},
	renderMonthList = function(month) {
		var code = [];
		code.push('<dl class="g-1-2 srt">');
		for(var i = month - 5; i < month; i++) {
			var m = (i + 12) % 12;
			code.push('<dd style="display:none"><a class="cml">' + (m + 1) + '</a></dd>');
		}
		code.push('<dd><a class="cm" title="点击选择月份">' + (month + 1) + '</a></dd>');
		for(var i = month + 1; i < month + 7; i++) {
			var m = i % 12;
			code.push('<dd style="display:none"><a class="cml">' + (m + 1) + '</a></dd>');
		}
		code.push('</dl>');
		return code.join('');
	},
	/**
	 * 获取某个月份的第一天是星期几
	 * @param {Object} year
	 * @param {Object} month
	 */
	getMonthFirstDay = function(year, month) {
		var date = new Date(year, month, 1);
		return date.getDay();
	},
	/**
	 * 获取某个月的天数
	 * @param {Number} year
	 * @param {Number} month
	 */
	getMonthDayNum = function(year, month) {
		switch(month) {
			case 0:
	        case 2:
	        case 4:
	        case 6:
	        case 7:
	        case 9:
	        case 11:
	            return 31;
	        case 1:
	            return year % 100 != 0 && year % 4 == 0 || year % 400 == 0 ? 29 : 28;
	        case 3:
	        case 5:
	        case 8:
	        case 10:
	            return 30;
		}
	},
	/**
	 * 得到下一个月
	 * @param {Object} year
	 * @param {Object} month
	 */
	getNextMonth = function(year, month) {
		var m = month + 1;
		if (m > 11) {
			m = 0;
			year++;
		}
		return [year, m];
	},
	/**
	 * 得到上一个月
	 * @param {Object} year
	 * @param {Object} month
	 */
	getPrevMonth = function(year, month) {
		var m = month - 1;
		if (m < 0) {
			m = 11;
			year--;
		}
		return [year, m];
	},
	Calendar = function(elem, options) {
		this.elem = elem;
		this.elem.className += ' cal';
		this.options = options;
	}
	;
	Calendar.prototype = {
		_inited: false,
		initDate:[],
		year:0,
		month:0,
		getYearElem:function(){
			return H.ui._tag('dl', this.elem)[0];
		},
		getMonthElem:function(){
			return H.ui._tag('dl', this.elem)[1];
		},
		hideList:function() {
			var ye = this.getYearElem(), me = this.getMonthElem();
			if (ye.getAttribute('cstatus') == 1) {
				H.each(ye.childNodes, function(){
					if (this.firstChild.className == 'cyl') {
						this.style.display = 'none';
					}
				});
				ye.className = ye.className.replace(/ on/, '');
				ye.setAttribute('cstatus', 1);
			}
			
			if (me.getAttribute('cstatus') == 1) {
				H.each(me.childNodes, function(){
					if (this.firstChild.className == 'cml') {
						this.style.display = 'none';
					}
				});
				me.className = me.className.replace(/ on/, '');
				me.setAttribute('cstatus', 1);
			}
		},
		init: function(year, month, day, sdt, edt) {

			year = parseInt(year, 10);
			month = parseInt(month, 10);
			day = parseInt(day, 10);
			this.initDate = [year, month, day];
			this.year = year;
			this.month = month;
			this.sdt = sdt;
			this.edt = edt;
			
			var grids = getMonthGrids(year, month, day, sdt, edt),
				code = renderCalendar(grids, year, month),
				self = this;
			this.elem.innerHTML = code;
			
			H.ui.on(this.elem, 'a', 'click', {
				'default': function(e) {
					self.hideList();
				},
				cday: function(e, t, f, o) {
					self.hideList();
					t = e.target;
					o = self.options;
					f = o.format || 'Y-m-d';
					if (o.onSelect) {
						o.onSelect.apply(t, getDate(t.parentNode));
					}
				},
				cpm: function(e) {
					self.showPrevMonth();
				},
				cpy: function(e) {
					self.showPrevYear();
				},
				cnm: function(e) {
					self.showNextMonth();
				},
				cny: function(e) {
					self.showNextYear();
				},
				cy: function(e, p) {
					self.hideList();
					p = e.target.parentNode.parentNode;
					p.className += ' on';
					p.setAttribute('cstatus', 1);
					
					setTimeout(function(){
						p.scrollTop = p.scrollHeight/2 - p.childNodes[0].scrollHeight/2;
					});
					
					H.each(p.childNodes, function(){
						this.style.display = 'block';
					});
				},
				cm: function(e, p) {
					self.hideList();
					p = e.target.parentNode.parentNode;
					p.className += ' on';
					p.setAttribute('cstatus', 1);
					
					setTimeout(function(){
						p.scrollTop = p.scrollHeight*(5/12);
					});
					
					H.each(p.childNodes, function(){
						this.style.display = 'block';
					});
				}, 
				cml: function(e, t, m) {
					t = e.target;
					m = parseInt(t.innerHTML) - 1;
					self.showMonth(self.year, m);
				},
				cyl: function(e, t, y) {
					t = e.target;
					y = parseInt(t.innerHTML);
					self.showMonth(y, self.month);
				}
			});
		},
		showPrevMonth: function() {
			var ms = getPrevMonth(this.year, this.month);
			this.showMonth(ms[0], ms[1]);
		},
		showNextMonth: function() {
			var ms = getNextMonth(this.year, this.month);
			this.showMonth(ms[0], ms[1]);
		},
		showPrevYear: function() {
			this.showMonth(this.year - 1, this.month);
		},
		showNextYear: function() {
			this.showMonth(this.year + 1, this.month);
		},
		showMonth: function(year, month) {
			this.year = year;
			this.month = month;
			var grids = getMonthGrids(year, month, this.initDate[2], this.sdt, this.edt);
			this.elem.innerHTML = renderCalendar(grids, year, month);
		},
		hide: function() {
			this.hideList();
			this.elem.style.display = 'none';
		},
		show: function() {
			this.hideList();
			this.elem.style.display = 'block';
		}
	};
	
	H.ui.fn.cal = function(options){
		var cal = new Calendar(this[0], options);
		return cal;
	}
})(hapj);

/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-03-016
 * @version 1.0 
 * @brief
 **/

 (function(H, undefined){
 	var cfg,loadJs = false,
	_fd = function(y, m, d, format) {
		m < 10 ? (m = '0' + m) : '';
		d < 10 ? (d = '0' + d) : '';
		var dates = {
			Y:y,
			m:m,
			d:d
		}
		return format.replace(/(([Ymd]))/g, function(m, i, k){
			return dates[k];
		});
	},
	me = {
		init: function(configs) {
			cfg = configs;
		},
		active: function(id) {
			var node = H.ui._node('div'), trigger = typeof id == 'string' ? H.ui.id(id) : H.ui(id), options = H.extend({}, cfg)
				n = trigger.next();
				
			node.style.display = 'none';
			document.body.appendChild(node);
						
			if (!H.ui.fn.menuable) {
				return H.log.error('hapj.lib.cal menuable module is not loaded');
			}
			var mn = H.ui.elem(node).menuable(), format = options.format || 'Y-m-d',
				sdt = options.startDate || undefined,
				edt = options.endDate || undefined;

			if (H.ui.fn.floatable) {
				H.ui.elem(node).floatable(trigger[0]).left().bottom(0, true);
			}
			trigger.attr({
				'readonly': 'readonly',
				'autocomplete':'off'
			});
			
			trigger.on('click', function(e){
				cal.hideList();
				mn.show(e);
			});

			var cal = H.ui.elem(node).cal({
				onSelect: function(y, m, d) {
					trigger.attr('value', _fd(y, m, d, format));
					cal.hide();
					mn.hide();
					
					// 使trigger引发onblur事件，用来满足验证事件的发生
					if (document.createEvent) {
						var evt = document.createEvent('HTMLEvents');
						evt.initEvent('blur', true, true);
						trigger[0].dispatchEvent(evt);
					} else {
						trigger[0].fireEvent('onblur');
					}
				}
			});
			
			// 设置默认值
			var defDate = trigger.attr('value'), date;
			if (defDate) {
				var reg = new RegExp('^' + format
					.replace('Y', '([12][0-9]{3})')
					.replace('m', '((?:1[012])|(?:0?[1-9]))')
					.replace('d', '((?:[1-2][0-9])|(?:0?[1-9])|(?:3[01]))')
					.replace('-', '\-') + '$'), ms;
				if (ms = reg.exec(defDate)) {
					var y = ms[1],m = parseInt(ms[2], 10) - 1,d = parseInt(ms[3], 10);
					try {
						date = new Date(y, m, d);
						cal.init(y, m, d, sdt, edt);
					} catch (e) {
						
					}
				}
			} else {
				date = new Date();
				cal.init(date.getFullYear(), date.getMonth(), date.getDate(), sdt, edt);
			}

			return cal;
		}
	};
 	H.lib.cal = me;
 })(hapj);
 
/************************----------ui/verifiable.js-------------************************************/
 /** 
  * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
  * @author dengxiaolong@jiehun.com.cn
  * @date 2012-01-07
  * @version 1.0 
  * @brief 使元素可验证
  * @example 
  * 
  * ## html code
 <form id="formAdd" method="post">
 	<input type="text" name="data[username]" verify-rule="{
 		required:{
 			msg:'username is required.'
 		},
 		remote: {
 			url: '/user/username-is-exist',
 			data:'username={$value}',
 			msg:'username is existed.',
 	}"/>
 	<input type="email" name="data[email]" verify-rule="{
 		email:{
 			msg:'email format is wrong.'
 		}
 	}"/>
 </form>
  * 
  * ## js code
 hapj(function(H){
 	H.ui.id('formAdd').verifiable();
  });
  **/
 (function(H, undefined){
 var verifyRules = {
 	addRule:function(type, verify) {
 		if (type in _vRules) {
 			return H.log.warn('hapj.ui.verifiable the rule named ' + type + ' is exited');
 		}
 		_vRules[type] = verify;
 	},
 	addRules:function(verifies) {
 		var self = this;
 		H.each(verifies, function(type){
 			self.addRule(type, this);
  		});
 	},
 	/**
 	 * 验证规则
 	 * @param {Mixed} value
 	 * @param {String} type
 	 * @param {Object} rule
 	 * @return Boolean
 	 */
 	verify:function(value, type, rule) {
 		if (type in _vRules) {
 			if (H.isArray(value)) {
 				var pass = true;
 				H.each(value, function(i){
 					if (!_vRules[type](value[i], rule)) {
 						pass = false;
 						return false;
 					}
 				});
 				return pass;
 			}
 			return _vRules[type](value, rule);
 		} else {
 			H.log.warn('hapj.ui.verifiable the verify type named ' + type + ' is not supported');
 		}
 	}
 },
 _vRules = {},
 _rules = {},
 _hints = {},
 _inited = false,
 _notValueElemExp = /RADIO|CHECKBOX/,
 getValue = function(elem) {
 	if (elem.type && /^(select\-multiple|radio|checkbox)$/.test(elem.type)) {
 		var values = [];
 		if (elem.nodeName == 'SELECT') {
 			H.each(elem.options, function(){
 				if (this.selected) {
 					values.push(this.value);
 				}
 			})
 		} else {
 			H.each(elem.form[elem.name], function(){
 				if (this.checked) {
 					values.push(this.value);
 				}
 			});
 		}
 		if (values.length > 1) {
 			return values;
 		}
 		return values.join(',');
 	}
 	return elem.value;
 },
 _init = function() {
 	if (_inited) {
 		return;
 	}
 	_addRules();
 	_inited = true;
 },
 _dateReg = /^([12][0-9]{3})[\-\/\_\.\s](0?[1-9]|1[012])[\-\/\_\.\s](0?[1-9]|[12][0-9]|3[01])$/,
 _str2date = function(str) {
 	var ms = _dateReg.exec(str), date;
 	if (ms) {
 		var y = parseInt(ms[1], 10), m = parseInt(ms[2], 10) - 1, d = parseInt(ms[3], 10);
 		try {
 			return new Date(y, m, d);
 		} catch (e) {
 			return false;
 		}
 	}
 	return false;
 },
 _addRules = function(){
 	verifyRules.addRules({
 		/**
 		 * 验证是否为空
 		 * @param {Object} val
 		 */
 		required: function(val){
 			return H.trim(val) != '';
 		},
 		/**
 		 * 验证是否为数字
 		 * @param {Object} val
 		 */
 		number: function(val, rule) {
 			return !isNaN(val);
 		},
 		/**
 		 * 验证是否为金钱,保留两位小数
 		 * @param {Object} val
 		 */
 		price: function(val) {
 			return /^(\d{1,7})(\.\d{2})?$/.test(val);
 		},
 		/**
 		 * 验证是否为email地址
 		 * @param {Object} val
 		 */
 		email: function(val) {
 			return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(val);
 		},
 		/**
 		 * 验证是否符合正则表达式
 		 */
 		regexp: function(val, rule) {
 			return new RegExp(rule.exp).test(val);
 		},
 		/**
 		 * 验证是否中文
 		 * @param {String} val
 		 * @param {Object} rule
 		 * {
 		 * 		min:最小长度
 		 * 		max:最大长度
 		 * }
 		 */
 		chinese:function(val, rule) {
 			if (undefined === rule.min) {
 				rule.min = 0;
 			}
 			if (undefined === rule.max) {
 				rule.max = Number.MAX_VALUE;
 			}
 			return new RegExp('^[\u4e00-\u9fa5]{' + rule.min + ',' + rule.max + '}$').test(val);
 		},
 		/**
 		 * 身份证验证
 		 * @param {String} val
 		 * @param {Object} rule
 		 * {
 		 * 		minAge: 最小年龄
 		 * 		maxAge: 最大年龄
 		 * 		sex: ['male', 'female'] male 男性 female 女性
 		 * 		province: 省份名称，如北京、天津等
 		 * }
 		 */
 		ID:function(val, rule){
 			if (!val) return false;
 			var len = val.length;
 			if (len != 15 && len != 18) {
 				return false;
 			}
 			// 检测基本格式是否正确
 			if (!/^(\d{15})|(\d{17}([0-9xX]))$/.test(val)) {
 				return false;
 			}
 			
 			// 根据校验规则检查身份证合法性
 			if (len == 18) {
 				var total = 0, v = [1,0,'X',9,8,7,6,5,4,3,2], mod, rightCode;
 				H.each([7, 9, 10, 5, 8, 4, 2, 1, 6, 3], function(i){
 					if (i < 7) {
 						total += ((parseInt(val.charAt(i)) + parseInt(val.charAt(i+10))) * this);
 					} else {
 						total += (parseInt(val.charAt(i))) * this;
 					}
 				});
 				mod = total % 11;
 				rightCode = v[mod] + '';
 				if (val.charAt(17).toLowerCase() != rightCode.toLowerCase()) {
 					return false;
 				}
 			}
 			
 			// 校验地区的合法性
 			if (!this.cities) {
 				this.cities = {11:'北京',12:'天津',13:'河北',14:'山西',15:'内蒙古',21:'辽宁',22:'吉林',23:'黑龙江 ',31:'上海',32:'江苏',33:'浙江',34:'安徽',35:'福建',36:'江西',37:'山东',41:'河南',42:'湖北 ',43:'湖南',44:'广东',45:'广西',46:'海南',50:'重庆',51:'四川',52:'贵州',53:'云南',54:'西藏 ',61:'陕西',62:'甘肃',63:'青海',64:'宁夏',65:'新疆',71:'台湾',81:'香港',82:'澳门',91:'国外'};
 			}
 			if (!(val.substr(0, 2) in this.cities)) {
 				return false;
 			}
 			// 检测限制的地区是否正确
 			if (rule.province && this.cities[val.substr(0,2)] != rule.province) {
 				return false;
 			}
 			
 			// 检查性别
 			if (rule.sex) {
 				var tag = val.substr(len == 15 ? len -1 : len - 2, 1);
 				if (tag % 2 == 0) {
 					if (rule.sex != 'female') {
 						return false;
 					}
 				} else {
 					if (rule.sex != 'male') {
 						return false;
 					}
 				}
 			}
 			
 			// 检测生日的合法性
 			var yearLen = len == 15 ? 2 : 4,
 				year = parseInt(len == 2 ? '19' + val.substr(6, yearLen) : val.substr(6, 4), 10),
 				month = parseInt(val.substr(6 + yearLen, 2), 10),
 				day = parseInt(val.substr(8 + yearLen, 2), 10),
 				d = new Date(year, month - 1, day);
 				
 			if (d.getFullYear() != year || d.getMonth() != month - 1 || d.getDate() != day) {
 				return false;
 			}
 			
 			var offDay = parseInt((new Date().getTime() - d.getTime())/(1000*3600*24));
 			// 检查最小年龄
 			if (!isNaN(rule.minAge)) {
 				if (offDay < 365 * rule.minAge) {
 					return false;
 				}
 			}
 			// 检查最大年龄
 			if (!isNaN(rule.maxAge)) {
 				if (offDay > 365 * rule.maxAge) {
 					return false;
 				}
 			}
 			return true;
 		},
 		/**
 		 * 验证是否为url链接
 		 * @param {Object} val
 		 */
 		url: function(val) {
 			return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(val);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 	
 		},
 		/**
 		 * 手机号码规则验证
 		 * @param {String} val
 		 * @param {Object} rule 具有如下参数
 		 * {
 		 * 		mobile:['mobile','home','400','both'] 手机类型，mobile 移动电话 home 座机 400电话 both 移动、座机、400都行
 		 * }
 		 */
 		phone: function(val, rule){
 			if (undefined === rule.mobile) {
 				rule.mobile = 'mobile';
 			}
 			switch(rule.mobile) {
 				case 'mobile':
 					return /^1[3|4|5|8]\d{9}$/.test(val);
 				case 'home':
 					return /^\d{3,4}\-\d{7,8}$/.test(val);
 				case '400':
 					return /^400\d{7}$/.test(val.replace(/[\s\-]/g, ''));
 				case 'both':
 					if( /(^1[3|4|5|8]\d{9}$)|(^\d{3,4}\-\d{7,8}$)/.test(val) ) {
 						return true;
 					}else{
 						return /^400\d{7}$/.test(val.replace(/[\s\-]/g, ''));
 					}
 			}
 		},
 		/**
 		 * 比较两个对象的值
 		 * @param {String} val
 		 * @param {Object} rule
 		 * {
 		 * 		to: 要比较对象的id
 		 * 		type: ['elem', 'value']
 		 * }
 		 */
 		compare: function(val, rule) {
 			var cVal = H.ui._id(rule.to).value;
 			if (!rule.condition) {
 				rule.condition = '=';
 			}
 			switch(rule.condition) {
 				case '=':
 				case 'equal':
 					return val == cVal;
 				case '!=':
 				case '<>':
 				case 'notEqual':
 					return val != cVal;
 				case '>':
 				case 'great':
 					return val > cVal;
 				case '<':
 				case 'less':
 					return val < cVal;
 				case '>=':
 				case 'notGreat':
 					return val >= cVal;
 				case '<=':
 				case 'notLess':
 					return val <= cVal;
 				default:
 					return H.log.error('hapj.ui.verifiable the condition(' + rule.condition + ') is not defined');
 			}
 		},
 		/**
 		 * 范围比较
 		 * @param {String} val
 		 * @param {Object} rule 
 		 * {
 		 * 		type: ['length','number'] length 长度比较 number 数值比较
 		 * 		min: 最小值
 		 * 		max: 最大值
 		 * }
 		 */
 		range: function(val, rule){
 			if (undefined === rule.min) {
 				rule.min = Number.MIN_VALUE;
 			}
 			if (undefined === rule.max) {
 				rule.max = Number.MAX_VALUE;
 			}
 			switch(rule.type) {
 				case 'length':
 					return val.length <= rule.max && val.length >= rule.min;
 					break;
 				case 'number':
 					val = parseInt(val, 10);
 					return val <= rule.max && val >= rule.min;
 					break;
 			}
 		},
 		/**
 		 * 远程校验 需要jQuery的支持
 		 * @param {Object} val
 		 * @param {Object} rule
 		 * {
 		 * 		url:  // 远程校验的网址
 		 * 		type:['POST','GET'] 方法，默认为post
 		 * 		data:提交给服务器端的数据，可以是key1=value1&key2=value2、{key1:value1}、function(){return {key1:value1}}等形式
 		 * 		dataType:['text','json', 'html']等
 		 * 		verify:函数，用来校验返回数据，如果返回true，说明校验成功，如果返回false，说明校验失败。如果没有这个函数，则返回的数据为true或者'true'时认为成功，其他都为失败
 		 * }
 		 */
 		remote: function(val, rule) {
 			if (undefined === this.cache) {
 				this.cache = {};
 			}
 			if (undefined === this.cache[rule.name]) {
 				this.cache[rule.name] = {};
 			}
 			
 			if (undefined === rule.url) {
 				return H.log.warn('hapj.ui.verifiable the url of the remote rule is not supplied');
 			}
 			
 			var data = rule.data || {value:val};
 			if (typeof data == 'function') {
 				data = data.call(this, val);
 			}
 			// 序列化data数据
 			var	dataKey = (typeof data == 'object') ? H.lib.serial.toString(data, 'pair') : data.toString(),
 				callback = function(data){
 					var pass = false;
 					if (rule.verify) {
 						pass = rule.verify.call(rule, data);
 					} else {
 						pass = (data == true || data == 'true');
 					}
 					if (pass) {
 						rule.success && rule.success.call();
 					}
 					else {
 						rule.failure && rule.failure.call();
 					}
 				},
 				cache = this.cache[rule.name];
 				
 			if (cache[dataKey]) {
 				callback(cache[dataKey]);
 			} else {
 				// 如果是表单提交的，默认通过
 				if (rule.formSubmit) {
 					return true;
 				}
 				H.lib.ajax({
 					url: rule.url,
 					type: rule.type ? rule.type : 'POST',
 					async: undefined !== rule.async ? rule.async : true,
 					data: data,
 					dataType: rule.dataType ? rule.dataType : 'json',
 					success: function(data){
 						cache[dataKey] = data;
 						
 						callback(data);
 					},
 					failure: function(){
 						H.log.error('hapj.ui.verifiable remote method called failed(' + rule.url + ')');
 					}
 				});
 			}
 		},
 		/**
 		 * 日期验证
 		 * @param {Object} val
 		 * @param {Object} rule
 		 * {
 		 * 	min:最小日期。可以是多少s、或者具体的日期，如 6*3600*24，表示离现在至少6天，或者2012-02-24,表示选择的日期不能在这个日期之前
 		 *  max:最大日期。和min的格式一样
 		 * }
 		 */
 		date: function(val, rule) {
 			var date = _str2date(val);
 			if (!date) {
 				return false;
 			}
 			// 检查最小数
 			if (rule.min || rule.max) {
 				var now = new Date();
 				if (rule.min) {
 					if (!isNaN(rule.min)) {
 						if ( (date.getTime() - now.getTime())/1000 < rule.min ) {
 							return false;
 						}
 					} else {
 						var min = _str2date(rule.min);
 						if (!min) {
 							return hapj.log.error('hapj.ui.verifiable date format wrong');
 						}
 						if (date.getTime() < min.getTime()) {
 							return false;
 						}
 					}
 				}
 				if (rule.max) {
 					if (!isNaN(rule.max)) {
 						if ( (date.getTime() - now.getTime())/1000 > rule.max ) {
 							return false;
 						}
 					} else {
 						var max = _str2date(rule.max);
 						if (!max) {
 							return hapj.log.error('hapj.ui.verifiable date format wrong');
 						}
 						if (date.getTime() > max.getTime()) {
 							return false;
 						}
 					}
 				}
 			}
 			return true;
 		}
 	});
 },
 VERIFY_KEY = 'verify-rule',
 // 设置提示元素
 createHinter = function(elem){
 	var last;
 	if (elem.nodeName == 'INPUT' && (elem.type == 'radio' || elem.type == 'checkbox') && elem.form[elem.name].length) {
 		var elems = elem.form[elem.name];
 		last = elems[elems.length - 1].nextSibling;
 	} else {
 		last = elem.nextSibling;
 	}
 	var d = document, node = d.createElement('span');
 	
 	while (last && (last.nodeType == 3 || /^(IMG|A|SPAN|EM|LABEL)$/.test(last.nodeName))) {
 		last = last.nextSibling;
 	}
 	
 	// 如果之后是文字节点
 	if (last && last.nodeType == 3) {
 		if (last.nextSibling) {
 			elem.parentNode.insertBefore(node, last.nextSibling);
 		} else {
 			elem.parentNode.appendChild(node);
 		}
 	} else {
 		if (last && last !== elem) {
 			elem.parentNode.insertBefore(node, last);
 		} else {
 			elem.parentNode.appendChild(node);
 		}
 	}
 	return node;
 },
 _formArray = [],
 _formCount = 0,
 /**
  * 得到验证表单
  * @param {Object} form
  */
 _getVForm = function(form, options) {
 	if (!form || form.tagName != 'FORM') {
 		return null;
 	}
 	
 	// 检查form是否被验证过，如果验证过，则直接调出之前的
 	var verfiedId = form.getAttribute('verfy-id'), vf;
 	if (verfiedId && verfiedId >= 0) {
 		vf = _formArray[verfiedId];
 		vf.cleanVerify();
 		return vf;
 	}
 	if (vf) {
 		vf.bindSubmit();
 		return vf;
 	}
 	
 	if (undefined == options) {
 		return H.log.error('hapj.ui.verifiable form is not init.');
 	}
 	
 	// 对表单进行验证
 	vf = new verifiableForm(form, options);
 	vf.bindSubmit();
 	form.setAttribute('verfy-id', _formCount);
 	_formArray[_formCount] = vf;
 	_formCount++;
 	return vf;
 }
 ;
 	
 hapj.ui.fn.verifiable = function(options){
 	if (this.length < 1) {
 		return;
 	}
 	options = options || {};
 	
 	options = H.extend({
 		success:null,
 		failure:null,
 		hint:null
 	}, options);
 	
 	H.each(this, function(){
 		var vf = _getVForm(this, options);
 		if (vf) {
 			vf.initElements();
 		}
 	});
 	_init();
 	
 	var self = this;
 	return {
 		/**
 		 * 重做验证。当加入了新的验证规则时需要进行此项
 		 */
 		redo: function(){
 			H.each(self, function(){
 				var vf = _getVForm(this);
 				if (vf) {
 					vf.initElements();
 				}
 			})
 		},
 		/**
 		 * 显示错误信息。
 		 * @param {Object} name 对应的表单元素的name
 		 * @param {Object} msg  显示的内容
 		 */
 		error: function(name, msg) {
 			H.each(self, function() {
 				var vf = _getVForm(this);
 				if (vf && vf.elemAttrs[name]) {
 					var attr = vf.elemAttrs[name];
 					attr.hinter.css('display', '').html(msg);
 					if (options.failure) {
 						options.failure.call(attr.elem, 'custom', null, attr.hinter);
 					}
 					attr.status = 'custom';
 				}
 			});
 		}
 	};
 };

 /**
  * 表单验证的主要逻辑
  * @param {Object} form
  * @param {Object} options
  */
 function verifiableForm(form, options) {
 	this.form = form;
 	this.options = options;
 	this.elemAttrs = {};
 	this.verifyFuncs = {};
 }
 verifiableForm.prototype = {
 	options: null,
 	errNum:0,//判断是否为表单中第一个报错，
 	/**
 	 * 进行验证
 	 * @param {HtmlElement} elem
 	 * @param {String} type
 	 * @param {Object} rule
 	 * @param {Boolean} required 是否必填
 	 */
 	doVerify: function(elem, type, rule, required) {
 		var self = this,
 		name = elem.name,
 		inputType = elem.type,
 		inputDisplay = elem.style.display,
 		attr = this.elemAttrs[name],
 		ret = null,
 		status = attr.status,
 		failure,
 		success,
 		options = this.options,
 		elemValue = getValue(elem),
 		errNum = self.errNum;
 		
 		if (!required && !elemValue) {
 			return;
 		}
 		// 如果已经是错误状态，则不继续验证
 		if (status && status != 'hint' && status != type) {
 			return;
 		}
 		failure = function(){
 			attr.hinter.css('display', '').html(rule.msg);
 			if(self.errNum == 0&&inputType!='hidden' && inputDisplay != 'none'){
 				elem.focus();//焦点到第一个报错的elem
 				self.errNum++;
 			}
 			options.failure && options.failure.call(elem, type, rule, attr.hinter);
 			attr.status = type;
 		};
 		success = function() {
 			// 如果是下拉框，则不显示成功提示
 			if (elem.nodeName == 'SELECT') {
 				attr.hinter.hide();
 			} else {
 				attr.hinter.css('display', '').html('');
 			}
 			options.success && options.success.call(elem, type, rule, attr.hinter);
 		};
 		
 		if (true === rule.async) {
 			rule.success = success;
 			rule.failure = function(){
 				failure.call();
 			}
 			verifyRules.verify(elemValue, type, rule);
 		} else {
 			ret = verifyRules.verify(elemValue, type, rule);
 			if (true === ret) {
 				success();
 			} else if (false === ret) {
 				failure();	
 			}
 		}
 		
 		// 如果不是通过form进行的验证，则会调用trigger触发其他验证
 		if (!rule.formSubmit && rule.trigger && rule.trigger in this.verifyFuncs) {
 			this.verifyFuncs[rule.trigger]['func'].call();
 		}
 		
 		return ret;
 	},
 	/**
 	 * 处理提示规则
 	 * @param {HtmlElement} el
 	 * @param {Object} rules
 	 */
 	_handlerHintRule:function(el, rules) {
 		// 处理hinter
 		if (!('hint' in rules)) {
 			rules.hint = {msg:''};
 		}
 		if (typeof rules.hint == 'string') {
 			rules.hint = {msg: rules.hint};
 		} 
 		var self = this,
 			name = el.name, attr = {
 			hintMsg:rules.hint.msg,
 			hinter: rules.hint.id ? H.ui.id(rules.hint.id) : H.ui.elem(createHinter(el)),
 			status:'',
 			hint:function(){
 				if (this.hintMsg) {
 					this.hinter.css('display','').html(this.hintMsg);
 				} else {
 					this.hinter.hide();
 				}
 				this.status = 'hint';
 				self.options.hint && self.options.hint.call(el, 'hint', rules.hint, this.hinter);
 			}
 		};
 		this.elemAttrs[name] = attr;
 		
 		delete rules.hint;
 		attr.hint();
 		H.ui.on(el, 'focus', function(){
 			attr.hint();
 		});
 	},
 	/**
 	 * 处理其他规则
 	 * @param {Object} el
 	 * @param {Object} rules
 	 */
 	_handlerRules: function(el, rules) {
 		var required = 'required' in rules;
 		for(var type in rules) {
 			var rule = rules[type], name = (this.verifyCount++);
 			if (typeof rule == 'string') {
 				rule = {msg: rule};
 			}
 			
 			// 设置异步请求状态
 			if (type == 'remote' && undefined === rule.async) {
 				rule.async = true;
 			}
 			
 			if (!rule.event) {
 				rule.event = 'blur';
 			} 
 			var self = this,
 			func = (function(el, type, rule, required){
 				return function(e) {
 					if (self.formSubmit && e.target.nodeName != 'FORM') {
 						H.log.debug('from ' + e.target.nodeName);
 						return;
 					}
 					rule.formSubmit = self.formSubmit;
 					return self.doVerify.call(self, el, type, rule, required);}
 				;
 			})(el, type, rule, required);
 			
 			if (rule.name && isNaN(rule.name)) {
 				name = rule.name;
 			}
 			this.verifyFuncs[name] = {
 				'elem': el,
 				'func': func
 			};
 			// 修改规则的名称
 			rule.name = name;
 			
 			if (H.isArray(rule.event)) {
 				H.each(rule.event, function(){
 					H.ui.on(el, this, func);
 				});
 			} else {
 				H.ui.on(el, rule.event, func);
 			}
 		}
 	},
 	/**
 	 * 初始化表单元素的验证规则
 	 */
 	initElements: function(){
 		// 必须有name才予以验证
 		for(var i = 0, l = this.form.elements.length, el, ruleStr; i < l; i++) {
 			if ( !(el = this.form.elements[i]).name  // 必须要有name属性
 			|| !(ruleStr = el.getAttribute(VERIFY_KEY)) //必须要有验证规则
 			|| !H.trim(ruleStr) // 验证规则不为空
 			|| el.name in this.elemAttrs // 如果已经有过，就不再继续验证
 			) {
 				continue;
 			}
 			var name = el.name, rules;
 			try {
 				rules = eval('(' + ruleStr + ')');
 			} catch(e) {
 				return H.log.error(e.message);
 			}
 			
 			this._handlerHintRule(el, rules);
 			
 			this._handlerRules(el, rules);
 		}
 	},
 	/**
 	 * 清理无用的验证
 	 */
 	cleanVerify: function() {
 		var self = this;
 		H.each(this.verifyFuncs, function(key){
 			if (!this.elem.form) {
 				delete self.verifyFuncs[key];
 				delete self.elemAttrs[key];
 			}
 		});
 	},
 	/**
 	 * 绑定提交事件
 	 */
 	bindSubmit: function() {
 		var self = this;
 		//先将无用验证规则清楚
 		// 提交表单时进行验证
 		H.ui.on(this.form, 'submit', function(e){
 			self.cleanVerify();
 			self.errNum = 0;
 			var pass = true;
 			self.formSubmit = true;
 			for(var i in self.verifyFuncs) {
 				var ret = self.verifyFuncs[i]['func'].call(self, e);
 				if (ret === false) {
 					pass = false;
 				}
 			}
 			self.formSubmit = false;
 			if (pass) {
 				var ret = true;
 				if (self.options.submit) {
 					ret = self.options.submit.call(this, e, self.options);
 				} else {
 					var f = hapj.hook.get('form.submit');
 					if (f) {
 						ret = f.call(this, e, self.options);
 					}
 				}
 				return !(ret === false);
 			}
 			return false;
 		});
 	},
 	verifyCount: 0,
 	formSubmit: false
 };

 (function(){
 	// 支持hapj.com
 	var verifiableCfg, tmpId, tmpOptions;
 	hapj.ui.verifiable = {
 		init:function(options) {
 			verifiableCfg = options;
 		},
 		/**
 		 * 激活表单验证
 		 * @param {Object} id 元素id
 		 * @param {Object} handlers 处理函数
 		 */
 		active:function(id, handlers) {
 			var configs = {};
 			H.extend(configs, verifiableCfg);
 			H.extend(configs, handlers);
 			tmpId = typeof id == 'string' ? H.ui.id(id) : H.ui(id);
 			tmpOptions = H.extend({}, verifiableCfg);
 			
 			return tmpId.verifiable(configs);
 		},
 		addRule: verifyRules.addRule,
 		/**
 		 * 动态验证，当有元素通过动态方式加入表单后，需要执行一下该方法，以便将动态内容的验证加入进来
 		 */
 		dynamic: function(){
 			tmpId.verifiable(tmpOptions);
 		},
 		/**
 		 * 直接对内容进行验证
 		 * @param {Object} type 类型
 		 * @param {Object} val 值
 		 * @param {Object} options 规则
 		 */
 		doVerify: function(type, val, options) {
 			_init();
 			if (! type in _vRules) {
 				return hapj.log.warn('hapj.ui.verifialbe type not supported type=' + type);
 			}
 			return _vRules[type].call(null, val, options);
 		}
 	};
 })();
 })(hapj);

 			
/************************----------ui/lazyload.js-------------************************************/
(function(H){
	var lazyTag = 'hll',
	defaults = {
		onComplete:null,
		minLoadOffset:30// 开始加载图片的最小时间间隔
	},
	_d = H.ui.elem(document), 
	getDocPos = function() {
		var offset = _d.offset();
		// 顶部和底部都增加200px
		return {
			left: offset.left,
			top: offset.top - 200,
			width: _d.width(),
			height: _d.height() + 800
		};
	}, docPos
	;
	H.ui.fn.lazyload = function(options) {
		var cfg = H.extend({}, defaults), imgs = this.tag('img');
		if (!imgs.length) {
			return;
		}
		H.extend(cfg, options);
		
		var queue = new LLQueue(cfg);
		
		imgs.each(function() {
			if (this.src || !this.getAttribute(lazyTag)) return;
			
			var ll = new Lazyload(this);
			queue.push(ll);
			if (cfg.loadSrc) {
				ll.setLoading(cfg.loadSrc);
			}
		});
		
		queue.init();
	};
	
	var LLQueue = function(options) {
		this.options = options;
		this.queue = {};
		this.lockCount = this.loadCount = this.length = 0;
		this.locked = false;
		
		// 正在加载的数量，用来保护加载数量不能过多
		this.lastLoadTime = new Date().getTime();
	}
	LLQueue.prototype = {
		init: function() {
			var self = this;
			this.loadsFunc = function() {
				self.loads();
			}
			
			H(function() {
				H.ui.on(window, 'scroll', self.loadsFunc);
				// 用来防止firefox之外的浏览器一加载页面就下载第一屏的图片。
				setTimeout(function() {
					self.loadsFunc();
					H.ui.on(window, 'resize', self.loadsFunc);
				}, 100);
			});
		},
		push: function(ll) {
			this[this.length] = ll;
			ll.index = this.length;
			
			// 获取图片父容器的大小
			var i = H.ui.elem(ll.img), w = i.width(), h = i.height();
			if (!w || !h) {
				var p = i.parent();
				if (!p[0] || p[0].nodeType == 9) {
					w = h = 0;
				} else {
					docPos = getDocPos();
					w = Math.min(p.width(), docPos.width);
					h = Math.min(p.height(), docPos.height);
				}
			}
			ll.size(w, h);
			this.length ++;
		},
		onLoadComplete: function(ll) {
			this.loadCount++;
			delete this[ll.index];
			
			if (this.options.onLoad) {
				this.options.onLoad.call(ll, ll.index, this.loadCount, this.length);
			}
			
			if (this.loadCount >= this.length) {
				if (this.options.onComplete) {
					this.options.onComplete.call(this, this.length);
				}
				H.ui.un(window, 'scroll', this.loadsFunc);
				H.ui.un(window, 'resize', this.loadsFunc);
			}
		},
		/**
		 * 载入所有图片
		 */
		loads: function() {
			if (this.scrollCount == 1) {
				return;
			}
			if (this.locked) {
				this.lockCount++;
				return;
			}
			this.locked = true;
			var self = this;
			
			docPos = getDocPos();
			H.each(this, function(k, v) {
				// 一次加载的图片不能超过10个
				if (v && !v.lock &&  v.needLoad()) {
					// 每次图片加载间隔不能低于500ms
					var now = new Date().getTime(),offset = self.lastLoadTime + self.options.minLoadOffset - now;
					if (offset > 0) {
						v.load(function(ll){
							self.onLoadComplete(ll);
						}, offset);
						
						self.lastLoadTime += self.options.minLoadOffset;
					} else {
						self.lastLoadTime = now;
						v.load(function(ll){
							self.onLoadComplete(ll);
						});
					}
				}
			});
			this.locked = false;
			
			if (this.lockCount > 0) {
				this.lockCount = 0;
				this.loads();
			}
		}
	};
	
	
	
	function Lazyload(img) {
		this.img = img;
		this.src = img.getAttribute(lazyTag);
		this.lock = false;
	};
	
	
	Lazyload.prototype = {
		size: function(w, h) {
			this.width = w;
			this.height = h;
		},
		/**
		 * 检测是否需要载入
		 */
		needLoad: function() {
			var io = H.ui.elem(this.img).offset();
			if (!io.width || !io.height) {
				io = H.ui.elem(this.img.parentNode).offset();
			}
			if (io.left + this.width < docPos.left || io.top + this.height < docPos.top || io.left > docPos.left + docPos.width || io.top > docPos.top + docPos.height) {
				return false;
			}
			return true;
		},
		load:function(callback, offset) {
			if (this.lock) {
				return;
			}
			this.lock = true;
			offset = offset || 0;
			var img = this.img, self = this;
			if (offset > 0) {
				setTimeout(function(){
					H.load(self.src, function(){
						self.onLoad(this.src, callback);
					}, function() {
						self.onLoad('', callback);
					});
				}, offset);
			} else {
				H.load(this.src, function(){
					self.onLoad(this.src, callback);
				}, function() {
					self.onLoad('', callback);
				});
			}
		},
		setLoading:function(src) {
			this.oldBgStyle = this.img.parentNode.style.background;
			if (this.oldBgStyle && this.oldBgStyle.indexOf(src) > -1) {
				this.oldBgStyle = null;
			} else {
				this.img.parentNode.style.background = 'url(' + src + ') no-repeat center center';
			}
			this.img.style.visibility = 'hidden';
		},
		unsetLoading:function(src) {
			if (this.oldBgStyle !== null) {
				this.img.parentNode.style.background = this.oldBgStyle;
			}
			this.img.style.visibility = 'visible';
		},
		onLoad: function(src, callback) {
			if (src) {
				this.img.src = src;
			}
			this.img.removeAttribute(lazyTag);
			this.unsetLoading();
			if (callback) {
				callback.call(null, this);
			}
			this.lock = false;
		}
	};
})(hapj);
 			
/************************----------lib/serial.js-------------************************************/
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-02-17
 * @version 1.0 
 * @brief
 **/
(function(H, undefined){
var _e = encodeURIComponent,
_d = decodeURIComponent,
r20 = /%20/g,
me,
tos = {
	/**
	 * 转化为json格式的字符串
	 * @param {Mixed} from
	 */
	toJsonFormatString: function(from) {
		if (undefined !== window.JSON) {
			return JSON.stringify(from);
		}
		if (H.isArray(from)) {
			var results = [], self = this;
			for(var i = 0, l = from.length; i < l; i++){
				var v = self.toJson(from[i]);
				if (v !== undefined) {
					results.push(v);
				}
			};
			return '[' + results.join(',') + ']';
		} else {
			switch (typeof from) {
				case 'undefined':
				case 'unknown': 
					return '';
				case 'function':
				case 'boolean':
				case 'regexp':
					return from.toString();
				case 'number':
					return isFinite(from) ? from.toString() : 'null';
				case 'string':
					return '"' +
					from.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function(){
						var a = arguments[0];
						return (a == '\n') ? '\\n' : (a == '\r') ? '\\r' : (a == '\t') ? '\\t' : ""
					}) +
					'"';
				case 'object':
				 	if (from=== null) return 'null';
				    var results = [];
				    for (var p in from) {
				      var v = this.toJsonFormatString(from[p]);
				      if (v !== undefined) {
					  	results.push(this.toJsonFormatString(p) + ':' + v);
					  }
				    }
				    return '{' + results.join(',') + '}';
			}
		}
	},
	/**
	 * 转化为键值对的字符串
	 * @param {Object} from
	 */
	toPairFormatString: function(from) {
		if (typeof from != 'object') {
			throw new Error('serial.u_wrongTypeForPariString');
		}
		var ret = [];
		for(var key in from) {
			var v = from[key];
			key = _e(key);
			if (typeof v == 'function') {
				v = from[i].call(null);
			} else if (H.isArray(v)) {
				H.each(v, function(i) {
					ret.push(key + '=' + _e(v[i]));
				})
				continue;
			}
			ret.push(key + '=' + _e(v));
		}
		return ret.join('&').replace( r20, '+' );
	},
	/**
	 * 转化成md5格式的字符串
	 * @param {String} from
	 */
	toMd5FormatString: function(from) {
		return H.lib.md5(from.toString());
	},
	/**
	 * 转化成cookie格式的字符串
	 * @param {Object} from
	 */
	toCookieFormatString:function(from) {
		if (typeof from != 'object') {
			throw new Error('serial.u_wrongTypeForCookieFormatString');
		}
		if (!('name' in from)) {
			throw new Error('serial.u_keyOfNameLost');
		}
		var name = _e(from['name']), value;
		if (!('value' in from) || from.value === null) {
			value = '';
			from.expires = -1;
		} else {
			value = _e(from['value']);
		}
		var expires = '';
		if (from.expires
				&& (typeof from.expires == 'number' || from.expires.toUTCString)) {
			var date;
			if (typeof from.expires == 'number') {
				date = new Date();
				date.setTime(date.getTime()
						+ (from.expires * 24 * 60 * 60 * 1000));
			} else {
				date = from.expires;
			}
			expires = '; expires=' + date.toUTCString();
		}
		var path = from.path ? '; path=' + (from.path) : '',
		domain = from.domain ? '; domain=' + (from.domain) : '',
		secure = from.secure ? '; secure' : '';
		return [ name, '=', value, expires, path, domain, secure ].join('');
	}
},
getKeyValue = function(from, elemTag, kvTag, key) {
	var arr = from.split(elemTag), i, l, ret = {};
	for(i = 0, l = arr.length; i < l; i++ ) {
		var tmp = arr[i].split(kvTag), k = _d(H.trim(tmp[0]));
		if (!k) continue;
		if (k in ret) {
			if (!H.isArray(ret[k])) {
				ret[k] = [ret[k]];
			}
			ret[k].push(_d(tmp[1]));
		} else {
			ret[k] = _d(tmp[1]);
		}
	}
	if (key) {
		return key in ret ? ret[key] : null;
	}
	return ret;
}
;
	
	me = {
		toString:function(from, format) {
			if (!from){
				return '';
			}
			switch(format) {
				case 'md5':
					return tos.toMd5FormatString(from);
				case 'json':
					return tos.toJsonFormatString(from);
				case 'pair':
					return tos.toPairFormatString(from);
				case 'cookie':
					return tos.toCookieFormatString(from);
				default:
					throw new Error('serial.u_formatNotImplemented');
					return from;
			}
		},
		/**
		 * 获取json对象
		 * @param {Object} from
		 */
		getJson:function(from) {
			if (undefined !== window.JSON) {
				return JSON.parse(from);
			}
			return eval('(' + from + ')');
		},
		/**
		 * 获取cookie值
		 * @param {Object} from
		 * @param {Object} key
		 */
		getCookie: function(from, key) {
			return getKeyValue(from, ';', '=', key);
		},
		/**
		 * 获取键值对
		 * @param {Object} from
		 */
		getPair: function(from, key) {
			return getKeyValue(from, '&', '=', key);
		}
	};
	hapj.lib.serial = me;
})(hapj);

/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-01-09
 * @version 1.0 
 * @brief md5算法
 * @example 
 * 
 
 **/
(function(H){
	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
	function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
	function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
	function hex_hmac_md5(k, d)
	  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
	function b64_hmac_md5(k, d)
	  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
	function any_hmac_md5(k, d, e)
	  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function md5_vm_test()
	{
	  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
	}

	/*
	 * Calculate the MD5 of a raw string
	 */
	function rstr_md5(s)
	{
	  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	}

	/*
	 * Calculate the HMAC-MD5, of a key and some data (raw strings)
	 */
	function rstr_hmac_md5(key, data)
	{
	  var bkey = rstr2binl(key);
	  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
	    ipad[i] = bkey[i] ^ 0x36363636;
	    opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }

	  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
	  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
	}

	/*
	 * Convert a raw string to a hex string
	 */
	function rstr2hex(input)
	{
	  try { hexcase } catch(e) { hexcase=0; }
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var output = "";
	  var x;
	  for(var i = 0; i < input.length; i++)
	  {
	    x = input.charCodeAt(i);
	    output += hex_tab.charAt((x >>> 4) & 0x0F)
	           +  hex_tab.charAt( x        & 0x0F);
	  }
	  return output;
	}

	/*
	 * Convert a raw string to a base-64 string
	 */
	function rstr2b64(input)
	{
	  try { b64pad } catch(e) { b64pad=''; }
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var output = "";
	  var len = input.length;
	  for(var i = 0; i < len; i += 3)
	  {
	    var triplet = (input.charCodeAt(i) << 16)
	                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
	                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
	    for(var j = 0; j < 4; j++)
	    {
	      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
	      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
	    }
	  }
	  return output;
	}

	/*
	 * Convert a raw string to an arbitrary string encoding
	 */
	function rstr2any(input, encoding)
	{
	  var divisor = encoding.length;
	  var i, j, q, x, quotient;

	  /* Convert to an array of 16-bit big-endian values, forming the dividend */
	  var dividend = Array(Math.ceil(input.length / 2));
	  for(i = 0; i < dividend.length; i++)
	  {
	    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
	  }

	  /*
	   * Repeatedly perform a long division. The binary array forms the dividend,
	   * the length of the encoding is the divisor. Once computed, the quotient
	   * forms the dividend for the next step. All remainders are stored for later
	   * use.
	   */
	  var full_length = Math.ceil(input.length * 8 /
	                                    (Math.log(encoding.length) / Math.log(2)));
	  var remainders = Array(full_length);
	  for(j = 0; j < full_length; j++)
	  {
	    quotient = Array();
	    x = 0;
	    for(i = 0; i < dividend.length; i++)
	    {
	      x = (x << 16) + dividend[i];
	      q = Math.floor(x / divisor);
	      x -= q * divisor;
	      if(quotient.length > 0 || q > 0)
	        quotient[quotient.length] = q;
	    }
	    remainders[j] = x;
	    dividend = quotient;
	  }

	  /* Convert the remainders to the output string */
	  var output = "";
	  for(i = remainders.length - 1; i >= 0; i--)
	    output += encoding.charAt(remainders[i]);

	  return output;
	}

	/*
	 * Encode a string as utf-8.
	 * For efficiency, this assumes the input is valid utf-16.
	 */
	function str2rstr_utf8(input)
	{
	  var output = "";
	  var i = -1;
	  var x, y;

	  while(++i < input.length)
	  {
	    /* Decode utf-16 surrogate pairs */
	    x = input.charCodeAt(i);
	    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
	    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
	    {
	      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
	      i++;
	    }

	    /* Encode output as utf-8 */
	    if(x <= 0x7F)
	      output += String.fromCharCode(x);
	    else if(x <= 0x7FF)
	      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
	                                    0x80 | ( x         & 0x3F));
	    else if(x <= 0xFFFF)
	      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
	                                    0x80 | ((x >>> 6 ) & 0x3F),
	                                    0x80 | ( x         & 0x3F));
	    else if(x <= 0x1FFFFF)
	      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
	                                    0x80 | ((x >>> 12) & 0x3F),
	                                    0x80 | ((x >>> 6 ) & 0x3F),
	                                    0x80 | ( x         & 0x3F));
	  }
	  return output;
	}

	/*
	 * Encode a string as utf-16
	 */
	function str2rstr_utf16le(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length; i++)
	    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
	                                  (input.charCodeAt(i) >>> 8) & 0xFF);
	  return output;
	}

	function str2rstr_utf16be(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length; i++)
	    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
	                                   input.charCodeAt(i)        & 0xFF);
	  return output;
	}

	/*
	 * Convert a raw string to an array of little-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */
	function rstr2binl(input)
	{
	  var output = Array(input.length >> 2);
	  for(var i = 0; i < output.length; i++)
	    output[i] = 0;
	  for(var i = 0; i < input.length * 8; i += 8)
	    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
	  return output;
	}

	/*
	 * Convert an array of little-endian words to a string
	 */
	function binl2rstr(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length * 32; i += 8)
	    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
	  return output;
	}

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length.
	 */
	function binl_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);
	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}
	
	H.lib.md5 = hex_md5;
})(hapj);

/************************----------lib/sort.js-------------************************************/
/** 
 * Copyright (c) 2012, Jiehun.com.cn Inc. All Rights Reserved
 * @author dengxiaolong@jiehun.com.cn
 * @date 2012-02-26
 * @version 1.0 
 * @brief
 **/

 (function(H, undefined){
 	var cfg,loading = false,
	me = {
		init: function(configs) {
			cfg = configs;
		},
		active: function(id) {
			if (typeof id == 'string') {
				id = '#' + id;
			}
			if (!loading && undefined === jQuery.fn.tableDnD) {
				loading = true;
				H.load('/static/js/ext/jquery.tablednd.js', function(){
					jQuery(id).tableDnD(cfg);
				});
			} else {
				if (undefined === jQuery.fn.tableDnD) {
					setTimeout(function(){
						jQuery(id).tableDnD(cfg);
					}, 1000);
				} else {
					jQuery(id).tableDnD(cfg);
				}
			}
		}
	};
 	H.lib.sort = me;
 })(hapj);

/************************----------hapj.conf.js-------------************************************/
 hapj.log.url = 'http://' + location.host + '/util/hapj/error/';
 hapj.conf.set('loadingpic', 'http://' + hapj.staticHost + '/static/img/loading.gif');
 hapj.conf.set('hapj.com', {
 	sort: {
 		_link: 'hapj.lib.sort',
 		onDragClass:'sort_drag'
 	},
     editor: {
         _link: 'hapj.ext.editor',
         'default': {
             tools: 'Fontface,FontSize,Bold,Italic,Underline,Removeformat,|,FontColor,BackColor,|,Link,Unlink,|,Align,List,Table,|,Img,Flash,Video,Emot,|,Preview,Fullscreen',
             linkTag: false,
             inlineScript: false,
             inlineStyle: true,
             forcePtag: true,
             cleanPaste: 2,
             hoverExecDelay:-1,
             disableContextmenu: true,
             autoEditorHeight:false,//高度自适应开关
             onPaste:function(html){//禁止复制站外图片
     			var imgData=/<img\s.*?\s?src\s*=\s*['|"]?data\:image([^\s'"]+).*?>/ig;//图片源文件 
     			var imgLink=/<img\s.*?\s?src\s*=\s*['|"]?http\:\/\/.*?\.jiehun\.com\.cn([^\s'"]+).*?>/ig;//本站图片包括cdn
     			var imgOrderLink = /<img\s.*?\s?src\s*=\s*['|"]?([^\s'"]+).*?>/ig ;//非本站图片
     			var imgDataReg = html.match(imgData);//匹配图片文件
     			var imgLinkReg = html.match(imgLink);//匹配本站图片
     			if(imgDataReg !== null){//如果匹配源文件 成功则替换
     				html = html.replace(imgData,'');
     			}
     			if(imgLinkReg == null){//如果非体站图片则把图片替换为空
     				html = html.replace(imgOrderLink, '');
     			}
     			return html;
     		},
     		emotMark:true,
     		emots:{tusiji:{name:'兔斯基',count:40,width:24,height:24,line:7}, lvdouwa:{name:'绿豆蛙',count:53,width:24,height:24,line:7}}
         },
         upload: {
             html5Upload: true,
             upMultiple: 10,
             upImgUrl: /360se/i.test(navigator.userAgent) ? '!/util/image/traditional/?rules=editor' : '!/util/image/multi/?rules=editor',
             upImgExt: 'jpg,jpeg,gif,png'
         }
     },
 	upload: {
 		_link: '_hapj.image',
 		flash_url:'/swfupload.swf',
 		multi_url:'http://' + hapj.staticHost + '/util/image/swfmultiupload.swf',
 		upload_url:'http://' + location.host + '/util/image/_upload/',
 		crop_url: 'http://' + hapj.staticHost + '/util/image/swfcrop.swf',
 		prevent_swf_caching: false,//是否缓存SWF文件
 		file_post_name: 'upload',
 		use_query_string: false,//是否用GET方式发送参数
 		file_size_limit: "3 MB",
 		file_types: '*.jpg;*.jpeg;*.gif;*.png',
 		file_types_description: "图片文件(*.jpg,*.jpeg,*.gif,*.png)",
 		file_queue_limit: 0,//上传队列总数
 		button_window_mode: 'transparent',
 		button_cursor: -2,
 		button_text_left_padding: 20,
 		button_text_top_padding: 0,
 		button_text_style: ".theFont { font-size: 12px; }",
 		button_width: "60",
 		button_height: "18",
 		multi_width:'706',
 		multi_height:'470',
 		button_text: '浏览',
 		button_image_url: 'http://' + hapj.staticHost + '/util/image/img/add.gif',
 		debug: false
 	},
     verify: {
         _link: 'hapj.ui.verifiable',
         hint: function(type, rule, hinter){
             hinter.attr('class', 'hint');
         },
         success: function(type, rule, hinter){
             hinter.attr('class', 'success').html('y');
         },
         failure: function(type, rule, hinter){
             hinter.attr('class', 'err');
         },
         submit: function(e, handlers){
 			handlers['_binded_'] = true;
             hapj.ui.ajaxable.ajaxForm(this, handlers);
 			return false;
         },
 		ok: function(data) {
 			location.reload();
 		}
     },
 	cal : {
 		_link: 'hapj.lib.cal',
 		format:'Y-m-d'
 	}
 });
