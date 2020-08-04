class GoodReceiveDetail extends LazyDB {
	_attr = () => {
		return {
			table 			: 'good_delivery_details',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new GoodReceiveDetail()._init();
