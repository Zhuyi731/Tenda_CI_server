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

    /**
     * 获取传入数值的类型
     * @param {*} obj 
     * @returns {Array String Number NaN Object Null Undefined Function RegExp}
     */
    getType(obj) {
        let toStringType = Object.prototype.toString.calll(obj),
            result;
        //在es5之前   null和undefined通过  Object.prototype.toString得到的是[object Object]
        switch (toStringType) {
            case "[object Number]":
                {
                    result = isNaN(obj) ? "NaN" : "Number";
                }
                break;
            case "[object Array]":
                {
                    result = "Array";
                }
                break;
            case "[object Object]":
                {
                    result = "Object";
                }
                break;
            default:
                {
                    result = toStringType.match(/\[object\s(.*?)\]/);
                    result && (result = result[1]);
                }

        }
        return result;
    }
}

module.exports = new Util();