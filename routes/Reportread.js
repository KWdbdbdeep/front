var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

router.get('/:Q_Board_Id', readData);
router.get('/:Q_Board_Id/comments', (req, res) => {
    var Q_Board_Id = req.params.Q_Board_Id;


    pool.query('SELECT * FROM ReportBoard WHERE Q_Board_Id = ?', Q_Board_Id, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving ReportBoard');
        }

        var row = rows[0]; // 조회된 글 정보

        // Comments 테이블에서 댓글 조회
        pool.query('SELECT * FROM ReportComment WHERE Q_Board_Id = ?', Q_Board_Id, (err, comments) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error retrieving comments');
            }

            console.log('댓글 조회 결과:', comments);

            // 조회된 글 정보와 댓글 목록을 전달
            res.render('Reportread', { title: "글 조회", row: row, comments: comments || [] });
        });
    });
});

router.post('/:Q_Board_Id/comments', (req, res) => {
    var Q_Board_Id = req.params.Q_Board_Id;
    var user_id = req.session.userId;
    var comment_text = req.body.comment_text;

    if (!user_id) {
        console.error('Invalid or missing user ID');
        return res.redirect('/login');
    }

    pool.query('INSERT INTO ReportComment (Q_Board_Id, id, comment_text) VALUES (?, ?, ?)', [Q_Board_Id, user_id, comment_text], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding comment');
        }

        // 댓글 저장 후 댓글 목록 다시 조회
        res.redirect(`/Reportread/${Q_Board_Id}`);
    });
});

function readData(req, res, next) {
    var Q_Board_Id = req.params.Q_Board_Id;
    increaseViews(Q_Board_Id, () => {
        // 게시물 조회 로직
        getData(Q_Board_Id, (row) => {
            console.log('1개 글 조회 결과 확인:', row);

            // 댓글 목록 조회
            pool.query('SELECT * FROM ReportComment WHERE Q_Board_Id = ?', Q_Board_Id, (err, comments) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error retrieving comments');
                }

                res.render('Reportread', { title: "글 조회", row: row[0], comments: comments || [], user_id: req.session.userId });
            });
        });
    });
}

function getData(Q_Board_Id, callback) {
    pool.query('SELECT Q_Board_Id, Q_Title, id, Q_views, Q_MainText, Q_Image FROM ReportBoard WHERE Q_Board_Id = ?', Q_Board_Id, (err, rows, fields) => {
        if (err) {
            console.error(err);
            return callback([]);
        }
        callback(rows);
    });
}

function increaseViews(Q_Board_Id, callback) {
    pool.query('UPDATE ReportBoard SET Q_views = Q_views + 1 WHERE Q_Board_Id = ?', Q_Board_Id, (err, result) => {
        if (err) {
            console.error(err);
            return callback(err);
        }
        callback();
    });
}


module.exports = router;
