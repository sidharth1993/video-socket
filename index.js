const app = require('express')();
const http = require('http').createServer(app);
const Websocket = require('websocket').server;

let rooms = {};

const port = process.env.PORT || 4000;

app.get('/',(req,res)=>{
    res.send("Connected");
});

http.listen(port,()=>{
    console.log(`Tuned into ${port}`);
    console.log("Room   |User   |Total in room");
    console.log("----   |----   |----- -- ----");
});

const io = new Websocket({
    httpServer : http,
    
});

const originValidation = (origin)=>{
    if(origin.indexOf('localhost') < 0){
        return false
    }
    return true;
}

const validateRequest = (request)=>{
    if(!request.resourceURL.query || (request.resourceURL.query && !request.resourceURL.query.mid)){
        return false;
    }
    return true;
}
//rooms = {123,456,789};
let connection = {};
io.on("request",(request)=>{
    if(originValidation(request.origin) && validateRequest(request)){
        let resources = request.resourceURL;
        const mId = resources.query.mid;
        const user = resources.query.user;
        if(connection[mId]){
            connection[mId][user] = request.accept();
        }else{
            connection[mId] = {};
            connection[mId][user] = request.accept();
        }
        
        console.log(`${mId}|${user}(O)|${Object.keys(connection[mId]).length}`);
        connection[mId][user].on("message",(message)=>{
            for(let usr in connection[mId]){
                connection[mId][usr].send(JSON.stringify({msg:message.utf8Data,usr:Object.keys(connection[mId]).length}));
            }
        });
        connection[mId][user].on("close",(a)=>{
            delete connection[mId][user];
            console.log(`${mId}|${user}(C)|${Object.keys(connection[mId]).length}`);
        })
    }else{
        request.reject();
    }

});




