var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var _ = require("underscore")._;
var connect = require("connect");
var easyrtc = require("easyrtc");
var sharejs = require("share").server;

app.configure(function () {
    app.set("port", process.env.OPENSHIFT_NODEJS_PORT || 5000);
    //app.set("port", process.env.PORT || 3000);
    app.set("ipaddr", process.env.OPENSHIFT_NODEJS_IP || "localhost");
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + "/public"));
    app.use("/components", express.static(__dirname + "/components"));
    app.use("/js", express.static(__dirname + "/js"));
    app.use("/icons", express.static(__dirname + "/icons"));
    app.set("views", __dirname + "/views");
    app.engine("html", require("ejs").renderFile);
    app.set("view engine", "html");
});

var options = {
    db: {
        type: "none"                                                    //Use redis for persistence
    }
};
    /** @type {Array} */
var validRooms = [];
    /** @type {number} */
var id = 0;
app.get("/", function (req, res) {
    /** @type {number} */
    id = Math.round(Math.random() * 1E6);
    validRooms.push(id);
    res.redirect("/meeting/" + id);
});
app.get("/meeting/:id", function (req, res) {
    res.render("meeting");
});
app.get("/errorPage", function (req, res) {
    res.render("error");
});

sharejs.attach(app, options);
easyrtc.listen(app, io);
server.listen(app.get("port"), app.get("ipaddr"), function () {
    console.log("Express server listening on  IP: " + app.get("ipaddr") + " and port " + app.get("port"));
});

//server.listen(app.get("port"), function () {
//    console.log("Express server listening on port: " + app.get("port"));
//});

io.configure('production', function () {
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file
    io.set('transports', [                     // enable all transports (optional if you want flashsocket)
        'websocket'
      , 'flashsocket'
      , 'htmlfile'
      , 'xhr-polling'
      , 'jsonp-polling'
    ]);
});

io.set("log level", 1);
var people = {};
var rooms = {};
    /** @type {Array} */
var sockets = [];
var sizePeople = {};
    /**
     * @param {Object} s
     * @param {string} action
     * @return {undefined}
     */

function purge(s, action) {
    if (action === "disconnect") {
        delete rooms[s.room][s.id];
        delete people[s.id];
        sizePeople = _.size(rooms[s.room]);
        if (sizePeople === 0) {
            var emptyRoomIndex = validRooms.indexOf(s.room);
            validRooms.splice(emptyRoomIndex, 1);
        }
        io.sockets.in(s.room.toString()).emit("update-people", {
            people: rooms[s.room],
            count: sizePeople
        });
        var o = _.findWhere(sockets, {
            "id": s.id
        });
        sockets = _.without(sockets, o);
    }
}

io.sockets.on("connection", function (socket) {

    socket.on("badUserdAction", function () {
        socket.emit("badURL");
    });

    socket.on("checkValidRoom", function (data) {
        var check = validRooms.indexOf(data);
        if (check === -1) {
            socket.emit("badURL");
        }
    });

    socket.on("joinserver", function (userData) {
        socket.room = userData.inRoom;
        socket.join(socket.room);
        people[socket.id] = {
            "name": userData.uId,
            "button": userData.uButton,
            "activeTab": userData.activeTab,
            "roomAlloted": userData.inRoom
        };
        if (typeof rooms[socket.room] === "undefined") {
            rooms[socket.room] = {};
        }
        rooms[socket.room][socket.id] = people[socket.id];
        sizePeople = _.size(rooms[socket.room]);
        io.sockets.in(socket.room.toString()).emit("update-people", {
            people: rooms[socket.room],
            count: sizePeople
        });
        sockets.push(socket);
    });

    socket.on("activeTab", function (data) {
        /** @type {string} */
        people[socket.id].activeTab = data;
        rooms[socket.room][socket.id].activeTab = data;
    });

    socket.on("disconnect", function () {
        if (typeof people[socket.id] !== "undefined") {
            purge(socket, "disconnect");
        }
    });

    socket.on("textTab", function () {
        var uName = people[socket.id].button;
        io.sockets.in(socket.room.toString()).emit("update-textTab", uName);
    });

    socket.on("drawTab", function () {
        var uName = people[socket.id].button;
        io.sockets.in(socket.room.toString()).emit("update-drawTab", uName);
    });

    socket.on("videoTab", function () {
        var uName = people[socket.id].button;
        io.sockets.in(socket.room.toString()).emit("update-videoTab", uName);
    });

    socket.on("mousemove", function (data) {
        socket.broadcast.to(socket.room).emit("moving", data);
    });

    socket.on("videoConnect", function (data) {
        if (data.id !== null) {
            people[socket.id].callId = data.id;
            rooms[socket.room][socket.id].callId = data.id;
        }
    });

    socket.on("calling", function (data) {
        /** @type {string} */
        var socketId = "";
        var key;
        for (key in rooms[data.roomID]) {
            if (rooms[data.roomID][key].callId === data.calleeId) {
                /** @type {string} */
                socketId = key;
                break;
            }
        }
        io.sockets.socket(socketId).emit("called", data);
    });

    socket.on("status", function (data) {
        /** @type {string} */
        var callerSocketId = "";
        /** @type {string} */
        var calleeSocketId = "";
        var key;
        for (key in rooms[data.roomID]) {
            if (rooms[data.roomID][key].callId === data.callerId) {
                /** @type {string} */
                callerSocketId = key;
                break;
            }
        }
        for (key in rooms[data.roomID]) {
            if (rooms[data.roomID][key].callId === data.calleeId) {
                /** @type {string} */
                calleeSocketId = key;
                break;
            }
        }
        io.sockets.socket(calleeSocketId).emit("incoming", data);
        io.sockets.socket(callerSocketId).emit("isConnected", {
            callerId: data.callerId,
            calleeId: data.calleeId,
            //state: "connected"
        });
        //if (data.status === "free") {
        //    //io.sockets.socket(calleeSocketId).emit("incoming", data);
        //    //io.sockets.socket(callerSocketId).emit("isConnected", {
        //    //    callerId: data.callerId,
        //    //    calleeId: data.calleeId,
        //    //    state: "connected"
        //    //});
        //} else {
        //    io.sockets.socket(callerSocketId).emit("isConnected", {
        //        callerId: data.callerId,
        //        calleeId: data.calleeId,
        //        state: "notConnected"
        //    });
        //    io.sockets.socket(calleeSocketId).emit("notifyConn", people[callerSocketId].name + " " + "wants to connect with you...");
        //    io.sockets.socket(callerSocketId).emit("notifyConn", "Person is busy in another call!");
        //}
    });

    socket.on("disconnected", function (data) {
        /** @type {string} */
        var callerSocketId = "";
        var key;
        for (key in rooms[data.roomID]) {
            if (rooms[data.roomID][key].callId === data.rCallerId) {
                /** @type {string} */
                callerSocketId = key;
                break;
            }
        }
        io.sockets.socket(callerSocketId).emit("hangedUp", "nodata");
        io.sockets.socket(callerSocketId).emit("notifyConn", "Remote user hanged up!!");
    });
});
