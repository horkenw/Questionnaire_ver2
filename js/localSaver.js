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
	$('#sub-btn').append(this.subBtn);

	var dataValidate = function(evt){
		evt.preventDefault();

		this.storage.datackd = true;
		this.storage.title = $('#title').val();
		this.storage.describe = $('#describe').val();
		this.storage.welcome = $('#welcome').val();

		$('[name=details]:checked').map($.proxy(function(i, v){
			this.storage.personal.push($(v).val());
		}, this));
		this.storage.date.startDate = this.startDate.data("DateTimePicker").date();
		this.storage.date.endDate = this.endDate.data("DateTimePicker").date();

		localStorage.setItem('quizStorage', JSON.stringify(this.storage));
		window.location.href = './quizpage.html'; 
	}

	this.startDate.datetimepicker({
		locale: 'zh-tw',
        format: 'YYYY-MM-DD'
    });
    this.endDate.datetimepicker({
    	locale: 'zh-tw',
        useCurrent: false, //Important! See issue #1075
        format: 'YYYY-MM-DD'
    });
    this.startDate.on("dp.change", $.proxy(function(e) {
            this.endDate.data("DateTimePicker").minDate(e.date);
        }, this));
    this.endDate.on("dp.change", $.proxy(function(e) {
            this.startDate.data("DateTimePicker").maxDate(e.date);
        }, this));

	this.form.on('submit', $.proxy(dataValidate, this))

}

localSaver.prototype.getData = function(){
	var data = this.storage;
	return data;
}

// 啟動
document.onload = new localSaver();
