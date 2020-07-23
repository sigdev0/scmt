/* Details Item Attribute */
GET('item-attribute/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:items_attribut,id']
        };

    validate(data, rules, () => {
        var itemAttribute = ItemAttribute.find(data.id);

        if (itemAttribute) {
            res(itemAttribute);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* List Item Attributes */
GET('item-attributes', () => {
    var result = ItemAttribute.instance();
        result.select(
            "id",
            "description",
            "value",
            "items_id",
            "created_at",
            "updated_at"
        );

    var limit   = req("limit"),
        offset  = req("offset"),
        keyword = req("keyword");
            
    if (!empty(limit))      result.limit(limit);
    if (!empty(offset))     result.offset(offset);
    if (!empty(keyword))    result.whereLike("value", keyword);

    res(result.get());
});

/* Insert Item Attribute */
POST('item-attribute/insert', () => {
    var data    = req("description", "value", "items_id"),
        rules   = {
            description     : ['required'],
            value           : ['required'],
            items_id        : ['required']

        };

    validate(data, rules, () => {
		data.id 		= ItemAttribute.max('id') + 1;
        data.created_at = now(true);
        data.updated_at = now(true);

        var itemAttribute = ItemAttribute.insert(data);
        if (itemAttribute) {
            res(itemAttribute);
        } else {
            res('Internal server error', 500)
        }
    })
});

PUT('item-attribute/update', () => {
    var data    = req("id", "description", "value", "items_id"),
        rules   = {
            id              : ['required', 'exists:items_attribut,id'],
            description     : ['required'],
            value           : ['required'],
            items_id        : ['required']
        };

    validate(data, rules, () => {
        var itemAttribute               = ItemAttribute.find(data.id);
            itemAttribute.description   = data.description;
            itemAttribute.value         = data.value;
            itemAttribute.updated_at    = now(true);

        var success = itemAttribute.update();
        if (success) {
            res("Item Attribute successfully updated");
        } else {
            res('Internal server error', 500)
        }
    })
});

DELETE('item-attribute/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:items_attribut,id']
        };

    validate(data, rules, () => {
        var success = ItemAttribute.delete({ 'id': data.id });

        if (success) {
            res("Item Attribute successfully deleted");
        } else {
            res('Cannot delete Item Attribute as it is being used by another records', 500);
        }
    })
});
