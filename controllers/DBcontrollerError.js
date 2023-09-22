const pg = require("pg");
const configuration = require("../Configuration");
const utils = require("../utils/Utils");

/* Api verison of InsertUserToDB in database*/
exports.insertErrorToDb = async function (err, req) {
  let userId = req.body.userId;
  let ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  ip = ip.split(",")[0];
  ip = ip.split(":").slice(-1); //in case the ip returned in a format: "::ffff:146.xxx.xxx.xxx"

  let accountId = req.body.accountId;
  let accountConfiguration = configuration;

  if (accountId) {
    accountConfiguration = await utils.getConfiguration(
      accountId,
      configuration
    );
  }

  var pool = new pg.Pool({
    host: accountConfiguration.getHost(),
    user: accountConfiguration.getUserId(),
    password: accountConfiguration.getPassword(),
    database: accountConfiguration.getDatabase(),
    port: accountConfiguration.getPort(),
    ssl: { rejectUnauthorized: false },
  });

  var sql = "insert into Error_log(description,source_ip) values($1,$2)";

  await pool.query(sql, [err.toString(), ip]);

  pool.end(() => {});
};
