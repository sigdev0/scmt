class GoodReceive extends LazyDB {
	_attr = () => {
		return {
			table 			: 'good_receives',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new GoodReceive()._init();
