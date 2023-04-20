const { VodUploadClient, VodUploadRequest } = require("../index");
const path = require('path');

describe('upload', function () {
    let client;
    const region = "ap-guangzhou";

    beforeEach(function () {
        client = new VodUploadClient("your secretId", "your secretKey");
    });

    it('lack media path', function (done) {
        let req = new VodUploadRequest();
        client.upload(region, req, function (err) {
            if (err.message === "lack media path") {
                done();
            } else {
                done(err);
            }
        });
    });

    it('lack media type', function (done) {
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife");
        client.upload(region, req, function (err) {
            if (err.message === "lack media type") {
                done();
            } else {
                done(err);
            }
        });
    });

    it('invalid media path', function (done) {
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "WildlifeA");
        client.upload(region, req, function (err) {
            if (err.message === "media path is invalid") {
                done();
            } else {
                done(err);
            }
        });
    });

    it('invalid cover path', function (done) {
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-coverA");
        client.upload(region, req, function (err) {
            if (err.message === "cover path is invalid") {
                done();
            } else {
                done(err);
            }
        });
    });

    it('lack cover type', function (done) {
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-cover");
        client.upload(region, req, function (err) {
            if (err.message === "lack cover type") {
                done();
            } else {
                done(err);
            }
        });
    });

    it('invalid media type', function (done) {
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-cover.png");
        req.MediaType = "test";
        client.upload(region, req, function (err) {
            if (err.message === "invalid media type") {
                done();
            } else {
                done(err);
            }
        });
    });

    it('invalid cover type', function (done) {
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-cover.png");
        req.CoverType = "test";
        client.upload(region, req, function (err) {
            if (err.message === "invalid cover type") {
                done();
            } else {
                done(err);
            }
        });
    });

    it('normal upload', function (done) {
        this.timeout(10000);
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-cover.png");
        client.upload(region, req, function (err, data) {
            if (err) {
                done(err);
            }
            if (data.FileId) {
                console.log(data.FileId);
                done();
            } else {
                done(data);
            }
        });
    });

    it('upload with progress callback', function (done) {
        this.timeout(10000);
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-cover.png");
        client.upload(region, req, function (err, data) {
            if (err) {
                done(err);
            }
            if (data.FileId) {
                console.log(data.FileId);
                done();
            } else {
                done(data);
            }
        },
        function (progressData) {
            console.log(JSON.stringify(progressData));
        });
    });

    it('upload with Procedure', function (done) {
        this.timeout(10000);
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-cover.png");
        req.Procedure = "QCVB_SimpleProcessFile(1, 1)";
        client.upload(region, req, function (err, data) {
            if (err) {
                done(err);
            }
            if (data.FileId) {
                console.log(data.FileId);
                done();
            } else {
                done(data);
            }
        });
    });

    it('upload with storage region', function (done) {
        this.timeout(10000);
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-cover.png");
        req.StorageRegion = "ap-chongqing";
        client.upload(region, req, function (err, data) {
            if (err) {
                done(err);
            }
            if (data.FileId) {
                console.log(data.FileId);
                done();
            } else {
                done(data);
            }
        });
    });

    it('upload with media name', function (done) {
        this.timeout(10000);
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "Wildlife.mp4");
        req.CoverFilePath = path.join(__dirname, "Wildlife-cover.png");
        req.MediaName = "test_test";
        client.upload(region, req, function (err, data) {
            if (err) {
                done(err);
            }
            if (data.FileId) {
                console.log(data.FileId);
                done();
            } else {
                done(data);
            }
        });
    });

    it('upload simple hls', function (done) {
        this.timeout(10000);
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "hls", "prog_index.m3u8");
        req.MediaName = "test_hls";
        client.upload(region, req, function (err, data) {
            if (err) {
                done(err);
            }
            if (data.FileId) {
                console.log(data.FileId);
                done();
            } else {
                done(data);
            }
        });
    });

    it('upload master playlist', function (done) {
        this.timeout(20000);
        let req = new VodUploadRequest();
        req.MediaFilePath = path.join(__dirname, "hls", "bipbopall.m3u8");
        req.MediaName = "test_master_playlist";
        client.upload(region, req, function (err, data) {
            if (err) {
                done(err);
            }
            if (data.FileId) {
                console.log(data.FileId);
                done();
            } else {
                done(data);
            }
        });
    });
});