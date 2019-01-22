//global debug definition
//仅在调试时开启对应的debug开关，部署时需要全部关闭
global.debug = {
    env: "dev", //  "dev"  || "product"  调试环境或生产环境
    svn: false, //svn调试卡关
    util: false, //工具类调试开关
    product: false, //产品类调试开关
    notifier: true, //Notifier类调试开关，开启时，启动服务器会立即进行CI检查
    oemProduct: true, //oem调试开关，开启时，不会从SVN下拉代码，而是使用本地代码
    shouldLogDB: false,
    isFirstDeploy: false, //是否为第一次部署，第一次部署则会生成数据库结构,并且会清空所有表格！！！
    shouldCreateDBData: false, //数据库调试开关，开启时，每次启动服务器都会创建测试数据覆盖数据库
    shouldLogWhenCheck: false, //开启时，会输出CI检查的信息
    shouldCloseCICheck: false, //开启时，不会进行CI检查
};