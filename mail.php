<!DOCTYPE html>
<html lang="pl"> 
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="content-type" content="text/html; charset=windows-1250">
        <title>Chaotyczne Wyrazy Ekspresji</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100;0,300;0,500;1,200&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Spartan:wght@100;400;500;600&display=swap" rel="stylesheet">
        <link rel="icon" href="images/favicon.ico">
        <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
        <link rel="stylesheet" href="style.css"> 
        <link rel="stylesheet" href="css/all.css">
        <link rel="stylesheet"href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css"/>
        <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
        <!--<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>-->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" 
        integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <script src="js/contact.js" type="text/javascript"></script>
        <style>
            #mail_send{
            width: 85%;
            margin: 10px;
            margin-bottom: 10px;
            color: rgb(209, 255, 205);
            font-family: 'Roboto Mono', monospace;
            font-weight: 300;
            font-size: 30px;
            cursor: default;
            border-radius: 10px;
            border: 0px solid rgb(6, 6, 6);
            background: linear-gradient(45deg, hsl(125, 52%, 4%), hsl(125, 52%, 5%));
            box-shadow:  0px -5px 0px hsl(129, 47%, 3%),-0px 5px 0px hsl(129, 52%, 6%);
            box-sizing: border-box;
            padding: 10px;
            }
            @media (max-width: 1360px)
            {
                #mail_send
                {
                margin-left: 8%;
                margin-right: 8%;
                }
            }
            @media (max-width: 750px)
            {
                #mail_send
                {
                margin-left: 5%;
                margin-right: 5%;
                }
            }
        </style>
    </head>
    <body>
        <!-- PASEK NAGŁÓWKOWY -->
        <section class="sub-header5">
            <nav>
                <a href="index.html"><img src="images/logo.png" class="logo"></a>
                <div class="headroom">
                    <a id="cwe_m" class="cwe">Chaotyczne Wyrazy Ekspresji</a>
                <div class="nav-links" id="navLinks">
                    <ul>
                        <i class="fas fa-times" onclick="hideMenu()"></i>
                        <li><a href="Idea.html">Idea</a></li>
                        <li><a href="video.html">Materiały</a></li>
                        <li><a href="author.html">O twórcy</a></li>
                        <li><a href="about_page.html">O stronie</a></li>
                        <li><a href="contact.html">Kontakt</a></li>
                    </ul>
                </div>
                </div>
                <i class="fas fa-bars" onclick="showMenu()"></i>
            </nav>
    <!-- Tekst hasło -->
            <div data-aos="fade-down" data-aos-duration="2300" data-aos-delay="500">
                <h1 id="main_motto">Kontakt</h1>
            </div>
    </section>
    <!--Tekst idei-->
    <section class="kontakt">
        <div class="filary">
            <div data-aos="fade" data-aos-duration="2000" data-aos-delay="10" class="kontakt-col">
                <div>
                    <i class="far fa-envelope-open"></i>
                    <span>
                        <h5>d4krzyk@mat.umk.pl</h5>
                    </span>
                </div>
                <div>
                    <i class="fab fa-instagram"></i>
                    <span>
                        <h5>@d4krzyk</h5>
                    </span>
                </div>
            </div>
            <div data-aos="fade" data-aos-duration="2000" data-aos-delay="10" class="kontakt-col">
                <form action="mail.php" method="POST" class="ajax" enctype="multipart/form-data">
                    <!--<input id="mail_name" type="text" placeholder="Imię i nazwisko" required>
                    <input id="mail_email" type="text" placeholder="E-mail"required>
                    <input id="mail_subject" type="text" placeholder="Temat"required>
                    <textarea id="mail_message" placeholder="Treść wiadomości"required></textarea>
                    <input id="mail_file" name="file" type="file" placeholder="Załącznik">-->
                    <h1 data-aos="fade" data-aos-duration="2000" data-aos-delay="300" id="mail_send">Wysłano do foleru log.txt!</h1>
                </form>
            </div>
        </div>
    </section>

    <!-- IKONY GŁOŚNIKA -->
    <i id="plays" class="fas fa-volume-up" onclick="changepause()"></i>
    <i id="pauses" class="fas fa-volume-mute" onclick="changeplay()"></i>
    <!-- Reserved strona autorstwo -->
        <section class="footer">
            <p><br>Wszelkie prawa do strony zastrzeżone.</p>
            <div class="icons">
                <a href="https://www.youtube.com/user/danielauta44/featured" class="href"><i class="fab fa-youtube"></i></a>
                <a href="https://www.facebook.com/d4krzyk"><i class="fab fa-facebook-f"></i></a>
                <a href="https://www.instagram.com/d4krzyk/"><i class="fab fa-instagram"></i></a>
                <a href="https://twitter.com/dankrzyk"><i class="fab fa-twitter"></i></a>
            </div>
        </section>
        <!--PUSZCZANIE AUDIO-->
        <audio id="player" loop>
            <source src="audio/background1.mp3" type="audio/mpeg">
        </audio>
        <!--Skrypty przejścia/kolorów-->
        <script src="js/index_zmiana.js"></script>
        <!--JavaScript pokaż/schowaj liste---> 
        <script src="js/wysuwanie.js"></script>
        <!-- NASLUCHIWANIE POKAZYWANIA NA SCROLL -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
        <script>AOS.init();</script>
    </body>
</html>
<?php
if($_POST['email']!="" && $_POST['name']!="" && $_POST['message']!="")
{
    $name = $_POST['name'];
    $email = $_POST['email'];
    $msg = $_POST['message'];
    $from = $email;
    $data = date("d-m-Y, H:i");
    //$subject = $_POST['subject'];
    //$mailto = "chaotycznewyrazyekspresji.site@gmail.com";
    //$filenameee =  $_FILES['file']['name'];
    //$fileName = $_FILES['file']['tmp_name']; 
    //if($filenameee == NULL)
    //$content = file_get_contents($fileName);
    //$content = chunk_split(base64_encode($content));
    // a random hash will be necessary to send mixed content
    //$separator = md5(time());
    //$eol = "\r\n";
    
    //$message = '<b>Nazwa:</b> '.$name.'<br><b>E-mail:</b> '.$email.' <p>'.$msg.'</p><br><br>';
    
    $body = "\n-------------\n";
    $body .= $data;
    $body .= "\nNazwa: ";
    $body .= $name;
    $body .= "\nE-mail: ";
    $body .= $email;
    //$body .= "\nTemat: ";
    //$body .= $subject;
    $body .= "\n";
    $body .= $msg;
    $body .= "\n-------------";
    /*nagłówek
    $headers = "From: $from $eol";
    $headers .= "Reply-to: $email $eol";
    $headers .= "MIME-Version: 1.0" . $eol;
    $headers .= "Content-Type: multipart/mixed; boundary=\"" . $separator . "\"" . $eol;
    $headers .= "Content-Transfer-Encoding: 7bit" . $eol;
    $headers .= "This is a MIME encoded message." . $eol;*/
    // wiadomosc
    //$body = "--" . $separator . $eol;
    //$body .= "Content-Type: text/plain; charset=\"iso-8859-1\"" . $eol;
    //$body .= "Content-Transfer-Encoding: 8bit" . $eol;
    //$body .= $message . $eol;
    
    $log = fopen("log.txt", "at");
    fwrite($log,$body);
    fclose($log);
     //SEND Mail
    /*if(mail($mailto, $subject, $body, $headers) ){
        echo 'succes';
    } else{
        echo 'Błąd wysyłania wiadomości! Spróbuj ponownie później.';
    }*/
}
/*else
{
    echo 'Nie wypełniono pliku. BŁĄD';
}*/
?>
