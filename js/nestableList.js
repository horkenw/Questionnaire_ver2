;(function($, window, document, undefined){
	var menuOptions = {
		menuData		: '',
		listNodeName    : '.list_items',
		group		    : 0,
		maxDepth		: 2,
		threshold       : 20,
	}

	function menuSetup(el, options){
		this.options = $.extend({}, menuOptions, options);
	}

	$.fn.menuData = function(params){
		var listRoot = this;

		listRoot.each(function(){
			$(this).data('menuList', new menuSetup(this, params));
		});

		return listRoot;
	}
})(window.jQuery, window, document)