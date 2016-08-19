/**
 * @description 基于jQuery的分页插件，内部封装了Ajax。
 * @更新说明 修改了分页按钮的实现方式
 * @author 张伯松
 * @version 2.0
 * @date 2016年8月18日16:51:00
 */
(function($) {

	var default_options = {
		totalPages: 0, // 总页数
		showPageCount: 5, // 每次显示的页数
		url: "",	// 分页数据的地址
		dataType: "json", // 返回的数据的类型
		callback: function(data) {}, // 请求成功后的回调函数,
		background: "#ccc", // 当前页按钮的背景颜色
		color: "#fff", // 当前按钮的前景色
		defaultBackground: "#fff", // 分页按钮默认的背景色
		defaultColor: "#333" // 分页按钮的默认前景色
	};

	$.fn.extend({
		"jPage": function(options) {
			options = $.extend(default_options, options);
			var jPage = createJPage(options);
			$(this).append(jPage);
			setCurrentShowPage(options, 1);
			initClickEvent(options);
			initJPageCSS(options);
			checkMore(options);
			return $(this);
		}
	});

	/**
	 * 发送Ajax请求
	 * @param {Object} options
	 * @param {Object} page 当前页码
	 */
	function sendAjaxRequest(options, page) {
		$.ajax({
			type: "get",
			url: options.url,
			data:{
				"page":page
			},
			dataType: options.dataType,
			success: function(data) {
				if (options.callback)
					options.callback(data);
			},
			error: function(e) {
				console.log(e);
				throw e;
			}
		});
	}

	var currentPage = 0; // 记录当前页码
	var cpr = 1;
	function initClickEvent(options) {
		var totalPages = options.totalPages;
		
		$(".j_num").on(
			"click" , function() {
				var page = $(this).attr("p");
				setCurrentShowPage(options, page);
				afterClick(options, page);
			}
		);
		$(".p_prev").on(
			"click" , function() {
				var page = $("span.current_page").attr("p");
				page = page * 1 - 1;
				if (page < 1) {
					page = 1;
				}
				setCurrentShowPage(options, page);
				afterClick(options, page);
			}
		);
		$(".p_next").on(
			"click" , function() {
				var page = $("span.current_page").attr("p");
				page = page * 1 + 1;
				if (page > options.totalPages) {
					page = options.totalPages;
				}
				setCurrentShowPage(options, page);
				afterClick(options, page);
			}
		);
	}
	
	/**
	 * 点击按钮之后调用
	 * @param {Object} cp 当前页
	 */
	function afterClick(options, cp) {
		if(cp == cpr) // 如果当前页与点击的页一致,则不发送请求
			return;
		cpr = cp;
		sendAjaxRequest(options, cp);
	}
	
	/**
	 * 控制更多按钮的显示
	 */
	function checkMore(options) {
		$(".p_numbers .p_button[p=1]").length == 0 ? $(".p_first_more").show() : $(".p_first_more").hide();
		$(".p_numbers .p_button[p="+ options.totalPages +"]").length == 0 ? $(".p_last_more").show() : $(".p_last_more").hide();
	}
	
	/**
	 * 根据当前页获得需要显示出来的页数按钮
	 */
	function setCurrentShowPage(options, page) {
		if (page == currentPage) 
			return;
		currentPage = page;
		var showCount = options.showPageCount;
		var limit = parseInt(showCount / 2);
		
		var start = 1, end = 0;
		if (page <= limit) {
			start = 1;
			end = showCount;
		} else if (page <= options.totalPages - limit) {
			start = page * 1 - limit;
			end = page * 1 + limit;
		} else {
			start = options.totalPages - showCount + 1;
			end = options.totalPages;
		}
		if (start < 1) {
			start = 1;
		}
		$(".p_numbers span").each(function() {
			$(this).attr("p",start).html(start++);
		});
		
		$(".j_page .p_numbers").find("span.p_button[p="+page+"]").addClass("current_page").siblings().removeClass("current_page");
		checkMore(options);
	}

	function initJPageCSS(options) {
		$("head").append(
			'<style>.j_page {'+
			'	font-size: 12px;'+
			'	overflow: hidden;'+
			'	color: '+ options.defaultColor +';'+
			'}'+
			'.j_page .p_button {'+
			'	float: left;'+
			'	margin: 0 2px;'+
			'}'+
			'.j_page span {'+
			'	display: inline-block;'+
			'	border: 1px solid #ccc;'+
			'	padding: 5px;'+
			'	text-align: center;'+
			'	cursor: pointer;'+
			'	color: '+ options.defaultColor +';background:'+ options.defaultBackground +';'+
			'}'+
			'.j_page span:hover {'+
			'	background:'+ options.background +';border-color:'+ options.background +';'+
			'	color:'+ options.color +';'+
			'}'+
			'.j_page .p_numbers {'+
			'	display: inline-block;'+
			'	float: left;'+
			'	overflow: hidden;'+
			'}'+
			'.j_page .p_numbers span {'+
			'	padding-left: 10px;'+
			'	padding-right: 10px;'+
			'}'+
			'.j_page .p_numbers span.current_page {'+
			'	background:'+ options.background +';border-color:'+ options.background +';'+
			'	color: '+ options.color +';'+
			'}'+
			'.j_page a {'+
			'	display:inline-block;padding:5px;'+
			'}'+
			'.j_page a.p_more {'+
			'	border: 0;'+
			'	cursor: default;'+
			'	display: none;'+
			'	float: left;'+
			'}'+
			'.p_button.p_first,.p_button.p_last,.p_button.p_prev,.p_button.p_next {'+
			'	padding-left: 15px;'+
			'	padding-right: 15px;'+
			'}</style>'
		);
	}
	
	/**
	 * 创建分页html代码
	 * @param {Object} options
	 */
	function createJPage(options) {
		var pageHtml =
			"<div class=\"j_page\">" +
			"	<span class=\"p_button p_first j_num\" p=\"1\">首页</span>" +
			"	<span class=\"p_button p_prev\">上一页</span>" +
			"	<a class=\"p_more p_first_more\">...</a>" +
			"	<div class=\"p_numbers\">";
		var count = options.showPageCount;
		if (options.totalPages < count) {
			count = options.totalPages;
		}
		for (var i = 1; i <= count; i++) {
			pageHtml += '<span class="p_button j_num" p="'+ i +'">'+ i +'</span>';
		}
		pageHtml +=	
			"	</div>" +
			"	<a class=\"p_more p_last_more\">...</a>" +
			"	<span class=\"p_button p_next\">下一页</span>" +
			"	<span class=\"p_button p_last j_num\" p=\"" + options.totalPages + "\">末页</span>" +
			"</div>";
		return $(pageHtml);
	}
})(jQuery);