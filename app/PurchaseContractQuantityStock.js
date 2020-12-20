class PurchaseContractQuantityStock extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_contract_quantity_stocks',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseContractQuantityStock()._init();