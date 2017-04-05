/**
 * Created by evolve on 8/24/2015.
 */
function localSaver(){
	this.storage={
		datackd: false,
		title: '',
		describe: '',
		welcome: '',
		personal: [],
		date: {
			startDate: '',
			endDate: ''
		},
		quiz: ''
	}
	this.subBtn = $('<input type="submit" class="btn btn-info btn-block" value="下一步">');
	this.form = $('#requestops');
	this.startDate = $("#startDate");
	this.endDate = $('#endDate');
	this.quizBox = JSON.parse(localStorage.getItem('quizStorage'));
	$('#sub-btn').append(this.subBtn);

	var dataValidate = function(evt){
		evt.preventDefault();

		this.storage.title = $('#title').val();
		this.storage.describe = $('#describe').val();
		this.storage.welcome = $('#welcome').val();

		$('[name=details]:checked').map($.proxy(function(i, v){
			this.storage.personal.push($(v).val());
		}, this));
		this.storage.date.startDate = this.startDate.data("DateTimePicker").date();
		this.storage.date.endDate = this.endDate.data("DateTimePicker").date();
		this.storage.editQuize = true;

		localStorage.setItem('quizStorage', JSON.stringify(this.storage));
		window.location.href = './quiz-page.html'; 
	}

	this.startDate.datetimepicker({
		locale: 'zh-tw',
		format: 'YYYY-MM-DD',
			tooltips: {
		    today: '當天',
		    clear: '清除',
		    close: '關閉',
		    selectMonth: '月',
		    prevMonth: '上一月',
		    nextMonth: '下一月',
		    selectYear: '年',
		    prevYear: '上一年',
		    nextYear: '下一年',
		    selectDecade: 'Select Decade',
		    prevDecade: 'Previous Decade',
		    nextDecade: 'Next Decade',
		    prevCentury: '上一世紀',
		    nextCentury: '下一世紀'
		}
	});
	this.endDate.datetimepicker({
		locale: 'zh-tw',
		useCurrent: false,
		format: 'YYYY-MM-DD',
		tooltips: {
		    today: '當天',
		    clear: '清除',
		    close: '關閉',
		    selectMonth: '月',
		    prevMonth: '上一月',
		    nextMonth: '下一月',
		    selectYear: '年',
		    prevYear: '上一年',
		    nextYear: '下一年',
		    selectDecade: 'Select Decade',
		    prevDecade: 'Previous Decade',
		    nextDecade: 'Next Decade',
		    prevCentury: '上一世紀',
		    nextCentury: '下一世紀'
		}
	});

	this.startDate.on("dp.change", $.proxy(function(e) {
		this.endDate.data("DateTimePicker").minDate(e.date);
	}, this));
	this.endDate.on("dp.change", $.proxy(function(e) {
		this.startDate.data("DateTimePicker").maxDate(e.date);
	}, this));

	if(this.quizBox && this.quizBox.editQuize) this.setInitData();

	this.form.on('submit', $.proxy(dataValidate, this));
}

localSaver.prototype.setInitData = function(){
	console.log(this.quizBox);
	$('#title').val(this.quizBox.title);
	$('#describe').val(this.quizBox.describe);
	$('#welcome').val(this.quizBox.welcome);

	if(this.quizBox.personal.length)
		this.quizBox.personal.forEach(function(v, i){
			$('input[type=checkbox]').eq(v).click();
	})
	this.startDate.data("DateTimePicker").date(moment(this.quizBox.date.startDate).format('YYYY-MM-DD'));
	this.endDate.data("DateTimePicker").date(moment(this.quizBox.date.endDate).format('YYYY-MM-DD'));
}

localSaver.prototype.getData = function(){
	var data = this.storage;
	return data;
}

// 啟動
document.onload = new localSaver();
