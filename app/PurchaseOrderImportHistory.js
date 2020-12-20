class PurchaseOrderImportHistory extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_order_import_histories',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseOrderImportHistory()._init();