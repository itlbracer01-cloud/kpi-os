
document.querySelectorAll('.glass').forEach((card)=>{

card.addEventListener('mousemove',(e)=>{

const rect = card.getBoundingClientRect();

const x = e.clientX - rect.left;
const y = e.clientY - rect.top;

const rotateX = ((y / rect.height)-0.5) * -4;
const rotateY = ((x / rect.width)-0.5) * 4;

card.style.transform = `
perspective(1200px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-2px)
`;

});

card.addEventListener('mouseleave',()=>{

card.style.transform = '';

});

});
