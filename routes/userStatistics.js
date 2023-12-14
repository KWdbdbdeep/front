var express = require('express');
var router = express.Router();
const path = require('path');

router.get('/user-statistics', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, '../public/userStatistics.json'));
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
