$(document).ready(function(){
    $('#mail_submit').click(function(){
        
        var name = $("#mail_name").val();
        var email = $("#mail_email").val();
        //var subject = $("#mail_subject").val();
        var message = $("#mail_message").val();
        //var file = $("#mail_file").val();

        var submit = $("#mail_submit").val();
        $.post("mail.php",{
            name: name,
            email: email,
            //subject: subject,
            message: message,
            //file: file,
        },function(data){
            console.log(data);
        });
    });
});