## 简介

基于 NodeJs 语言平台的服务端上传的 SDK，通过 SDK 和配合的 Demo，可以将视频和封面文件直接上传到腾讯云点播系统，同时可以指定各项服务端上传的可选参数。

## npm 安装
```
npm i vod-node-sdk --save
```

## 示例

```
const { VodUploadClient, VodUploadRequest } = require('vod-node-sdk');

client = new VodUploadClient("your secretId", "your secretKey");
let req = new VodUploadRequest();
req.MediaFilePath = "/data/file/Wildlife.mp4";
req.CoverFilePath = "/data/file/Wildlife-cover.png";
client.upload("ap-guangzhou", req, function (err, data) {
    if (err) {
        // 处理业务异常
        console.log(err)
    } else {
        // 获取上传成功后的信息
        console.log(data.FileId);
        console.log(data.MediaUrl);
        console.log(data.CoverUrl);
    }
});
```
