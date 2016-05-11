/**
* @param {number} length
* @param {string} chars
* @return {string}
*/
function randomString(length, chars) {
    /** @type {string} */
    var result = "";
    /** @type {number} */
    var i = length;
    for (; i > 0; --i) {
        result += chars[Math.round(Math.random() * (chars.length - 1))];
    }
    return result;
}

$(function () {
        //(function (d, s, id) {
        //    var js, fjs = d.getElementsByTagName(s)[0];
        //    if (d.getElementById(id)) return;
        //    js = d.createElement(s); js.id = id;
        //    js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&appId=352984204854873&version=v2.0";
        //    fjs.parentNode.insertBefore(js, fjs);
    //}(document, 'script', 'facebook-jssdk'));
   
    /**
     * @param {number} fromx
     * @param {number} fromy
     * @param {number} tox
     * @param {number} toy
     * @return {undefined}
     */
    function drawLine(fromx, fromy, tox, toy) {
        /** @type {string} */
        context.globalCompositeOperation = "source-over";
        context.beginPath();
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.stroke();
        data = context.getImageData(0, 0, canvas.getAttribute("width"), canvas.getAttribute("height"));
    }
    /**
     * @param {number} lastX
     * @param {number} lastY
     * @return {undefined}
     */
    function eraseLine(lastX, lastY) {
        /** @type {string} */
        context.globalCompositeOperation = "destination-out";
        /** @type {string} */
        context.strokeStyle = "black";
        context.arc(lastX, lastY, 1, 0, 2, false);
        context.fill();
    }
    /**
     * @param {number} R
     * @param {number} G
     * @param {number} B
     * @return {string}
     */
    function rgbToHex(R, G, B) {
        return toHex(R) + toHex(G) + toHex(B);
    }
    /**
     * @param {number} n
     * @return {string}
     */
    function toHex(n) {
        /** @type {number} */
        n = parseInt(n, 10);
        if (isNaN(n)) {
            return "00";
        }
        /** @type {number} */
        n = Math.max(0, Math.min(n, 255));
        return "0123456789ABCDEF".charAt((n - n % 16) / 16) + "0123456789ABCDEF".charAt(n % 16);
    }
    /**
     * @return {undefined}
     */
    function onColorSelect() {
        /** @type {NodeList} */
        var colors = document.getElementById("colorContainer").children;
        /** @type {number} */
        var i = 0;
        for (; i < colors.length; i++) {
            $("#colorContainer div").hover(function () {
                $("#bgBox").css("background-color", this.style.backgroundColor);
                var bgColor = this.style.backgroundColor;
                var thenum = bgColor.match(/\d+\.?\d*/g);
                /** @type {string} */
                var hexColor = "#" + rgbToHex(thenum[0], thenum[1], thenum[2]);
                $("#hexBox").html(hexColor);
            });
            /**
             * @param {DOM event listener} event
             * @return {undefined}
             */
            colors[i].onclick = function (event) {
                $("#stroke").attr("class", "draw-icon left menu toolBox");
                $("#clear").attr("class", "erase-icon-inactive left menu toolBox");
                globalStrokeColor = this.style.backgroundColor;
                context.strokeStyle = this.style.backgroundColor;
                /** @type {string} */
                mode = "drawing";
                $("#paper").css("cursor", "crosshair");
            };
        }
    }
    /**
     * @return {undefined}
     */
    function carousal_nav() {
        if ($(window).width() + 17 < screen.width) {
            $("#cam_footer a").css("display", "block");
        } else {
            if (currentFreeIndex > 2) {
                $("#cam_footer a").css("display", "block");
            } else {
                $("#cam_footer a").css("display", "none");
            }
        }
    }
    /**
     * @return {string}
     */
    function checkIsCalling() {
        console.log(isCalling);
        if (isCalling === true) {
            console.log("caught if");
            /** @type {boolean} */
            isCalling = false;
            /** @type {string} */
            var idToUse = "caller";
            return idToUse;
        } else {
            if (isCalling === false) {
                console.log("caught else");
                if ($("#peopleCount").html() >= "12") {
                    var numPeople = $("#peopleCount").html();
                    $("#stream_list").append("<li style=\"width: 210px;\"><video id=\"otherStream" + numPeople + "\"  autoplay=\"autoplay\" muted style=\"border:1.3px solid;\"></video><!--<img src=\"images/blank_pic.jpg\" alt=\"Image 2\">--></li>");
                    streamArray.push("otherStream" + numPeople);
                }
                return streamArray[currentFreeIndex];
            }
        }
    }
    /**
     * @return {undefined}
     */
    function video_init() {
        easyrtc.setRoomOccupantListener(roomListener);
        /**
         * @param {string} myId
         * @return {undefined}
         */
        var connectSuccess = function (myId) {
            console.log("My easyrtcid is " + myId);
            /** @type {string} */
            selfId = myId;
            socket.emit("videoConnect", {
                id: myId
            });
        };
        /**
         * @param {string} errorCode
         * @param {string} errText
         * @return {undefined}
         */
        var connectFailure = function (errorCode, errText) {
            console.log(errText);
        };
        easyrtc.initMediaSource(function () {
            /** @type {(HTMLElement|null)} */
            var selfVideo = document.getElementById("self");
            easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
            easyrtc.joinRoom(roomName.toString());
            easyrtc.connect("Huddle_Chat_Line", connectSuccess, connectFailure);
        }, connectFailure);
    }
    /**
     * @param {string} roomName
     * @param {object} otherPeers
     * @return {undefined}
     */
    function roomListener(roomName, otherPeers) {
        console.log(typeof otherPeers);
        console.log("entered room listener");
        /** @type {(HTMLElement|null)} */
        var otherClientDiv = document.getElementById("otherClients");
        for (; otherClientDiv.hasChildNodes() ;) {
            otherClientDiv.removeChild(otherClientDiv.lastChild);
        }
        var i;
        for (i in otherPeers) {
            console.log("entered otherPeers");
            btnTrigger(i);
        }
    }
    /** @type {number} */
    var randomTimeOut = Math.round(Math.random() * 20E3 + 7);
    /**
     * @param {string} i
     * @param {string} btnId
     * @return {undefined}
     */
    function btnTrigger(rtcID) {
        console.log("entered timeout");
        setTimeout(function () {
            if (easyrtc.getConnectStatus(rtcID) == easyrtc.NOT_CONNECTED) {
                performCall(rtcID);
            }
        }, randomTimeOut);
    }
    /**
     * @param {string} easyrtcid
     * @return {undefined}
     */
    function performCall(easyrtcid) {
        easyrtc.call(easyrtcid, function (easyrtcid) {
            console.log("completed call to " + easyrtcid);
        }, function (errorMessage) {
            console.log("err:" + errorMessage);
        }, function (accepted, bywho) {
            console.log((accepted ? "accepted" : "rejected") + " by " + bywho);
        });
    }
    /** @type {number} */
    var roomName = Number(window.location.pathname.match(/\/meeting\/(\d+)$/)[1]);
    var socket = io.connect();
    var URL = window.location.protocol + "//" + window.location.host;
    $("#fbShare").attr("data-url", document.URL);
    $("#gPlusShare").attr("data-url", document.URL);
    $('#fbShare').sharrre({
        share: {
            facebook: true
        },
        enableHover: false,
        enableTracking: false,
        click: function (api, options) {
            api.simulateClick();
            api.openPopup('facebook');
        }
    });
    $('#gPlusShare').sharrre({
        share: {
            googlePlus: true
        },
        enableHover: false,
        enableTracking: false,
        click: function (api, options) {
            api.simulateClick();
            api.openPopup('googlePlus');
        }
    });
    /*if (document.cookie === "") {
        var d = new Date();
        console.log(d.toGMTString());
        d.setTime(d.getTime() + (60 * 60 * 1000));
        console.log(d.toGMTString());
        var expires = "expires=" + d.toGMTString();
        document.cookie = "site=" + URL + "/meeting; " + expires;
    } else {
        socket.emit("badUserdAction");
    }*/
    $(window).bind('beforeunload', function () {
        document.cookie = "site=" + URL + "/meeting; " + "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    });
    socket.emit("checkValidRoom", roomName);
    socket.on("badURL", function () {
        /** @type {string} */
        window.location = "/errorPage";
    });
    //$("#hideBtn").click(function () {
    //    if ($(this).html() === "Hide") {
    //        $(this).html("Show");
    //        $(this).attr("class", "hideBtn btn btn-primary btn-xs");
    //        $("#floatingMenu").attr("class", "displayNone");
    //    } else {
    //        $(this).html("Hide");
    //        $("#floatingMenu").attr("class", "options");
    //        $(this).attr("class", "showBtn btn btn-primary btn-xs");
    //    }
    //});
    $("#textBlock_button").click(function () {
        socket.emit("activeTab", "action-text-edit icon");
        $("#textBlock_button").attr("class", "action-text-edit icon");
        $("#whiteBoard_button").attr("class", "action-whiteBoard-inactive icon");
        $("#videoCall_button").attr("class", "action-video-meeting-inactive icon");
        $("#textArea").attr("class", "col-md-9 chat_content");
        $("#drawArea").attr("class", "displayNone");
        $("#videoCall").attr("class", "displayNone");
    });
    $("#whiteBoard_button").click(function () {
        socket.emit("activeTab", "action-whiteBoard icon");
        $("#whiteBoard_button").attr("class", "action-whiteBoard icon");
        $("#textBlock_button").attr("class", "action-text-edit-inactive icon");
        $("#videoCall_button").attr("class", "action-video-meeting-inactive icon");
        $("#textArea").attr("class", "displayNone");
        $("#drawArea").attr("class", "col-md-9 draw_content");
        $("#videoCall").attr("class", "displayNone");
    });
    $("#videoCall_button").click(function () {
        socket.emit("activeTab", "action-video-meeting icon");
        $("#videoCall_button").attr("class", "action-video-meeting icon");
        $("#textBlock_button").attr("class", "action-text-edit-inactive icon");
        $("#whiteBoard_button").attr("class", "action-whiteBoard-inactive icon");
        $("#textArea").attr("class", "displayNone");
        $("#drawArea").attr("class", "displayNone");
        $("#videoCall").attr("class", "col-md-9 video_content");
    });
    /** @type {string} */
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var userName = randomString(5, chars);
    var buttonId = randomString(5, chars);
    $("#welcome_header").append(" " + userName);
    /** @type {object} */
    var userData = {
        uId: userName,
        uButton: buttonId,
        activeTab: "action-text-edit icon",
        inRoom: roomName
    };
    socket.emit("joinserver", userData);
    socket.on("update-people", function (data) {
        $("#userSection").empty();
        $("#userSection").append('<li class="list-group-item active onlineStat">People online:<span class="badge" id="peopleCount">' + data.count + "</span></li>");
        $.each(data.people, function (a, obj) {
            if (obj.name === userName) {
                $("#userSection").append('<p class="user panel-body"><span class="user-list-user-image-own icon">&nbsp;</span><span class="user-list-user-name badge"' + 'id="' + obj.name + '"' + ">" + obj.name + "</span><span " + 'id="' + obj.button + '"' + 'class="' + obj.activeTab + '">&nbsp;</span></p>');
            } else {
                $("#userSection").append('<p class="user panel-body"><span class="user-list-user-image icon">&nbsp;</span><span class="user-list-user-name badge"' + 'id="' + obj.name + '"' + ">" + obj.name + "</span><span " + 'id="' + obj.button + '"' + 'class="' + obj.activeTab + '">&nbsp;</span></p>');
            }
        });
    });
    /** @type {string} */
    var docName = roomName.toString();
    /** @type {(HTMLElement|null)} */
    //var elem = document.getElementById("text_input");
    var elem = ace.edit("text_input");
    elem.session.setMode("ace/mode/text");
    elem.setTheme("ace/theme/xcode");
    elem.session.setUseWorker(false);
    elem.setHighlightActiveLine(false);
    elem.setShowPrintMargin(false);
    var connection = sharejs.open(docName, "text", function (error, doc) {
        if (error) {
            console.log(error);
        } else {
            /** @type {boolean} */
            elem.disabled = false;
            //doc.attach_textarea(elem);
            doc.attach_ace(elem);
        }
    });
    $("#mode").on('change', function () {
            var currentMode = "ace/mode/" + $(this).val();
            elem.session.setMode(currentMode);
            $("#text_input").focus();
    });
    $("#textBlock_button").click(function () {
        /** @type {string} */
        var btnId = "#textBlock_button";
        socket.emit("textTab", btnId);
    });
    $("#whiteBoard_button").click(function () {
        /** @type {string} */
        var btnId = "#whiteBoard_button";
        socket.emit("drawTab", btnId);
    });
    $("#videoCall_button").click(function () {
        /** @type {string} */
        var btnId = "#videoCall_button";
        socket.emit("videoTab", btnId);
    });
    socket.on("update-textTab", function (data) {
        /** @type {string} */
        var buttonId = "#" + data;
        $(buttonId).attr("class", "action-text-edit icon");
    });
    socket.on("update-drawTab", function (data) {
        /** @type {string} */
        var buttonId = "#" + data;
        $(buttonId).attr("class", "action-whiteBoard icon");
    });
    socket.on("update-videoTab", function (data) {
        /** @type {string} */
        var buttonId = "#" + data;
        $(buttonId).attr("class", "action-video-meeting icon");
    });
    var doc = $(document);
    /** @type {(Element|null)} */
    var canvas = document.querySelector("#paper");
    var context = canvas.getContext("2d");
    var clients = {};
    /** @type {number} */
    var id = Math.round($.now() * Math.random());
    /** @type {null} */
    var mode = null;
    /** @type {boolean} */
    var isMouseDown = false;
    /** @type {number} */
    canvas.width = 1355;
    /** @type {number} */
    canvas.height = 544;
    $(window).resize(function () {
        carousal_nav();
        if ($(window).width() + 17 < screen.width) {
            $("#canvasHolder").css("overflow", "scroll");
            if ($(window).width() > 892) {
                $("#right_div").css({
                    "width": "3%"
                });
                $("#left_div").css({
                    "width": "3%"
                });
            } else {
                if ($(window).width() > 788 && $(window).width() <= 892) {
                    $("#right_div").css({
                        "width": "6%"
                    });
                    $("#left_div").css({
                        "width": "6%"
                    });
                } else {
                    if ($(window).width() <= 788) {
                        $("#right_div").css({
                            "width": "9%"
                        });
                        $("#left_div").css({
                            "width": "9%"
                        });
                    }
                }
            }
            $("#right_div").css("right", "16px");
            $("#right_div").attr("class", "control_divsUp");
            $("#left_div").attr("class", "control_divsUp");
            $("#colors").css("margin-top", "7px");
        } else {
            $("#canvasHolder").css("overflow", "hidden");
            $("#right_div").css({
                "right": "0",
                "width": "2%"
            });
            $("#left_div").css({
                "width": "2%"
            });
            $("#right_div").attr("class", "control_divs");
            $("#left_div").attr("class", "control_divs");
            $("#colors").css("margin-top", "-186px");
        }
    });
    /** @type {string} */
    context.lineCap = "round";
    /** @type {string} */
    context.strokeStyle = "black";
    if (!("getContext" in document.createElement("canvas"))) {
        alert("Sorry, it looks like your browser does not support canvas!");
    }
    socket.on("moving", function (data) {
        if (data.isDrawing && (data.mode === "drawing" && clients[data.id])) {
            if ($("#canvasHolder").width() < canvas.width || $("#canvasHolder").height() < canvas.height) {
                $("#canvasHolder").css("overflow", "scroll");
                $("#right_div").attr("class", "control_divsUp");
                $("#left_div").attr("class", "control_divsUp");
            } else {
                $("#canvasHolder").removeAttr("style");
                $("#canvasHolder").css("overflow", "hidden");
                $("#right_div").attr("class", "control_divs");
                $("#left_div").attr("class", "control_divs");
            }
            drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
        } else {
            if (data.isDrawing && (data.mode === "eraser" && clients[data.id])) {
                eraseLine(clients[data.id].x, clients[data.id].y);
            }
        }
        /** @type {Object} */
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });
    var prev = {};
    canvas.addEventListener("mousedown", function (e) {
        e.preventDefault();
        /** @type {boolean} */
        isMouseDown = true;
        if (e.offsetX) {
            /** @type {number} */
            prev.x = e.offsetX;
            /** @type {number} */
            prev.y = e.offsetY;
        } else {
            if (e.clientX) {
                /** @type {number} */
                prev.x = e.pageX - $("#paper").offset().left;
                /** @type {number} */
                prev.y = e.pageY - $("#paper").offset().top;
            }
        }
    });
    doc.bind("mouseup mouseleave", function () {
        /** @type {boolean} */
        isMouseDown = false;
    });
    canvas.addEventListener("mousemove", function (e) {
        var mousex;
        var mousey;
        if (e.offsetX) {
            /** @type {number} */
            mousex = e.offsetX;
            /** @type {number} */
            mousey = e.offsetY;
        } else {
            if (e.clientX) {
                /** @type {number} */
                mousex = e.pageX - $("#paper").offset().left;
                /** @type {number} */
                mousey = e.pageY - $("#paper").offset().top;
            }
        }
        socket.emit("mousemove", {
            "x": mousex,
            "y": mousey,
            "isDrawing": isMouseDown,
            "mode": mode,
            "id": id
        });
        if (isMouseDown) {
            if (mode === "drawing") {
                drawLine(prev.x, prev.y, mousex, mousey);
                /** @type {(number|undefined)} */
                prev.x = mousex;
                /** @type {(number|undefined)} */
                prev.y = mousey;
            } else {
                if (mode === "eraser") {
                    eraseLine(prev.x, prev.y);
                    /** @type {(number|undefined)} */
                    prev.x = mousex;
                    /** @type {(number|undefined)} */
                    prev.y = mousey;
                }
            }
        }
    });
    $("#left_div").mouseleave(function () {
        $("#hexBox").html("");
        $("#bgBox").css("background-color", "none");
    });
    onColorSelect();
    $("#clear").click(function () {
        /** @type {string} */
        mode = "eraser";
        $("#paper").css("cursor", "not-allowed");
        $("#stroke").attr("class", "draw-icon-inactive left menu toolBox");
        $("#clear").attr("class", "erase-icon left menu toolBox");
    });
    /** @type {string} */
    var browser = navigator.userAgent;
    $("#caller").removeAttr("src");
    /** @type {number} */
    var currentFreeIndex = 0;
    var lastFreeIndex = currentFreeIndex;
    /** @type {string} */
    var focusedCalleeId = "";
    /** @type {string} */
    var selfId = "";
    /** @type {string} */
    var label = "";
    /** @type {boolean} */
    var isCalling = false;
    /** @type {boolean} */
    isBusy = false;
    /** @type {boolean} */
    var isDisconnect = false;
    /** @type {Array} */
    var streamArray = ["otherStream1", "otherStream2", "otherStream3", "otherStream4", "otherStream5", "otherStream6", "otherStream7", "otherStream8", "otherStream9", "otherStream10", "otherStream11"];
    /** @returns {undefined} */
    easyrtc.setStreamAcceptor(function (easyrtcid, stream) {
        console.log("entered stream acceptor");
        console.log(currentFreeIndex);
        var VideoHolderToUse = checkIsCalling();
        if (isBusy && $("#caller").attr("name") !== "" && VideoHolderToUse === "caller") {
            return;
        }
        if (VideoHolderToUse == "caller") {
            /** @type {string} */
            document.getElementById("cam_image").style.display = "none";
            /** @type {string} */
            document.getElementById("caller").style.display = "block";
            /** @type {string} */
            document.getElementById("hangUp").style.display = "block";
        }
        document.getElementById(VideoHolderToUse).setAttribute("name", easyrtcid);
        easyrtc.setVideoObjectSrc(document.getElementById(VideoHolderToUse), stream);
        if (VideoHolderToUse != "caller") {
            $("#" + VideoHolderToUse).parent().css("display", "inline-block");
            $("#" + VideoHolderToUse).css({
                "border": "1.3px solid",
                "display": "inline-block"
            });
            if (isDisconnect) {
                console.log("entered is disconnect");
                currentFreeIndex = lastFreeIndex;
                console.log(currentFreeIndex + "-> " + isDisconnect);
                //lastFreeIndex = currentFreeIndex;
                /** @type {boolean} */
                isDisconnect = false;
            } else {
                console.log("entered is disconnect else");
                console.log(isDisconnect);
                currentFreeIndex++;
                lastFreeIndex = currentFreeIndex;
            }
            if ($("#peopleCount").html() > "5") {
                $("#cam_footer a").css("display", "block");
            }
        }
    });
    easyrtc.setOnStreamClosed(function (callerEasyrtcid) {
        console.log("entered stream closed");
        var disconnectedVideoId = document.getElementsByName(callerEasyrtcid)[0].getAttribute("id");
        console.log(disconnectedVideoId);
        /** @type {number} */
        var indexOfdisconnectedVideo = streamArray.indexOf(disconnectedVideoId);
        /** @type {number} */
        currentFreeIndex = indexOfdisconnectedVideo;
        easyrtc.setVideoObjectSrc(document.getElementById(disconnectedVideoId), "");
        $("#" + disconnectedVideoId).css({
            "border": "transparent",
            "display": "hidden"
        });
        $("#" + disconnectedVideoId).parent().css("display", "hidden");
        if ($("#peopleCount").html() <= "5") {
            $("#cam_footer a").css("display", "none");
        }
        /** @type {boolean} */
        isDisconnect = true;
        if ($("#caller").attr("name") == callerEasyrtcid) {
            easyrtc.setVideoObjectSrc("caller", "");
            $("#caller").attr("name", "");
            /** @type {string} */
            document.getElementById("cam_image").style.display = "block";
            /** @type {string} */
            document.getElementById("caller").style.display = "none";
            /** @type {string} */
            document.getElementById("hangUp").style.display = "none";
            /** @type {boolean} */
            //isBusy = false;
        }
    });
    video_init();
    /** @type {number} */
    
    $("#stream_list video").click(function () {
        //event.preventDefault();
        socket.emit("activeTab", "action-video-meeting icon");
        $("#videoCall_button").attr("class", "action-video-meeting icon");
        $("#textBlock_button").attr("class", "action-text-edit-inactive icon");
        $("#whiteBoard_button").attr("class", "action-whiteBoard-inactive icon");
        $("#textArea").attr("class", "displayNone");
        $("#drawArea").attr("class", "displayNone");
        $("#videoCall").attr("class", "col-md-9 video_content");
        if ($(this).attr("id") == "self") {
        } else {
            focusedCalleeId = $(this).attr("name");
            /** @type {boolean} */
            isCalling = true;
            /** @type {boolean} */
            //isBusy = true;
            console.log(focusedCalleeId);
            socket.emit("calling", {
                calleeId: focusedCalleeId,
                callerId: selfId,
                roomID  : roomName
            });
        }
    });
    socket.on("isConnected", function (data) {
        console.log("entered isConnected");
        //if (data.state === "connected") {
            performCall(data.calleeId);
        /*} else {
            /** @type {boolean} */
            //isBusy = false;
            /** @type {boolean} */
            /*isCalling = false;
            console.log("Person busy!!");
        }*/
    });
    socket.on("called", function (data) {
        console.log("entered called");
        //if (isBusy) {
        //    console.log("entered busy");
        //    socket.emit("status", {
        //        callerId: data.callerId,
        //        calleeId: data.calleeId,
        //        roomID  : roomName,
        //        status: "busy"
        //    });
        //} else {
            //console.log("entered free");
            socket.emit("status", {
                callerId: data.callerId,
                calleeId: data.calleeId,
                roomID  : roomName,
                //status: "free"
            });
        //}
    });
    socket.on("incoming", function (data) {
        console.log("entered incoming");
        /** @type {boolean} */
        isCalling = true;
        /** @type {boolean} */
        isBusy = true;
    });
    socket.on("notifyConn", function (data) {
        /** @type {Element} */
        var notification = document.createElement("p");
        /** @type {(HTMLElement|null)} */
        var notifyDiv = document.getElementById("notify");
        /** @type {Text} */
        var notifyLabel = document.createTextNode(data);
        notification.appendChild(notifyLabel);
        notifyDiv.appendChild(notification);
        $("#notify p").fadeOut(2E3, "swing");
    });
    $("#hangUp").click(function () {
        var remote_callerId = $("#caller").attr("name");
        easyrtc.setVideoObjectSrc(document.getElementById("caller"), "");
        $("#caller").attr("name", "");
        /** @type {string} */
        document.getElementById("cam_image").style.display = "block";
        /** @type {string} */
        document.getElementById("caller").style.display = "none";
        /** @type {string} */
        document.getElementById("hangUp").style.display = "none";
        $("#caller").attr("name", "");
        /** @type {boolean} */
        isBusy = false;
        socket.emit("disconnected", {
                 rCallerId: remote_callerId,
                 roomID: roomName
            });
    });
    socket.on("hangedUp", function (data) {
        console.log("entered hanged Up");
        easyrtc.setVideoObjectSrc(document.getElementById("caller"), "");
        $("#caller").attr("name", "");
        /** @type {string} */
        document.getElementById("cam_image").style.display = "block";
        /** @type {string} */
        document.getElementById("caller").style.display = "none";
        /** @type {string} */
        document.getElementById("hangUp").style.display = "none";
        /** @type {boolean} */
        isBusy = false;
    });
});

//window.fbAsyncInit = function () {
//    FB.init({
//        appId: '352984204854873', // App ID
//        status: true, // check login status
//        cookie: true, // enable cookies to allow the server to access the session
//        xfbml: true  // parse XFBML
//    });
//};

//URL = window.location.protocol + "//" + window.location.host + window.location.pathname;
//// Load the SDK Asynchronously
//(function (d) {
//    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
//    if (d.getElementById(id)) { return; }
//    js = d.createElement('script'); js.id = id; js.async = true;
//    js.src = "//connect.facebook.net/pt_PT/all.js";
//    ref.parentNode.insertBefore(js, ref);
//}(document));


//function shareFB() {
//    var obj = {
//        method: 'share',
//        //name: 'name',
//        //caption: 'caption',
//        //description: 'description',
//        //href: 'http://localhost:5000/',
//        href: URL
//        //picture: 'http://www.image.com/static/3.png'
//    };

//    function share(response) {
//        if (response && response.post_id) {
//            alert('Post was published.');
//        } else {
//            alert('Post was not published.');
//        }
//    }
//    FB.ui(obj, share);
//};
