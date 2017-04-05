!(function($, window, document, undefined){
	function urlRedirect(url){
		window.location.href = url;
	}

	var wrapStyle = {
        boxStyle: 'col-sm-12',
        boxHeader: 'panel-heading clearfix quiz-header',
        boxBody: 'panel-body quiz-body',
        delBtn: '<div class="btn btn-remove" title="刪除選項"><i class="glyphicon glyphicon-remove"></i></div>',
        addonBtn: $('<div class="btn btn-plus" title="新增選項"><i class="glyphicon glyphicon-plus"></i></div>'),
    }

	function createView(){
		this.data = JSON.parse(localStorage.getItem('quizAfterSort'));
		this.rootWrap = $('#viewer');
		this.counter = 0;
		var quizHeader = JSON.parse(localStorage.getItem('quizStorage'));

		var initView = function(){
			$('h1').text(quizHeader.title);
			$('h3').text(quizHeader.describe + ' (題目預覽畫面)');

			this.data.forEach($.proxy(function(v, i){
				this.quizViewFilter(v);
				if(v.children){
					$(v.children).each($.proxy(function(i, v){
						this.quizViewFilter(v);
					}, this))
				}
			},this))
		}
		initView.call(this);
	}

	createView.prototype = {
		quizViewFilter: function(quiz){
			switch (quiz.type){
				case 'sigle':
					this.rootWrap.append(this.singleQuizView(quiz));
					break;
				case 'multi':
					this.rootWrap.append(this.multiQuizView(quiz));
					break;
				case 'radio':
					this.rootWrap.append(this.radioQuizView(quiz));
					break;
				case 'check':
					this.rootWrap.append(this.checkQuizView(quiz));
					break;
				case 'liker':
					this.rootWrap.append(this.likerQuizView(quiz));
					break;
				default:
					this.rootWrap.append(this.groupQuizView(quiz));
					break;
			}
		},
		groupQuizView: function(data){
			var htmls=$(this.itemTemplate(data.required));

			htmls.addClass('quiz-title');
			htmls.find('.formtitle').text(data.name);
			htmls.find('.textarea').remove();
			htmls.find('.desc').text(data.describe)
			return htmls;
		},
		singleQuizView: function(data){
			var htmls=$(this.itemTemplate(data.required, data.type));

			this.counter++;
			htmls.find('.formtitle').text(this.counter + '. ' + data.name + (data.required ?'*' : ''));
			htmls.find('.desc').text(data.describe);
			return htmls;
		},
		multiQuizView: function(data){
			var htmls=$(this.itemTemplate(data.required, data.type));

			this.counter++;
			htmls.find('.formtitle').text(this.counter + '. ' + data.name + (data.required ?'*' : ''));
			htmls.find('.desc').text(data.describe);
			return htmls;
		},
		radioQuizView: function(data){
			var htmls=$(this.itemTemplate(data.required, data.type));

			this.counter++;
			htmls.find('.formtitle').text(this.counter + '. ' + data.name + (data.required ?'*' : ''));
			$(data.answerBox).each($.proxy(function(i, v){
				this.multiAnswer(htmls.find('.inline-group'), v, 'checkbox');
			}, this))
			htmls.find('.desc').text(data.describe);
			return htmls;
		},
		checkQuizView: function(data){
			var htmls=$(this.itemTemplate(data.required, data.type));

			this.counter++;
			htmls.find('.formtitle').text(this.counter + '. ' + data.name + (data.required ?'*' : ''));
			$(data.answerBox).each($.proxy(function(i, v){
				this.multiAnswer(htmls.find('.inline-group'), v, 'radio');
			}, this))
			htmls.find('.desc').text(data.describe);
			return htmls;
		},
		likerQuizView: function(data){
			var htmls=$(this.itemTemplate(data.required, data.type)), 
				options = ['同意', '喜歡', '滿意', '非常不同意', '非常不喜歡', '非常不滿意'], 
				count=parseInt(data.answerBox, 10);

			this.counter++;
			htmls.find('.formtitle').text(this.counter + '. ' + data.name + (data.required ?'*' : ''));
			for(var i = 0; i < 6; i++){
				var _label = $('<label class="radio ikfloat"></label>');

				if(i<1)	_label.text(i+'('+options[count]+')');
				else if(i>4) _label.text('('+options[count+2]+')');
				else _label.text('('+i+')');
				_label.prepend('<input type="radio" name="liker'+this.counter+'" />')
				htmls.find('.inline-group').append(_label)
			}
			htmls.find('.desc').text(data.describe);
			return htmls;
		},
		multiAnswer: function(root, data, type){
			var label=$('<label class="' + type + '"></label>');
			
			label.text(data)
			label.prepend($('<input type="' + type + '" name = "'+type+this.counter+'" />'));
			root.append(label)
		},
		itemTemplate: function(required, type) {
			return ''+
				'<section class="' + wrapStyle.boxStyle + '">'+
					this.itemHeader()+
					this.itemBody(required, type)+
				'</section>'
		},
		itemHeader: function(){
			
			return ''+
					'<label for="title" class="label formtitle"></label>';
		},
		itemBody: function(required, type){
			var bodyType;

			switch (type){
				case 'sigle':
					bodyType = ''+
						'<label class="input">'+
							'<input type="text"' + (required ? 'required' : '') +'/>'+
						'</label>'+
						'<p class="desc"></p>'
					break;
				case 'multi':
					bodyType = ''+
						'<label class="textarea">'+
							'<textarea class = "form-control"' + (required ? 'required' : '') +' placeholder = "請輸入文字..." ></textarea>'+
						'</label>'+
						'<p class="desc"></p>'
					break;
				default:
					bodyType = ''+
						'<div class="inline-group"></div>'+
						'<p class="desc"></p>'
					break;
			}
			return bodyType;
		},
	}

	window.onload = new createView();
	$('#back-to-modify').on('click', function(){
		var quizBox = JSON.parse(localStorage.getItem('quizStorage'));
		quizBox.editQuize = true;
		localStorage.setItem('quizStorage', JSON.stringify(quizBox));
		urlRedirect.call(this, './index.html');
	});
	$('#quiz-submit').on('click', function(){
		localStorage.setItem('quizStorage', '');
		urlRedirect.call(this, './index.html');
	});
})(window.jQuery, window, document)