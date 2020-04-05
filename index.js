const app = require('express')();
const http = require('http').createServer(app);
const Websocket = require('websocket').server;

let rooms = {};

const port = process.env.PORT || 4000;

app.get('/',(req,res)=>{
    res.send("Connected");
});

http.listen(port,()=>{
    console.log(`Tuned into ${port}`)
});

const io = new Websocket({
    httpServer : http,
    
});

const originValidation = (origin)=>{
    console.log(`Validating ${origin}`);
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
        
        console.log(`Connection request Accepted for room ${mId} and user ${user}`);
        connection[mId][user].on("message",(message)=>{
            for(let usr in connection[mId]){
                console.log(`Streaming to ${usr} in room ${mId}`);
                connection[mId][usr].send({msg:message.utf8Data,users:Object.keys(connection[mId].length)});
            }
        });
        connection[mId][user].on("close",(a)=>{
            console.log(`Connection closed with ${user} in room ${mId} --> ${a}`);
        })
    }else{
        request.reject();
    }

});




