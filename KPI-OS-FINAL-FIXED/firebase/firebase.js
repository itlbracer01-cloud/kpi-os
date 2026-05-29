import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ======================
// FIREBASE CONFIG
// ======================

const firebaseConfig = {
  apiKey: "AIzaSyCJ_Jzeb4D6UmN49h1WFQcaVbZv1GWaeV8",
  authDomain: "kpi-os-reminder.firebaseapp.com",
  projectId: "kpi-os-reminder",
  storageBucket: "kpi-os-reminder.firebasestorage.app",
  messagingSenderId: "151457799603",
  appId: "1:151457799603:web:e764e478a4225ba939bfc6",
  measurementId: "G-HH9J4YBSQ5"
};

// ======================
// INIT
// ======================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// ======================
// ELEMENTS
// ======================

const loginBtn =
document.getElementById('login-btn');

const logoutBtn =
document.getElementById('logout-btn');

const userInfo =
document.getElementById('user-info');

const container =
document.getElementById('kpi-container');

// ======================
// USER
// ======================

let currentUser = null;

// ======================
// NOTIFICATION
// ======================

if ('Notification' in window) {

  Notification.requestPermission();

}

// ======================
// LOGIN
// ======================

loginBtn.addEventListener(
'click',
async()=>{

try{

await signInWithPopup(
auth,
provider
);

}catch(err){

console.error(err);

alert(err.message);

}

}
);

// ======================
// LOGOUT
// ======================

logoutBtn.addEventListener(
'click',
async()=>{

await signOut(auth);

}
);

// ======================
// AUTH STATE
// ======================

onAuthStateChanged(
auth,
(user)=>{

if(user){

currentUser = user;

userInfo.innerHTML =
'👋 ' + user.displayName;

loadKPIs(user.uid);

}else{

currentUser = null;

userInfo.innerHTML =
'Guest';

container.innerHTML = `
<div class="empty-card glass">
Login เพื่อเริ่ม Sync KPI
</div>
`;

}

}
);

// ======================
// LOAD KPI
// ======================

function loadKPIs(uid){

onSnapshot(

collection(
db,
'users',
uid,
'kpis'
),

(snapshot)=>{

container.innerHTML='';

snapshot.forEach((item)=>{

const data = item.data();

container.innerHTML += `

<div class="card glass">

<h3>
${data.month}
</h3>

<div class="metric">
${data.year}
</div>

<p>
สถานะ:
${data.status}
</p>

</div>

`;

});

}

);

}

// ======================
// SEND + CANCEL KPI
// ======================

document.addEventListener(
'click',
async(e)=>{

// ======================
// SEND KPI
// ======================

if(
e.target.classList.contains(
'month-send-btn'
)
){

if(!currentUser){

alert('กรุณา Login');
return;

}

const month =
e.target.dataset.month;

const year =
e.target.dataset.year;

// Prevent duplicate KPI

const checkQuery = query(

collection(
db,
'users',
currentUser.uid,
'kpis'
),

where('month','==',month),
where('year','==',year)

);

const existing =
await getDocs(checkQuery);

if(!existing.empty){

alert('ส่ง KPI เดือนนี้แล้ว');
return;

}

// SAVE KPI

await addDoc(

collection(
db,
'users',
currentUser.uid,
'kpis'
),

{
month,
year,
status:'sent',
createdAt:serverTimestamp()
}

);

alert(
`ส่ง KPI ${month} ${year} สำเร็จ`
);

// Notification

if(
Notification.permission === 'granted'
){

new Notification(
'KPI OS',
{
body:
`ส่ง KPI ${month} ${year} แล้ว`
}
);

}

}

// ======================
// CANCEL KPI
// ======================

if(
e.target.classList.contains(
'month-cancel-btn'
)
){

if(!currentUser){

alert('กรุณา Login');
return;

}

const month =
e.target.dataset.month;

const year =
e.target.dataset.year;

const q = query(

collection(
db,
'users',
currentUser.uid,
'kpis'
),

where('month','==',month),
where('year','==',year)

);

const snapshot =
await getDocs(q);

snapshot.forEach(async(item)=>{

await deleteDoc(

doc(
db,
'users',
currentUser.uid,
'kpis',
item.id
)

);

});

alert(
`ยกเลิก KPI ${month} ${year}`
);

// Notification

if(
Notification.permission === 'granted'
){

new Notification(
'KPI OS',
{
body:
`ยกเลิก KPI ${month} ${year}`
}
);

}

}

}
);

// ======================
// SERVICE WORKER
// ======================

if('serviceWorker' in navigator){

navigator.serviceWorker.register(
'./sw.js'
);

}