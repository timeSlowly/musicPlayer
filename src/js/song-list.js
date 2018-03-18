{
	let view = {
		el: 'aside ul',
		find(selector) {
			return $(this.el).find(selector)
		},
		template: {

		},
		render(data) {
			console.log(data)
			let _html = ''
			for(var i = 0; i < data.songs.length; i++) {
				_html += `<li id='${data.songs[i].id}' class='uploaded'>${data.songs[i].name} - ${data.songs[i].artist}</li>`
			}
			console.log(_html)
			$(this.el).html(_html)
		},
		addList(data){
			$(this.el).append(data)
		}
	}
	let model = {
		songList: {
			songs: []
		},
		find() {
			var query = new AV.Query('songList');
			return query.find().then((songList) => {
				this.songList.songs = songList.map((song) => {
					return {
						id: song.id,
						...song.attributes
					}
				})
				return songList
			})
		}
	}
	let controller = {
		init(view, model) {
			this.view = view
			this.model = model
			this.initLencloud()
			this.bindEvents()
			this.eventHub()
			this.model.find().then(()=>{
				this.view.render(this.model.songList)
			})
		},
		bindEvents() {
			$(this.view.el).on('click', 'li.uploaded', function() {
				$(this).addClass('action').siblings().removeClass('action')
			})
		},
		eventHub() {
			window.eventHub.on('beginUpload', (data) => {
				let _html = '<li class="uploading" id="' + data.id + '">' + data.key + '<div class="bar"></div></li>'
				this.view.addList(_html)
			})
			window.eventHub.on('uploading', (data) => {
				this.view.find('li.uploading .bar').css("width", data + "%")
			})
			window.eventHub.on('uploaded', (data) => {
				this.view.find('li.uploading').addClass('uploaded').removeClass('uploading').find('.bar').removeClass('bar')
				
			})
		},
		initLencloud() {
			const appId = 'wLBohGG41v9T7VrMcprChWhW-gzGzoHsz';
			const appKey = 'bVm5vdSNMSy4LHogjlgDO4z7';
			AV.init({
				appId,
				appKey
			});
		}

	}
	controller.init(view, model)
}