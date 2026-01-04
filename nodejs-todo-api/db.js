// mysql2モジュールの取り込み
const mysql = require('mysql2/promise');

// DB接続設定
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'nodejs_db_kadai',
};

// DB接続プールの確立
const pool = mysql.createPool(dbConfig);

// DB接続プールの破棄用関数
async function closePool() {
    try{
        await pool.end();
        console.log('データベース接続プールを破棄しました。');
    } catch(error) {
        console.error(`データベース接続プールの破棄中にエラーが発生しました。`);
    }
}

// SQL文の実行関数
async function executeQuery( sql, params = [] ) {
    try {
        const [rows] = await pool.execute(sql, params);
        return [rows];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// 関数のエクスポート
module.exports = {
    closePool,
    executeQuery,
}