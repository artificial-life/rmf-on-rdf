'use_strict'

function discover(name) {
	try {
		return require(`./${name}`);
	} catch(e) {
		return false;
	}
}

module.exports = discover;