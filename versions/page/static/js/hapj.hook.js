// ****************************************************
// 初始化页面配置信息
if (window['_hjc']) {
	var C = hapj.conf, L = hapj.log;
	hapj.array.each(_hjc, function(i, a) {
		if (C.get(a[0]) === null) {
			C.set(a[0], a[1]);
		}
	});
	
	if (C.get('id')) {
		hapj.id(C.get('id'));
	}
	// 初始化debug模式
	if (C.get('debug')) {
		L.mode = L.DEVELOP_MODE;
	} else {
		L.mode = L.ONLINE_MODE;
	}
}

// ****************************************************
// 手机页面跳转
// 只有配置了mobile.url且没有设置cookie用pc访问
if (hapj.conf.get('mobile.url') && !hapj.page.getCookie('_pc')) {
	hapj.hook.set('browser.mobile', function(){
		location.href = hapj.conf.get('mobile.url');
	});
}

// ****************************************************
// 设置一个错误的钩子
hapj.hook.set('hapj.error', function(msg, url, line){
	if (hapj.log) {
		hapj.log.error({msg:msg, url:url, line:line});
	} else if (_firebug){
		console.log({msg:msg, url:url, line:line});
	} else {
		// TODO
	}
});

// ****************************************************
// 设置一个闭包的钩子，使hapj的闭包支持object类型
hapj.hook.set('hapj.closure', function(closure) {
	var ctx = document;
	if (closure._tag) {
		return function() {
			ctx = closure._tag;
			
			var elems = [];
			if (typeof ctx == 'string') {
				elems = hapj.ui._tag(ctx);
			} else if (hapj.array.isArray(ctx)) {
				hapj.array.each(ctx, function(i, t) {
					hapj.array.merge(elems, hapj.ui._tag(t));
				});
			}
			
			delete closure._tag;
			
			hapj.object.each(closure, function(k, c) {
				if (typeof c != 'function') {
					return;
				}
				var ce = new RegExp('(^|[\\s])_j' + k + '([\\s]|$)');
				hapj.array.each(elems, function(i, e) {
					if (ce.test(e.className)) {
						var node = new hapj.ui(e);
						c.call(hapj.__modules, node, e);
					}
				});
			});
		}
	} else {
		return function() {
			hapj.object.each(closure, function(k, c){
				if (typeof c != 'function') {
					return;
				}
				var es = hapj.ui._cls('_j' + k);
				if (es) {
					if (es.length == 1) {
						c.call(hapj.__modules, hapj.ui(es), es[0]);
					} else {
						c.call(hapj.__modules, hapj.ui(es), es);
					}
				}
			});
		}
	}
});

// ****************************************************
// ajax的json返回数据的钩子
(function(H){
	var ajaxErrMap = {
		'hapn.u_power': '您没有权利操作这个权限',
		'hapn.u_notfound': '您提交的页面不存在',
		'hapn.u_login': {
			msg: '您没有登录或者登录超时，请重新登录',
			callback: function() {
				location.href = '/accounts/login/?u=' + encodeURIComponent(document.URL);
			}
		},
		'hapn.u_filterHasWords': '您提交的内容中包含敏感词',
		'db.TextTooLong': '您提交的内容太多了，请精简后重试！',
		'hapn.fatal': '系统错误',
		'hapn.u_filterHasEmail': '您提交的内容中包含Email',
		'hapn.u_filterHasQQ': '您提交的内容中包含QQ',
		'hapn.u_filterHasPhone': '您提交的内容中包含电话号码'
	};
	
	// 增加一个模块用来设置错误码映射信息
	H.set('errMap', {
		add: function(map) {
			hapj.object.extend(ajaxErrMap, map);
		}
	});
	
	H.hook.set('ajax.jsonParser', function(data){
		if (data.err == 'hapn.ok') return true;
		var pos = data.err.indexOf(' '), code, desc;
        if (pos > 0) {
            code = data.err.substr(0, pos);
            desc = H.trim(data.err.substr(pos + 1));
        }
        else {
            code = data.err;
            desc = '';
        }
		
		if (code in ajaxErrMap) {
			var m = ajaxErrMap[code];
			if (typeof m == 'string') {
				m = {msg: m};
			}
			hapj.ui.dialog.error(m.msg, m.callback);
			return false;
		}
		return true;
	});
})(hapj);

// ****************************************************
// ajax请求错误
hapj.hook.set('ajax.error', function(type){
	switch(type) {
		case 'timeout':
			hapj.ui.dialog.error('请求网页超时');
			break;
		case 'parse':
			hapj.ui.dialog.error('返回结果分析失败');
			break;
		default:
			hapj.ui.dialog.error('网页请求失败：' + type);
	}
});

// ****************************************************
// 表单提交
hapj.hook.set('form.submit', function(options){
	options['_binded_'] = true;
    hapj.ui.ajaxable.ajaxForm(this, options);
	return false;
});

// ****************************************************
// 图片延迟加载
if (hapj.conf.get('image.lazyload')) {
	hapj.hook.set('dom.ready', function() {
		hapj.ui(document.body).lazyload({
			loadSrc:hapj.conf.get('loadingpic')
		});
	});
} else {
	hapj.hook.set('dom.ready', function() {
		hapj.ui('img').each(function(){
			if (!this.src && this.getAttribute('hll')) {
				this.src = this.getAttribute('hll');
				this.removeAttribute('hll');
			}
		});
	});
}

// ****************************************************
// 回到顶部链接初始化
hapj.hook.set('dom.ready', function() {
	var H = hapj,
	gt = H.ui('#gototop');
	if (!gt.length) return;
	gt.hide();
	
	var doc = H.ui(document),doh = doc.height(true), dih = doc.height();
	if (doh > dih) {
		var toggle = function(){
			if (doc.offset().top > dih - 200) {
				if (gt[0].style.display == 'none') {
					gt.show();
				}
			} else {
				if (gt[0].style.display != 'none') {
					gt.hide();
				}
			}
		}, _ft = H.ui('#ft'), _lleft = _ft.width(), _ll, resetLeft = function(){
			var tl = _lleft + _ft.offset().left + 4;
			if (_ll != tl) {
				gt.css('left', tl + 'px');
				_ll = tl;
			}
		};
		
		H.ui.on(window, 'scroll', toggle);
		H.ui.on(window, 'resize', function(){
			resetLeft();
			toggle();
		});
		if (H.browser.msie && H.browser.msie < 7) {
			var resetTop = function(){
				gt.attr('class', 'gototop');
			}
			H.ui.on(window, 'scroll', resetTop);
			H.ui.on(window, 'resize', function(){
				resetTop();
			});
		}
		resetLeft();
		toggle();
	}
});

/************************modalDlg***************************/
(function(){
	var dlg = null,_enable_scroll=true, mn, doc = hapj.ui(document),shadow,getDlg = function() {
		if (!dlg) {
			dlg = hapj.ui(hapj.ui._node('div', {'class':'dialog',id:'modalDlg'}));
			dlg.css({height:doc.height() + 'px',left: (doc.width()-600)/2 + 'px'});
			dlg.html('<div class="out_dhd"><div class="dhd"><h3></h3><a class="dclose">X</a></div></div><div class="dbd"></div>');
			document.body.appendChild(dlg[0]);
			dlg.hide().cls('dhd').tag('a').on('click', function(){
				me.hide();
				return false;
			});
			mn = dlg.menuable({
				onHide:function(){
					_enable_scroll = true;
					shadow.hide();
				}
			});
			dlg.cls('out_dhd').css('left', (doc.width()-600)/2 + 'px');
			shadow = hapj.ui(hapj.ui._node('div', {'class':'dialog_shadow'}));
//			shadow.css({
//				width:doc.width() + 'px',
//				height:doc.height() + 'px'
//			}).hide();
			document.body.appendChild(shadow[0]);
			
			hapj.ui.on(window,'scroll', function(){
				if (!_enable_scroll) {
					return false;
				}
			});
		}
		return dlg;
	}, me = {
		show:function(url, title) {
			var _d = getDlg();
			if (undefined !== title) {
				this.title(title);
			}
			hapj.ajax({
				url: url,
				type:'GET',
				dataType:'html',
				success:function(html) {
					_d.cls('dbd').html(html).css({
						height:doc.height() + 'px'
					});
					mn.show();
					shadow.show();
					if (_d.tag('textarea').length) {
						_d.tag('textarea')[0].focus();
					}
				}
			});
			_enable_scroll = false;
			return this;
		},
		hide:function(){
			if (dlg) {
				mn.hide();
			}
			return this;
		},
		title:function(title) {
			getDlg().cls('dhd').tag('h3')[0].innerHTML = title;
			return this;
		}
	};
	hapj.set('modalDlg', me);
})();