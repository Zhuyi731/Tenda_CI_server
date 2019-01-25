const http = require("http");
const https = require("https");
const queryString = require("querystring");
const urlParser = require("url");

class Crawler {
    constructor() {
        this.dealResponse = this.dealResponse.bind(this);
    }

    get(url, options) {

    }

    /**
     * 
     * @param {*地址} url 
     * @param {*需要传递的参数} options 
     * @param {*请求方式} method 
     * @param {*请求数据的传递方式} dataType   json||form||append   
     * json:将json格式数据序列化
     * form:通过queryString来序列化，类似于原始表单提交
     * append:通过queryString来序列化，直接添加到url后面
     */
    creatRequest(url, options, method = "GET", dataType = "json") {
        let requestArgs,
            requestOptions,
            urlOpt = urlParser.parse(url),
            req;

        requestOptions = {
            protocol: urlOpt.protocol,
            host: urlOpt.host,
            path: urlOpt.path,
            method: method.toUpperCase(),
            headers: {
                'Content-Type': "application/json;charset=UTF-8",
                'Content-Length': 0
            }
        };

        switch (dataType) {
            case "append":
                {
                    requestArgs = queryString.stringify(options);
                    requestOptions.path += (/\?$/.test(requestOptions.path) ? "" : "?") + requestArgs;
                }
                break;
            case "json":
                {
                    requestArgs = JSON.stringify(options);
                    requestOptions.headers["Content-Type"] = "";
                }
                break;
            case "form":
                {
                    requestArgs = queryString.stringify(options);
                    requestOptions.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
                }
                break;
        }
        requestOptions.headers["Content-Length"] = requestArgs.length;

        if (urlOpt.protocol == "http:") {
            req = http.request(requestOptions, this.dealResponse);
        } else {
            req = https.request(requestOptions, this.dealResponse);
        }

        req.write(requestArgs, "utf-8");
        req.on("error", err => {
            console.log(err);
        });
        req.end();
    }

    dealResponse(res) {
        let chunk = "";
        console.log(`状态码: ${res.statusCode}`);
        console.log(`响应头: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (data) => {
            console.log(`响应主体: ${data}`);
            chunk += data;
        });
        res.on('end', () => {
            console.log(chunk);
        });
    }
}
const crawler = new Crawler();
crawler.creatRequest("http://api.seniverse.com/v3/life/suggestion.json", {
    key: "ucjdmxvvjcdut4fy",
    location: "shenzhen",
    language: "zh-Hans"
}, "GET", "append");
module.exports = Crawler;