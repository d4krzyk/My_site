var bloodwords = document.getElementById("main_motto");
            var mutedaudio = document.getElementById("player");
            var soundup = document.getElementById("plays");
            var soundmute = document.getElementById("pauses");
            var lightshadow = document.getElementById("navLinks");
            var cwe_main = document.getElementById("cwe_m");
            function changeplay()
            {
                soundup.style.color = "rgb(73, 6, 6, 1)";
                soundmute.style.color = "rgba(73, 6, 6, 0)";
                soundup.style.bottom = "3%";
                soundmute.style.bottom = "10%";
                lightshadow.style.boxShadow = "0 12px 32px 0 rgb(53, 13, 13)";
                cwe_main.style.color = "rgb(151, 13, 13)";
                bloodwords.style.color = "rgb(149, 12, 12)";
                player.play();
            }
            function changepause()
            {
                soundup.style.color = "rgba(255, 255, 255, 0)";
                soundmute.style.color = "rgb(255, 255, 255, 1)";
                soundup.style.bottom = "-10%";
                soundmute.style.bottom = "3%";
                lightshadow.style.boxShadow = "0 12px 32px 0 rgb(255, 255, 255)";
                cwe_main.style.color = "rgb(255, 255, 255)";
                bloodwords.style.color = "rgb(255, 255, 255)";
                player.pause();
            }