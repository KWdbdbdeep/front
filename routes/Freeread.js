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

router.get('/:F_Board_Id', readData);
router.get('/:F_Board_Id/comments', (req, res) => {
    var F_Board_Id = req.params.F_Board_Id;

    // FreeBoard 테이블에서 글 조회
    pool.query('SELECT * FROM FreeBoard WHERE F_Board_Id = ?', F_Board_Id, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving FreeBoard');
        }

        var row = rows[0]; // 조회된 글 정보

        // Comments 테이블에서 댓글 조회
        pool.query('SELECT * FROM Comment WHERE F_Board_Id = ?', F_Board_Id, (err, comments) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error retrieving comments');
            }

            console.log('댓글 조회 결과:', comments);

            // 조회된 글 정보와 댓글 목록을 전달
            res.render('Freeread', { title: "글 조회", row: row, comments: comments || [] });
        });
    });
});

router.post('/:F_Board_Id/comments', (req, res) => {
    var F_Board_Id = req.params.F_Board_Id;
    var user_id = req.session.userId;
    var comment_text = req.body.comment_text;

    if (!user_id) {
        console.error('Invalid or missing user ID');
        return res.redirect('/login');
    }

    pool.query('INSERT INTO Comment (F_Board_Id, id, comment_text) VALUES (?, ?, ?)', [F_Board_Id, user_id, comment_text], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding comment');
        }

        // 댓글 저장 후 댓글 목록 다시 조회
        res.redirect(`/Freeread/${F_Board_Id}`);
    });
});

function readData(req, res, next) {
    var F_Board_Id = req.params.F_Board_Id;
    increaseViews(F_Board_Id, () => {
        // 게시물 조회 로직
        getData(F_Board_Id, (row) => {
            console.log('1개 글 조회 결과 확인:', row);

            // 댓글 목록 조회
            pool.query('SELECT * FROM Comment WHERE F_Board_Id = ?', F_Board_Id, (err, comments) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error retrieving comments');
                }

                res.render('Freeread', { title: "글 조회", row: row[0], comments: comments || [], user_id: req.session.userId });
            });
        });
    });
}

function getData(F_Board_Id, callback) {
    pool.query('SELECT F_Board_Id, F_Title, id, F_views, F_MainText, F_Image FROM FreeBoard WHERE F_Board_Id = ?', F_Board_Id, (err, rows, fields) => {
        if (err) {
            console.error(err);
            return callback([]);
        }
        callback(rows);
    });
}

function increaseViews(F_Board_Id, callback) {
    pool.query('UPDATE FreeBoard SET F_views = F_views + 1 WHERE F_Board_Id = ?', F_Board_Id, (err, result) => {
        if (err) {
            console.error(err);
            return callback(err);
        }
        callback();
    });
}


module.exports = router;
