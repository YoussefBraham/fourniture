const Pool = require("pg").Pool;

const pool = new Pool({
    user: 'postgres',
    password: 'e-eBea6Af*d2BF3-6f5*-aF4Gg4bGBg*',
    host: 'monorail.proxy.rlwy.net',
    port : 57893,
    database: 'railway'
});


module.exports = pool;

