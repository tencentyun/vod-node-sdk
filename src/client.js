const { FileUtil, StringUtil } = require("./common");
const VodClientException = require("./exception");
const { VodUploadResponse } = require("./model");
const cloud = require("tencentcloud-sdk-nodejs");
const COS = require('cos-nodejs-sdk-v5');

const VodClient = cloud.vod.v20180717.Client;
const VodModel = cloud.vod.v20180717.Models;
const Credential = cloud.common.Credential;

class VodUploadClient {
    constructor(secretId, secretKey) {
        this.secretId = secretId || null;
        this.secretKey = secretKey || null;
        this.ignoreCheck = false;
    }

    upload(region, request, callback) {
        const cred = new Credential(this.secretId, this.secretKey);
        const cloudClient = new VodClient(cred, region);
        this.prefixCheckAndSetDefaultVal(
            region, request
        ).then(() => {
            let applyUploadRequest = new VodModel.ApplyUploadRequest();
            applyUploadRequest.from_json_string(request.to_json_string());
            return new Promise(
                (resolve, reject) => {
                    cloudClient.ApplyUpload(applyUploadRequest, function (err, applyUploadResponse) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(applyUploadResponse);
                        }
                    });   
                }
            );
        }).then((applyUploadResponse) => {
            let cosClient;
            if (applyUploadResponse.TempCertificate == null) {
                cosClient = new COS({
                    SecretId: this.secretId,
                    SecretKey: this.secretKey
                })
            } else {
                cosClient = new COS({
                    SecretId: applyUploadResponse.TempCertificate.SecretId,
                    SecretKey: applyUploadResponse.TempCertificate.SecretKey,
                    XCosSecurityToken: applyUploadResponse.TempCertificate.Token
                });
            }
            return new Promise(
                (resolve, reject) => {
                    if (StringUtil.isNotEmpty(request.MediaType) && StringUtil.isNotEmpty(applyUploadResponse.MediaStoragePath)) {
                        cosClient.sliceUploadFile({
                            Bucket: applyUploadResponse.StorageBucket,
                            Region: applyUploadResponse.StorageRegion,
                            Key: applyUploadResponse.MediaStoragePath,
                            FilePath: request.MediaFilePath
                        }, function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve({
                                    client: cosClient,
                                    response: applyUploadResponse
                                });
                            }
                        });
                    } else {
                        resolve({
                            client: cosClient,
                            response: applyUploadResponse
                        });
                    }
                }
            );
        }).then((data) => {
            return new Promise(
                (resolve, reject) => {
                    if (StringUtil.isNotEmpty(request.CoverType) && StringUtil.isNotEmpty(data.response.CoverStoragePath)) {
                        data.client.sliceUploadFile({
                            Bucket: data.response.StorageBucket,
                            Region: data.response.StorageRegion,
                            Key: data.response.CoverStoragePath,
                            FilePath: request.CoverFilePath
                        }, function (err) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(data.response);
                            }
                        });
                    } else {
                        resolve(data.response);
                    }
                }
            );
        }).then((applyUploadResponse) => {
            let commitUploadRequest = new VodModel.CommitUploadRequest();
            commitUploadRequest.VodSessionKey = applyUploadResponse.VodSessionKey;
            commitUploadRequest.SubAppId = request.SubAppId;
            return new Promise(
                (resolve, reject) => {
                    cloudClient.CommitUpload(commitUploadRequest, function (err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            let response = new VodUploadResponse();
                            response.from_json_string(data.to_json_string());
                            callback(null, response);
                            resolve()
                        }
                    })
                }
            );
        }).catch(err => callback(err, null))
    }

    prefixCheckAndSetDefaultVal(region, request) {
        return new Promise(
            (resolve, reject) => {
                if (!this.ignoreCheck) {
                    if (StringUtil.isEmpty(region)) {
                        reject(new VodClientException("lack region"));
                    }
                    if (StringUtil.isEmpty(request.MediaFilePath)) {
                        reject(new VodClientException("lack media path"));
                    }
                    if (!FileUtil.isFileExist(request.MediaFilePath)) {
                        reject(new VodClientException("media path is invalid"));
                    }
                    if (StringUtil.isEmpty(request.MediaType)) {
                        let videoType = FileUtil.getFileType(request.MediaFilePath);
                        if (StringUtil.isEmpty(videoType)) {
                            reject(new VodClientException("lack media type"));
                        }
                        request.MediaType = videoType;
                    }
                    if (StringUtil.isEmpty(request.MediaName)) {
                        request.MediaName = FileUtil.getFileName(request.MediaFilePath);
                    }

                    if (StringUtil.isNotEmpty(request.CoverFilePath)) {
                        if (!FileUtil.isFileExist(request.CoverFilePath)) {
                            reject(new VodClientException("cover path is invalid"));
                        }
                        if (StringUtil.isEmpty(request.CoverType)) {
                            let coverType = FileUtil.getFileType(request.CoverFilePath);
                            if (StringUtil.isEmpty(coverType)) {
                                reject(new VodClientException("lack cover type"));
                            }
                            request.CoverType = coverType;
                        }
                    }
                }
                resolve();
            }
        )
    }
}

module.exports = VodUploadClient;