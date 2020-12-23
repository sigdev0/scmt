GET('purchase-contract/list-order/:id', () => {
    var data = param(),
        rule = {
            id : ['exists:purchase_contract_details,id']
        };
    
    validate(data, rule, () => {
		var result = PurchaseContractQuantityStock		.select('purchase_orders.id as purchase_order_id', 'purchase_orders.number as purchase_order_number', 'purchase_orders.reference as purchase_order_reference', 'purchase_contract_quantity_stocks.quantity_taken as quantity_taken')
														.join('purchase_order_details', 'purchase_contract_quantity_stocks.purchase_order_detail_id', 'purchase_order_details.id')
														.join('purchase_orders', 'purchase_orders.id', 'purchase_order_details.purchase_order_id')
														
														.groupBy('purchase_orders.id', 'purchase_orders.number', 'purchase_orders.reference', 'purchase_contract_quantity_stocks.quantity_taken')
														.where('purchase_contract_quantity_stocks.purchase_contract_detail_id', data.id)
														.whereNotNull('purchase_contract_quantity_stocks.quantity_taken')
														.get()

		res(result);
    });
});
