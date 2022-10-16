const menuToggle = document.querySelector('.toggle');
const showcase = document.querySelector('.showcase');
const video = document.querySelector('video');
const menu = document.querySelector('.menu');
const container = document.querySelector('.container');

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

$(".container").hover(function(){
    $(this).find('h2, p').css({"color": color[Math.floor(Math.random() * color.length)], "transition": "0.5s"});
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

