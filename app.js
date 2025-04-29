const API = 'https://script.google.com/macros/s/AKfycbzjxtSb16w6SnarXRwOH_6ItWRb0M_IMXbSAtTRzF5QFaDL43e0u8rkG-Yh75-ncpRI/exec';  // 새 exec URL

const list   = document.getElementById('list');
const sel    = document.getElementById('lectureSel');
const form   = document.getElementById('askForm');
const nameIn = document.getElementById('nameInp');
const qIn    = document.getElementById('qInp');

/*  LocalStorage  */
const MYQ_LS = 'qna_myQ', LIKE_LS = 'qna_like';
const myQ  = JSON.parse(localStorage.getItem(MYQ_LS)||'[]');
const myL  = JSON.parse(localStorage.getItem(LIKE_LS)||'[]');

/* ------- load & render ------- */
function load(){
  list.textContent='질문을 불러오는 중…';
  fetch(`${API}?mode=get&lecture=${encodeURIComponent(sel.value)}`)
    .then(r=>r.json()).then(render).catch(err=>{
      list.textContent='[오류] '+err.message;
    });
}
function render(arr){
  if(!arr.length){list.innerHTML='<p>아직 등록된 질문이 없습니다.</p>';return;}
  list.innerHTML='';
  arr.forEach(v=>{
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML=`
      <p><strong>${v.name}</strong>: ${v.q}</p>
      <p>
        <button class="heart ${myL.includes(v.id)?'liked':''}" data-id="${v.id}">
          ❤️ <span>${v.like}</span>
        </button>
      </p>`;
    card.querySelector('.heart').onclick = toggleLike;
    list.appendChild(card);
  });
}

/* ------- 제출 ------- */
form.onsubmit = e=>{
  e.preventDefault();
  const q = qIn.value.trim(); if(!q){alert('질문을 입력하세요');return;}
  fetch(`${API}?mode=add&lecture=${encodeURIComponent(sel.value)}&name=${encodeURIComponent(nameIn.value)}&q=${encodeURIComponent(q)}`)
    .then(r=>r.json()).then(d=>{
      myQ.push(d.id); localStorage.setItem(MYQ_LS,JSON.stringify(myQ));
      nameIn.value=''; qIn.value=''; load();
    });
};

/* ------- 좋아요 ------- */
function toggleLike(e){
  const btn = e.currentTarget, id = btn.dataset.id;
  const liked = btn.classList.contains('liked');
  fetch(`${API}?mode=like&id=${id}&delta=${liked?-1:1}`)
    .then(r=>r.json()).then(d=>{
      btn.classList.toggle('liked');
      btn.querySelector('span').textContent = d.like;
      if(liked) myL.splice(myL.indexOf(id),1); else myL.push(id);
      localStorage.setItem(LIKE_LS,JSON.stringify(myL));
    });
}

/* init */
sel.onchange = load;
window.onload = load;
