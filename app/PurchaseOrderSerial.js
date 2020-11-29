class PurchaseOrderSerial extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_order_serials',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseOrderSerial()._init();