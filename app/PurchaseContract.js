class PurchaseContract extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_contracts',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseContract()._init();
