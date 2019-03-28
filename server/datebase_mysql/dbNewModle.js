const Sequelize = require("sequelize");
const MYSQL_CONFIG = require("../config/mysql_config");

class DataBasicModel{
    constructor(){
        this.tableModels = {};
        this.sequelize = null;
        this.force = true;
        this.logging = false;
        this.isFirst = true;
        this.shouldCreateData = true;
        this.createTestData = this.createTestData.bind(this);
        this.initTableStruct = this.initTableStruct.bind(this);
        this.deleteTableExits = this.deleteTableExits.bind(this);
    }

    init(){
        return new Promise((reslove,reject) => {
            this.initConnection();
            console.log("初始化数据库中......");
            this.testConnection()
                .then(this.initTableStruct)
                .then(this.createTestData)
                .then(() => {
                    console.log("");
                    console.log("数据库初始化完毕!");
                    resolve();
                })
                .catch(reject);
        });
    }
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
            },
            logging: this.logging
        });
    }
    //测试连接是否正常
    testConnection() {
        console.log(`数据库连接测试中...`);

        return new Promise((resolve, reject) => {
            this.sequelize
                .authenticate()
                .then(() => {
                    console.log("连接建立成功");
                    resolve();
                })
                .catch(err => {
                    reject();
                    throw new Error(`无法连接数据库:${err.message}`);
                });
        });
    }

    
    //初始化之前需要先删除已有表格，因为存在外键约束，所以需要先删除子表
    deleteTableExits() {
        return new Promise((resolve, reject) => {
            if (this.isFirst) {
                this.sequelize.queryInterface.dropTable("procedure")
                    .then(() => {
                        console.log("");
                        console.log("procedure表删除");
                        resolve();
                    })
                    .catch(reject);
            } else {
                resolve();
            }
        });
    }

    initTableStruct() {
          /**
        * checklist 流程表
        * @param{id}  自动生成的 
        * @param{name} 项目名称 可重复
        * @param{remark}  备注  
        * @param{status}  流程运行状态   1. pending 等待审批   3. resubmit 待全部提交（被驳回or 其他多人项目成员未提交checklist）  3.ending 完成  （发送给负责人） 
        */
       this.tableModels.Procedure = this.sequelize.define('procedure', {
           name: {
               type: Sequelize.STRING(255),
               allowNull: false
           },
           response: {
               type: Sequelize.STRING(255),
               allowNull: false
           },
           remarks: {
               type: Sequelize.TEXT,
           },
           teacher:{
               type: Sequelize.STRING(255),
               allowNull: false
           },
           mail: {
               type: Sequelize.STRING(255),
               allowNull: false
           },
           process: {
               type: Sequelize.STRING(255),
               allowNull: false
           },
           status: {
               type: Sequelize.STRING(20),
               allowNull: false
           },
           opinion:{
               type: Sequelize.TEXT,
           },
           submit:{
               type: Sequelize.STRING(255),
           }
       }, {
           freezeTableName: true
       });

       
       return new Promise((resolve,reject) => {
        const force = this.force;
        if (this.isFirst) {

            this.tableModels.Procedure
                .sync({ force: this.force })
                .then(resolve)
                .catch(err => {
                    console.info("初始化数据库结构时出现错误");
                    reject(err);
                });
        } else {
            resolve();
        }
       })
    
    }

    
    createTestData() {
        return new Promise((resolve, reject) => {
            if (this.shouldCreateData) {
                this.tableModels.Procedure.bulkCreate([
                    //
                    { name: "O3V2.0", response: "yangchunmei",teacher: "yangchunmei", mail: "yangchunmei", remarks: "pengjuadfdgfnli", status: "pending" ,process:"1",submit:"杨春梅"},
                    { name: "O3V1.0", response: "yangchunmei,yanhuan",teacher: "yangchunmei", mail: "yangchunmei", remarks: "pengsdfsfjuanli", status: "resubmit",process:"1" ,submit:"杨春梅"},
                 
                ])
                .then(resolve)
                .catch(err=> {
                    console.info("初始化表格数据出错");
                })
            }
        })
    }


}


    let dbModel = new DataBasicModel();

    dbModel.init();
module.exports = dbModel;