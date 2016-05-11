//	document.createElement('article');
//	document.createElement('section');
//	document.createElement('aside');
//	document.createElement('hgroup');
//	document.createElement('nav');
//	document.createElement('header');
//	document.createElement('footer');
//	document.createElement('figure');
//	document.createElement('figcaption');


//function unhideFloatingMenu(divID) {
//var item = document.getElementById(divID);
//if (item) {
//    if(item.className ==='hidden'){
//        item.className = 'unhidden' ;
//        //clickedButton.value = 'hide';
//    }else{
//        item.className = 'hidden';
//        //clickedButton.value = 'unhide';
//    }
//}}
//
//function unhideTextBlock(divID){
//    var item = document.getElementById(divID);
//if (item) {
//    if(item.className ==='hidden'){
//        item.className = 'unhidden' ;
//        //clickedButton.value = 'hide';
//    }else{
//        item.className = 'hidden';
//        //clickedButton.value = 'unhide';
//    }
//}}

        

// function toggleFloatingMenu(){
//        $("#floatingMenu").toggle();
//    }
//    
//    function toggleChatWindow() {
//  $("#text-block").toggle();
//  }

$(function(){
    
     $("form").submit(function(event) {
    event.preventDefault();
  });
  
  
    $("#userNameForm").submit(function() {     //submit handler for nameForm
    var name = $("#userName").val();
    if (name === "" || name.length < 2) {  //check if the name has atleast 2 chars
      $("#errors").empty();
      $("#errors").append("Please enter a name");
      $("#errors").show();
    } else {
      //socket.emit("joinserver", name);  //on success emit joinserver event
//      toggleNameForm()
      $("#welcome_header").empty();
      $("#welcome_header").append("Welcome" + " " + name);
      ( function () {
  var item = document.getElementById('floatingMenu');
   if (item) {
    if(item.className === 'hidden'){
        item.className = 'unhide' ;
        //clickedButton.value = 'hide';
    }
    
}
})();

( function () {
  var item = document.getElementById('userNameSection');
   if (item) {
        item.className += " " + 'hidden' ;
}
})();


    }
  });
  
  $("#text_block_button").click(function(){
      ( function() {
  var item = document.getElementById('content');
   if (item) {
    if(item.className === 'hidden'){
        item.className = 'unhide' ;
        //clickedButton.value = 'hide';
    }else{
        item.className = 'hidden';
        //clickedButton.value = 'unhide';
    }
}
})();
      $("#msg").focus();
  });
    
    $("#userName").keypress(function(e){
    var name = $("#userName").val();
    if(name.length < 2) {
      $("#enterChat").attr('disabled', 'disabled'); 
    } else {
      $("#errors").empty();
      $("#errors").hide();
      $("#enterChat").removeAttr('disabled');
    }
  });
    
    
    
    
    
    
    
    
    
});

