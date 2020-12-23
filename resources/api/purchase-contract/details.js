GET('purchase-contract/:id' 		, () => {
	var data = param(),
		rule = {
			id : ['required' , 'exists:purchase_contracts']
		}

    validate(data, rule, () => {
		var purchaseContract = PurchaseContract 	.select('purchase_contracts.id', 'number', 'reference', 'mttr', 'description', 'contract_type', 'status', 'effective_date', 'expired_date', 'contract_date', 'contract_date', 'purchase_contracts.created_at', 'purchase_contracts.updated_at',
															'creators.username as created_by', 'updaters.username as updated_by', 'supplier_id' , 'supplier_description')
													.leftJoin('users as creators', 'creators.id', 'purchase_contracts.created_by')
													.leftJoin('users as updaters', 'updaters.id', 'purchase_contracts.updated_by')
													.leftJoin('suppliers', 'suppliers.id', 'supplier_id')
													.where('purchase_contracts.id', data.id)
													.first();

		if(purchaseContract){
			var result 	= PurchaseContractDetail 	.select('purchase_contract_details.id', 'quantity', 'price', 'mttr', 'guarantee_period', 'guarantee_duration', 'purchase_contract_details.created_at', 'product_id', 'product_code', 'products.description as product_description' ,'brand')
													.leftJoin('products', 'products.id', 'product_id')
													.where('purchase_contract_id', purchaseContract.id)
													.get();

			purchaseContract.details = [];
			foreach(result, (index, each) => {
				each.quantity_taken 	= PurchaseContractQuantityStock.where('purchase_contract_detail_id', each.id).sum('quantity_taken');
				each.quantity_available = each.quantity - each.quantity_taken;

				purchaseContract.details.push(each);
			});
			
			res(purchaseContract);
		} else {
			res("Internal server error occured", 500);
		}
	});
});
