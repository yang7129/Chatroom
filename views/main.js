var myapp = angular.module('ChatroomApp', []);
myapp.controller('IndexCtrl', function($scope, $timeout, $http) {
    $scope.name;
    var socket;
    $scope.nginmsg = "";
    $scope.ngcount = 0;  
    $scope.ngusers = [];  
    $(function() {
        $scope.name = prompt("請輸入暱稱", "");
        socket = io.connect('/');
        if ($scope.name == "" || $scope.name == null) {
            location.reload();
        } else {
            //count(JSON.parse("[" + $scope.name + "]"));
            var temp =[];
            temp.push($scope.name);
            fnusers(temp);
            count(1);
            $('#msg').prepend('<li>' + $scope.name + '進來了' + '</li>');
            socket.emit('online', $scope.name);
        };
        loginchatroom();
        //發送
        $('#btmsg').click(function() {
            if ($scope.nginmsg == "") {
                alert("請輸入內容");
            } else {
                sendmsg($scope.nginmsg);
            }
        });
        $('#inmsg').keyup(function(event) {
            if (event.keyCode === 13) {
                if ($scope.nginmsg == "") {
                    alert("請輸入內容");
                } else {
                    sendmsg($scope.nginmsg);
                }
            }
        });
        //上限
        socket.on('online', function(data) {
            $('#msg').prepend('<li>' + data.message + '</li>');
            fnusers(data.users);
            count(data.count);
        });
        //接訊息
        socket.on('fromserver', function(data) {
            $('#msg').prepend('<li>' + data.name + ":" + data.message + '</li>');
            fnusers(data.users);
            count(data.count);
        });
        //離線
        socket.on('offline', function(data) {
            $('#msg').prepend('<li>' + data.message + '</li>');
            fnusers(data.users);
            count(data.count);
        });
        //人數相關
        socket.on('Usercount', function(data) {
            $scope.ngcount = data.count;
              $scope.ngusers = data.users;
        }); 
         //上傳檔案
        $('#uploadForm').submit(function() {
            $("#status").empty().text("File is uploading..."); 
            $(this).ajaxSubmit({ 
                error: function(xhr) {
                    alert('無法連接server'); 
                }, 
                success: function(response) {
                    $("#Upfile").val('');
                    $scope.nguploadFileShow = false;
                    if (response.msg.url !== "找不到檔案") {
                        sendmsg(response.msg.url);
                    }
                    else {
                        alert(response.msg.url);
                    }
                }
            }); 
            return false;
        });     
    });


    //確認是否有重複ID
    function loginchatroom() {
        socket.on('nickExisted', function() {
            //location.reload();
        });
    };
    //發送
    function sendmsg(message) {
        $('#msg').prepend('<li>' + $scope.name + ":" + message + '</li>');
        socket.emit('fromClient', { name: $scope.name, message: message });
        $('#inmsg').val('');
        $scope.nginmsg = ""; 
    };
    //人數相關
     function fnusers(datausers) {
        $scope.ngusers = datausers; 
        //mytimeout = $timeout($scope.onTimeout, 1000);
    };
    function count(datacount) {
        $scope.ngcount = datacount; 
        mytimeout = $timeout($scope.onTimeout, 1000);
    };
    $scope.recount = 0;
    $scope.onTimeout = function() {
        if ($scope.recount < 10) { 
            socket.emit('Usercount');
            $scope.ngcount = $scope.ngcount; 
             $scope.ngusers = $scope.ngusers; 
            $scope.recount++;
            mytimeout = $timeout($scope.onTimeout, 1000);
        } else {
            $timeout.cancel(mytimeout);
            $scope.recount = 0;
        }
    };
    var mytimeout = $timeout($scope.onTimeout, 1000);
    $scope.clickShowImages = function() {
        $scope.ShowImages = !$scope.ShowImages;
    };
    //發送圖片
    $scope.ngSendImg = function(sendimg) {
        sendmsg('<img src="' + sendimg + '" />');
        $scope.ShowImages = false;
    };


    //顯示圖片
    var LinesotreURL = 'http://sdl-stickershop.line.naver.jp/products/';
    var LineImageURL = "0/0/1/6119/android/stickers/";
    var LineImages = "[";
    //臭跩貓愛嗆人-白爛貓在蠕動
    for (var i = 10460056; i <= 10460079; i++) {
        if (i == 10460056) {
            LineImages += "{\"img\": \"" + LinesotreURL + LineImageURL + i + ".png\"}"
        } else {
            LineImages += ",{\"img\": \"" + LinesotreURL + LineImageURL + i + ".png\"}"
        }
    }
    //豆卡頻道-聲動貼
    LineImageURL = "0/0/1/5841/android/stickers/";
    for (var i = 9598144; i <= 9598167; i++) {
        LineImages += ",{\"img\": \"" + LinesotreURL + LineImageURL + i + ".png\"}"
    }
    //豆卡頻道2-茶包&飯丸
    LineImageURL = "0/0/1/1140900/android/stickers/";
    for (var i = 5747052; i <= 5747091; i++) {
        LineImages += ",{\"img\": \"" + LinesotreURL + LineImageURL + i + ".png\"}"
    }
    //臭跩貓愛嗆人3-白爛貓無極限
    LineImageURL = "0/0/1/1236945/android/stickers/";
    for (var i = 9615144; i <= 9615183; i++) {
        LineImages += ",{\"img\": \"" + LinesotreURL + LineImageURL + i + ".png\"}"
    }
    LineImages += "]";
    $scope.Images = JSON.parse(LineImages);
    //上傳檔案
    $scope.nguploadFileShow = false;
    $scope.clicknguploadFileShow = function() {
        $scope.nguploadFileShow = !$scope.nguploadFileShow;
    }; 
});
