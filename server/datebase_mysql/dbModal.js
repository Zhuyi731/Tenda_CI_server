const Sequelize = require("sequelize");
const MYSQL_CONFIG = require("../config/mysql_config");

class DataBaseModal {
    constructor() {
        this.tableModals = {};
        this.sequelize = null;
        //调试用，正常情况下设置为false即可
        this.force = true;
        this.init();
    }

    init() {
        this.initConnection();
        this.testConnection();
        this.initTableStruct();
    }

    //初始化连接，连接上数据库
    initConnection() {
        this.sequelize = new Sequelize({
            database: MYSQL_CONFIG.database,
            username: MYSQL_CONFIG.username,
            password: MYSQL_CONFIG.password,
            host: MYSQL_CONFIG.host,
            dialect: "mysql",
            pool: {
                max: 5,
                min: 0,
                acquire: MYSQL_CONFIG.aquireTimeout,
                idle: 10000
            }
        });
    }

    //测试连接是否正常
    testConnection() {
        console.log(`Start try connect to mysql database`);
        this.sequelize
            .authenticate()
            .then(() => {
                console.log("Connection has been established successfully");
            })
            .catch(err => {
                console.error("Unable to connect to the datebase:", err);
            });
    }

    //初始化数据库表结构
    initTableStruct() {
        /**
         * 成员表格
         * @param {name} 成员名称
         * @param {mail} 成员邮件地址前缀  例如pengjuanli@tenda.cn  则mail:pengjuanli
         * @param {authority} 成员权限  0~9依次降低
         */
        this.tableModals.User = this.sequelize.define('users', {
            name: { type: Sequelize.STRING, allowNull: false },
            mail: { type: Sequelize.STRING },
            authority: { type: Sequelize.INTEGER(1).UNSIGNED }
        }, {
            'freezeTableName': true
        });

        /**
         * 项目表格
         * @param{product} 产品名称
         * @param{productLine} 产品线
         * @param{isMultiLang} 是否为多国语言项目
         * @param{excelUploaded} 多国语言项目语言包是否上传 上传则为1 否则为0
         * @param{langPath} 语言包json文件相对于项目根目录的相对路径 
         * @param{src} 项目svn路径
         * @param{dist} 项目dist路径 
         * @param{compilerOrder} 编译指令 如果为npm run build 则储存build0
         * @param{compiler} 编译器类型 现只支持webpack  如果没有则为none
         * @param{localDist} 编译后的本地路径 
         * @param{interval} 检查间隔 单位/天
         * @param{testCase} 测试用例是否上传 上传则为1 否则为0
         * @param{status} 项目运行状态  pending 待运行  running 运行中，处于pending的项目不会检查
         */
        this.tableModals.Product = this.sequelize.define('product', {
            product: { type: Sequelize.STRING(255), primaryKey: true, allowNull: false },
            productLine: { type: Sequelize.STRING(255), allowNull: false },
            isMultiLang: { type: Sequelize.INTEGER(1), defaultValue: 0 },
            excelUploaded: { type: Sequelize.INTEGER(1), defaultValue: 0 },
            langPath: { type: Sequelize.STRING(255), defaultValue: null },
            src: { type: Sequelize.STRING(255), allowNull: false },
            dist: { type: Sequelize.STRING(255), defaultValue: null },
            compiler: { type: Sequelize.ENUM, values: ["none", "webpack"] },
            compilerOrder: { type: Sequelize.STRING(255), validate: { is: /[a-zA-Z0-9]/ } },
            localDist: { type: Sequelize.STRING(255), defaultValue: null },
            interval: { type: Sequelize.SMALLINT(3), max: 31, min: 1 },
            testCase: { type: Sequelize.SMALLINT(1).ZEROFILL, max: 1, min: 0 },
            status: { type: Sequelize.ENUM, values: ["pending", "running"] }
        }, {
            'freezeTableName': true
        });

        /**
         * 项目抄送人员表
         */
        this.tableModals.ProductCopyto = this.sequelize.define('productcopyto', {
            product: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            copyTo: {
                type: Sequelize.STRING(255),
                allowNull: false,
            }
        }, {
            'freezeTableName': true
        });

        /**
         * 项目邮件发送人员表
         */
        this.tableModals.ProductMember = this.sequelize.define('productmember', {
            product: { type: Sequelize.STRING(255), allowNull: false },
            product: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            member: {
                type: Sequelize.STRING(255),
                allowNull: false
            }
        }, {
            'freezeTableName': true
        });

        this.tableModals.Product.hasMany(this.tableModals.ProductCopyto, {
            foreignKey: "product"
        });
        this.tableModals.Product.hasMany(this.tableModals.ProductMember, {
            foreignKey: "product"
        })

        // //同步实例与DB
        Promise
            .all([
                this.tableModals.User.sync(),
                this.tableModals.Product.sync(),

            ])
            .then(() => {
                return Promise
                    .all([this.tableModals.ProductCopyto.sync(),
                        this.tableModals.ProductMember.sync()
                    ]);
            })
            .then(() => {
                this.initTableData();
            })
            .catch(el => {
                console.info("初始化数据库结构时出现错误");
                console.log(err);
            });
    }

    //初始化数据库数据
    //主要是成员的数据
    initTableData() {
        this.tableModals.User.bulkCreate([
            { name: "Admin", mail: "", authority: 0 },
            { name: "彭娟莉", mail: "pengjuanli", authority: 9 },
            { name: "周安", mail: "zhouan", authority: 9 },
            { name: "谢昌", mail: "xiechang", authority: 9 },
            { name: "邹梦丽", mail: "zoumengli", authority: 9 },
            { name: "闫欢", mail: "yanhuan", authority: 9 },
            { name: "杨春梅", mail: "yangchunmei", authority: 9 },
            { name: "朱义", mail: "zhuyi", authority: 9 }
        ]);
    }
}

module.exports = new DataBaseModal();