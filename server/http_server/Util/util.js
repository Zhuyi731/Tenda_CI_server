const fs = require("fs");
const _ = require("lodash");
const path = require("path");

class Util {
    constructor() {
        this.debug = global.debug.util;
    }

    wrapSpawn(sp, resolve, reject, options) {
        let text = "",
            hasError = false,
            errorText = [],
            defaultOptions = {
                silent: false
            };
        options = _.extend(defaultOptions, options);

        //process error
        sp.on("err", err => {
            reject("进程错误");
        });

        //std error
        sp.stderr.on('data', (data) => {
            errorText.push(data.toString("utf-8"));
            hasError = true;
            !options.silent && console.log(data.toString("utf-8"));
        });

        //collect std stream information
        sp.stdout.on("data", (data) => {
            text += data;
            !options.silent && console.log(data.toString("utf-8"));
        });

        sp.stdout.on("close", () => {
            resolve({
                text: hasError ? errorText : text,
                hasError: hasError
            });
        });
    }

    /**
     * 递归的创建文件夹
     * @param {*} dirPath 必须为一个相对于盘的绝对路径
     */
    mkDirRecursively(dirPath) {
        let dirStack = dirPath.split(/\\/),
            depth = dirStack.length,
            ct = 1,
            curPath = dirStack[0];

        while (ct < depth) {
            curPath = path.join(curPath, dirStack[ct]);
            !fs.existsSync(curPath) && fs.mkdirSync(curPath);
            ct++;
        }
    }

    /**
     * 用于处理数据库返回的数据,
     * @param {*数据库返回的数据} rows 
     */
    dealRowData(rows) {
        return rows.map((data) => {
            let obj = {},
                pro;
            for (pro in data) {
                if (data.hasOwnProperty(pro)) {
                    obj[pro] = data[pro];
                }
            }
            return obj;
        });
    }

    dealDataValues(modals) {
        return modals.map(modal => {
            return modal.dataValues;
        });
    }

    debug() {
        if (!this.debug) return;

        let args = arguments;
        args.forEach(msg => {
            console.log(`[Debug:]\t${msg}`);
        });
    }

    /**
     * 同步方法  删除一个文件夹  -r
     * @param {*要删除的文件夹} dir 
     * @param {*callback} cb 
     */
    rmdirSync(dir, cb) {
        (function() {
            function iterator(url, dirs) {
                let stat = fs.statSync(url);
                if (stat.isDirectory()) {
                    dirs.unshift(url); //收集目录
                    inner(url, dirs);
                } else if (stat.isFile()) {
                    fs.unlinkSync(url); //直接删除文件
                }
            }

            function inner(path, dirs) {
                let arr = fs.readdirSync(path);
                for (let i = 0, el; el = arr[i++];) { //eslint-disable-line
                    iterator(path + "/" + el, dirs);
                }
            }
            return function(dir, cb) {
                cb = cb || function() {};
                let dirs = [];

                try {
                    iterator(dir, dirs);
                    for (let i = 0, el; el = dirs[i++];) { //eslint-disable-line
                        fs.rmdirSync(el); //一次性删除所有收集到的目录
                    }
                    cb();
                } catch (e) { //如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
                    e.code === "ENOENT" ? cb() : cb(e);
                }
            };
        })(dir, cb);
    }

    /**
     * 让一个数组内的函数异步顺序执行
     * @param {*需要线性运行的promise函数数组} promiseArr @type Array  数组中的每个值都是函数对象的引用  而不是像  b()这样的   应该传b
     * @param {*是否需要返回一个Promise} returnPromise 　@type Boolean
     */
    runPromiseLinear(promiseArr, returnPromise) {
        return new Promise((resolve, reject) => {
            let result = Promise.resolve();

            promiseArr.forEach(func => {
                result = result.then(this._promiseFactory(func));
            });
        });
    }

    _promiseFactory(func) {
        //只有当进入到then中才会
        return function() {
            return new Promise((resolve, reject) => {
                func()
                    .then(resolve)
                    .catch(reject);
            });
        };
    }
}

module.exports = new Util();