GET('purchase-contract/by-supplier/:supplier_id' , () => {
    var result = PurchaseContract 	.select('purchase_contracts.id', 'number', 'description')
									.leftJoin('suppliers', 'suppliers.id', 'supplier_id');

	var limit   = req('limit'),
		offset  = req('offset'),
		keyword = req('keyword');

	if(!empty(limit))  	result.limit(limit);
	if(!empty(offset))  result.offset(offset);
	if(!empty(keyword)) result.whereLike('purchase_contracts.number', keyword);

	result.where('supplier_id', param('supplier_id'))

	res(result.get());
});
