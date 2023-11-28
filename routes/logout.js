var express = require('express');
var router = express.Router();

// 로그아웃 처리 라우트
router.post('/', function (req, res) {
  // 세션을 파기하여 로그아웃합니다.
  req.session.destroy((err) => {
    if (err) {
      console.error("로그아웃 오류:", err);
      res.status(500).json({ message: "로그아웃 실패" });
    } else {
      res.status(200).json({ message: "로그아웃 성공" });
    }
  });
});

module.exports = router;
