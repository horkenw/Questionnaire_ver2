;(function($, window, document, undefined){
	var hasTouch = 'ontouchstart' in document;

	/**
     * Detect CSS pointer-events property
     * events are normally disabled on the dragging element to avoid conflicts
     * https://github.com/ausi/Feature-detection-technique-for-pointer-events/blob/master/modernizr-pointerevents.js
     */
    var hasPointerEvents = (function()
    {
        var el    = document.createElement('div'),
            docEl = document.documentElement;
        if (!('pointerEvents' in el.style)) {
            return false;
        }
        el.style.pointerEvents = 'auto';
        el.style.pointerEvents = 'x';
        docEl.appendChild(el);
        var supports = window.getComputedStyle && window.getComputedStyle(el, '').pointerEvents === 'auto';
        docEl.removeChild(el);
        return !!supports;
    })();

	var defaults = {
		listNodeName    : 'ul',
        itemNodeName    : 'li',
        rootClass       : 'list_wrap',
        listClass       : 'list_items',
        itemClass       : 'list_item',
        handleClass     : 'list_handle',
        dragClass       : 'list_dragel',
        collapsedClass  : 'list_collapsed',
        placeClass      : 'list_placeholder',
        noParents		: 'list_noparent',
        noChildren		: 'list_noChildren',
        noDragClass     : 'list_nodrag',
        emptyClass      : 'list_empty',
        expendBtnHTML   : '<button data-action="expend" type="button">Expend</button>',
        collapseBtnHTML : '<button data-action="collapse" type="button">Collapse</button>',
        group           : 0,
        maxDepth        : 3,
        threshold       : 20,
        sleepTime		: 150,
        longClick		: false
	}, addEvent;

	$.fn.addEvent = function(obj, evt, fn) {
		if (obj.addEventListener)
			obj.addEventListener(evt,fn,false);
		else if (obj.attachEvent)
			obj.attachEvent('on'+evt,fn);
	}

	function nestList(el, options){
		this.w = $(document);
		this.el = $(el);
		this.options = $.extend({}, defaults, options);
        this.addEvtAction = $.fn.addEvent;
        this.init();
	}

	nestList.prototype ={
		init: function(){
			var list=this;
			list.reset();
			list.el.data('nestList-group', this.options.group);
			list.placeEl = $('<div class="'+this.options.placeClass+'"/>');

			$.each(this.el.find(list.options.itemNodeName), function(idx, el){
				list.setParent($(el));
			});

			list.el.on('click', 'button', function(evt){
				if(list.dragEl) return;

				var target = $(evt.currentTarget),
				action = target.data('action'),
				item = target.parent(list.options.itemNodeName);

				if(action === 'collapse') list.collapseItem(item);
				if(action === 'expend') list.expendItem(item)
			})

			var onStartEvent = function(evt){
				var handle = $(evt.target);
				
				if(handle.hasClass(list.options.handleClass)){
					if(handle.hasClass(list.options.noDragClass)){
						return;
					}
					handle = handle.closest('.' + list.options.handleClass);
				}

				if(!handle.length || list.dragEl) return;
				
				list.isTouch = /^touch/.test(evt.type);
				if(list.isTouch && e.touchs.length!==1) return;

				evt.preventDefault();
				list.options.longClick = setTimeout(function(){
						list.dragStart(evt.touches ? e.touches[0] : evt);
					}, list.options.sleepTime);
			}

			var onMoveEvent = function(evt){
				if(list.dragEl){
					evt.preventDefault();
					list.dragMove(evt.touches ? e.touches[0] : evt)
				}
			}

			var onEndEvent = function(evt){
				if(list.dragEl){
					evt.preventDefault();
					list.dragStop(evt.touches ? e.touches[0] : evt);
				}
				clearTimeout(list.options.longClick);
				// list.el.menuData('listCancelEdit'); // call to refresh dataArray
			}

			if(hasTouch){
				this.addEvtAction(list.el[0], 'touchStart', onStartEvent);
				this.addEvtAction(window, 'touchmove', onMoveEvent);
				this.addEvtAction(window, 'touchend', onEndEvent);
				this.addEvtAction(window, 'touchcancel', onEndEvent);
			}

			this.addEvtAction(list.el[0], 'mousedown', onStartEvent);
			this.addEvtAction(list.w[0], 'mousemove', onMoveEvent);
			this.addEvtAction(list.w[0], 'mouseup', onEndEvent);
		},

		expendItem: function(li){
			li.removeClass(this.options.collapsedClass);
			li.children('[data-action="expend"]').hide();
            li.children('[data-action="collapse"]').show();
            li.children(this.options.listNodeName).show();
		},

		collapseItem: function(li){
			var lists = li.children(this.options.listNodeName);

			if(lists.length){
				li.addClass(this.options.collapsedClass);
				li.children('[data-action="collapse"]').hide();
            	li.children('[data-action="expend"]').show();
            	li.children(this.options.listNodeName).hide();
			}
			
		},

        expendAll: function()
        {
            var list = this;
            list.el.find(list.options.itemNodeName).each(function() {
                list.expendItem($(this));
            });
        },

        collapseAll: function()
        {
            var list = this;
            list.el.find(list.options.itemNodeName).each(function() {
                list.collapseItem($(this));
            });
        },

		setParent:  function(li){
			if(li.children(this.options.listNodeName).length){
				li.prepend($(this.options.expendBtnHTML));
				li.prepend($(this.options.collapseBtnHTML));
			}
			li.children('[data-action="expend"]').hide();
		},

		unsetParent: function(li){
			li.removeClass(this.collapsedClass);
			li.children('[data-action]').remove();
			li.children(this.options.listNodeName).remove();
		},

		reset: function(){
			this.mouse = {
				offsetX  : 0,
				offsetY  : 0,
				startX   : 0,
				startY   : 0,
				lastX    : 0,
				lastY    : 0,
				nowX     : 0,
				nowY     : 0,
				distX    : 0,
				distY    : 0,
				dirX     : 0,
				dirY     : 0,
				dirAx    : 0,
				lastDirX : 0,
				lastDirY : 0,
				distAxX  : 0,
				distAxY  : 0
			};
			this.isTouch    = false;
			this.moving     = false;
			this.dragEl     = null;
			this.dragRootEl = null;
			this.dragDepth  = 0;
			this.hasNewRoot = false;
			this.pointEl    = null;
		},

		dragStart: function(evt){
			var mouse = this.mouse,
			target = $(evt.target),
			dragItem = target.closest(this.options.itemNodeName);

			this.placeEl.css('height', dragItem.height());

			mouse.offsetX = evt.offsetX || evt.pageX - target.offset().left;
			mouse.offsetY = evt.offsetY || evt.pageY - target.offset().top;
			mouse.startX = mouse.lastX = evt.pageX;
			mouse.startY = mouse.lastY = evt.pageY;

			//remove all editable area
			if(this.el.find('input').length){
				var target = this.el.find('input').parent().parent();

				target.children().remove();
				target.append($('<div class="'+this.options.handleClass+'"/>'));
				target.find('.'+this.options.handleClass).text(target.data('name'));
				target.find('.'+this.options.handleClass).prepend($('<i class="fa fa-th" aria-hidden="true"></i>'));
			}

			this.dragRootEl = this.el;

			this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.listClass +' '+ this.options.dragClass);
			this.dragEl.css('width', dragItem.width());

			dragItem.after(this.placeEl);
			dragItem.detach().appendTo(this.dragEl);
			$('body').append(this.dragEl);
			this.dragEl.css({
				'left': evt.pageX - mouse.offsetX,
				'top': evt.pageY - mouse.offsetY
			})

			var i, depth, 
				items = this.dragEl.find(this.options.itemNodeName);

			for(var i=items.length; i--;){
				depth = $(items[i]).parents(this.options.listNodeName).length;
				if(depth > this.dragDepth) this.dragDepth = depth;
			}

		},

		dragMove: function(evt){
			var list , parent, prev, next, depth,
				opt = this.options,
				mouse = this.mouse;

			this.dragEl.css({
				'left': evt.pageX - mouse.offsetX,
				'top': evt.pageY - mouse.offsetY
			})

			// mouse position last events
			mouse.lastX = mouse.nowX;
			mouse.lastY = mouse.nowY;
			// mouse position this events
			mouse.nowX  = evt.pageX;
			mouse.nowY  = evt.pageY;
			// distance mouse moved between events
			mouse.distX = mouse.nowX - mouse.lastX;
			mouse.distY = mouse.nowY - mouse.lastY;
			// direction mouse was moving
			mouse.lastDirX = mouse.dirX;
			mouse.lastDirY = mouse.dirY;
			// direction mouse is now moving (on both axis)
			mouse.dirX = mouse.distX === 0 ? 0 : mouse.distX > 0 ? 1 : -1;
			mouse.dirY = mouse.distY === 0 ? 0 : mouse.distY > 0 ? 1 : -1;

			var newAx = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;

			// do nothing on first move
			if(!mouse.moving){
				mouse.dirAx = newAx;
 				mouse.moving= true;
 				return;
			}

			// calc distance moved on this axis (and direction)
			if(mouse.dirAx !== newAx){
				mouse.distAxX = 0;
				mouse.distAxY = 0;
			}else {
				mouse.distAxX += Math.abs(mouse.distX);
				if(mouse.dirX !== 0 && mouse.dirX !== mouse.lastDirX) mouse.distAxX=0;
				mouse.distAxY += Math.abs(mouse.distY);
				if(mouse.dirY !== 0 && mouse.dirY !== mouse.lastDirY) mouse.distAxY=0; 
			}
			mouse.dirAx = newAx;

			// If target has no Parents class
			var noParents = this.dragEl.find(this.options.itemNodeName).hasClass(this.options.noParents);

			/* Move horizontal */

			if(!noParents && mouse.dirAx && mouse.distAxX >= opt.threshold){
				mouse.distAxX = 0;
				prev = this.placeEl.prev(opt.itemNodeName);
				// increase horizontal level if previous sibling exists and is not collapsed
				if(mouse.dirX > 0 && prev.length && !prev.hasClass(opt.collapsedClass) && !prev.hasClass(opt.noChildren)){
					// cannot increase level when item above is collapsed
					list = prev.find(opt.listNodeName).last();
					//check if depth is reached
					depth = this.placeEl.parents(opt.listNodeName).length;

					if(depth + this.dragDepth <= opt.maxDepth){
						// create sub-level if one doesn't exist
						if(!list.length){
							list = $('<'+opt.listNodeName+'/>').addClass(opt.listClass);
							list.append(this.placeEl);
							prev.append(list);
							this.setParent(prev);
						}else{
							//else append to next level up
							list = prev.children(opt.listNodeName).last();
							list.append(this.placeEl);
						}
					}
				}
				//decrease horizontal level
				if(mouse.distX < 0){
					// we can't decrease a level if an item preceeds the current one
					next = this.placeEl.next(opt.itemNodeName);
					if(!next.length){
						parent = this.placeEl.parent();
						this.placeEl.closest(opt.itemNodeName).after(this.placeEl);
						if(!parent.children().length){
							this.unsetParent(parent.parent());
						}
					}
				}
			}
			var isEmpty = false;

			// find list item under cursor
			if (!hasPointerEvents) this.dragEl[0].style.visibility = 'hidden';

			//elementFromPoint - get element from where your mouse point
			this.pointEl = $(document.elementFromPoint(evt.pageX - document.body.scrollLeft, evt.pageY - (window.pageYOffset || document.documentElement.scrollTop)));
			if(!hasPointerEvents) this.dragEl[0].style.visibility = 'visible';
			
			if (this.pointEl.hasClass(opt.handleClass)) this.pointEl = this.pointEl.parent(opt.itemNodeName);
            
            if (this.pointEl.hasClass(opt.emptyClass)) isEmpty = true;
            else if(!this.pointEl.length || !this.pointEl.hasClass(opt.itemClass)) return;

            // find parent list of item under cursor
            var pointElRoot = this.placeEl.closest('.' + opt.rootClass),
            	isNewRoot = this.dragRootEl.data('nestList-id')!== pointElRoot.data('nestList-id');

            /**
             * move vertical
             */
			if(!mouse.dirAx || isNewRoot || isEmpty){
				if(isNewRoot && opt.group !== pointElRoot.data('nestList-group')) return;

				depth = this.dragDepth -1 + this.pointEl.parents(opt.listNodeName).length;
				if(depth > opt.maxDepth) return;

				var before = evt.pageY < (this.pointEl.offset().top + this.pointEl.height() / 2);
				parent = this.placeEl.parent();

				if(isEmpty){
					list = $('<'+opt.listNodeName+'>').addClass(opt.listClass);
					list.append(this.placeEl);
					this.placeEl.replaceWith(this);
				}else if(noParents && this.pointEl.parents(opt.listNodeName).length > 1){
					return false;
				}else if(before){
					this.pointEl.before(this.placeEl);
				}else{
					this.pointEl.after(this.placeEl);
				}

				if (!parent.children().length) {
                    this.unsetParent(parent.parent());
                }

                if (!this.dragRootEl.find(opt.itemNodeName).length) {
                    this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>');
                }

                // parent root list has changed
                if (isNewRoot) {
                    this.dragRootEl = pointElRoot;
                    this.hasNewRoot = this.el[0] !== this.dragRootEl[0];
                }
			}
		},

		dragStop: function(){
			var el = this.dragEl.children(this.options.itemNodeName).first();
			
			this.placeEl.replaceWith(el.detach());

			this.dragEl.remove();
			this.el.trigger('change');
			if(this.hasNewRoot) this.dragRootEl.trigger('change', this.resetParent);
			this.reset();
		},

        serialize: function()
        {
            var data,
                depth = 0,
                list  = this;
                step  = function(level, depth)
                {
                    var array = [ ],
                        items = level.children(list.options.itemNodeName);
                    items.each(function()
                    {
                        var li   = $(this),
                            item = $.extend({}, li.data()),
                            sub  = li.children(list.options.listNodeName);
                        if (sub.length) {
                            item.children = step(sub, depth + 1);
                        }
                        array.push(item);
                    });
                    return array;
                };
            data = step(list.el.find(list.options.listNodeName).first(), depth);
            return data;
        },

        serialise: function()
        {
            return this.serialize();
        },
	}

	$.fn.nestable = function(params){
		var lists = this,
			retval = this;

		lists.each(function(){
			var plugin = $(this).data('nestList');

			if(!plugin){
				$(this).data("nestList", new nestList(this, params));
                $(this).data("nestList-id", new Date().getTime());
			}else{
				if(typeof params === 'string' && typeof plugin[params] === 'function'){
					retval = plugin[params]();
				}
			}
		})
		return retval || lists;
	}

})(window.jQuery, window, document)