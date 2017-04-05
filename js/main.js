!function(window, document) {
    'user strict';

    var wrapStyle = {
        boxStyle: 'panel panel-main panel-info wraper-selector',
        boxHeader: 'panel-heading clearfix quiz-header',
        boxBody: 'panel-body quiz-body',
        delBtn: '<div class="btn btn-remove" title="刪除選項"><i class="glyphicon glyphicon-remove"></i></div>',
        addonBtn: $('<div class="btn btn-plus" title="新增選項"><i class="glyphicon glyphicon-plus"></i></div>'),
    }

    var toolBox = {
        title: $('h1'),
        describe: $('.describe'),
        selectedZone: $('[name = quiztype]'),
        addGroup: 'group',
        addSingleline: 'sigle',
        addMultline: 'multi',
        addRadiobox: 'radio',
        addCheckbox: 'check',
        addmultRadio: 'liker',
    }

    // 送出按鈕移動
	function sideBarAnimate(evt) {
		if(document.documentElement.scrollTop+document.documentElement.clientHeight < document.documentElement.offsetHeight-100) $('#submit').addClass('showout');
		else  $('#submit').removeClass('showout');
		$('#submit').stop().animate({ "top": ($(window).scrollTop() + ($(window).innerHeight() / 2)) + "px" }, "slow");
	};

    // Template
    var sprintf = function(str) {
        var args = arguments,
            flag = true,
            i = 1;

        str = str.replace(/%s/g, function() {
            var arg = args[i++];

            if (typeof arg === 'undefined') {
                flag = false;
                return '';
            }
            return arg;
        });
        return flag ? str : '';
    };

    // 修改當前選擇區塊
    var addSelectedClass = function(target){
    	if(!$(target).hasClass('selected')){
	    	$('#form-items').find('.selected').removeClass('selected');
    		$(target).addClass('selected');
    	}
    }

    // 確認是否為當前選擇區塊
	var targetCheckIsSelected = function(target){

		if(!$.contains($('.selected')[0], target)){
			$('.wraper-selector').map(function(i, v){
				if($.contains(v, target)) addSelectedClass(v);
			})
			return true;
		}
    }


    function quizItem(element) {
        var data = JSON.parse(localStorage.getItem('quizStorage'));
        this.quizbox = data.quiz;
        this.title = data.title;
        this.desc = data.describe;
        this.wrap = $(element);
        this.formWrap = $('#form-items');
        this.counter = -1;

        var init = function() {
            var quizStyleBtn = $('#addon-btn-selector'),
                _this = this;

			toolBox.title.text(this.title);
			toolBox.describe.text(this.desc);

			$('#addon-btn-selector').on('click', function() { _this.creatItemListener($(toolBox.selectedZone).val()); })
			$(window).on('scroll', sideBarAnimate);

			$('#quiz-items').on('submit', $.proxy(this.getAllData, this))
		}
		init.call(this);
	}

	quizItem.prototype = {
		creatItemListener: function(options) {
			var opt = options.slice(0, 5);

			this.formWrap.find('.selected').removeClass('selected');
			this.selectType=opt;
			this.counter++;

			switch (opt) {
				case toolBox.addGroup:
					this.formWrap.append(this.groupCreat.call(this));
					break;
				case toolBox.addSingleline:
					this.formWrap.append(this.singleLineTxt.call(this));
					break;
				case toolBox.addMultline:
					this.formWrap.append(this.mulitiLineTxt.call(this));
					break;
				case toolBox.addRadiobox:
					this.formWrap.append(this.radioSelect.call(this));
					break;
				case toolBox.addCheckbox:
					this.formWrap.append(this.checkSelect.call(this));
					break;
				case toolBox.addmultRadio:
					this.formWrap.append(this.likerSelect.call(this));
					break;
				default:
					console.log('option undefined');
					break;
			}
			this.formWrap.find('[name=title]:last').focus();
		},
		groupCreat: function(){
			this.panelHeader = '段落標題';

			var htmls=this.clickDirection($(this.groupZone()));
			$(htmls).find('.del-btn-selecotr').append(this.deleteBtnAdd('panel'));

			return htmls;
		},
		singleLineTxt: function() {
			this.panelHeader = '簡易問題';

			var htmls=this.clickDirection($(this.itemTemplate()));
			$(htmls).find('.del-btn-selecotr').append(this.deleteBtnAdd('panel'));

			return htmls;
		},
		mulitiLineTxt: function(){
			this.panelHeader = '長篇問題';

			var htmls=this.clickDirection($(this.itemTemplate()));
			$(htmls).find('.del-btn-selecotr').append(this.deleteBtnAdd('panel'));

			return htmls;
		},
		radioSelect: function(){
			this.panelHeader = '單選問題';

			var htmls=this.clickDirection($(this.itemTemplate())), 
			answerZone = $('<div class="form-group ans-selectors hr"></div>');

			$(htmls).find('.del-btn-selecotr').append(this.deleteBtnAdd('panel'));
			$(htmls).find('.quiz-body').append(answerZone);
			$(answerZone).append(this.itemAnswerZone());
			$(answerZone).find('.input-type-selector').append($('<input type="radio" value="" disabled>'));	
			$(answerZone).find('.del-btn-selecotr').append(this.deleteBtnAdd('item'));
			$(answerZone).find('.ins-btn-selecotr').append(this.insertBtnAdd());
			$(answerZone).find('.input-addon').on('click',  this.addonItems.bind(this));

			return htmls;
		},
		checkSelect: function(){
			this.panelHeader = '多選問題';

			var htmls=this.clickDirection($(this.itemTemplate())), 
			answerZone = $('<div class="form-group ans-selectors hr"></div>');

			$(htmls).find('.del-btn-selecotr').append(this.deleteBtnAdd('panel'));
			$(htmls).find('.quiz-body').append(answerZone);
			$(answerZone).append(this.itemAnswerZone());
			$(answerZone).find('.input-type-selector').append($('<input type="checkbox" value="" disabled>'));			
			$(answerZone).find('.del-btn-selecotr').append(this.deleteBtnAdd('item'));
			$(answerZone).find('.ins-btn-selecotr').append(this.insertBtnAdd($(answerZone).find('.input-addon')));
			$(answerZone).find('.input-addon').on('click',  this.addonItems.bind(this));

			return htmls;
		},
		likerSelect: function(){
			this.panelHeader = '量表問題';

			var htmls=this.clickDirection($(this.itemTemplate())), 
			answerZone = $('<div class="ans-selectors hr"></div>'),
			_div = $('<div/>'), lists=['同意', '喜歡', '滿意'];

			$(htmls).find('.del-btn-selecotr').append(this.deleteBtnAdd('panel'));
			$(htmls).find('.quiz-body').append(answerZone);
			_div.addClass('form-group select-group').append($('<label for="" class="control-label">選項</label>'));
			_div.append($('<select name="likers" id="liker" class="form-control"></select>'));
			lists.map(function(v, i){
				_div.find('#liker').append($('<option value="'+i+'">'+v+'</option>'))
			})
			answerZone.append(_div);

			return htmls;
		},
		itemTemplate: function() {
			return ''+
				'<div class="' + wrapStyle.boxStyle + ' selected" data-type="'+this.selectType+'" >'+
					'<div class="' + wrapStyle.boxHeader + '">'+
						this.itemHeader()+
					'</div>'+
					'<div class="' + wrapStyle.boxBody + '">'+
						this.itemBody()+
					'</div>'+
				'</div>'
		},
		itemHeader: function(){
			return ''+
				'<h3 class="pull-left">'+this.panelHeader+'</h3>'+
				'<div class="pull-right m-g-t15 del-btn-selecotr"></div>';
		},
		itemBody: function(){
			return ''+
				'<div class="form-group">'+
					'<label class="control-label">標題</label>'+
					'<textarea class="autosize form-control" name="title" rows="1" required></textarea>'+
				'</div>'+
				'<div class="form-group">'+
					'<label class="control-label">說明</label>'+
					'<textarea class="autosize form-control" name="" rows="1"></textarea>'+
				'</div>'+
				'<div class="form-group">'+
					'<label class="control-label">是否必填</label>'+
					'<label class="radio-inline space">'+
						'<input type="radio" name="request'+this.counter+'" value="true">必填'+
					'</label>'+
					'<label class="radio-inline space">'+
						'<input type="radio" name="request'+this.counter+'" value="false" checked >選填'+
					'</label>'+
				'</div>';
		},
		groupZone: function(){
			return ''+
				'<div class="' + wrapStyle.boxStyle + ' selected" data-type="'+this.selectType+'" >'+
					'<div class="' + wrapStyle.boxHeader + '">'+
						this.itemHeader()+
					'</div>'+
					'<div class="' + wrapStyle.boxBody + '">'+
						'<div class="form-group">'+
							'<label class="control-label">段落標題</label>'+
							'<textarea class="autosize form-control" name="title" rows="1" required></textarea>'+
						'</div>'+
						'<div class="form-group">'+
							'<label class="control-label">詳細描述</label>'+
							'<textarea class="autosize form-control" name="" rows="4"></textarea>'+
						'</div>'+
					'</div>'+
				'</div>'
		},
		itemAnswerZone: function(){
        	return ''+
        		'<div class="insert-selector">'+this.answerTemplate()+'</div>'+
				'<div class="input-group btn input-addon">'+
					'<div class="input-group-addon"></div>'+
					'<div class="autosize form-control click-to-add txt-hover">新增選項</div>'+
					'<span class="input-group-btn ins-btn-selecotr" title="新增選項"></span>'+
				'</div>'
		},
		answerTemplate: function(){
			return ''+
	        	'<div class="input-group">'+
					'<div class="input-type-selector input-group-addon"></div>'+
					'<textarea class="autosize form-control" id="" rows="1"></textarea>'+
					'<span class="input-group-btn del-btn-selecotr" title="刪除選項"></span>'+
				'</div>';
		},
		clickDirection: function(target){
			target.off('click').on('click', function(){ 
				addSelectedClass(this);
			});

			return target;
		},
		insertBtnAdd: function(){
			var addBtn = $(wrapStyle.addonBtn).clone();
			return addBtn;
		},
		deleteBtnAdd: function(dom){
			var delBtn = $(wrapStyle.delBtn).clone();

			delBtn.on('click', this.deleteItems.bind(this, dom));
			return delBtn;
		},
		addonItems: function(){
			var htmlStru = $(this.answerTemplate());
			
			targetCheckIsSelected(arguments[0].target);
			
			htmlStru.find('.del-btn-selecotr').append(this.deleteBtnAdd('item'));
			$('.selected').find('.insert-selector').append(htmlStru);
			htmlStru.find('.input-type-selector').append($('<input type="'+htmlStru.parent().find('[type]').attr('type')+'" value="" disabled>'));
			
		},
		deleteItems: function(target){
			if(target === 'panel') {
				// 刪除大項
				if($(arguments[1].target).parent().parent().parent().parent().hasClass('panel')) $(arguments[1].target).parent().parent().parent().parent().remove();
				else if($(arguments[1].target).parent().parent().parent().hasClass('panel')) $(arguments[1].target).parent().parent().parent().remove();
			}
			else 
				if(target === 'item'){
					// 刪除單/複選選項
					if($(arguments[1].target).parent().parent().parent().hasClass('input-group') &&
						$(arguments[1].target).parent().parent().parent().parent().children().length > 1)
							$(arguments[1].target).parent().parent().parent().remove();
					else if($(arguments[1].target).parent().parent().hasClass('input-group') &&
							$(arguments[1].target).parent().parent().parent().children().length > 1 ) 
								$(arguments[1].target).parent().parent().remove();
				}
		},
		getAllData: function(evt){
			evt.preventDefault();

			var data = new getAllDataList(this.formWrap);
		}
	}

	function getAllDataList(target){
		this.formWrap = target;
		this.quizBox = {};
		this.quizBox.dataCollect = [];
		this.quizBox.sortCollect = [];
		this.validate = false;
		this.groupId = this.groupChildId = 0;
		_that = this;

		this.formWrap.children().each(function(i, v){
			switch ($(v).data('type')){
				case 'group':
					this.groupFormat(v);
					break;
				case 'sigle':
					this.QnAFormat(v, 'sigle');
					break;
				case 'multi':
					this.QnAFormat(v, 'multi');
					break;
				case 'radio':
					this.multiSelectFormat(v, 'radio');
					break;
				case 'check':
					this.multiSelectFormat(v, 'check');
					break;
				case 'liker':
					this.likerFormat(v, 'liker');
					break;
			}
		}.bind(this))
		console.log(this.quizBox)
		localStorage.setItem('quizBox', JSON.stringify(this.quizBox));
		window.location.href = './quiz-sortable.html'; 
	}

	getAllDataList.prototype = {
		groupFormat: function(node){ //題組選項組成
			var items = $(node).find('.form-group');
			this.groupId = this.quizBox.sortCollect.length+1;
			this.groupChildId = 0;
			
			this.quizBox.dataCollect.push({
				id: this.groupId,
				name: items.eq(0).find('textarea').val(),
				describe: items.eq(1).find('textarea').val()
			})
			this.quizBox.sortCollect.push({
				id: this.groupId,
				name: items.eq(0).find('textarea').val(),
				children: []
			})
		},
		QnAFormat: function(node, type){ // 短/長篇問題組成
			var items = $(node).find('.form-group');
			this.groupChildId++;

			if(!this.groupId){
				this.wrapQnAContent(items, this.quizBox.dataCollect, this.quizBox.sortCollect, type);
			}
			else{
				this.wrapQnAContent(items, this.quizBox.dataCollect, this.quizBox.sortCollect[this.groupId-1].children, type);	
			}
		},
		wrapQnAContent: function(target, dataWrap, sortWrap, type){
			dataWrap.push({
				id: this.groupChildId,
				parent: this.groupId,
				name: target.eq(0).find('textarea').val(),
				describe: target.eq(1).find('textarea').val(),
				required: target.eq(2).find('[type="radio"]:checked').val(),
				type: type
			});
			sortWrap.push({
				id: this.groupChildId,
				parent: this.groupId,
				name: target.eq(0).find('textarea').val()
			})
		},
		multiSelectFormat: function(node, type){ //多選欄位問題組成
			var items = $(node).find('.form-group');
			this.groupChildId++;

			if(!this.groupId){
				// 驗證不能為空的選項
				// if($(items).eq(3).find('.insert-selector').length === 1 && !$(items).eq(3).find('textarea').val().length){
				// 	$(items).eq(3).find('textarea').addClass('red');
				// 	return false;
				// }
				this.wrapMultiContent(items, this.quizBox.dataCollect, this.quizBox.sortCollect, type);
			}
			else{
				this.wrapMultiContent(items, this.quizBox.dataCollect, this.quizBox.sortCollect[this.groupId-1].children, type);	
			}
		},
		wrapMultiContent: function(target, dataWrap, sortWrap, type){
			var answers = [];

			$(target).eq(3).find('textarea').each(function(i, v){
				answers.push($(v).val());
			})

			dataWrap.push({
				id: this.groupChildId,
				parent: this.groupId,
				name: target.eq(0).find('textarea').val(),
				describe: target.eq(1).find('textarea').val(),
				required: target.eq(2).find('[type="radio"]:checked').val(),
				answerBox: answers,
				type: type
			});
			sortWrap.push({
				id: this.groupChildId,
				parent: this.groupId,
				name: target.eq(0).find('textarea').val()
			})			
		},
		likerFormat: function(node, type){
			var items = $(node).find('.form-group');

			var warpLikerContent = function(target, dataWrap, sortWrap, type){
				dataWrap.push({
				id: this.groupChildId,
				parent: this.groupId,
				name: target.eq(0).find('textarea').val(),
				describe: target.eq(1).find('textarea').val(),
				required: target.eq(2).find('[type="radio"]:checked').val(),
				answerBox: target.eq(3).find('select option:selected').val(),
				type: type
				});
				sortWrap.push({
					id: this.groupChildId,
					parent: this.groupId,
					name: target.eq(0).find('textarea').val()
				})		
			}

			if(!this.groupId){
				warpLikerContent.call(this, items, this.quizBox.dataCollect, this.quizBox.sortCollect, type);
			}
			else{
				warpLikerContent.call(this,items, this.quizBox.dataCollect, this.quizBox.sortCollect[this.groupId-1].children, type);	
			}
		}
	}
	window.onload = new quizItem('#formpaper');
}(window, document)
