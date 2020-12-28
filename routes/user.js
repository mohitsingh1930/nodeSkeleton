const router = require('express').Router()


router.get('/', (req, res) => {

	mysqlConnect.query(`select * from practice.test`).then((rows) => {
		res.json(rows);
	});

})


module.exports = router;