module.exports = new class LazyData {
	i = (data) => { return parseInt(data); }
	f = (data) => { return parseFloat(data); }
	s = (data) => { return String(data); }
}
