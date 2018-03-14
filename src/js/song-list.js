{
	let view = {
		el: 'aside ul',
		find(selector) {
			return $(this.el).find(selector)
		},
		template: `
			<li>丑八怪-薛之谦</li>
			<li>丑八怪-薛之谦</li>
			<li>丑八怪-薛之谦</li>
		`,
		render(data) {
			if(data === undefined) {
				$(this.el).html(this.template)
			}else{
				console.log(data)
				$(this.el).append(data)
			}
		}
	}
	let model = {}
	let controller = {
		init(view, model) {
			this.view = view
			this.model = model
			this.view.render(this.model.data)
			this.bindEvents()
			window.eventHub.on('beginUpload', (data) => {
				let _html = '<li class="uploading">' + data.key + '<div class="bar"></div></li>'
				this.view.render(_html)
			})
			window.eventHub.on('uploading',(data)=>{
				this.view.find('li.uploading .bar').css("width",data + "%")
			})
			window.eventHub.on('uploaded',(data)=>{
				this.view.find('li.uploading .bar').removeClass('bar')
			})
		},
		bindEvents() {
			$(this.view.el).on('click','li', function() {
				$(this).addClass('action').siblings().removeClass('action')
			})
		}

	}
	controller.init(view, model)
}