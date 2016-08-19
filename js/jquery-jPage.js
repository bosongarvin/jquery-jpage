/**
 * @description 基于jQuery的分页插件，内部封装了Ajax。
 * @author 张伯松
 * @version 1.0
 * @date 2016年8月14日23:10:36
 */
(function($) {

	var default_options = {
		totalPages: 0,
		background: "#ccc",
		color: "#fff",
		defaultBackground: "#fff",
		defaultColor: "#333",
		//type: "get",
		url: "",
		dataType: "json",
		callback: function(data) {}
	};

	$.fn.extend({
		"jPage": function(options) {
			options = $.extend(default_options, options);
			var jPage = createJPage(options);
			$(this).append(jPage);
			initJPageCSS(options);
			initClickEvent(options);
			if(options.totalPages > 9) {
				$(".j_page .p_numbers").find("span.p_button:gt(8)").hide();
			}
			checkMore();
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

	function initClickEvent(options) {
		var currentPage = 1; // 记录当前页码
		var totalPages = options.totalPages;
		$(".j_page .p_numbers").find("span.p_button").click(function() {
			controlCurrentPage(options, $(this).index());
			afterClick();
		});
		
		// 首页和末页
		$(".j_page .p_first,.j_page .p_last").click(function() {
			var dataId = $(this).attr("data-id");
			controlCurrentPage(options, dataId * 1 - 1);
			afterClick();
		});
		
		// 上一页，下一页
		$(".j_page .p_prev").click(function() {
			var currentIndex = $("span.current_page").index();
			currentIndex -= 1;
			if (currentIndex < 0) {
				currentIndex = 0;
			}
			controlCurrentPage(options, currentIndex);
			afterClick();
		});
		$(".j_page .p_next").click(function() {
			var currentIndex = $("span.current_page").index();
			currentIndex += 1;
			if (currentIndex > totalPages - 1) {
				currentIndex = totalPages - 1;
			}
			controlCurrentPage(options, currentIndex);
			afterClick();
		});
		
		function afterClick() {
			var currentIndex = $("span.current_page").index();
			controlBtnCount(currentIndex, totalPages); // 控制按钮数量
			checkMore(); // 控制更多按钮显示
			// 发送请求
			var cp = $(".p_numbers").find(".current_page").attr("data-id");
			if (cp == currentPage)
				return;
			currentPage = cp;
			sendAjaxRequest(options, cp);
		}
	}
	
	/**
	 * 控制当前页按钮的变化
	 * @param {Object} options
	 * @param {Object} currentIndex 当前页按钮的索引
	 */
	function controlCurrentPage(options, currentIndex) {
		$(".j_page .p_numbers").find("span.p_button").eq(currentIndex).addClass("current_page").css({
			background: options.background,
			color: options.color
		})
		.siblings().removeClass("current_page").css({
			background: options.defaultBackground,
			color: options.defaultColor
		});
	}
	
	/**
	 * 控制每次只显示9个按钮
	 * @param currentIndex 当前页码按钮的索引
	 * @param totalPages 总页数
	 */
	function controlBtnCount(currentIndex, totalPages) {
		if(currentIndex <= 4) {
			$(".j_page .p_numbers").find("span.p_button:lt(9)").show();
			$(".j_page .p_numbers").find("span.p_button:gt(8)").hide();
		} else if(currentIndex <= totalPages - 5) {
			var down = currentIndex - 4; // 下限
			var up = currentIndex + 4; // 上限
			$(".j_page .p_numbers").find("span.p_button:lt(" + (down) + ")").hide();
			$(".j_page .p_numbers").find("span.p_button:gt(" + (down - 1) + ")").show();
			$(".j_page .p_numbers").find("span.p_button:gt(" + (up) + ")").hide();
		} else {
			$(".j_page .p_numbers").find("span.p_button:gt(" + (totalPages - 10) + ")").show();
			$(".j_page .p_numbers").find("span.p_button:lt(" + (totalPages - 9) + ")").hide();
		}
	}
	
	function checkMore() {
		$(".p_numbers .p_button:eq(0)").is($(":hidden")) ? $(".p_first_more").show() : $(".p_first_more").hide();
		$(".p_numbers .p_button:last-child").is($(":hidden")) ? $(".p_last_more").show() : $(".p_last_more").hide();
	}

	function initJPageCSS(options) {
		$(".j_page").css({
			fontSize: "12px",
			overflow: "hidden",
			color: options.defaultColor
		});
		$(".j_page .p_button").css({
			float: "left",
			margin: "0 2px"
		});
		$(".j_page span").css({
			display: "inline-block",
			border: "1px solid #ccc",
			padding: "5px",
			textAlign: "center",
			cursor: "pointer",
			color: options.defaultColor
		});
		$(".j_page .p_numbers").css({
			display: "inline-block",
			float: "left",
			overflow: "hidden"
		});
		$(".j_page .p_numbers span").css({
			paddingLeft: "10px",
			paddingRight: "10px"
		});
		$(".j_page .p_numbers span.current_page").css({
			background: options.background,
			color: options.color
		});
		$(".j_page span.p_more").css({
			border: 0,
			cursor: "default",
			display: "none",
			float: "left"
		});
	}

	function createJPage(options) {
		var pageHtml =
			"<div class=\"j_page\">" +
			"	<span class=\"p_button p_first\" data-id=\"1\">首页</span>" +
			"	<span class=\"p_button p_prev\">上一页</span>" +
			"	<span class=\"p_more p_first_more\">...</span>" +
			"	<div class=\"p_numbers\">" +
			"		<span class=\"p_button current_page\" data-id=\"1\">1</span>";
		for(var i = 2; i <= options.totalPages; i++) {
			pageHtml += "<span class=\"p_button\" data-id=\"" + i + "\">" + i + "</span>";
		}
		pageHtml +=
			"	</div>" +
			"	<span class=\"p_more p_last_more\">...</span>" +
			"	<span class=\"p_button p_next\">下一页</span>" +
			"	<span class=\"p_button p_last\" data-id=\"" + options.totalPages + "\">末页</span>" +
			"</div>";
		return $(pageHtml);
	}
})(jQuery);