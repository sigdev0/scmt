GET('purchase-order-datatable', () => {
    var instance 		= PurchaseOrder.instance(),
        columnToSelect 	= [ 'purchase_orders.id', 'purchase_orders.number', 'purchase_orders.reference', 'purchase_mode', 'purchase_orders.status', 'currency', 'term_of_payment', 'purchase_mode',
							'processed_date', 'approved_date', 'cancelled_date', 'purchase_orders.created_at', 'purchase_orders.updated_at', 
							'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 
							'creators.username as created_by', 'updaters.username as updated_by', 'business_unit_id', 'locations.location_code as business_unit_code', 'locations.description as business_unit_description', 'purchase_contract_id', 'purchase_contracts.number as purchase_contract_number', 'purchase_contracts.reference as purchase_contract_reference', 'purchase_contracts.supplier_id', 'suppliers.supplier_description'],
        columnToSearch 	= ['purchase_orders.number', 'purchase_orders.reference'];

	instance.leftJoin('users as processors' , 'processors.id'   		, 'purchase_orders.processed_by')
			.leftJoin('users as approvers'  , 'approvers.id'    		, 'purchase_orders.approved_by')
			.leftJoin('users as cancellers' , 'cancellers.id'   		, 'purchase_orders.cancelled_by')
			.leftJoin('users as creators'   , 'creators.id'     		, 'purchase_orders.created_by')
			.leftJoin('users as updaters'   , 'updaters.id'     		, 'purchase_orders.updated_by')
			.leftJoin('locations'			, 'locations.id' 			, 'business_unit_id')
			.leftJoin('purchase_contracts'	, 'purchase_contracts.id'	, 'purchase_contract_id')
			.leftJoin('suppliers'			, 'suppliers.id' 			, 'purchase_contracts.supplier_id')

    res(instance.datatable(columnToSelect, columnToSearch));
});
