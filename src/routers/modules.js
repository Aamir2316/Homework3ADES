const database = require('../database/database');
const createHttpError = require('http-errors');

const router = require('express').Router();

router.get('/', function (req, res, next) {
  return database.query(`SELECT * FROM items_list ORDER BY id;`, [], function (error, result) {
    if (error) {
      return next(error);
    }
    const items = [];
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows[i];
      items.push({
        id: item.id,
        name: item.name,
        //moduleCredit: module.module_credit,
        status: item.status,
      });
    }
    return res.json({ items: items });
  });
});

router.post('/', function (req, res, next) {
  const name = req.body.name;
  //const moduleCredit = req.body.moduleCredit;
  return database.query(
    `INSERT INTO items_list (name) VALUES ($1)`,
    [name],
    function (error) {
      //23505 means the item already exists 
      if (error && error.code === '23505') {
        return next(createHttpError(400, `Module ${name} already exists`));
      } else if (error) {
        return next(error);
      }
      return res.sendStatus(201);
    },
  );
});

router.put('/:name', function (req, res, next) {
  const status = req.body.status;
  const name = req.params.name;
  // item: Use Parameterized query instead of string concatenation
  //return database.query(`UPDATE modules_tab SET grade = '${grade}' WHERE module_code = '${moduleCode}'`, [], function (
    return database.query(`UPDATE items_list SET status = $1 WHERE name = $2`, [status, name], function (
    error,
    result,
  ) {
    if (error) {
      return next(error);
    }
    if (result.rowCount === 0) {
      return next(createHttpError(404, `No such name: ${name}`));
    }
    return res.sendStatus(200);
  });
});

router.delete('/:name', function (req, res, next) {
  const name = req.params.name;
  console.log(name);
  // item: Use Parameterized query instead of string concatenation
  //return database.query(`DELETE FROM modules_tab WHERE module_code = '${moduleCode}'`, [], function (error, result) {
    return database.query(`DELETE FROM items_list WHERE name = $1`, [name], function (error, result) {
    if (error) {
      return next(error);
    }
    return res.sendStatus(200);
  });
});

module.exports = router;
