var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]
var qiniu = require('qiniu')

if(!port){
  console.log('请指定端口号？\nnode server 8888 ')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var path = request.url 
  var query = ''
  if(path.indexOf('?') >= 0){ query = path.substring(path.indexOf('?')) }
  var pathNoQuery = parsedUrl.pathname
  var queryObject = parsedUrl.query
  var method = request.method

  /********路由部分************/
  if(path==='/uptoken'){
     response.statusCode = 200
     response.setHeader('Content-Type', 'text/json;charset=utf-8')
     response.setHeader('Access-Control-Allow-Origin', '*')
     response.removeHeader('Date')

     var config = fs.readFileSync('./qiniu-key.json')
     config = JSON.parse(config)

     let {accessKey, secretKey} = config;
     var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
     var options = {
     scope: 'musicplay',
     };
     var putPolicy = new qiniu.rs.PutPolicy(options);
     var uploadToken=putPolicy.uploadToken(mac);
     response.write(`
     {
     "uptoken": "${uploadToken}"
     }
     `)
     response.end()
 }else{
    response.statusCode = 404
    response.end()
  }

  /******** 路由结束 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n地址 http://localhost:' + port)
