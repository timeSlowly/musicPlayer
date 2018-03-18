{
	let view = {
		el: 'article',
		template: `
			<div id="upload-dropArea" class="uploader">
				<p>将文件拖曳至虚线框内，或点击<b id="uploderButton"> 此处 </b>选择文件以上传</p>
			</div>
		`,
		render(data) {
			$(this.el).html(this.template)
		}
	}
	let model = {
		qiniuFile: {}
	}
	let controller = {
		init(view, model) {
			this.view = view
			this.model = model
			this.view.render(this.model.data)
			this.initQiniu()
		},
		initQiniu() {
			var view = this.view
			var qiniuFile = this.model.qiniuFile
			var uploader = Qiniu.uploader({
				runtimes: 'html5', //上传模式,依次退化
				browse_button: 'uploderButton', //上传选择的点选按钮，**必需**
				uptoken_url: 'http://localhost:8888/uptoken',
				domain: 'http://p53jgj0ea.bkt.clouddn.com/', //bucket 域名，下载资源时用到，**必需**
				get_new_uptoken: false, //设置上传文件的时候是否每次都重新获取新的token
				max_file_size: '40mb', //最大文件体积限制
				dragdrop: true, //开启可拖曳上传
				drop_element: 'upload-dropArea', //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
				auto_start: true, //选择文件后自动上传，若关闭需要自己绑定事件触发上传
				init: {
					'FilesAdded': function(up, files) {
						plupload.each(files, function(file) {
							// 文件添加进队列后,处理相关的事情
							return
						});
					},
					'BeforeUpload': function(up, file) {
						console.log('--------开始上传--------')
						qiniuFile.domain = up.getOption('domain');
						qiniuFile.name = file.name;
						qiniuFile.id = file.id;
						qiniuFile.sourceLink = qiniuFile.domain + encodeURIComponent(qiniuFile.name);
						window.eventHub.emit('beginUpload', {
							key: qiniuFile.name,
							id: qiniuFile.id
						})
					},
					'UploadProgress': function(up, file) {
						var percent = this.total.percent
						console.log('已上传' + this.total.percent + '%')
						window.eventHub.emit('uploading', percent)
					},
					'FileUploaded': function(up, file, info) {
						console.log('--------上传完毕--------')
						window.eventHub.emit('uploaded', {
							link: qiniuFile.sourceLink
						})
					},
					'Error': function(up, err, errTip) {
						//上传出错时,处理相关的事情
					},
					'UploadComplete': function() {
						//队列文件处理完毕后,处理相关的事情
					},
				}
			});
		}
	}
	controller.init(view, model)
}