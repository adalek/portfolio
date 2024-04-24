const menuToggle = document.querySelector('.toggle');
const showcase = document.querySelector('.showcase');
const menu = document.querySelector('.menu');
const container = document.querySelector('.container');
const containerall = document.querySelectorAll('.container');
const backgroundimg = document.querySelector('#backgroundimg');
const srclist = ["https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHdoNWNva2txYTJnenljZjh4cTljNTB4azR5Zjg0cXN2bXlqZjlheCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JfY9AKtUxBC0RvciB5/giphy.gif","https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTJoYXFlbHc0aXZzeTE3OHFpeWNxanJwNjZsOGIyY3l1dndlMHBzbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/75epjnrY0ql0kJN34d/giphy.gif","https://media.giphy.com/media/RV4j4cZR76nZhoTu6m/giphy.gif","https://media.giphy.com/media/uCwKPaIqlDxDRuBPBZ/giphy.gif","https://media.giphy.com/media/TZDbsuOhXabEP8YhlR/giphy.gif","https://media.giphy.com/media/dPIsG7MPxP8PA2LGtZ/giphy.gif","https://media.giphy.com/media/o01myFqXAMXJtFX67K/giphy.gif","https://media.giphy.com/media/kP75uYxIsUpVIPPbdb/giphy.gif","https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif","https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"];

const menuBtn = document.querySelector('.menu-btn');
let menuOpen = false;
const color = ["pink", "blue","green","yellow","red","orange"];

menuToggle.addEventListener('click', function(){
//   menuToggle.classList.toggle('active');
  showcase.classList.toggle('active');
  menu.classList.toggle('active');
  if(!menuOpen) {
    menuBtn.classList.add('open');
    menuOpen = true;
  } else {
    menuBtn.classList.remove('open');
    menuOpen = false;
  }
});

for (i=0; i<containerall.length; i++){
  containerall[i].setAttribute("src",srclist[i]);
}

$(".container").hover(function(){
    $(this).find('h2, p').css({"color": color[Math.floor(Math.random() * color.length)], "transition": "0.5s"});
    console.log($(this).attr("src"));
    backgroundimg.src = $(this).attr("src");
},function(){
    $(this).find('h2, p').css("color", "white");
}
)

$('.menu li').hover(function(){
    $(this).find('a').css({"color": color[Math.floor(Math.random() * color.length)], "transition": "0.5s"});
},function(){
    $(this).find('a').css("color", "white");
}
)

// $(window).scroll(function(){
//     $('.showcase video').css({
//         'top': $(this).scrollTop() + 0 
//     });
// });



