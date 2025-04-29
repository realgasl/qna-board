const API = 'https://script.google.com/macros/s/AKfycbzjxtSb16w6SnarXRwOH_6ItWRb0M_IMXbSAtTRzF5QFaDL43e0u8rkG-Yh75-ncpRI/exec'; // ← 배포된 GAS URL
const list = document.getElementById('list');
const sel  = document.getElementById('lectureSel');

function load(){
  fetch(`${API}?mode=get&lecture=${encodeURIComponent(sel.value)}`)
    .then(r=>r.json())
    .then(render)
    .catch(console.error);
}
function render(arr){
  list.innerHTML = arr.map(v=>`<p>${v.name}: ${v.q}</p>`).join('');
}
sel.onchange = load;
window.onload = load;
