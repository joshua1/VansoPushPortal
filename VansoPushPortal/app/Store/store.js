var App=require('app');
App.messageStore=DS.Store.create({
    revision:11,
    adapter:App.adapter
});

App.deviceStore=DS.Store.create({
    revision:11,
    adapter:App.adapter
});

App.adapter=DS.Adapter.create({
    find:function(store,type,id){
        var url=type.url;
        url=url.fmt(id);
        jQuery.getJSON(url,function(data){
           store.load(type,id,data);
        });
    },
    findAll:function(store,type){
        var url=type.url;
        jQuery.getJSON(url,function(data){
            store.loadMany(type,data);
        });

    },
    createRecord:function(store,type,model){
        var url = type.url;
        jQuery.ajax({
            url: url,
            data: model.get('data'),
            dataType: 'json',
            type: 'POST',

            success: function(data) {
                // data is a hash of key/value pairs representing the record.
                // In general, this hash will contain a new id, which the
                // store will now use to index the record. Future calls to
                // store.find(type, id) will find this record.
                store.didCreateRecord(model, data);
            }
        });
    },
    updateRecord:function(store,type,model){
        var url = type.url;

        jQuery.ajax({
            url: url.fmt(model.get('id')),
            data: model.get('data'),
            dataType: 'json',
            type: 'PUT',

            success: function(data) {
                // data is a hash of key/value pairs representing the record
                // in its current state on the server.
                store.didUpdateRecord(model, data);
            }
        });

    },
    deleteRecord:function(store,type,model){
        var url = type.url;

        jQuery.ajax({
            url: url.fmt(model.get('id')),
            dataType: 'json',
            type: 'DELETE',

            success: function() {
                store.didDeleteRecord(model);
            }
        });
    },
    commit: function(store, commitDetails) {
        commitDetails.updated.eachType(function(type, array) {
            this.updateRecords(store, type, array.slice());
        }, this);

        commitDetails.created.eachType(function(type, array) {
            this.createRecords(store, type, array.slice());
        }, this);

        commitDetails.deleted.eachType(function(type, array) {
            this.deleteRecords(store, type, array.slice());
        }, this);
    }
});