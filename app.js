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
// const basicUrl = 'http://aqdyba.com/lusi/'
const basicUrl = 'http://aqdyba.com/lldm/'
const homeUrl = 'http://aqdyba.com'
let num = 1;
/**
 * 获取详情保存
 */
const getDetail = function(data) {
    return new Promise((resolve, reject) => {
        const $ = cheerio.load(data);
        let arr = [];
        $(".show-list h5 a").each((index, e) => {
            var req = new Promise((resolve, reject) => {
                const ip = parseInt(Math.random()*253 + 1) + '.' + parseInt(Math.random()*253 + 1) + '.' + parseInt(Math.random()*253 + 1) + '.' + parseInt(Math.random()*253 + 1);
                //配置超时时间
                let server = axios.create({
                    timeout: 2000,
                    headers: {
                        'X-Forwarded-For' : ip
                    }
                });
                let url = homeUrl + $(e).attr("href");
                console.log(url);
                server.get(url).then((resourse) => {
                    console.log(index);
                    const $ = cheerio.load(resourse.data);
                    var str = $(".con4").html();
                    // const reg = /http:\/\/[\w\W]+\d\.rmvb/g;
                    const reg = /http:\/\/[\w\W]+\.rmvb/g;//lldm
                    let downstr;
                    if (str.match(reg)) {
                        downstr = str.match(reg)[0] + "\r\n";
                    } else {
                        downstr = '';
                    }
                    console.log(downstr);
                    fs.appendFile('./data/url.txt', downstr, "utf-8", function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        resolve();
                    })
                }).catch((error) => {
                    console.log('error2');
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
        if(num < 200){
            num++;
            start(basicUrl + 'index' + num + '.html');
        }else{
            console.log('end');
        }
    });

}



//开始
const start = function(url) {
    const ip = parseInt(Math.random()*253 + 1) + '.' + parseInt(Math.random()*253 + 1) + '.' + parseInt(Math.random()*253 + 1) + '.' + parseInt(Math.random()*253 + 1);
    //配置超时时间
    let server = axios.create({
        timeout: 3000,
        headers: {
            'X-Forwarded-For' : ip
        }
    });
    server.get(url).then((resourse) => {
        console.log(num);
        console.log(ip);
        try{
            const $ = cheerio.load(resourse.data);
            let imgList = $('.play-pic img');
            imgList.each((index, e) => {
                let reg = /[a-zA-Z]+[-_]\d+/g
                let imgUrl = $(e).attr('src');
                let str = $(e).attr('alt');
                let imgName = str.match(reg) || str;
                if (imgName && imgUrl) {
                    let name = imgName[0] + '.jpg';
                    console.log(imgUrl);
                    try {
                        request.head(imgUrl, function(err, res, body) {
                            if (err) {
                                console.log(err);
                            }
                            let writeStream = fs.createWriteStream('./image/' + name, {autoClose:true});
                            request(imgUrl).pipe(writeStream).on('close', function(){
                                console.log('end');
                            });
                        });
                    }catch(error){
                        console.log(name + 'imgError');
                    }
                }
            })
        }catch(e) {
            console.log('imgErr');
        }
        getUrl(resourse.data);
    }).catch((error) => {
        console.log('error');
        num++;
        start(basicUrl + 'index' + num + '.html');
    });
}
if(num == 1){
start(basicUrl);

}else{
    start('http://aqdyba.com/lusi/index' + num + '.html');
}