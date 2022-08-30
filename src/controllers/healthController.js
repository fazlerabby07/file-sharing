const os = require('os');

const check = (req, res) => {
	let uptime = `${Math.floor(process.uptime())}s`;
	let loadavg = os.loadavg()[2];
	let time = new Date().toTimeString();
	res.json({
		uptime,
		loadavg,
		time,
	});
};

module.exports = {
	check,
};
