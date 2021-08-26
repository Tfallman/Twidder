
setBody = function(view){
  document.getElementById("body").innerHTML = view.innerHTML;
};


// Hur gör man för att skicka med email när det inte finns?
// vill hämta email från "get email by token, men hur gör man det?"
// SignUp, SignIn, changePassword och signOut fungerar!


window.onload = function(){
  welcomeView = document.getElementById("welcomeView");
  profileView = document.getElementById("profileView");
  if(localStorage.getItem("token") == null) {
    setBody(welcomeView);
  } else {
    setBody(profileView);
    userInfo();
    document.getElementById("defaultOpen").click();
    updateWall();
    socket();

  }

};




function checkPassword() {

  var passwordReg = document.getElementById("passwordReg").value;
  var passwordReg2 = document.getElementById("passwordReg2").value;
  var matchingPassword = document.getElementById('wrongPassswordAlert').innerHTML
  var status = document.getElementById('wrongPassswordAlert');

  if (passwordReg == passwordReg2){
    status.innerHTML = "Passwords do match";
    status.style.color="green";

  }else {
    status.innerHTML = "Passwords doesnt match";
    status.style.color="red";

  }
}


function recoverPassword() {
   var recoverEmail = document.getElementById("recoverEmail").value;
   var status4 = document.getElementById('generatePasswordAlert');

   console.log(recoverEmail);

   var request = new XMLHttpRequest();
  //   request.open("POST", "/sign-in", true);

   request.onreadystatechange = function(){


     if (this.readyState == 4){

       parsedRequest = JSON.parse(request.responseText);

       if (this.status == 200){
         status4.innerHTML = parsedRequest.message;
         status4.style.color="green";

         //Generera lösenord
       }
       else if (this.status == 404){
         status4.innerHTML = parsedRequest.message;
         status4.style.color="red";

       }
     }
   };
   request.open("POST", "recover-password", true);

   request.setRequestHeader('Content-type','application/json; charset=utf-8');
   request.send(JSON.stringify({"email": recoverEmail}));


 }






function signUp() {

  formData = document.getElementById("signupForm");

  var email = document.getElementById("email").value;
  var password = document.getElementById("passwordReg").value;
  var password2 = document.getElementById("passwordReg2").value;
  var firstName = document.getElementById("fname").value;
  var lastName = document.getElementById("lname").value;
  var gender = document.getElementById("gender").value;
  var city = document.getElementById("city").value;
  var country =  document.getElementById("country").value;
  var status2 = document.getElementById('wrongPassswordAlert');



  if (password2 != password) {
    status2.innerHTML = "Passwords doesnt match";
    status2.style.color="red";
  }else {

     var newUser = JSON.stringify({
        "email": email,
        "password": password,
        "firstname": firstName,
        "lastname": lastName,
        "gender": gender,
        "city": city,
        "country": country
      });


    var request = new XMLHttpRequest();


    request.onreadystatechange = function(){

      if (this.readyState == 4){

        parsedRequest = JSON.parse(request.responseText);

        if(this.status ==200) {

          status2.innerHTML  = parsedRequest.message;
          status2.style.color="green";
        }
        else if(this.status == 500){
          status2.innerHTML  = "User already exists.";
          status2.style.color="red";
        }
        else if (this.status == 400){
          status2.innerHTML  = "Password is too short.";
          status2.style.color="red";
        }
        else if(this.status == 501){
          status2.innerHTML  = "You need to fill in all the fields.";
          status2.style.color="red";
        }
      }

};
request.open("POST", "/sign-up", true);

  request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.send(newUser);
  }
}

function signIn(){
  var email = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var status3 = document.getElementById('signInAlert');


  var request = new XMLHttpRequest();

  request.onreadystatechange = function(){


    if (this.readyState == 4){

      parsedRequest = JSON.parse(request.responseText);

      if (this.status == 200){
        status3.innerHTML = parsedRequest.message;
        status3.style.color="green";

        localStorage.setItem("token", parsedRequest.data);
        localStorage.setItem("email", email);
        window.onload();

      }
      else if (this.status == 400){
        status3.innerHTML = "Wrong username or password";
        status3.style.color="red";

      }
    }
  };
  request.open("POST", "sign-in", true);

  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.send(JSON.stringify({"email": email, "password": password}));


}

function changePassword() {
  var newPassword = document.getElementById("passwordReg").value;
  var newPassword2 = document.getElementById("passwordReg2").value;

  var oldPassword = document.getElementById("oldPassword").value;
  var status = document.getElementById('wrongPassswordAlert');
  var token = localStorage.getItem("token");

  if (newPassword == newPassword2) {
  var request = new XMLHttpRequest();
  request.open("POST", "change-password", true);

  request.onreadystatechange = function(){
    if (this.readyState == 4){
      console.log("KOMMER VI HIT?")
      parsedRequest = JSON.parse(request.responseText);
      if (this.status == 200) {
        status.innerHTML = parsedRequest.message;
        status.style.color="green";

      }
      else if(this.status == 400) {
        status.innerHTML = "Wrong password.";
        status.style.color="red";
      }
      else if(this.status == 405) {
        status.innerHTML = "You are not signed in.";
        status.style.color="red";
        }
    }

  }

  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.setRequestHeader("token", token);

  request.send(JSON.stringify({"oldPassword": oldPassword, "newPassword": newPassword}));


} else {
    status.innerHTML = "passwords doesnt match";
    status.style.color="red";

  }

  }



function signOut() {
  var token = localStorage.getItem("token");
  var email = localStorage.getItem("email");
  var request = new XMLHttpRequest();
  request.open("POST", "sign-out", true);

  request.onreadystatechange = function(){

    if (this.readyState == 4){
      parsedRequest = JSON.parse(request.responseText);
   if(this.status == 200) {
    setBody(welcomeView);
    localStorage.removeItem("token");
    localStorage.removeItem("email");
  }
}
}
request.setRequestHeader('Content-type','application/json; charset=utf-8');
request.setRequestHeader("token", token);

request.send(JSON.stringify({"email": email}));

/*  var returnCode = serverstub.signOut(localStorage.getItem("token"));
  if (returnCode.success) {
    setBody(welcomeView);
    localStorage.removeItem("token");
  }*/

}

function userInfo(){
// how to get email?
  var email = localStorage.getItem("email");

  var token = localStorage.getItem("token");
//  var email = ???
  var request = new XMLHttpRequest();
  request.open("GET", "get-user-data-by-token/", true);

  request.onreadystatechange = function(){
      if (this.readyState == 4){
      //  var userData = serverstub.getUserDataByToken(localStorage.getItem("token")).data;

        parsedRequest = JSON.parse(request.responseText);
        console.log(parsedRequest)

        if (this.status == 200) {
          console.log(parsedRequest.data);
          document.getElementById('personalInfo').innerHTML = "Personal information:"
          document.getElementById('emailLabel').innerHTML = "Email: " + parsedRequest.data[0];
          document.getElementById('nameLabel').innerHTML = "Name: " + parsedRequest.data[1] + " " + parsedRequest.data[2];
          document.getElementById('genderLabel').innerHTML = "Gender: " + parsedRequest.data[3];
          document.getElementById('cityLabel').innerHTML = "City: " + parsedRequest.data[4];
          document.getElementById('countryLabel').innerHTML = "Contry: " + parsedRequest.data[5];
        }
        else if(this.status == 404) {
          console.log("No such user");
        }
        else if(this.status == 405) {
          console.log("You are not signed in.");
        }
      }
    }
    request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.setRequestHeader("token", token);

    request.send();


}

function sendTwiid(){
  var twiddWallList = document.getElementById("twiddWallList");
  var twiid = document.getElementById("textArea").value;
  var email = localStorage.getItem("email");
  var token = localStorage.getItem("token");

//  var returnCode = serverstub.getUserDataByToken(localStorage.getItem("token")).data;
  if (twiid.length>0) {
  var request = new XMLHttpRequest();
  request.open("POST", "/post-message", true);
  request.onreadystatechange = function(){
      if (this.readyState == 4){
        parsedRequest = JSON.parse(request.responseText);
        if (this.status == 200){
          twiddWallList.innerHTML += email + ": " + twiid + "<br>" + "<br>";
          document.getElementById("textArea").value = "";

          updateWall();

        }
        else if(this.status == 404){
          console.log("No such user");
        }
        else if(this.status == 405)
        console.log("You are not signed in");
      }
    }
    request.setRequestHeader('Content-type','application/json; charset=utf-8');
    request.setRequestHeader("token", token);

    request.send(JSON.stringify({"message": twiid, "toEmail": email}));

    }
  }



function sendTwiidToUser() {

  var twiddWallList = document.getElementById("userTwiddWallList");
  var twiid = document.getElementById("textAreaUser").value;
  var toEmail = document.getElementById("searchUser").value;
  var status = document.getElementById('errorSendTwiidToUser');
  var email = localStorage.getItem("email");
  var token = localStorage.getItem("token");


  if (twiid.length>0) {
    var request = new XMLHttpRequest();
    request.open("POST", "/post-message", true);
    request.onreadystatechange = function(){
        if (this.readyState == 4){
          parsedRequest = JSON.parse(request.responseText);
            if (this.status == 200){
              userTwiddWallList.innerHTML += email + ": " + twiid + "<br>" + "<br>";
              document.getElementById("textAreaUser").value = "";
              updateUserWall();
            }
            else if(this.status == 404){
              status.innerHTML = "No such user.";
              status.style.color="red";

            }
            else if(this.status == 405){
              status.innerHTML = "You are not signed in.";
              status.style.color="red";

          }
          else if(this.status == 400){
            status.innerHTML = "You have to write something";
            status.style.color="red";

        }
        }
      }
        request.setRequestHeader('Content-type','application/json; charset=utf-8');
        request.setRequestHeader("token", token);

        request.send(JSON.stringify({"message": twiid, "toEmail": toEmail}));


      }

}





function updateWall(){
  var twiddWallList = document.getElementById("twiddWallList");
  var token = localStorage.getItem("token");

  //var messages = serverstub.getUserMessagesByToken(localStorage.getItem("token"));
  var request = new XMLHttpRequest();

  request.open("GET", "/get-user-messages-by-token", true);
  request.onreadystatechange = function(){
      if (this.readyState == 4){
        parsedRequest = JSON.parse(request.responseText);
        console.log(parsedRequest.data);
        if(this.status == 200){


          var twiid = document.getElementById("textArea");
          twiddWallList.innerHTML = "";
          for (var i = 0; i < parsedRequest.data.length; i++) {
            twiddWallList.innerHTML += parsedRequest.data[i][2] + ": " + parsedRequest.data[i][1] + "<br>" + "<br>";
          }

        }
        else if(this.status == 404) {
          console.log("no such user")
        }
        else if(this.status == 405) {
          console.log("You are not signed in")
        }
      }}
      request.setRequestHeader('Content-type','application/json; charset=utf-8');
      request.setRequestHeader("token", token);

      request.send();

}

function updateUserWall() {
  var token = localStorage.getItem("token");
  var twiddWallList = document.getElementById("userTwiddWallList");
  var email = document.getElementById("searchUser").value;
  var request = new XMLHttpRequest();

  request.open("GET", "/get-user-messages-by-email/" + email, true);
  request.onreadystatechange = function(){
      if (this.readyState == 4){
        parsedRequest = JSON.parse(request.responseText);
        console.log("TITTA HIT")
        console.log(parsedRequest.data);
        if (this.status == 200){
          var twiid = document.getElementById("textAreaUser");
          userTwiddWallList.innerHTML = "";
          for (var i = 0; i < parsedRequest.data.length; i++) {
            userTwiddWallList.innerHTML += parsedRequest.data[i][2] + ": " + parsedRequest.data[i][1] + "<br>" + "<br>";
          }
  }
  else if(this.status == 404) {
    console.log("no such user")
  }
  else if(this.status == 405) {
    console.log("You are not signed in")
  }
}

  }
  request.setRequestHeader('Content-type','application/json; charset=utf-8');
  request.setRequestHeader("token", token);

  request.send();
}

function searchUser(){
  var status = document.getElementById('errorSendTwiidToUser');
  var status1 = document.getElementById('somethingWentWrong');
  var token = localStorage.getItem("token")
  var hideOrSeek = document.getElementById("infoPageSearch");
  var hideOrSeek2 = document.getElementById("userTwiddWallDiv");

  var email = document.getElementById("searchUser").value;

  var request = new XMLHttpRequest();
  request.open("GET", "get-user-data-by-email/" + email, true);
  request.onreadystatechange = function(){


      if (this.readyState == 4){

        parsedRequest = JSON.parse(request.responseText);

          if (this.status == 200){
            hideOrSeek2.style.display = "block";
            hideOrSeek.style.display = "block";

            document.getElementById('personalInfoSearch').innerHTML = "Personal information:"
            document.getElementById('emailLabelSearch').innerHTML = "Email: " + parsedRequest.data[0];
            document.getElementById('nameLabelSearch').innerHTML = "Name: " + parsedRequest.data[1] + " " + parsedRequest.data[2];
            document.getElementById('genderLabelSearch').innerHTML = "Gender: " + parsedRequest.data[3];
            document.getElementById('cityLabelSearch').innerHTML = "City: " + parsedRequest.data[4];
            document.getElementById('countryLabelSearch').innerHTML = "Contry: " + parsedRequest.data[5];
            status.innerHTML = "";

            updateUserWall();
          } else if (this.status == 404){
            hideOrSeek2.style.display = "none";
            hideOrSeek.style.display = "none";
            status.innerHTML = "No such user.";
            status.style.color="red";

          }else if (this.status == 405){
            hideOrSeek2.style.display = "none";
            hideOrSeek.style.display = "none";
            status.innerHTML = "You are not signed in.";
            status.style.color="red";

          }

        }
        }
        request.setRequestHeader('Content-type','application/json; charset=utf-8');
        request.setRequestHeader("token", token);
        //request.send(JSON.stringify({"email": email}));

        request.send();


  }

function socket() {
  var token = localStorage.getItem("token");
  console.log(token)
  ws = new WebSocket("ws://" + document.domain + ":5000/socket");


  ws.onmessage = function(msg) {
    console.log(msg.data);
  //  console.log(JSON.parse(msg.data));

    if(JSON.parse(msg.data) =="logout"){
      setBody(welcomeView);
      localStorage.removeItem("token");
      ws.close();
      signOut();
    }

  };
  ws.onopen = function(){
  ws.send(token);

};

}

//Function from W3 Schools

function changeTab(pageName, tabElement){
  var tabcontent;
  var tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  tabcontent2 = document.getElementsByClassName("tabcontent").value;

  for (var i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";

  }

  tablinks = document.getElementsByClassName("tablink");

  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";

  }
  tabElement.style.backgroundColor = "AntiqueWhite";
  document.getElementById(pageName).style.display = "block";



}
