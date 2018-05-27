

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
    $('#modal_name').html('添加新纪录')
    $('#add_data')[0].reset();  
	$("#Modal").modal('show')
    $('#add_submit').show()
    $('#modify_submit').hide()
})



//添加记录
$('#add_submit').click(function(){
    createOrUpdate(1)
})

//修改记录
$('#modify_submit').click(function(){
    createOrUpdate(2)
})

$('#close_modal').click(function(){
    console.log('模态框关闭')
    $('#add_data')[0].reset(); 
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
	 		json.unshift(j)
	 	}
	 	data = json
	 	initTable()
	 },function(error){
		console.log(error)
	 })
}

$('#sign_out').click(function(){
     AV.User.logOut();
     window.location.href = "../index.html";
})

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
                field: 'material',
                title: '材料'
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
        '<button id="btn_table_del" type="button" class="table_del btn btn-danger btn-xs">删除</button><br>'+
        '<button id="btn_table_modify" type="button" class="table_modify btn btn-primary btn-xs">修改</button>',  
    ].join('');  
 }

window.operateEvents = {  
    'click .table_del': function(e, value, row, index) {  
        layer.confirm("确认删除这条记录？", {
			btn: ['确认', '取消'] //按钮
		}, function () {
			delRecord(row.id)
			layer.closeAll('dialog')
		})
    },
     'click .table_modify': function(e, value, row, index) {  
        $('#add_submit').hide()
        $('#modify_submit').show()
        $('#modal_name').html('修改')

        $('#table_id').val(row.id)
        $('#no').val(row.no)
        $('#name').val(row.name)
        $('#phone').val(row.phone)
        $('#injured_time').val(row.injured_time)
        $('#accept_person').val(row.accept_person)
        $('#inside_service_person').val(row.inside_service_person)
        $('#lawyer').val(row.lawyer)
        $('#agency_fees').val(row.agency_fees)
        $('#material').val(row.material)
        $('#note').val(row.note)

        $("#Modal").modal('show')
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


function createOrUpdate(create){
    no = $('#no').val()
    name = $('#name').val()
    phone = $('#phone').val()
    id = $('#table_id').val()
    if(no =='' ||name==''||phone==''){
        console.log('案件编号、姓名、电话 不可为空!')
        toastr.error('案件编号、姓名、电话 不可为空!')
    }
    if(id == '' && create==1){ //新增
        WorkRecord = AV.Object.extend('WorkRecord');
        var workRecord = new WorkRecord()
    }else if (id != '' && create==2){ //更新
        var workRecord = AV.Object.createWithoutData('WorkRecord', id)
    }else{
        toastr.error('出错了 请稍后再试！')
        $("#Modal").modal('hide')
        $('#add_data')[0].reset();  
        return;
    }
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
    workRecord.set('material',$('#material').val())
    workRecord.set('is_del',0)

    if(id == '' && create==1){
        workRecord.save().then(function (result) {
            var j = result._serverData
            j.id = result.id
            data.unshift(j)
            initTable()
            toastr.success("保存成功")
        }, function (error) {
            
            toastr.error('保存失败 请稍后再试！')
        });
    }else if(id != '' && create==2){
        workRecord.save().then(function(){
            toastr.success("修改成功")
            loadData('')
        },function(error){
            toastr.error('修改失败 请稍后再试！')
        })
    }else{
         toastr.error('出错了 请稍后再试！')
    }
    $("#Modal").modal('hide')
    $('#add_data')[0].reset();  
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

