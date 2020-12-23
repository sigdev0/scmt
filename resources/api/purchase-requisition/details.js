GET('purchase-requisition/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:purchase_requisitions']
        };

    validate(data, rule, () => {
        var result 	= PurchaseRequisition 	.select('purchase_requisitions.id', 'number', 'remarks', 'status', 'processed_date', 'approved_date', 'cancelled_date', 'purchase_requisitions.created_at', 'purchase_requisitions.updated_at', 'locations.id as business_unit_id', 'locations.location_code as business_unit_code', 'locations.description as business_unit_description', 'locations.location_code as business_unit', 'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 'creators.username as created_by', 'updaters.username as updated_by')
											.leftJoin('locations', 'locations.id', 'business_unit_id')
											.leftJoin('users as processors', 'processors.id', 'purchase_requisitions.processed_by')
											.leftJoin('users as approvers', 'approvers.id', 'purchase_requisitions.approved_by')
											.leftJoin('users as cancellers', 'cancellers.id', 'purchase_requisitions.cancelled_by')
											.leftJoin('users as creators', 'creators.id', 'purchase_requisitions.created_by')
											.leftJoin('users as updaters', 'updaters.id', 'purchase_requisitions.updated_by')
											.where('purchase_requisitions.id', data.id).first(),
									
			details = PurchaseRequisitionDetail	.select('purchase_requisition_details.id', 'quantity', 'target_date', 'purchase_requisition_details.created_at', 'purchase_requisition_details.updated_at', 'product_id', 'product_code', 'products.description', 'location_id', 'location_code', 'locations.description as location_description')
												.leftJoin('products', 'products.id', 'product_id')
												.leftJoin('locations', 'locations.id', 'location_id')
												.where({ purchase_requisition_id: result.id }).get();
		result.details = [];

		foreach(details, (index, each) => {
			each.quantity_fulfilled = PurchaseRequisitionQuantityStock.where('purchase_requisition_detail_id', each.id).sum('quantity_fulfilled');
			each.quantity_left 		= each.quantity - each.quantity_fulfilled;

			result.details.push(each);
		});

        res(result);
    });
});
