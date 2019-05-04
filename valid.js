$(document).ready(function () {
    function User(name, password) {
        this.name = name;
        this.password = password;
    }
    // create a default user
    var newUs = new User("a", "a");
    var users = [];
    users.push(newUs);

    $("#datepicker").click(function() {
        $("#datepicker").datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "dd/mm/yy",
            yearRange: "-90:+00"
        });
        $( "#datepicker" ).datepicker("show");
    });

    $("#submitRegister").click(function () {
        // get the relevant values
        var fName = $('#registerForm').find('input[name="Fname"]').val();
        var lName = $('#registerForm').find('input[name="Lname"]').val();
        var checkNames;
        // names checking
        function checkFirstAndLastName() {
            var letters = /^[a-zA-Z]+$/;
            if (!fName.match(letters) || !lName.match(letters)) {
                alert("First and last name must input string");
                return false;
            }
            return true;
        }
        checkNames = checkFirstAndLastName();

        var checkPassword;
        var pass = $('#registerForm').find('input[name="passid"]').val();
        // password checking
        function checkPass() {
            var letter = /(?=.*[a-zA-Z])/;
            containLetter = pass.match(letter);
            var matches = pass.match(/\d+/g);
            var checkPassRes;
            if (pass.length < 8 || matches == null || containLetter==null)
                checkPassRes = false;
            else
                checkPassRes = true;
            return checkPassRes;

        }
        checkPassword = checkPass();
        if(!checkPassword){
            alert("Invalid Password");
        }
        // email field checking
        var email = $('#registerForm').find('input[name="email"]').val();

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        var checkEmail = validateEmail(email);
        if(!checkEmail){
            alert("Invalid Email Address");
        }
        var userid = $('#registerForm').find('input[name=userid]').val();
        var userCheck = true;
        if(userid=="") {
            alert("Username cannot be empty!");
            userCheck=false;
        }
        else{
            for (var i = 0; i < users.length; i++) {
                if (users[i].name == userid) {
                    userCheck = false;
                    alert("Username is in use");
                    break;
                }
            }
        }

        // ****** bdate need to get also the year!!! ******
        var bDate = $('#registerForm').find('input[name=bDate]').val();
        var checkEm = false;
        var checkEmpty = lName == "" || fName == "" || pass == "" || email == "" || userid == "" || bDate == "";
        if (checkEmpty == false)
            checkEm = true;
        var totalCheck = checkEmail && checkEm && checkNames && checkPassword && userCheck;

        // create a new user
        if (totalCheck == true) {
            var newUser = new User(userid, pass);
            users.push(newUser);
            showDiv("login");
        }
    });

    // ******* only check basic things - not validate username or password yet *******
    $("#submitLogin").click(function () {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;
        // checking if user and password exists
        var found = false;
        for (var i = 0; i < users.length; i++) {
            if (users[i].name == username && users[i].password == password) {
                found = true;
                break;
            }
        }

        if (username == null || username == "") {
            alert("Please enter the username.");
            return false;
        }
        else if (password == null || password == "") {
            alert("Please enter the password.");
            return false;
        }

        else if (found == true) {
            alert('Login successful');
            document.getElementById('lblUsername').innerHTML = username;
            showDiv("settings");
        }
        else
            alert('Login failed');
    });
});






