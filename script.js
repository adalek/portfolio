const menuToggle = document.querySelector('.toggle');
const showcase = document.querySelector('.showcase');
const menu = document.querySelector('.menu');
const container = document.querySelector('.container');
const containerall = document.querySelectorAll('.container');
const backgroundimg = document.querySelector('#backgroundimg');
const img1 = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeHdoNWNva2txYTJnenljZjh4cTljNTB4azR5Zjg0cXN2bXlqZjlheCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JfY9AKtUxBC0RvciB5/giphy.gif";
const img2 = "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTJoYXFlbHc0aXZzeTE3OHFpeWNxanJwNjZsOGIyY3l1dndlMHBzbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/75epjnrY0ql0kJN34d/giphy.gif";
const img3 = "https://media.giphy.com/media/RV4j4cZR76nZhoTu6m/giphy.gif";
const img4 = "https://media.giphy.com/media/uCwKPaIqlDxDRuBPBZ/giphy.gif";
const img5 = "https://media.giphy.com/media/TZDbsuOhXabEP8YhlR/giphy.gif";
const img6 = "https://media.giphy.com/media/dPIsG7MPxP8PA2LGtZ/giphy.gif";
const img7 = "https://media.giphy.com/media/o01myFqXAMXJtFX67K/giphy.gif";
const img8 = "https://media.giphy.com/media/kP75uYxIsUpVIPPbdb/giphy.gif";
const donnut = "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif";
const cat = "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif";
const ghost = "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDB0bW45cnJ6NHUxbXJ1ZDN0N3ZjNzlyeTNjazE3cXlieTJ5bzk4MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HcfTCAUxmUb65ho5hh/giphy.gif";
const sendrome ="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExazhjc29vdGxsMjliNTZtMHZyMHpjendmbmg3d2ZsN3o5ZWFlZ3F1byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xGv9DI65ZvZBDDSnBQ/giphy.gif";

const srclist = [ghost,sendrome,img1,img2,img3,img4,img2,donnut,cat];

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


$(document).ready(function() {
  $('.gallery img').click(function() {
      var imgSrc = $(this).attr('src');
      $('#overlay-img').attr('src', imgSrc);
      $('#overlay').fadeIn();
  });

  $('#overlay').click(function() {
      $(this).fadeOut();
  });
});

$(document).ready(function() {
  $('.gallery img').click(function() {
      var imgSrc = $(this).attr('src');
      $('.overlay-img').attr('src', imgSrc);
      $('.overlay').fadeIn();
  });

  $('.overlay').click(function() {
      $(this).fadeOut();
  });
});
