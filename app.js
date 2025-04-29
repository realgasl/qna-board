const API = 'https://script.google.com/macros/s/AKfycbzjxtSb16w6SnarXRwOH_6ItWRb0M_IMXbSAtTRzF5QFaDL43e0u8rkG-Yh75-ncpRI/exec';  // 새 exec URL

const list  = document.getElementById('list');
const sel   = document.getElementById('lectureSel');
const form  = document.getElementById('askForm');
const nameI = document.getElementById('nameInp');
const qI    = document.getElementById('qInp');
const busy  = document.getElementById('busy');

/* localStorage */
const LS_MY = 'qna_myQ', LS_LIKE = 'qna_like';
const myQ = JSON.parse(localStorage.getItem(LS_MY)||'[]');
const myL = JSON.parse(localStorage.getItem(LS_LIKE)||'[]');

/* 공통 fetch */
async function api(params){
  const url = API + '?' + new URLSearchParams(params);
  const r   = await fetch(url); if(!r.ok) throw new Error(r.status);
  return r.json();
}

/* 로딩 */
async function load(){
  list.textContent='질문을 불러오는 중…';
  try{
    const arr = await api({mode:'get',lecture:sel.value});
    if(!arr.length){list.innerHTML='<p>아직 등록된 질문이 없습니다.</p>';return;}
    list.innerHTML='';
    arr.forEach(v=>{
      const own = myQ.includes(v.id), liked = myL.includes(v.id);
      list.insertAdjacentHTML('beforeend',`
        <div class="card" data-id="${v.id}">
          <p><strong>${v.name}</strong>: <span class="q">${v.q}</span></p>
          <p>
            <button class="heart ${liked?'liked':''}">
              ❤️ <span>${v.like}</span>
            </button>
            ${own?'<button class="edit">수정</button><button class="del">삭제</button>':''}
          </p>
        </div>`);
    });
    /* 이벤트 위임 */
    list.querySelectorAll('.heart').forEach(b=>b.onclick=toggleLike);
    list.querySelectorAll('.edit').forEach(b=>b.onclick=editQ);
    list.querySelectorAll('.del').forEach(b=>b.onclick=delQ);
  }catch(e){
    list.textContent='[오류] '+e.message;
  }
}

/* 질문 추가 */
form.onsubmit = async e=>{
  e.preventDefault(); const q=qI.value.trim(); if(!q){alert('내용이 없습니다');return;}
  busy.style.display='flex';
  try{
    const d = await api({mode:'add',lecture:sel.value,name:nameI.value,q});
    myQ.push(d.id); localStorage.setItem(LS_MY,JSON.stringify(myQ));
    nameI.value=''; qI.value=''; await load();
  }finally{busy.style.display='none';}
};

/* 좋아요 */
async function toggleLike(e){
  const btn=e.currentTarget, card=btn.closest('.card'), id=card.dataset.id;
  const liked=btn.classList.contains('liked');
  const d = await api({mode:'like',id,delta:liked?-1:1});
  btn.classList.toggle('liked');
  btn.querySelector('span').textContent=d.like;
  if(liked) myL.splice(myL.indexOf(id),1); else myL.push(id);
  localStorage.setItem(LS_LIKE,JSON.stringify(myL));
}

/* ---- 모달 (수정/삭제) ---- */
const modal   = document.getElementById('modal');
const modalIn = document.getElementById('modalIn');
let modalOkCB = null;
document.getElementById('mCancel').onclick = ()=>{modal.style.display='none';};
document.getElementById('mOk').onclick = ()=>{ if(modalOkCB) modalOkCB(); };

function openModal(text, ok){
  modalIn.value=text; modal.style.display='flex'; modalIn.focus(); modalOkCB = ok;
}

/* 수정 */
function editQ(e){
  const card=e.currentTarget.closest('.card'), id=card.dataset.id,
        qEl=card.querySelector('.q'), cur=qEl.textContent;
  openModal(cur, async ()=>{
    const next=modalIn.value.trim(); if(!next||next===cur){modal.style.display='none';return;}
    await api({mode:'edit',id,q:next}); modal.style.display='none'; load();
  });
}

/* 삭제 */
function delQ(e){
  if(!confirm('정말 삭제하시겠습니까?')) return;
  const id=e.currentTarget.closest('.card').dataset.id;
  api({mode:'del',id}).then(()=>{
    myQ.splice(myQ.indexOf(id),1); localStorage.setItem(LS_MY,JSON.stringify(myQ));
    load();
  });
}

/* init */
sel.onchange=load;
window.onload=load;
