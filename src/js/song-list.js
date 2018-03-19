{
	let view = {
		el: {
			songlist: 'aside ul',
			songInfo: 'main section'
		},
		find(selector) {
			return $(this.el.songlist).find(selector)
		},
		renderSonglist(data) {
			let _html = ''
			for(var i = 0; i < data.songs.length; i++) {
				console.log(data)
				_html += `<li id='${data.songs[i].songID}' objectid='${data.songs[i].id}' class='uploaded' data='${data.songs[i].link}'>${data.songs[i].name} - ${data.songs[i].artist}</li>`
			}
			$(this.el.songlist).html(_html)
		},
		fillSonginfo(data) {
			let $this = this.find('#' + data.id)
			$(this.el.songInfo).find('.name').val($this.html())
			$(this.el.songInfo).find('.link').val($this.attr('data'))
			$(this.el.songInfo).find('.submit').attr('id',data.objectid)
			$(this.el.songInfo).css('display', 'flex')
		},
		addList(data) {
			$(this.el.songlist).append(data)
		}
	}
	let model = {
		songList: {
			//从Lencloud上获取到的数据
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
			this.model.find().then(() => {
				this.view.renderSonglist(this.model.songList)
				console.log(this.model.songList)
			})
		},
		bindEvents() {
			$(this.view.el.songlist).on('click', 'li.uploaded', function() {
				let id = ''
				let objectid = ''
				$(this).addClass('action').siblings().removeClass('action')
				id = $(this).attr('id')
				objectid = $(this).attr('objectid')
				view.fillSonginfo({
					id: id,
					objectid: objectid
				})
			})
			$(this.view.el.songInfo).find('.submit').on('click', ()=> {
				let id = $(this.view.el.songInfo).find('.submit').attr('id')
				let name = $(this.view.el.songInfo).find('.name').val()
				let artist = $(this.view.el.songInfo).find('.artist').val()
				controller.modify_songInfo({
					id: id,
					key: name,
					artist: artist
				})
			})
		},
		eventHub() {
			window.eventHub.on('beginUpload', (data) => {
				let _html = '<li class="uploading" id="' + data.id + '" data="' + data.link + '">' + data.key + '<div class="bar"></div></li>'
				this.view.addList(_html)
				this.upload_songInfo(data)
				console.log('开始上传得到的数据')
				console.log(data)
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
		},
		upload_songInfo(data) {
			let songList = AV.Object.extend('songList');
			let songlist = new songList();
			songlist.set('songID', data.id);
			songlist.set('name', data.key);
			songlist.set('artist', data.artist);
			songlist.set('link', data.link);
			songlist.save().then(function(songlist) {
				console.log('lencloud上传完成')
				console.log(songlist)
			}, function(error) {
				console.log(error)
				alert('上传失败，稍后重试')
			});
		},
		modify_songInfo(data) {
			console.log(data)
			var modifyInfo = AV.Object.createWithoutData('songList', data.id);
			modifyInfo.set('name', data.key);
			modifyInfo.set('artist', data.artist);
			console.log(modifyInfo)
			modifyInfo.save();
		}

	}
	controller.init(view, model)
}