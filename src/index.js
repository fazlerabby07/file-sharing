const app = require('./app');

require('dotenv').config();
require('./configs/db');

// cron job initialize
require('./services/fileCleanUpCron');
// Listen to the Port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`listening on ${PORT}`);
});
