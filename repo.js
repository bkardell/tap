
XDomainMessageServer.receive(function(event, res){
    var promise;
    if (event.data.cmd) {
        res.send(contents);
    } else {
        event.data = (event.data.length) ? event.data : [event.data];
        for (var i=0;i<event.data.length;i++) {
            event.data[i].execute = false;
            event.data[i].url = "libs/" + event.data[i].url;
        }
        basket.require.apply(this, event.data).then(function () {
            res.send.apply(this, arguments);
        });
    }
});