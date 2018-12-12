const Sequelize = require("sequelize");
const MYSQL_CONFIG = require("../config/mysql_config");

class DataBaseModal {
    constructor() {
        //储存所有数据表，并通过sequelize来进行实例化
        this.tableModals = {};
        //sequelize实例
        this.sequelize = null;
        //调试用，正常情况下设置为false即可
        this.force = true;
        this.debug = true;
        this.deleteTableExits = this.deleteTableExits.bind(this);
        this.initTableStruct = this.initTableStruct.bind(this);
        this.initTableData = this.initTableData.bind(this);
        this.debugTest = this.debugTest.bind(this);
        //初始化数据库
        this.init();
    }

    init() {
        this.initConnection();
        this.testConnection()
            .then(this.deleteTableExits)
            .then(this.initTableStruct)
            .then(this.initTableData)
            .then(this.debugTest)
            .catch(console.log);
    }

    //初始化连接，连接上数据库
    initConnection() {
        this.sequelize = new Sequelize({
            database: MYSQL_CONFIG.database, //数据库名称
            username: MYSQL_CONFIG.username, //数据库用户名
            password: MYSQL_CONFIG.password, //数据库密码
            host: MYSQL_CONFIG.host, //数据库主机IP
            dialect: "mysql", //数据库类型
            pool: { //连接池配置
                max: 5, //最大连接数
                min: 0, //最小连接数
                acquire: MYSQL_CONFIG.aquireTimeout, //请求超时时间
                idle: 10000 //断开连接后，连接实例在连接池保持的时间
            }
        });
    }

    //测试连接是否正常
    testConnection() {
        console.log(`Start try connect to mysql database`);

        return new Promise((resolve, reject) => {
            this.sequelize
                .authenticate()
                .then(() => {
                    console.log("Connection has been established successfully");
                    resolve();
                })
                .catch(err => {
                    reject();
                    console.error("Unable to connect to the datebase:", err);
                });
        });
    }

    //初始化之前需要先删除已有表格，因为存在外键约束，所以需要先删除子表
    deleteTableExits() {
        return new Promise((resolve, reject) => {
            Promise.all([
                    this.sequelize.queryInterface.dropTable("productcopyto"),
                    this.sequelize.queryInterface.dropTable("productmember")
                ])
                .then(() => {
                    return this.sequelize.queryInterface.dropTable("product")
                })
                .then(() => {
                    return this.sequelize.queryInterface.dropTable("users")
                })
                .then(resolve)
                .catch(reject);
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
            mail: { type: Sequelize.STRING, primaryKey: true, allowNull: false },
            name: { type: Sequelize.STRING, allowNull: false },
            password: { type: Sequelize.STRING() },
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
        this.tableModals.ProductCopyTo = this.sequelize.define('productcopyto', {
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

        this.tableModals.Product.hasMany(this.tableModals.ProductCopyTo, {
            foreignKey: "product",
            as: "copyTo"
        });
        this.tableModals.Product.hasMany(this.tableModals.ProductMember, {
            foreignKey: "product",
            as: "member"
        });
        this.tableModals.ProductCopyTo.belongsTo(this.tableModals.User, {
            foreignKey: "mail"
        });

        return new Promise((resolve, reject) => {
            //同步实例与DB
            Promise.all([
                    this.tableModals.User.sync({ force: this.force }),
                    this.tableModals.Product.sync({ force: this.force })
                ])
                .then(() => {
                    return Promise.all([
                        this.tableModals.ProductCopyTo.sync({ force: this.force }),
                        this.tableModals.ProductMember.sync({ force: this.force })
                    ]);
                })
                .then(resolve)
                .catch(err => {
                    console.info("初始化数据库结构时出现错误");
                    reject(err);
                });
        });
    }

    //初始化数据库数据
    //主要是成员的数据
    initTableData() {
        return new Promise((resolve, reject) => {
            this.tableModals.User
                .bulkCreate([
                    { name: "Admin", mail: "CITest", authority: 0 },
                    { name: "彭娟莉", mail: "pengjuanli", authority: 9 },
                    { name: "周安", mail: "zhouan", authority: 9 },
                    { name: "谢昌", mail: "xiechang", authority: 9 },
                    { name: "邹梦丽", mail: "zoumengli", authority: 9 },
                    { name: "闫欢", mail: "yanhuan", authority: 9 },
                    { name: "杨春梅", mail: "yangchunmei", authority: 9 },
                    { name: "朱义", mail: "zhuyi", authority: 9 }
                ])
                .then(resolve)
                .catch(reject);
        });
    }

    debugTest() {
        if (!this.debug) return;
        this.tableModals.Product
            .bulkCreate([
                { product: "O3V2.0", productLine: "AP", isMultiLang: 0, excelUploaded: 0, langPath: null, src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp", interval: 1, status: "pending" },
                { product: "MR9", productLine: "微企", isMultiLang: 0, excelUploaded: 0, langPath: null, src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/EWRT/src-new/src", interval: 1, status: "pending" },
                { product: "F3V4.0", productLine: "家用", isMultiLang: 0, excelUploaded: 0, langPath: null, src: "http://192.168.100.233:18080/svn/GNEUI/SourceCodes/Trunk/GNEUIv1.0/O3v2_temp", interval: 1, status: "pending" }
            ])
            .then(() => {
                return this.tableModals.ProductCopyTo.bulkCreate([
                    { product: "O3V2.0", copyTo: "pengjuanli" },
                    { product: "O3V2.0", copyTo: "zhuyi" },
                    { product: "MR9", copyTo: "pengjuanli" }
                ]);
            })
            .then(() => {
                return this.tableModals.ProductMember.bulkCreate([
                    { product: "O3V2.0", member: "zhuyi" },
                    { product: "O3V2.0", member: "yangchunmei" },
                    { product: "MR9", member: "xiechang" },
                    { product: "MR9", member: "zoumengli" },
                    { product: "F3V4.0", member: "yanhuan" },
                    { product: "F3V4.0", member: "zhouan" }
                ]);
            })
            .catch(console.log);
    }
}

module.exports = new DataBaseModal();