const 	PC 	= PurchaseContract,
		PCD = PurchaseContractDetail,
		PO 	= PurchaseOrder;

/* PC Details */
GET('purchase-contract/:id' 		, () => {
	var data = param(),
		rule = {
			id : ['required' , 'exists:purchase_contracts']
		}

    validate(data, rule, () => {
		var purchaseContract = PC 	.select('purchase_contracts.id', 'number', 'reference', 'description', 'contract_type', 'status', 'effective_date', 'expired_date', 'contract_date', 'contract_date', 'purchase_contracts.created_at', 'purchase_contracts.updated_at',
											'creators.username as created_by', 'updaters.username as updated_by', 'supplier_description')
									.leftJoin('users as creators', 'creators.id', 'purchase_contracts.created_by')
									.leftJoin('users as updaters', 'updaters.id', 'purchase_contracts.updated_by')
									.leftJoin('suppliers', 'suppliers.id', 'supplier_id')
									.where('purchase_contracts.id', data.id)
									.first();

		if(purchaseContract){
			var pcDetail = PCD 	.select('purchase_contract_details.id', 'quantity', 'price', 'guarantee_period', 'guarantee_duration', 'purchase_contract_details.created_at', 'product_code', 'brand')
								.leftJoin('products', 'products.id', 'product_id')
								.where('purchase_contract_id', purchaseContract.id)
								.get();

			purchaseContract.details = pcDetail || [];
			
			res(purchaseContract);
		} else {
			res("Internal server error occured", 500);
		}
	});
});

/* PC List */
GET('purchase-contracts' 			, () => {
    var result = PC .select('purchase_contracts.id', 'number', 'reference', 'description', 'contract_type', 'status', 'effective_date', 'expired_date', 'contract_date', 'contract_date', 'purchase_contracts.created_at', 'purchase_contracts.updated_at',
						'creators.username as created_by', 'updaters.username as updated_by', 'supplier_description')
				.leftJoin('users as creators', 'creators.id', 'purchase_contracts.created_by')
				.leftJoin('users as updaters', 'updaters.id', 'purchase_contracts.updated_by')
				.leftJoin('suppliers', 'suppliers.id', 'supplier_id');

	var limit   = req('limit'),
		offset  = req('offset'),
		keyword = req('keyword');

	if(!empty(limit))  	result.limit(limit);
	if(!empty(offset))  result.offset(offset);
	if(!empty(keyword)) result.whereLike('purchase_contracts.number', keyword).orWhereLike('purchase_contracts.reference', keyword);

    // if(result.get()){
		var purchaseContracts = [];
        foreach(result.get(), (indexPC, eachPC) => {
            var details = PCD 	.select('quantity', 'price', 'guarantee_period', 'guarantee_duration', 'purchase_contract_details.created_at', 'product_code', 'brand')
								.leftJoin('products', 'products.id', 'product_id')
								.where('purchase_contract_id', eachPC.id)
								.get();

			eachPC.details = details || {};
			
			purchaseContracts.push(eachPC);
        });
        
        res(purchaseContracts);
    // } else {
	// 	res("Internal server error occured", 500);
    // }

});

/* PC Insert */
POST('purchase-contract/insert' 	, () => {
	var data = req('number', 'reference', 'description', 'contract_type', 'status', 'effective_date', 'expired_date', 'contract_date', 'created_by', 'supplier_id'),
		rule = {
			number          : ['required' , 'unique:purchase_contracts'],
			reference       : ['required'],
			contract_type   : ['required' , 'in:normal,special'],
			status          : ['required'],
			effective_date  : ['required'],
			expired_date    : ['required'],
			contract_date   : ['required'],
			created_by      : ['required' , 'exists:users,id'],
			supplier_id     : ['required' , 'exists:suppliers,id']
		};

	// console.log(data);
    validate(data, rule, () => {
		data.id 		= PC.max('id') + 1;
        data.created_at = now(true);
		data.updated_at = now(true);

		var purchase_contract = PC.insert(data);

        if(purchase_contract){
			for(var i = 0; i < count(req('details')); i++) {
                var pcdData = {
					id 						: PCD.max('id') + 1,
					quantity                : req('details')[i]['quantity'],
					price                   : req('details')[i]['price'],
					guarantee_period        : req('details')[i]['guarantee_period'],
					guarantee_duration      : req('details')[i]['guarantee_duration'],
					product_id              : req('details')[i]['product_id'],
					created_at              : now(true),
					purchase_contract_id    : purchase_contract.id,
				};

                PCD.insert(pcdData);
            }

            res(purchase_contract);
        } else {
			res('Internal server error occured', 500);
        }
    });

});

/* PC Update */
PUT('purchase-contract/update' 		, () => {
	var data = req('id', 'number', 'reference', 'description', 'contract_type', 'status', 'effective_date', 'expired_date', 'contract_date', 'updated_by', 'supplier_id'),
		rule = {
			number          : ['required' , 'unique:purchase_contracts,number,id,' + data.id],
			reference       : ['required'],
			contract_type   : ['required' , 'in:normal,special'],
			status          : ['required'],
			effective_date  : ['required'],
			expired_date    : ['required'],
			contract_date   : ['required'],
			updated_by      : ['required'],
			supplier_id     : ['required' , 'exists:suppliers,id']
		}

    validate(data, rule, () => {
		var condition = {id : data.id};

		data.updated_at = now(true);
		delete data.id;

		var pc = PC.update(data, condition);
        if(pc){
            for(var i = 0; i < count(req('details')); i++) {
				var pcdData = {
					quantity                : req('details')[i]['quantity'],
					price                   : req('details')[i]['price'],
					guarantee_period        : req('details')[i]['guarantee_period'],
					guarantee_duration      : req('details')[i]['guarantee_duration'],
					product_id              : req('details')[i]['product_id'],
					updated_at              : now(true),
					purchase_contract_id    : pc.id,
					// updated_by              : req('updated_by');
				}
                PCD.update(pcdData, {id : req('details')[i]['id']})
            }

            res(pc);
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* PC Delete */
DELETE('purchase-contract/:id'  , () => {
	var data = param(),
		rule = {
			id : ['required' , 'exists:purchase_contracts']
		};
	
    validate(data, rule, () => {
		var po = PO.where('purchase_contract_id', data.id).first();
        if(po){
            res(`Purchase Contract with ID '${data.id}' is being used in Purchase Order`);
        } else {
			var pcdDeleted  = PCD.where('purchase_contract_id' , data.id).delete(),
				pcDeleted 	= PC.where('id', data.id).delete();

            if(pcdDeleted && pcDeleted){
                res(`Purchase Contract with ID '${data.id}' successfully deleted`);
            } else {
                res('Internal server error occured', 500)
            }
        }
    });
});
