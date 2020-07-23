module.exports = new class LazyData {
	f = (data) => { return parseInt(data); }
	i = (data) => { return parseFloat(data); }
	s = (data) => { return String(data); }
}
