class PurchaseContractDetail extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_contract_details',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseContractDetail()._init();
