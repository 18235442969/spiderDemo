/*
 * @Author: MonkeyInMountain
 * @Date: 2017-11-07 11:11:23
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2017-11-07 11:45:58
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
const getDetail = async function(url) {
    return new Promise((resolve, reject) => {
        server.get(url).then((resourse) => {
            const $ = cheerio.load(resourse.data);
            // const reg = /http:\/\/[\w\W]+\d\.rmvb/g;
            var str = $('.blog-detail-time span').text() + '\r\n'
            fs.appendFile('./data/url.txt', str, "utf-8", function(err) {
                if (err) {
                    return console.log(err);
                }
                resolve();
            })
        }).catch((error) => {
            console.log('error');
            resolve();
        });
    })
}

/**
 * 获取请求地址处理
 */
const getUrl = async function(data) {
    //记录本页第几个
    let i = 0;
    const $ = cheerio.load(data);
    let arr = [];
    $(".blogListFooter>a").each((index, e) => {
        arr.push($(e).attr("href"));
    });
    for (let k of arr) {
        let url = basicUrl + k;
        console.log(url);
        try {
            await getDetail(url);
            console.log(i);
            i++;
        } catch (err) {
            console.log(err)
        }
    }
    console.log('end')
}



//开始
const start = function(url) {
    server.get(url).then((resourse) => {
        const $ = cheerio.load(resourse.data);
        let imgUrl = basicUrl + $($('.persionImage')[0]).attr('src');
        request.head(imgUrl, function(err, res, body) {
            if (err) {
                console.log(err);
            }
            request(imgUrl).pipe(fs.createWriteStream('./image/bgImg.jpg'));
        });
        // console.log(imgUrl);
        // var reg = /[a-zA-Z]+[-_]\d+/g
        // getUrl(resourse.data);
    }).catch((error) => {
        console.log(error);
    });
}

start(basicUrl);