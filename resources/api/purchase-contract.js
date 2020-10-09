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
											'creators.username as created_by', 'updaters.username as updated_by', 'supplier_id' , 'supplier_description')
									.leftJoin('users as creators', 'creators.id', 'purchase_contracts.created_by')
									.leftJoin('users as updaters', 'updaters.id', 'purchase_contracts.updated_by')
									.leftJoin('suppliers', 'suppliers.id', 'supplier_id')
									.where('purchase_contracts.id', data.id)
									.first();

		if(purchaseContract){
			var pcDetail = PCD 	.select('purchase_contract_details.id', 'quantity', 'price', 'guarantee_period', 'guarantee_duration', 'purchase_contract_details.created_at', 'product_id', 'product_code', 'products.description as product_description' ,'brand')
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
GET('purchase-contract' 			, () => {
    var result = PC .select('purchase_contracts.id', 'number', 'reference', 'description', 'contract_type', 'status', 'effective_date', 'expired_date', 'contract_date', 'contract_date', 'purchase_contracts.created_at', 'purchase_contracts.updated_at',
						'creators.username as created_by', 'updaters.username as updated_by', 'supplier_id', 'supplier_description')
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
		var details = PCD 	.select('quantity', 'price', 'guarantee_period', 'guarantee_duration', 'purchase_contract_details.created_at', 'product_id', 'product_code', 'products.description as product_description', 'brand')
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

/* PC List Datatable */
GET('purchase-contract-datatable', () => {
    var instance 		= PC.instance(),
        columnToSelect 	= ['purchase_contracts.id', 'number', 'reference', 'description', 'contract_type', 'status', 'effective_date', 'expired_date', 'contract_date', 'contract_date', 'purchase_contracts.created_at', 'purchase_contracts.updated_at', 'creators.username as created_by', 'updaters.username as updated_by', 'supplier_id', 'supplier_description'],
        columnToSearch 	= ['purchase_contracts.number', 'purchase_contracts.reference'];

    instance.leftJoin('users as creators', 'creators.id', 'purchase_contracts.created_by')
			.leftJoin('users as updaters', 'updaters.id', 'purchase_contracts.updated_by')
			.leftJoin('suppliers', 'suppliers.id', 'supplier_id');

    res(instance.datatable(columnToSelect, columnToSearch));
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
DELETE('purchase-contract/delete/:id'  	, () => {
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

/*
 *
 * Details
 *
 */

/* PC Details Datatable */
GET('purchase-contract-details-datatable/:id', () => {
    var data = param(),
        rule = {
            id : ['required', 'exists:purchase_contracts']
        };
    
    validate(data, rule, () => {
        var columnToSelect  = ['purchase_contract_details.id', 'quantity', 'price', 'guarantee_period', 'guarantee_duration', 'purchase_contract_details.created_at', 'product_id', 'product_code', 'products.description as product_description' ,'brand']
            columnToSearch  = ['product_code', 'brand'],
            keyword         = req('search').value,
            length          = req('length'),
            start           = req('start'),
            orderBy         = i(req('order')[0].column),
            orderType       = req('order')[0].dir;
            // keyword         = '',
            // length          = 10,
            // start           = 0,
            // orderBy         = '-',
            // orderType       = '-';

        var whereQuery  = '',
            orderQuery  = '',
            limitQuery  = `LIMIT ${length} OFFSET ${start}`;

        foreach(columnToSearch, (index, each) => {
            whereQuery += (i(index) === 0 ? '' : ' OR ') + `${each} LIKE '%${keyword}%'`;
        });

        if(orderBy !== '-' && orderType !== '-'){
            orderQuery = `ORDER BY ${columnToSelect[orderBy]} ${orderType}`;
        }

        var recordsTotal    = PCD.instance().count(),
        
            recordsFiltered = query(`SELECT COUNT(*) AS total
                                     FROM dev.purchase_contract_details
                                     JOIN dev.products  ON products.id  = product_id
                                     WHERE purchase_contract_id = '${data.id}'`).first().total,

            rawResult       = query(`SELECT ${columnToSelect.join(', ')}
                                     FROM dev.purchase_contract_details
                                     JOIN dev.products  ON products.id  = product_id
                                     WHERE purchase_contract_id = '${data.id}' AND (${whereQuery})
                                     ${orderQuery}
                                     ${limitQuery}`).get();

        var result = [];
        foreach(rawResult, (index, row) => {
            row.index = (i(length)) * i(start) + (i(index) + 1);
			result.push(row);
        });
        
        res({
            draw 			: req('draw'),
			recordsTotal 	: recordsTotal,
			recordsFiltered : recordsFiltered,
			data 			: result
        });
    });
});

/* PC Details Update */
PUT('purchase-contract-details/update/:id', () => {
    var data = param(),
        rule = {
            id : ['required', 'exists:purchase_contract_details']
        };
    
    validate(data, rule, () => {
        var data = {
            quantity                : req('quantity'),
			price                   : req('price'),
			guarantee_period        : req('guarantee_period'),
			guarantee_duration      : req('guarantee_duration'),
			product_id              : req('product_id'),
			updated_at              : now(true),
        };

        var details = PCD.update(data, {id : data.id});
        if(details){
            res(details) 
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* PC Details Delete */
DELETE('purchase-contract-details/delete/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:purchase_contract_details']
        };

    validate(data, rule, () => {
        if (PCD.delete({ id: data.id })) {
            res(`Purchase Contract Details with ID '${data.id}' successfully deleted`);
        } else {
            res('Internal server error occured', 500);
        }
    });
});
