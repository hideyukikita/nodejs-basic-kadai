// 必要な変数の定義
const express = require('express');
const app = express();
const PORT = 3000;

// DB共通モジュールのインポート
const { executeQuery, closePool } = require('./db');

// ミドルウェアでJSON形式のリクエストボディを自動的にパース
app.use(express.json());

// サーバーエラーを処理する関数
function handleServerError( res, error, message = `サーバーエラー`) {
    console.error(error);
    res.status(500).json({ error: message });
};

// ToDoの作成
app.post('/todos', async (req, res) => {
    // 登録データの変数化
    const { title, priority } = req.body;
    // statusの固定値
    const status = "未着手"
    // 登録処理
    try {
        const result = await executeQuery(
            'INSERT INTO todos (title, priority, status) VALUES (?, ?, ?);',
            [title, priority, status]
        );
        // 登録成功時
        res.status(201).json({ id: result.insertId, title, priority, status });
    } catch (error) {
        handleServerError(res, error, '登録に失敗しました。');
    }
});

// ToDoの読み取り
app.get('/todos', async (req, res) => {
    // 取得処理
    try{
        const rows = await executeQuery(
            'SELECT * FROM todos;'
        );
        res.status(200).json(rows);
    } catch (error) {
        handleServerError(res, error, '取得に失敗しました。');
    }
});

// ToDoの更新
app.put('/todos/:id', async (req, res) => {
    // 更新データの変数化
    const { title, priority, status } = req.body;
    
    // 更新処理
    try {
        const result =  await executeQuery(
            'UPDATE todos SET title = ?, priority = ?, status = ? WHERE id = ?;',
            [title, priority, status, req.params.id]
        );
        // 1行も更新されていない場合の分岐
        result.affectedRows === 0
            ? res.status(404).json({ error: `更新対象のデータが見つかりません。`})
            : req.status(200).json({ id: req.params.id, title, priority, status });
    } catch (error) {
        handleServerError(res, error, `データの更新に失敗しました。`);
    }
});

// ToDoの削除
app.delete('/todos/:id', async (req, res) => {
    // 削除処理
    try {
        const result = await executeQuery(
            'DELETE FROM todos WHERE id = ?;',
            [req.params.id]
        );
        // 1件も削除されていない場合の分岐
        result.affectedRows === 0
            ? res.status(404).json({ error: `削除対象のデータが見つかりません。`})
            : res.status(200).json({ message: `データの削除が成功しました。`});
    } catch(error) {
        handleServerError(res, error, 'データの削除に失敗しました。');
    }
});

// アプリ少雨領事のDB接続プールの破棄
['SIGINT', 'SIGTERM', 'SIGHUP' ].forEach(signal => {
    process.on(signal, async() => {
        console.log(`\n${signal}を受信。アプリケーションの終了処理中...`);
        await closePool();
        process.exit();
    });
});

// Webサーバーの起動
app.listen(PORT, () => {
    console.log(`${PORT}番ポートでWebサーバーを起動しました。`);
});