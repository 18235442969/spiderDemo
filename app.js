/*
 * @Author: MonkeyInMountain
 * @Date: 2017-11-07 11:11:23
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2017-11-07 15:06:34
 */
import axios from 'axios'
import fs from 'fs'
import cheerio from 'cheerio'
import request from "request";
//基本路径
const basicUrl = 'http://www.monkeyinmountain.com'

//配置超时时间
let server = axios.create({
    timeout: 10000
});
/**
 * 获取详情保存
 */
const getDetail = function(data) {
    return new Promise((resolve, reject) => {
        const $ = cheerio.load(data);
        let arr = [];
        $(".blogListFooter>a").each((index, e) => {
            var req = new Promise((resolve, reject) => {
                let url = basicUrl + $(e).attr("href");
                server.get(url).then((resourse) => {
                    const $ = cheerio.load(resourse.data);
                    // const reg = /http:\/\/[\w\W]+\d\.rmvb/g;
                    var str = $(".blog-detail-time span").text() + index + "\r\n";
                    fs.appendFile('./data/url.txt', str, "utf-8", function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log(index);
                        resolve();
                    })
                }).catch((error) => {
                    console.log('error');
                    resolve();
                });
            });
            arr.push(req);
        });
        resolve(arr);
    })
}

/**
 * 获取请求地址处理
 */
const getUrl = async function(data) {
    //记录本页第几个
    let i = 0;
    let arr = await getDetail(data);
    //同时请求本页所有数据
    Promise.all(arr).then((result) => {
        console.log("end");
    });
}



//开始
const start = function(url) {
    server.get(url).then((resourse) => {
        // const $ = cheerio.load(resourse.data);
        // let imgUrl = basicUrl + $($('.persionImage')[0]).attr('src');
        // request.head(imgUrl, function(err, res, body) {
        //     if (err) {
        //         console.log(err);
        //     }
        //     request(imgUrl).pipe(fs.createWriteStream('./image/bgImg.jpg'));
        // });
        // console.log(imgUrl);
        // var reg = /[a-zA-Z]+[-_]\d+/g
        getUrl(resourse.data);
    }).catch((error) => {
        console.log(error);
    });
}

start(basicUrl);