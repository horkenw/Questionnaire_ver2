;(function($, window, document, undefined){
	var menuOptions = {
		menuData		: '',
		listNodeName    : '.list_items',
		group		    : 0,
		maxDepth		: 2,
		threshold       : 20
	}

	function menuSetup(el, options){
		this.options = $.extend({}, menuOptions, options);
		this.el = $(el).find(menuOptions.listNodeName);
		this.addEvtAction = $.fn.addEvent;
		this.dataArray = this.options.data.sortCollect;
		this.orgArray = this.options.data.dataCollect;
		this.initItemList();
		this.nestableList();
	}
	menuSetup.prototype = {
		initItemList: function(){
			if(!this.dataArray.length) return;

			var menu = this;

			$(this.dataArray).each(function(i, v){
				menu.el.append(menu.setItem(v));
			})
		},
		setItem: function(item){
			var itemNodeName = $('<li class="list_item" />'),
				itemLabel = $('<div class="list_handle" />'),
				itemIcon = $('<i class="fa fa-th" aria-hidden="true"></i>'),
				clickCount = 0;

			itemNodeName.append(itemLabel.clone().text(item.name))
			itemNodeName.data({
				name: item.name,
				url: item.url
			})
			if(item.children){ //add Second level
				var secondul = $('<ul class="list_items"></ul>');
					
				for(var idx = 0; idx<item.children.length; idx++){
					secondul.append(this.setItem(item.children[idx]));
					itemNodeName.addClass('list_noparent');
					itemNodeName.append(secondul);
				}							
			}

			return itemNodeName;
		},
		nestableList: function(){
			this.el.parent().nestable({
				group		   : this.options.group,
				maxDepth		: this.options.maxDepth,
	       		threshold		: this.options.threshold
			});
		}
	}

	$.fn.menuData = function(params){
		var listRoot = this,
			fnSelect = this;

		listRoot.each(function(){
			var menuSet = $(this).data('menuList');

			if(!menuSet){
				$(this).data('menuList', new menuSetup(this, params));
			}
			else{
				if(typeof params === 'string' && typeof menuSet[params] === 'function'){
					var array, args;
					fnSelect = menuSet[params]('', args? args: '');
				}
			}
		})
		return fnSelect|| listRoot;
	}
})(window.jQuery, window, document)