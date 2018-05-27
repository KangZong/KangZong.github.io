

var data = []

$(document).ready(function(){
    if (isCurrentUser()) {
        init()
        loadData('')
    } else {
        window.location.href = "../index.html";
    }
})

$("#add").click(function() {
	console.log('打开模态框')
	$("#Modal").modal('show')
})



//添加记录
$('#add_submit').click(function(){
	console.log('添加记录')
	no = $('#no').val()
	name = $('#name').val()
	phone = $('#phone').val()
	if(no =='' ||name==''||phone==''){
		console.log('案件编号、姓名、电话 不可为空!')
		toastr.error('案件编号、姓名、电话 不可为空!')
	}
	WorkRecord = AV.Object.extend('WorkRecord');
	var workRecord = new WorkRecord()
	workRecord.set('no',no)
	workRecord.set('name',name)
	workRecord.set('phone',phone)
	workRecord.set('injured_time',$('#injured_time').val())
	workRecord.set('identify_time',$('#identify_time').val())
	workRecord.set('accept_person',$('#accept_person').val())
	workRecord.set('inside_service_person',$('#inside_service_person').val())
	workRecord.set('lawyer',$('#lawyer').val())
	workRecord.set('agency_fees',$('#agency_fees').val())
	workRecord.set('note',$('#note').val())

	workRecord.save().then(function (result) {
		$("#Modal").modal('hide')
    	console.log("保存成功！")

        var j = result._serverData
        j.id = result.id
        data.unshift(j)
        initTable()

    	toastr.success("保存成功")
    	$('#add_data')[0].reset();  
    }, function (error) {
    	console.log("保存失败！")
    	toastr.error('保存失败 请稍后再试！')
    });
})

/**
 * 搜索
 */
$('#search_btn').click(function(){
    var search_val = $('#search_val').val()
    loadData(search_val)
})
/**
 * 屏蔽回车事件
 */
$('#search_val').bind('keypress',function(event){
    if(event.keyCode == "13") {
         event.preventDefault();   
        $('#search_btn').click();
    }
});

/**
 * 加载数据
 * @return {[type]} [description]
 */
function loadData(like){
	query = new AV.Query('WorkRecord')
	query.equalTo('is_del',0)
    if(like != ''){
        query.contains('name',like)
    }
	query.find().then(function (results) {
	 	var json = []
	 	var j = {}
	 	for (var i = 0; i < results.length; i++) {
	 		j = results[i]._serverData
	 		j.id = results[i].id
	 		json.push(j)
	 	}
	 	data = json
	 	initTable()
	 },function(error){
		console.log(error)
	 })
}

/**
 * 渲染表格
 * @return {[type]} [description]
 */
function initTable(){
	 $('#my_table').bootstrapTable('destroy')
	 $('#my_table').bootstrapTable({
	 	 	data:data,
            columns: [ {
                field: 'no',
                title: '案件编号'
            }, {
                field: 'name',
                title: '姓名'
            }, {
                field: 'phone',
                title: '电话'
            }, {
                field: 'injured_time',
                title: '受伤时间'
            }, {
                field: 'identify_time',
                title: '鉴定时间'
            }, {
                field: 'accept_person',
                title: '收案人员'
            }, {
                field: 'inside_service_person',
                title: '内勤处理人员'
            }, {
                field: 'lawyer',
                title: '律师'
            }, {
                field: 'agency_fees',
                title: '代理费'
            }, {
                field: 'note',
                title: '备注'
            }, {
                field: 'Button',
                title: '操作',
                events:operateEvents,
                formatter:operateFormatter
            }]
     });
}

 function operateFormatter(value, row, index) {  
    return [  
        '<button id="btn_table_del" type="button" class="RoleOfA btn btn-danger">删除</button>',  
    ].join('');  
 }

window.operateEvents = {  
    'click .RoleOfA': function(e, value, row, index) {  
        console.log(row)
        layer.confirm("确认删除这条记录？", {
			btn: ['确认', '取消'] //按钮
		}, function () {
			delRecord(row.id)
			layer.closeAll('dialog')
		})
    }  
}

function delRecord(id){
  	AV.Query.doCloudQuery('update WorkRecord set is_del=1 where objectId="'+id+'"')
  	.then(function(data){
  		console.log('更新成功！')
  		this.data = $.grep(this.data,function(value){
  		    return value.id != id
  		})
  		initTable()
  	},function(error){
  		console.log(error)
  	})
}




/**
 * 初始化
 * @return {[type]} [description]
 */
 function init(){
 	toastr.options = {
 		"closeButton": true,
 		"debug": false,
 		"progressBar": true,
 		"positionClass": "toast-bottom-right",
 		"onclick": null,
 		"showDuration": "300",
 		"hideDuration": "300",
 		"timeOut": "7000",
 		"extendedTimeOut": "1000",
 		"showEasing": "swing",
 		"hideEasing": "linear",
 		"showMethod": "show",
 		"hideMethod": "fadeOut"
 	}

 	laydate.render({
        elem: '#injured_time',
        theme: 'molv'
    })

    laydate.render({
        elem: '#identify_time',
        theme: 'molv'
    })

    initTable()
 }

