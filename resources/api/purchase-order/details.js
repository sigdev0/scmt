GET('purchase-order/:id' 		, () => {
	var data = param(),
		rule = {
			id    : ['required' , 'exists:purchase_orders'],
		};

	validate(data, rule, () => {
		var result = PurchaseOrder.instance();
  
		result 	.select('purchase_orders.id', 'purchase_orders.number', 'purchase_orders.reference', 'purchase_mode', 'purchase_orders.status', 'currency', 'term_of_payment', 'purchase_mode',
					'processed_date', 'approved_date', 'cancelled_date', 'purchase_orders.created_at', 'purchase_orders.updated_at', 
					'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 
					'creators.username as created_by', 'updaters.username as updated_by', 'business_unit_id', 'locations.location_code as business_unit_code', 'locations.description as business_unit_description', 'purchase_contract_id', 'purchase_contracts.number as purchase_contract_number', 'purchase_contracts.supplier_id', 'suppliers.supplier_description')
				.leftJoin('users as processors' , 'processors.id'   		, 'purchase_orders.processed_by')
				.leftJoin('users as approvers'  , 'approvers.id'    		, 'purchase_orders.approved_by')
				.leftJoin('users as cancellers' , 'cancellers.id'   		, 'purchase_orders.cancelled_by')
				.leftJoin('users as creators'   , 'creators.id'     		, 'purchase_orders.created_by')
				.leftJoin('users as updaters'   , 'updaters.id'     		, 'purchase_orders.updated_by')
				.leftJoin('locations'			, 'locations.id' 			, 'business_unit_id')
				.leftJoin('purchase_contracts'	, 'purchase_contracts.id'	, 'purchase_contract_id')
				.leftJoin('suppliers'			, 'suppliers.id' 			, 'purchase_contracts.supplier_id')
				.where('purchase_orders.id' , data.id);
		  
		var 	po 			= result.first(),
				poDetails 	= PurchaseOrderDetail.instance();
				  
		poDetails 	.select('purchase_order_details.id', 'purchase_order_details.quantity as purchase_order_quantity', 'purchase_order_details.quantity_outstanding', 'purchase_order_details.created_at', 'purchase_order_details.updated_at', 
							'brand', 'products.id as product_id', 'products.product_code as product_code', 'products.description as product_description', 
							'warehouses.id as warehouse_id', 'warehouses.location_code as warehouse_code', 'warehouses.description as warehouse_description', 
							'business_units.id as business_id', 'business_units.location_code as business_unit', 
							'purchase_requisitions.id as purchase_requisitions_id', 'purchase_requisitions.number as purchase_requisition_number', 'purchase_requisitions.remarks as purchase_requisition_remarks',
							'purchase_contract_details.price as price')
							
					.leftJoin('purchase_requisitions' 		, 'purchase_requisitions.id' 							, 'purchase_order_details.purchase_requisition_id')
					.leftJoin('purchase_requisition_details', 'purchase_order_details.purchase_requisition_id' 		, 'purchase_requisition_details.id')
					.leftJoin('purchase_contract_details' 	, 'purchase_order_details.purchase_contract_detail_id' 	, 'purchase_contract_details.id')
					.leftJoin('products' 					, 'products.id' 										, 'purchase_order_details.product_id')
					.leftJoin('locations as business_units' , 'business_units.id' 									, 'purchase_requisitions.business_unit_id')
					.leftJoin('locations as warehouses' 	, 'warehouses.id' 										, 'purchase_requisition_details.location_id')
					.leftJoin('purchase_orders' 			, 'purchase_orders.id' 									, 'purchase_order_details.purchase_order_id')

					.where("purchase_orders.id", po.id);
		  
			po.details = poDetails.get();

		res(po);
	});
});
