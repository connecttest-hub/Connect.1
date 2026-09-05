// ==========================================================================
// STEP 1: Firebase Core Initialization & SDK CDN Imports
// ==========================================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    sendPasswordResetEmail, 
    signOut, 
    onAuthStateChanged, 
    updateProfile,
    setPersistence,
    sendEmailVerification,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    doc, 
    updateDoc, 
    where, 
    setDoc,
    getDoc,
    getDocs,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your verified web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtejWDo32cOOd2fSYGeXtws8AUPdUPfdY",
  authDomain: "connect-official-26.firebaseapp.com",
  databaseURL: "https://connect-official-26-default-rtdb.firebaseio.com",
  projectId: "connect-official-26",
  storageBucket: "connect-official-26.firebasestorage.app",
  messagingSenderId: "85439608910",
  appId: "1:85439608910:web:54c285610cee14c8486b1f",
  measurementId: "G-QJPDESY57R"
};

// Initialize Firebase Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); 
const db = getFirestore(app); 
const provider = new GoogleAuthProvider();

// Auto Select Account for Google Auth
provider.setCustomParameters({ prompt: 'select_account' });

// Global Session Variables
window.app = app;
window.auth = auth;
window.db = db;
window.getDoc = getDoc;
window.getDocs = getDocs;
window.provider = provider;

window.currentUser = null; 
window.activeChatRoomId = null; 
window.unsubscribeChats = null; 
window.unsubscribeInbox = null; 
window.allRegisteredUsersCache = [];

// Auth Functions attached to Window for easy access
window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
window.signInWithEmailAndPassword = signInWithEmailAndPassword;
window.signInWithPopup = signInWithPopup;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;
window.updateProfile = updateProfile;
window.sendEmailVerification = sendEmailVerification;

window.sendPasswordResetEmail = sendPasswordResetEmail;

window.collection = collection;
window.addDoc = addDoc;
window.query = query;
window.orderBy = orderBy;
window.onSnapshot = onSnapshot;
window.doc = doc;
window.updateDoc = updateDoc;
window.where = where;
window.setDoc = setDoc;
window.serverTimestamp = serverTimestamp;
// ==========================================================================
// STEP 2: Global View Navigator & Navigation Bug Fixes
// ==========================================================================
window.showScreen = function(id) {
    document.querySelectorAll('.app-screen').forEach(s => s.style.display = 'none');
    const t = document.getElementById(id); 
    if(t) { t.style.display = 'flex'; t.style.flexDirection = 'column'; }
};

window.toggleMenu = function() {
    const drawer = document.getElementById('sideDrawer');
    const backdrop = document.getElementById('menuBackdrop');
    if(drawer) drawer.classList.toggle('open');
    if(backdrop) backdrop.classList.toggle('active');
};

// Fixed welcome screens click triggers handler
window.bindAppWelcomeActionButtons = function() {
    const signupBtn = document.getElementById("welcomeSignupBtn"); 
    const loginBtn = document.getElementById("welcomeLoginBtn");
    const gotoSignup = document.getElementById("loginGotoSignupLink"); 
    const gotoLogin = document.getElementById("signupGotoLoginLink");
    
    if (signupBtn) signupBtn.onclick = () => window.showScreen("signup-view");
    if (loginBtn) loginBtn.onclick = () => window.showScreen("login-view");
    if (gotoSignup) gotoSignup.onclick = () => window.showScreen("signup-view");
    if (gotoLogin) gotoLogin.onclick = () => window.showScreen("login-view");
};

// Authentication Engine Pipelines
window.handleEmailSignup = async function(e, p, name) {
    if (!e || !p || !name) { alert("Please fill all fields!"); return; }
  
  
  
  
    try {
    const authObj = window.auth || auth;
    const dbObj = window.db || db;

    // ১. কাস্টম ইউজারনেম ফরম্যাট চেক (ইউজারনেম ভ্যারিয়েবলটি আপনার ফাংশনের আর্গুমেন্ট থেকে আসতে হবে)
    // যদি আপনার সাইন-আপ ফাংশনে ইউজারনেম ফিল্ডের নাম আলাদা হয় (যেমন `u`), তবে এখানে সেই নাম দিন
    const userNm = typeof username !== 'undefined' ? username : name.toLowerCase().replace(/\s+/g, '');
    const formattedUsername = userNm.startsWith('@') ? userNm : `@${userNm}`;

    // ২. একই ইউজারনেম ডাটাবেজে অলরেডি আছে কিনা তা চেক করা (Unique Username Check)
    const q = window.query(window.collection(dbObj, "users"), window.where("username", "==", formattedUsername));
    const querySnapshot = await window.getDocs(q);
    if (!querySnapshot.empty) {
      alert("This username is already taken! Please choose another one.");
      return;
    }

    // ৩. ফায়ারবেস অথেন্টিকেশনে ইউজার অ্যাকাউন্ট তৈরি
    const res = await window.createUserWithEmailAndPassword(authObj, e, p);

    // ৪. নতুন তৈরি হওয়া ইউজারের ইমেইলে ভেরিফিকেশন লিংক পাঠানো
    await window.sendEmailVerification(res.user);
    alert("A verification link has been sent to your email. Please verify your account before logging in!");

    // ৫. প্রোফাইলে ডিসপ্লে নেম আপডেট করা
    await window.updateProfile(res.user, { displayName: name });

const randomAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${res.user.uid}`;


    // ৬. ফায়ারস্টোর ডাটাবেজে ইউজারনেম সহ প্রোফাইল সেভ করা
    await window.setDoc(window.doc(dbObj, "users", res.user.uid), {
      uid: res.user.uid,
      username: formattedUsername, // ডাটাবেজে @mahi123 আকারে সেভ হবে
      name: name,
      email: e,
      avatar: randomAvatar
    });

    // ৭. ইমেইল ভেরিফাই না করা পর্যন্ত তাকে চ্যাটে ঢুকতে না দিয়ে লগআউট করে দেওয়া
    await window.signOut(authObj);

  } catch (err) {
    alert(err.message);
  }
};
  
  
  
  

window.handleEmailLogin = async function(e, p) {
  if (!e || !p) { 
    window.showCustomAlert("Please enter email and password!"); 
    return; 
  }
  try {
    const authObj = window.auth || auth;
    const res = await window.signInWithEmailAndPassword(authObj, e, p);
    
    if (!res.user.emailVerified) {
      window.showCustomAlert("Please verify your email first! A verification link was sent to your email during sign up.");
      await window.signOut(authObj);
      return;
    }
    
    // লগইন সফল হলে আপনার অ্যাপের স্ক্রিন দেখানোর ফাংশন (যেমন window.showScreen('chat-view'))
    if (window.showScreen) window.showScreen('chat-view');

  } catch (err) { 
    window.showCustomAlert(err.message); 
  }
};





window.handleGoogleLogin = async function() {
    try {
        const authObj = window.auth || auth;
        const dbObj = window.db || db;
        const providerObj = window.provider || provider;
        
        const r = await window.signInWithPopup(authObj, providerObj);
        const avatarUrl = r.user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${r.user.uid}`;
        
        await window.setDoc(window.doc(dbObj, "users", r.user.uid), { 
            uid: r.user.uid, 
            name: r.user.displayName, 
            email: r.user.email, 
            avatar: avatarUrl 
        }, { merge: true });
    } catch (e) { alert(e.message); }
};



// আপডেটেড কাস্টম অ্যালার্ট সহ পাসওয়ার্ড রিসেট ফাংশন
window.handleForgotPasswordReset = async function() {
  const emailInput = document.getElementById('forgotEmailInput');
  if (!emailInput) return;

  const email = emailInput.value.trim();

  if (!email) {
    window.showCustomAlert("Please enter your email address first!");
    return;
  }

  try {
    const authObj = window.auth || (typeof auth !== 'undefined' ? auth : null) || (window.getAuth ? window.getAuth() : null);
    if (!authObj) return;

    await window.sendPasswordResetEmail(authObj, email);
    
    // ব্রাউজারের alert() তুলে দিয়ে কাস্টম মোডাল ট্রিগার করা হলো
    window.showCustomAlert("A password reset link has been successfully sent to your email. Please check your inbox!");
    
    emailInput.value = "";
  } catch (error) {
    window.showCustomAlert(error.message);
  }
};





// ১. কাস্টম অ্যালার্ট মোডাল দেখানোর ফাংশন
window.showCustomAlert = function(message) {
  const modal = document.getElementById('customAlertModal');
  const msgText = document.getElementById('customAlertMessage');
  if (modal && msgText) {
    msgText.innerText = message;
    modal.style.display = 'flex';
  } else {
    console.log("Alert:", message);
  }
};

// ২. কাস্টম অ্যালার্ট বন্ধ করার ফাংশন
window.closeCustomAlert = function() {
  const modal = document.getElementById('customAlertModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// ৩. পাসওয়ার্ড রিসেট সফল হওয়ার পর লগইন স্ক্রিনে ব্যাক করার হ্যান্ডলার
window.handlePasswordResetSuccess = function() {
  // অ্যালার্ট মোডালটি বন্ধ করা
  window.closeCustomAlert();
  
  // পাসওয়ার্ড রিসেটের ইনপুট ফিল্ড ক্লিয়ার করা
  const forgotEmailInput = document.getElementById('forgotEmailInput');
  if (forgotEmailInput) {
    forgotEmailInput.value = "";
  }
  
  // লগইন স্ক্রিনে রিডাইরেক্ট করা
  if (typeof window.showScreen === 'function') {
    window.showScreen('login-view');
  }
};









window.confirmLogout = function() { 
    window.toggleMenu(); 
    const dialog = document.getElementById('logoutDialog');
    if (dialog) dialog.style.display = 'flex'; 
};

window.closeLogoutDialog = function() { 
    const dialog = document.getElementById('logoutDialog');
    if (dialog) dialog.style.display = 'none'; 
};

window.executeLogout = async function() { 
    try { 
        if (window.unsubscribeChats) window.unsubscribeChats();
        if (window.unsubscribeInbox) window.unsubscribeInbox();
        
        const authObj = window.auth || auth;
        await window.signOut(authObj); 
        window.closeLogoutDialog(); 
        window.showScreen('welcome-view'); 
    } catch (e) { alert(e.message); } 
};










// ==========================================================================
// STEP 3 (PART 1): User Session Stream Tracker & Inbox List Loader
// ==========================================================================
window.onAuthStateChanged(window.auth, (user) => {
    if (typeof window.bindAppWelcomeActionButtons === 'function') {
        window.bindAppWelcomeActionButtons();
    }
    if (user) {
        window.currentUser = user;
        const defaultAvatar = `https://dicebear.com{user.uid}`;
        const displayAvatar = document.getElementById('userDisplayAvatar');
        const cardImg = document.getElementById('profileCardImg');
        const cardName = document.getElementById('profileCardName');
        const cardEmail = document.getElementById('profileCardEmail');





    // প্রোফাইলে কাস্টম ইউজারনেম ডাইনামিক রেন্ডার করার শতভাগ কার্যকরী কোড
    const cardUsername = document.getElementById('profileCardUsername');
    const authObj = window.auth || auth;
    const dbObj = window.db || db;
    const docFn = window.doc || doc;
    const getDocFn = window.getDoc || getDoc;

    if (authObj && authObj.currentUser && cardUsername && getDocFn && docFn) {
      getDocFn(docFn(dbObj, "users", authObj.currentUser.uid)).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // ডাটাবেজে ইউজারনেম থাকলে তা দেখাবে, না থাকলে নামের ওপর ভিত্তি করে একটা অটো জেনারেট করবে
          cardUsername.innerText = userData.username || `@${authObj.currentUser.displayName.toLowerCase().replace(/\s+/g, '')}`;
        }
      }).catch((err) => console.error("Username load error:", err));
    }






        if (displayAvatar) displayAvatar.src = user.photoURL || defaultAvatar;
        if (cardImg) cardImg.src = user.photoURL || defaultAvatar;
        if (cardName) cardName.innerText = user.displayName || "Connect User";
        if (cardEmail) cardEmail.innerText = user.email;

        window.showScreen('inbox-view'); 
        listenToActiveConversationsList(); 
        loadRegisteredUsersNetwork();
    } else {
        window.currentUser = null; 
        window.showScreen('welcome-view');
    }
});

const floatingPeopleBtn = document.getElementById('floatingPeopleBtn');
if (floatingPeopleBtn) { 
    floatingPeopleBtn.onclick = () => window.showScreen('people-sheet-view'); 
}

function loadRegisteredUsersNetwork() {
    if (!window.currentUser) return;
    window.onSnapshot(window.collection(window.db, "users"), (snapshot) => {
        window.allRegisteredUsersCache = []; 
        snapshot.forEach((uDoc) => { 
            const d = uDoc.data(); 
            if (window.currentUser && d.uid !== window.currentUser.uid) {
                window.allRegisteredUsersCache.push(d); 
            }
        });
        renderUsersList(window.allRegisteredUsersCache, 'registeredUsersContainer');
    });
}

const searchInput = document.querySelector('.search-box input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const keyword = e.target.value.toLowerCase().trim();
        const filtered = window.allRegisteredUsersCache.filter(u => {
            const nameMatch = u.name ? u.name.toLowerCase().includes(keyword) : false;
            const uidMatch = u.uid ? u.uid.toLowerCase().includes(keyword) : false;
            return nameMatch || uidMatch;
        });
        const view = document.getElementById('people-sheet-view');
        if (view && view.style.display !== 'none') { 
            renderUsersList(filtered, 'registeredUsersContainer'); 
        } else { 
            renderUsersList(filtered, 'activeChatList'); 
        }
    });
}

function renderUsersList(arr, targetId) {
    const container = document.getElementById(targetId); 
    if (!container) return; 
    container.innerHTML = "";
    if (arr.length === 0) { 
        container.innerHTML = '<p style="color:#64748b; text-align:center; margin-top:40px; font-size:14px;">No matching accounts found. 🔍</p>'; 
        return; 
    }




  // চ্যাট লিস্ট ও ইনবক্স রেন্ডার করার ১০০% ফিক্সড কোড
  container.innerHTML = ""; // আগের লিস্ট সম্পূর্ণ ক্লিয়ার করা হলো

  arr.forEach((u) => {
    // কারেন্ট লগইন করা ইউজার যেন চ্যাট লিস্টে নিজের আইডি না দেখতে পায়
    if (window.currentUser && u.uid === window.currentUser.uid) return;

    const item = document.createElement('div');
    item.className = "chat-item";
    
    // সিএসএস ফিক্স: ছবি ও লেখার জ্যাম দূর করতে ইনলাইন ফ্ল্যাক্স লেআউট
    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.padding = "12px 16px";
    item.style.cursor = "pointer";
    item.style.borderBottom = "1px solid #1e293b";

    // বাটন ক্লিক করলেই কেবল চ্যাট বক্স ওপেন হবে, লগইন করার সাথে সাথে অটোমেটিক ওপেন হবে না
    item.onclick = (e) => {
      e.stopPropagation(); // অটো-ফায়ারিং বা অন্য ইভেন্টের ব্লকিং আটকানোর জন্য
      window.openChat(u.name, u.avatar || '', u.uid);
    };

    // শতভাগ কার্যকরী ফ্রি প্রফেশনাল অবতার এপিআই
    const avatarSrc = u.avatar && u.avatar.trim() !== "" 
      ? u.avatar 
      : `https://dicebear.com{u.uid}`;

    const uidDisplay = u.uid ? u.uid.substring(0, 8) : 'Connect';

    // ইমেজ ট্যাগের হাইট-উইডথ এবং মার্জিন ফিক্স করা হলো যাতে ২য় স্ক্রিনশটের মতো ভেঙে লেপ্টে না যায়
    item.innerHTML = `
      <div class="chat-avatar-wrapper" style="position: relative; width: 48px; height: 48px; margin-right: 14px; flex-shrink: 0;">
        <img src="${avatarSrc}" onerror="this.onerror=null; this.src='https://dicebear.com{u.uid}';" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: #1e293b;" alt="User">
        <span class="online-indicator" style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #22c55e; border: 2px solid #0f172a; border-radius: 50%;"></span>
      </div>
      <div class="chat-info" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; text-align: left;">
        <h3 style="margin: 0 0 4px 0; color: #fff; font-size: 1rem; font-weight: 600;">${u.name || 'User'}</h3>
        <p class="chat-preview" style="margin: 0; color: #64748b; font-size: 0.85rem;">UID: ${uidDisplay}...</p>
      </div>
    `;

    container.appendChild(item);
  });




}
// ==========================================================================
// STEP 3 (PART 2): Realtime Message Listener & Message Sender (Fully Fixed)
// ==========================================================================
function listenToActiveConversationsList() {
    const list = document.getElementById('activeChatList');
    if (!list || !window.currentUser) return;
    if (window.unsubscribeInbox) window.unsubscribeInbox();

    window.unsubscribeInbox = window.onSnapshot(window.collection(window.db, "messages"), (snapshot) => {
        const uniqueRooms = {}; 
        snapshot.forEach((mDoc) => { 
            const d = mDoc.data(); 
            if (d.roomId && window.currentUser && d.roomId.includes(window.currentUser.uid)) {
                if (!uniqueRooms[d.roomId]) {
                    uniqueRooms[d.roomId] = d;
                } else {
                    const currentTime = d.timestamp?.toDate ? d.timestamp.toDate() : new Date();
                    const existingTime = uniqueRooms[d.roomId].timestamp?.toDate ? uniqueRooms[d.roomId].timestamp.toDate() : new Date(0);
                    if (currentTime > existingTime) {
                        uniqueRooms[d.roomId] = d;
                    }
                }
            }
        });

        if (searchInput && searchInput.value.trim() !== "") return; 
        
        // ফিক্স: নেস্টেড লুপ বাদ দিয়ে ক্যাশ থেকে ইউজার ডাটা নেওয়া হয়েছে (RPC Error ফিক্স)
        list.innerHTML = "";
        let hasHistory = false;
        const usersCache = window.allRegisteredUsersCache || [];
        
        usersCache.forEach((uData) => {
            Object.keys(uniqueRooms).forEach(roomId => {
                if (window.currentUser && roomId.includes(uData.uid) && uData.uid !== window.currentUser.uid) {
                    hasHistory = true;
                    const lastMsg = uniqueRooms[roomId]; 

    const item = document.createElement('div');
    item.className = "chat-item";
    
    // ইভেন্ট বাবলিং আটকাতে এবং অটো-ফায়ারিং বন্ধ করতে (e) অপারেটর এবং e.stopPropagation() লক করা হলো
    item.onclick = (e) => {
      if (e) e.stopPropagation();
      window.openChat(uData.name, uData.avatar || '', uData.uid);
    };



                    const avatarSrc = uData.avatar || `https://dicebear.com{uData.uid}`;
                    item.innerHTML = `<div class="chat-avatar"><img src="${avatarSrc}"><span class="online-indicator"></span></div><div class="chat-info"><div class="chat-name-row"><h3>${uData.name}</h3></div><p class="chat-preview">${lastMsg.text}</p></div>`;
                    list.appendChild(item);
                }
            });
        });
        if (!hasHistory) {
            list.innerHTML = '<p style="color:#64748b; text-align:center; margin-top:40px; font-size:14px;">No histories.<br>Click 💬 below to start chat!</p>';
        }
    });
}

window.openChat = function(friendName, avatarUrl, friendUid) {
    const nameElem = document.getElementById('chatUserName');
    const imgElem = document.getElementById('chatUserImg');
    if (nameElem) nameElem.innerText = friendName; 
    if (imgElem) imgElem.src = avatarUrl || `https://dicebear.com{friendUid}`;
    if (searchInput) searchInput.value = ""; 
    const myId = window.currentUser.uid;
    window.activeChatRoomId = myId < friendUid ? `${myId}_${friendUid}` : `${friendUid}_${myId}`;
    window.showScreen('chat-view'); 
    loadRealtimeMessages(window.activeChatRoomId);
};

function loadRealtimeMessages(roomId) {
    if (window.unsubscribeChats) window.unsubscribeChats(); 
    const messagesArea = document.querySelector('.chat-messages-area');
    if (!messagesArea) return;

    const q = window.query(window.collection(window.db, "messages"), window.where("roomId", "==", roomId));
    
    window.unsubscribeChats = window.onSnapshot(q, (snapshot) => {
        messagesArea.innerHTML = '<div class="chat-date-separator">Today</div>';
        const messagesList = [];
        snapshot.forEach((mDoc) => {
            messagesList.push({ id: mDoc.id, ...mDoc.data() });
        });

        messagesList.sort((a, b) => {
            const timeA = a.timestamp?.toDate ? a.timestamp.toDate() : (a.timestamp ? new Date(a.timestamp) : new Date());
            const timeB = b.timestamp?.toDate ? b.timestamp.toDate() : (b.timestamp ? new Date(b.timestamp) : new Date());
            return timeA - timeB;
        });

        messagesList.forEach((data) => {
            const isOutgoing = window.currentUser && data.senderId === window.currentUser.uid;
            const msgRow = document.createElement('div'); 
            msgRow.className = `msg-row ${isOutgoing ? 'msg-outgoing' : 'msg-incoming'}`;
            let displayStyle = data.isUnsent ? 'style="font-style: italic; opacity: 0.5; background: #1f2937; color: #64748b; box-shadow: none;"' : '';
            let timeString = "Just now";
            if (data.timestamp) {
                const dateObj = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                timeString = dateObj.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            }
            
            
            
        // --- ফাইনাল জিরো-টলারেন্স মেসেজ ব্লুপ্রিন্ট ইঞ্জিন শুরু ---
        const currentUserId = window.currentUser ? window.currentUser.uid : '';

        // শর্ত ১: মেসেজটি যদি আমি নিজে আনসেন্ড করি OR বন্ধু যদি আনসেন্ড/ডিলিট করে থাকে
        if (data.isUnsent === true || (data.deletedBy && data.deletedBy[currentUserId] === true)) {
          data.text = "Message was unsent";
          // নোট: এখানে রিটার্ন (return) করা যাবে না! রিটার্ন করলে মেসেজ উধাও হয়ে যায়।
          // ডাটা টেক্সট পরিবর্তন করে বাবলটি স্ক্রিনে রেন্ডার হতে দেওয়া হলো, যাতে টাইমস্ট্যাম্প বা timeString থেকে যায়।
        }
        
        
        // অটো চ্যাট বক্স ওপেনিং ও সিঙ্কিং গার্ড লক (লগইন বা লোডের সময় জোর করে চ্যাট ওপেন হওয়া বন্ধ করবে)
if (!window.activeChatRoomId || window.activeChatRoomId === "") {
  if (window.showScreen) window.showScreen('inbox-view');
  return; 
}

        
        
        // --- ফাইনাল জিরো-টলারেন্স মেসেজ ব্লুপ্রিন্ট ইঞ্জিন শেষ ---

        msgRow.innerHTML = `<div class="msg-bubble-container"><div class="msg-bubble" data-id="${data.id}" data-sender-id="${data.senderId || ''}" ${displayStyle}>${data.text}</div><span class="msg-time">${timeString}</span></div>`;

        messagesArea.appendChild(msgRow);
    });
    messagesArea.scrollTop = messagesArea.scrollHeight;
  });
}

const sendInput = document.getElementById('mainMessageInputField'); 
const sendBtn = document.getElementById('mainSendMsgBtn');
if (sendBtn && sendInput) {
    const sendMessage = async () => {
        const text = sendInput.value.trim(); 
        if (!text || !window.activeChatRoomId || !window.currentUser) return; 
        sendInput.value = "";
        try { 
          await window.addDoc(
            window.collection(
              window.db,
              "messages"
            ), {
              roomId: window.activeChatRoomId,
              senderId: window.currentUser.uid,
              text: text,
              timestamp: window.serverTimestamp(),
              isUnsent: false,
              deletedBy: {} // এটি যোগ করায় ডাটাবেজ শুরু থেকেই ফিল্ডটি চিনে রাখবে
            });
        } catch (e) { 
          if (window.showCustomAlert) window.showCustomAlert(e.message); else alert(e.message); 
        }
    };
    sendBtn.onclick = sendMessage; 
    sendInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
}



// ==========================================================================
// STEP 4: Context Actions & Formspree Help Pipeline Integrations
// ==========================================================================
let selectedBubble = null;

// ==========================================================================
// Message Bubble & Inbox Context Menu Event Listeners
// ==========================================================================

// মেসেজ বাবল বা ইনবক্স ছাড়া বাইরে ক্লিক করলে মেনু বন্ধ হওয়ার লজিক
document.addEventListener('click', function(e) { 
    const menu = document.getElementById('msgContextMenu');
    
    // ১. যদি মেসেজ বাবলে ক্লিক করা হয় (Chat Screen)
    if (e.target.classList.contains('msg-bubble')) { 
        e.stopPropagation(); 
        if (typeof selectedBubble !== 'undefined') {
            selectedBubble = e.target; 
        }
        if (menu) menu.style.display = 'flex'; 
    } 
    // ২. যদি মেনুর বাইরে কোথাও ক্লিক করা হয়, তবে মেনু বন্ধ হবে
    else if (menu && menu.style.display === 'flex') {
        // মেনুর ভেতরের কোনো অংশ বা ইনবক্স কার্ডে ক্লিক না হলে বন্ধ হবে
        if (!e.target.closest('#msgContextMenu') && !e.target.closest('.inbox-chat-item')) {
            window.closeMsgMenu();
        }
    }
});

// মেনু বন্ধ করার ফাংশন
window.closeMsgMenu = function() { 
    const menu = document.getElementById('msgContextMenu');
    if (menu) menu.style.display = 'none'; 
};


// মেসেজ কপি করার ফাংশন (কাস্টম অ্যালার্ট সহ)
window.executeCopyMessage = function() { 
    if (selectedBubble) { 
        navigator.clipboard.writeText(selectedBubble.innerText); 
        if (window.showCustomAlert) {
            window.showCustomAlert("Copied! 📄");
        }
    } 
    window.closeMsgMenu(); 
};

// Help & Support ফর্ম সাবমিশন ফাংশন (কাস্টম অ্যালার্ট সহ)
window.handleHelpSubmit = async function(event) {
  if (event) event.preventDefault();

  // HTML ID-র সাথে মিলিয়ে ঠিক করা হলো (helpEmail & helpMessage)
  const emailInput = document.getElementById('helpEmail');
  const messageInput = document.getElementById('helpMessage');
  const submitBtn = document.getElementById('helpSubmitBtn');

  const email = emailInput ? emailInput.value.trim() : '';
  const message = messageInput ? messageInput.value.trim() : '';

  if (!email || !message) {
    if (window.showCustomAlert) window.showCustomAlert("Please fill in all fields.");
    return;
  }

  if (submitBtn) {
    submitBtn.innerText = "Sending...";
    submitBtn.disabled = true;
  }

  try {
    const response = await fetch("https://formspree.io/f/mwlkbggy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ email: email, message: message })
    });

    if (response.ok) {
      if (messageInput) messageInput.value = "";
      if (window.showCustomAlert) {
        window.showCustomAlert("Submitted! 📬");
      }
    } else {
      if (window.showCustomAlert) {
        window.showCustomAlert("Submission failed. Check Formspree ID.");
      }
    }
  } catch (error) {
    console.error("Help form error:", error);
    if (window.showCustomAlert) {
      window.showCustomAlert("Submission error: " + error.message);
    }
  } finally {
    if (submitBtn) {
      submitBtn.innerText = "Send Message";
      submitBtn.disabled = false;
    }
  }
};








// জিরো-টলারেন্স কাস্টম অ্যালার্ট সমৃদ্ধ ডিলিট ও আনসেন্ড প্রোটোকল
window.executeDeleteMessage = async function() {
  if (typeof selectedBubble !== 'undefined' && selectedBubble) {
    const msgId = selectedBubble.getAttribute('data-id');
    const msgSenderId = selectedBubble.getAttribute('data-sender-id'); 
    const currentUserId = window.currentUser ? window.currentUser.uid : '';

    if (msgId) {
      try {
        const dbObj = window.db || db;
        const updateDocFn = window.updateDoc || updateDoc;
        const docFn = window.doc || doc;

        if (!docFn || !updateDocFn) {
          if (window.showCustomAlert) window.showCustomAlert("Firebase functions are not loaded properly!");
          return;
        }

        const messageRef = docFn(dbObj, "messages", msgId);

        // ১. নিজের পাঠানো মেসেজ হলে -> সবার জন্য Unsend হবে (ডাটাবেজে টেক্সট এবং isUnsent ফ্ল্যাগ আপডেট হবে)
        if (msgSenderId === currentUserId || selectedBubble.classList.contains('sent') || selectedBubble.classList.contains('outgoing')) {
          await updateDocFn(messageRef, {
            text: "Message was unsent",
            isUnsent: true
          });
          
          if (window.showCustomAlert) {
            window.showCustomAlert("Message unsent for everyone!");
          } else {
            alert("Message unsent for everyone!");
          }
        } 
        // ২. বন্ধুর পাঠানো মেসেজ হলে -> শুধু আপনার স্ক্রিন থেকে ডিলিট হবে (Delete for Me)
        // ডাটাবেজে আপনার আইডির আন্ডারে ট্রু (true) সেট হবে, যা ব্লুপ্রিন্ট ইঞ্জিন রেন্ডার করবে
        else {
          let updateData = {};
          updateData[`deletedBy.${currentUserId}`] = true; 
          
          await updateDocFn(messageRef, updateData);
          
          if (window.showCustomAlert) {
            window.showCustomAlert("Message deleted for you!");
          } else {
            alert("Message deleted for you!");
          }
        }

      } catch (e) {
        if (window.showCustomAlert) window.showCustomAlert(e.message); else alert(e.message);
      }
    }
  }
  
  if (window.closeMsgMenu) {
    window.closeMsgMenu();
  }
};







// Formspree API Integration (কাস্টম মোডাল সহ ফিক্সড কোড)
const form = document.querySelector('.help-form-container');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        const btn = this.querySelector('button[type="submit"]'); 
        if (btn) { btn.innerText = "Sending..."; btn.disabled = true; }
        
        const emailInput = document.getElementById('helpEmail');
        const messageInput = document.getElementById('helpMessage');

        try {
            const res = await fetch("https://formspree.io/f/mwlkbggy", { 
                method: "POST", 
                body: JSON.stringify({ 
                    email: emailInput ? emailInput.value : '', 
                    message: messageInput ? messageInput.value : '' 
                }), 
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } 
            });
            
            if (res.ok) { 
                this.reset(); 
                if (window.showCustomAlert) {
                    window.showCustomAlert("Submitted! 📬");
                }
            } else {
                if (window.showCustomAlert) {
                    window.showCustomAlert("Submission failed. Check Formspree ID.");
                }
            }
        } catch (err) { 
            if (window.showCustomAlert) {
                window.showCustomAlert("Error sending message");
            }
        } finally { 
            if (btn) { btn.innerText = "Send Message"; btn.disabled = false; } 
        }
    });
}

// Global initialization
document.addEventListener("DOMContentLoaded", () => { 
    if (typeof window.bindAppWelcomeActionButtons === 'function') {
        window.bindAppWelcomeActionButtons(); 
    }
    if (!window.auth || !window.auth.currentUser) {
        window.showScreen('welcome-view'); 
    }
});




// মেসেঞ্জারের মতো আনসেন্ড এবং ডিলিট ফর মি ফাংশন
window.deleteMessageLogic = async function(messageId, messageSenderId, currentUserId, currentRoomId) {
  try {
    // ফায়ারস্টোরে আপনার মেসেজের পাথটি ঠিক করে নিন
    // আপনার ডাটাবেজ স্ট্রাকচার অনুযায়ী messages কালেকশনের ওই নির্দিষ্ট মেসেজের ডকুমেন্ট রেফারেন্স তৈরি করা হচ্ছে
    const messageRef = window.doc(db, "messages", messageId);

    // ১. মেসেজটি যদি আমার নিজের পাঠানো হয় -> Unsend (সবার জন্য ডিলিট)
    if (messageSenderId === currentUserId) {
      await window.updateDoc(messageRef, {
        isUnsent: true
      });
      alert("Message unsent for everyone!");
    } 
    // ২. মেসেজটি যদি বন্ধুর পাঠানো হয় -> শুধু আমার জন্য ডিলিট (Delete for Me)
    else {
      // ফায়ারস্টোরে arrayUnion সরাসরি উইন্ডো দিয়ে ব্যবহার করতে সমস্যা হলে জাভাস্ক্রিপ্টের স্প্রেড অপারেটর দিয়েও করা যায়
      // নিচে সহজ উপায়ে কারেন্ট ইউজারের আইডিটি deletedBy ফিল্ডে যোগ করা হচ্ছে
      
      // প্রথমে বর্তমান মেসেজের ডাটা দেখতে হবে (অথবা আপনি সরাসরি ফায়ারবেসের ফিল্ড আপডেট করতে পারেন)
      // যদি আপনার কোডে ফায়ারবেসের 'arrayUnion' ইমপোর্ট করা থাকে, তবে নিচের কোডটি ব্যবহার করুন:
      /*
      await window.updateDoc(messageRef, {
        deletedBy: firebase.firestore.FieldValue.arrayUnion(currentUserId) 
      });
      */
      
      // অথবা সবথেকে নিরাপদ উপায় হলো, মেসেজের ভেতরে সরাসরি ইউজারের আইডি অবজেক্ট আকারে ট্রু করে দেওয়া (যেমন: deletedBy.USER_ID = true)
      // এতে অ্যারে হ্যান্ডেল করার ঝামেলা থাকে না। আপনার ডাটাবেজের সুবিধার জন্য নিচে সহজ আপডেট দেওয়া হলো:
      
      let updateData = {};
      updateData[`deletedBy.${currentUserId}`] = true; // এটি ইউজারের আইডির নামে একটি ফিল্ড তৈরি করে ট্রু করে দেবে
      
      await window.updateDoc(messageRef, updateData);
      alert("Message deleted for you!");
    }
  } catch (error) {
    console.error("Error deleting message: ", error);
  }
};



// Trigger Profile Edit (Full Name and Username)
// ১. এডিট বাটনে চাপ দিলে কাস্টম ডার্ক মোডাল ওপেন করার ফাংশন

// ১. এডিট বাটনে চাপ দিলে কাস্টম ডার্ক মোডাল সম্পূর্ণ ব্ল্যাঙ্ক (ফাঁকা) অবস্থায় ওপেন করার ফাংশন
// ১. আপডেট অবতার বাটনে চাপ দিলে কাস্টম মোডাল ওপেন করার ফাংশн

// ১. পাসওয়ার্ড দেখা এবং লুকানোর প্রিমিয়াম টগল ফাংশন
window.togglePasswordVisibility = function(inputId, iconElement) {
  const passInput = document.getElementById(inputId);
  if (passInput) {
    if (passInput.type === "password") {
      passInput.type = "text";
      iconElement.innerText = "🔒"; 
    } else {
      passInput.type = "password";
      iconElement.innerText = "👁️"; 
    }
  }
};


// ১. প্রোফাইল এডিট মোডাল ওপেন করার ফাংশন
window.triggerProfileEdit = function() {
  const modal = document.getElementById('editProfileModal');
  const currentName = document.getElementById('profileCardName')?.innerText || '';
  const currentUsername = document.getElementById('profileCardUsername')?.innerText.replace('@', '') || '';

  if (modal) {
    const fullNameInput = document.getElementById('editFullNameInput');
    const usernameInput = document.getElementById('editUsernameInput');

    if (fullNameInput) fullNameInput.value = (currentName !== "Loading...") ? currentName : "";
    if (usernameInput) usernameInput.value = (currentUsername !== "username") ? currentUsername : "";

    modal.style.display = 'flex';
  } else {
    if (window.showCustomAlert) {
      window.showCustomAlert("System Error: editProfileModal element not found in HTML!");
    }
  }
};

// ২. প্রোফাইল এডিট মোডাল বন্ধ করার ফাংশন (Cancel বাটন এবং Save এর পর ব্যবহারের জন্য)
window.closeEditProfileModal = function() {
  const modal = document.getElementById('editProfileModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// ৩. ফায়ারবেসে তথ্য সেভ করার ফাংশন
window.saveProfileInfo = async function() {
  const nameInput = document.getElementById('editFullNameInput');
  const usernameInput = document.getElementById('editUsernameInput');

  const newName = nameInput ? nameInput.value.trim() : "";
  const newUsername = usernameInput ? usernameInput.value.trim() : "";

  if (!newName || !newUsername) {
    if (window.showCustomAlert) {
      window.showCustomAlert("Fields cannot be empty!");
    }
    return;
  }

  try {
    const authObj = window.auth || (typeof auth !== 'undefined' ? auth : null) || (window.getAuth ? window.getAuth() : null);
    const dbObj = window.db || (typeof db !== 'undefined' ? db : null);
    const currentUser = authObj ? authObj.currentUser : null;

    if (!currentUser) {
      if (window.showCustomAlert) {
        window.showCustomAlert("No authenticated user found!");
      }
      return;
    }

    const docFn = window.doc || (typeof doc !== 'undefined' ? doc : null);
    const updateDocFn = window.updateDoc || (typeof updateDoc !== 'undefined' ? updateDoc : null);

    // ফায়ারস্টোর ডাটাবেজ আপডেট
    if (docFn && updateDocFn && dbObj) {
      const userDocRef = docFn(dbObj, "users", currentUser.uid);
      await updateDocFn(userDocRef, {
        name: newName,
        username: newUsername
      });
    }

    // ফায়ারবেস অথেন্টিকেশন আপডেট
    const updateProfileFn = window.updateProfile || (typeof updateProfile !== 'undefined' ? updateProfile : null);
    if (updateProfileFn) {
      await updateProfileFn(currentUser, { displayName: newName });
    }

    // UI রিয়েল-টাইম আপডেট
    const nameElem = document.getElementById('profileCardName');
    const usernameElem = document.getElementById('profileCardUsername');

    if (nameElem) nameElem.innerText = newName;
    if (usernameElem) usernameElem.innerText = `@${newUsername}`;

    // মোডাল বন্ধ করা
    window.closeEditProfileModal();

    // কাস্টম অ্যালার্ট নোটিফিকেশন
    if (window.showCustomAlert) {
      window.showCustomAlert("Profile updated successfully!");
    }

  } catch (error) {
    console.error("Error updating profile:", error);
    if (window.showCustomAlert) {
      window.showCustomAlert("Error updating profile: " + error.message);
    }
  }
};



// ১. অবতার মোডাল ওপেন করা
window.triggerAvatarUpdate = function() {
  const modal = document.getElementById('customAvatarModal');
  if (modal) {
    modal.style.display = 'flex';
  } else {
    if (window.showCustomAlert) window.showCustomAlert("Error: customAvatarModal element missing!");
  }
};

// ২. অবতার মোডাল বন্ধ করা (Cancel বাটনের জন্য)
window.closeAvatarModal = function() {
  const modal = document.getElementById('customAvatarModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// ৩. সিলেক্ট করা স্টাইল অনুযায়ী ফায়ারবেস ও UI আপডেট করা
window.saveCustomAvatar = async function(chosenStyle) {
  try {
    const authObj = window.auth || (typeof auth !== 'undefined' ? auth : null) || (window.getAuth ? window.getAuth() : null);
    const dbObj = window.db || (typeof db !== 'undefined' ? db : null);
    const currentUser = authObj ? authObj.currentUser : null;

    if (!currentUser) {
      if (window.showCustomAlert) window.showCustomAlert("No authenticated user found!");
      return;
    }

    const randomSeed = Math.floor(Math.random() * 10000);
    const newAvatarUrl = `https://api.dicebear.com/7.x/${chosenStyle}/png?seed=${currentUser.uid}_${randomSeed}`;

    const docFn = window.doc || (typeof doc !== 'undefined' ? doc : null);
    const updateDocFn = window.updateDoc || (typeof updateDoc !== 'undefined' ? updateDoc : null);

    // ফায়ারস্টোর ডাটাবেজ আপডেট
    if (docFn && updateDocFn && dbObj) {
      const userDocRef = docFn(dbObj, "users", currentUser.uid);
      await updateDocFn(userDocRef, { avatar: newAvatarUrl });
    }

    // ফায়ারবেস অথেন্টিকেশন আপডেট
    const updateProfileFn = window.updateProfile || (typeof updateProfile !== 'undefined' ? updateProfile : null);
    if (updateProfileFn) {
      await updateProfileFn(currentUser, { photoURL: newAvatarUrl });
    }

    // UI রিয়েল-টাইম রেন্ডার
    const profileImgElement = document.getElementById('profileCardImg');
    if (profileImgElement) {
      profileImgElement.src = newAvatarUrl;
    }

    window.closeAvatarModal();

    if (window.showCustomAlert) {
      window.showCustomAlert("Avatar photo updated successfully!");
    }

  } catch (error) {
    console.error("Avatar error:", error);
    if (window.showCustomAlert) {
      window.showCustomAlert("Error: " + error.message);
    }
  }
};



// সিকিউরিটি বাটনের লজিক (পাসওয়ার্ড রিসেট সম্পূর্ণ রিমুভ করা হয়েছে)
window.triggerAccountSecurity = function() {
  const authObj = window.auth || (typeof auth !== 'undefined' ? auth : null) || (window.getAuth ? window.getAuth() : null);
  const currentUser = authObj ? authObj.currentUser : null;

  if (currentUser) {
    const userEmail = currentUser.email || "Your account";
    if (window.showCustomAlert) {
      window.showCustomAlert(`Account (${userEmail}) is secured via Firebase Auth.`);
    }
  } else {
    if (window.showCustomAlert) {
      window.showCustomAlert("Account security settings are up to date.");
    }
  }
};

// ==========================================================================
// Delete Chat from Inbox Logic (ES Module Compatible)
// ==========================================================================

window.executeDeleteChat = async function() {
  const authObj = window.auth || (typeof auth !== 'undefined' ? auth : null) || (window.getAuth ? window.getAuth() : null);
  const dbObj = window.db || (typeof db !== 'undefined' ? db : null);
  const currentUser = authObj ? authObj.currentUser : null;

  // বর্তমান এক্টিভ চ্যাট ইউজারের আইডি
  const targetUserId = window.activeChatUserId || (typeof activeChatUserId !== 'undefined' ? activeChatUserId : null);

  if (!currentUser || !targetUserId) {
    if (window.showCustomAlert) window.showCustomAlert("No active conversation selected to delete.");
    if (typeof window.closeMsgMenu === 'function') window.closeMsgMenu();
    return;
  }

  try {
    const docFn = window.doc || (typeof doc !== 'undefined' ? doc : null);
    const deleteDocFn = window.deleteDoc || (typeof deleteDoc !== 'undefined' ? deleteDoc : null);

    if (docFn && deleteDocFn && dbObj) {
      // কেবল নিজের ইনবক্স (active_chats) থেকে মুছে ফেলা হচ্ছে
      const myChatRef = docFn(dbObj, "users", currentUser.uid, "active_chats", targetUserId);
      await deleteDocFn(myChatRef);

      // আইডি রিসেট করা
      window.activeChatUserId = null;

      if (typeof window.closeMsgMenu === 'function') window.closeMsgMenu();

      if (window.showCustomAlert) {
        window.showCustomAlert("Chat removed from inbox!");
      }

      // ইনবক্স স্ক্রিনে ফেরত পাঠানো
      if (typeof window.showScreen === 'function') {
        window.showScreen('inbox-view');
      }
      
      // ইনবক্স রিফ্রেশ করা
      if (typeof window.loadInboxChats === 'function') {
        window.loadInboxChats();
      }
    }
  } catch (error) {
    console.error("Error deleting chat:", error);
    if (window.showCustomAlert) {
      window.showCustomAlert("Error: " + error.message);
    }
    if (typeof window.closeMsgMenu === 'function') window.closeMsgMenu();
  }
};


// Firestore user document থেকে রিয়েলটাইম isOnline স্ট্যাটাস চেক করা
async function getRealtimeUserStatus(userId) {
  const dbObj = window.db || (typeof db !== 'undefined' ? db : null);
  const docFn = window.doc || (typeof doc !== 'undefined' ? doc : null);
  const getDocFn = window.getDoc || (typeof getDoc !== 'undefined' ? getDoc : null);

  if (dbObj && docFn && getDocFn) {
    try {
      const userSnap = await getDocFn(docFn(dbObj, "users", userId));
      if (userSnap.exists()) {
        return userSnap.data().isOnline === true;
      }
    } catch (e) {
      // নেটওয়ার্ক ফেইল হলে কনসোলে লাল এরর না দিয়ে চুপচাপ false ধরে নেবে
      return false; 
    }
  }
  return false;
}


// Inbox Dynamic Render with Messenger Status
window.renderInboxItem = function(chatData, targetUserAvatar) {
  const authObj = window.auth || (typeof auth !== 'undefined' ? auth : null) || (window.getAuth ? window.getAuth() : null);
  const currentUserId = authObj ? authObj.currentUser?.uid : null;

  let statusBadgeHtml = '';
  const lastSender = chatData.lastSenderId || chatData.senderId;
  
  if (currentUserId && lastSender === currentUserId) {
    if (chatData.status === 'sent') {
      statusBadgeHtml = `<span class="inbox-status-check">✓</span>`;
    } else if (chatData.status === 'delivered') {
      statusBadgeHtml = `<span class="inbox-status-check">✓✓</span>`;
    } else if (chatData.status === 'seen') {
      const avatarSrc = targetUserAvatar || chatData.avatar || 'https://api.dicebear.com/7.x/bottts/png';
      statusBadgeHtml = `<img src="${avatarSrc}" class="inbox-seen-avatar" alt="Seen" />`;
    }
  }

  const isUserOnline = chatData.isOnline === true;
  const avatarUrl = targetUserAvatar || chatData.avatar || 'https://api.dicebear.com/7.x/bottts/png';

  return `
    <div class="inbox-chat-item" 
         data-userid="${chatData.userId}"
         onclick="window.openChatWithUser('${chatData.userId}', '${chatData.name || 'User'}', '${avatarUrl}')"
         oncontextmenu="window.handleInboxLongPress(event, '${chatData.userId}')">
      <div class="avatar-container" style="position: relative;">
        <img src="${avatarUrl}" class="chat-avatar" alt="Profile" />
        ${isUserOnline ? '<span class="online-indicator"></span>' : ''}
      </div>
      <div class="chat-info">
        <h4>${chatData.name || 'User'}</h4>
        <p>${chatData.lastMessage || 'Tap to message...'}</p>
      </div>
      <div class="inbox-status-right">
        ${statusBadgeHtml}
      </div>
    </div>
  `;
};


// ইনবক্সে লং প্রেস/রাইট ক্লিক করলে Context Menu প্যানেল খোলার লজিক
// ইনবক্সে লং-প্রেস বা রাইট ক্লিক করলে Context Menu প্যানেল খোলার লজিক
window.handleInboxLongPress = function(event, targetUserId) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  
  if (!targetUserId) return;

  // ডিলিট করার জন্য গ্লোবাল ভ্যারিয়েবলে ইউজার আইডি সেট করা
  window.activeChatUserId = targetUserId; 

  // বাটন ফিল্টারিং (ইনবক্সের জন্য কেবল চ্যাট ডিলিট বাটন দৃশ্যমান হবে)
  const copyBtn = document.getElementById('msgOptCopy');
  const deleteMsgBtn = document.getElementById('msgOptDelete');
  const deleteChatBtn = document.getElementById('inboxOptDelete');

  if (copyBtn) copyBtn.style.display = 'none';
  if (deleteMsgBtn) deleteMsgBtn.style.display = 'none';
  if (deleteChatBtn) deleteChatBtn.style.display = 'block';

  // প্যানেল মোডালটি দৃশ্যমান করা
  const menu = document.getElementById('msgContextMenu');
  if (menu) {
    menu.style.display = 'flex';
  }
};


// মোবাইলে চেপে ধরে রাখার (Long Press) জন্য ইভেন্ট লিসেনার
document.addEventListener('touchstart', function(e) {
  const chatCard = e.target.closest('.inbox-chat-item');
  if (!chatCard) return;

  if (window.longPressTimer) clearTimeout(window.longPressTimer);

  window.longPressTimer = setTimeout(() => {
    // কার্ডে থাকা data-userid রিড করা
    const targetUserId = chatCard.getAttribute('data-userid');
    if (targetUserId && typeof window.handleInboxLongPress === 'function') {
      window.handleInboxLongPress(e, targetUserId);
    } else {
      // ব্যাকআপ হিসেবে contextmenu ইভেন্ট ডিসপ্যাচ করা
      chatCard.dispatchEvent(new CustomEvent('contextmenu', { bubbles: true, cancelable: true }));
    }
  }, 500); // ৫০০ মিলি-সেকেন্ড চেপে ধরে রাখলে মেনু ওপেন হবে
}, { passive: true });

document.addEventListener('touchend', function() {
  if (window.longPressTimer) clearTimeout(window.longPressTimer);
});

document.addEventListener('touchmove', function() {
  if (window.longPressTimer) clearTimeout(window.longPressTimer);
});




// ১. ইনবক্সে লং-প্রেস করলে স্মার্ট প্যানেল খোলার লজিক
window.handleInboxLongPress = function(event, targetUserId) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  
  if (!targetUserId) return;

  // একটিভ ডায়ালগ মোড চিহ্নিত করা
  window.currentContextMenuMode = 'inbox';
  window.activeChatUserId = targetUserId; 

  // কপি বাটন লুকানো (ইনবক্স ডিলিটের সময় কপির প্রয়োজন নেই)
  const copyBtn = document.getElementById('msgOptCopy');
  if (copyBtn) copyBtn.style.display = 'none';

  const menu = document.getElementById('msgContextMenu');
  if (menu) menu.style.display = 'flex';
};

// ২. লাল ডিলিট বাটনে ক্লিক করলে সঠিক ফাংশন এক্সিকিউট করা
window.handleDeleteAction = function() {
  if (window.currentContextMenuMode === 'inbox') {
    window.executeDeleteChat();
  } else {
    window.executeDeleteMessage();
  }
};

// ৩. মেসেজ বাবলে ক্লিক করলে সাধারণ মোড চালু করা
document.addEventListener('click', function(e) { 
    const menu = document.getElementById('msgContextMenu');
    
    if (e.target.classList.contains('msg-bubble')) { 
        e.stopPropagation(); 
        window.currentContextMenuMode = 'message';
        
        const copyBtn = document.getElementById('msgOptCopy');
        if (copyBtn) copyBtn.style.display = 'block';

        if (menu) menu.style.display = 'flex'; 
    } else {
        if (menu && menu.style.display === 'flex' && !e.target.closest('#msgContextMenu') && !e.target.closest('.inbox-chat-item')) {
            window.closeMsgMenu();
        }
    }
});

// ৪. মোবাইলে সরাসরি টাচ ধরে রাখার (Long Press) লিসেনার
document.addEventListener('touchstart', function(e) {
  const chatCard = e.target.closest('.inbox-chat-item');
  if (!chatCard) return;

  if (window.longPressTimer) clearTimeout(window.longPressTimer);

  window.longPressTimer = setTimeout(() => {
    // কার্ডের onclick অথবা data-userid থেকে সঠিক আইডি বের করা
    let targetUserId = chatCard.getAttribute('data-userid');
    if (!targetUserId) {
      const onclickAttr = chatCard.getAttribute('onclick') || '';
      const match = onclickAttr.match(/'([^']+)'/);
      if (match) targetUserId = match[1];
    }

    if (targetUserId) {
      window.handleInboxLongPress(e, targetUserId);
    }
  }, 500);
}, { passive: true });

document.addEventListener('touchend', function() {
  if (window.longPressTimer) clearTimeout(window.longPressTimer);
});

document.addEventListener('touchmove', function() {
  if (window.longPressTimer) clearTimeout(window.longPressTimer);
});




// ১. চ্যাট ওপেন করলে আনসিন মেসেজকে Seen হিসেবে আপডেট করা
window.markMessagesAsSeen = async function(chatId, targetUserId) {
  const dbObj = window.db;
  if (!dbObj || !chatId || !targetUserId) return;

  const messagesRef = window.collection(dbObj, "chats", chatId, "messages");
  const q = window.query(
    messagesRef, 
    window.where("senderId", "==", targetUserId), 
    window.where("status", "!=", "seen")
  );

  const snapshot = await window.getDocs(q);
  snapshot.forEach(async (docSnapshot) => {
    await window.updateDoc(docSnapshot.ref, { status: 'seen' });
  });
};

// ২. ইউজারের Online/OfflinePresence আপডেট করা
window.updateUserPresence = function(uid) {
  const dbObj = window.db;
  if (!dbObj || !uid) return;

  const userStatusRef = window.doc(dbObj, "users", uid);

  // অনলাইন স্ট্যাটাস
  window.updateDoc(userStatusRef, {
    isOnline: true,
    lastSeen: window.serverTimestamp()
  });

  // ট্যাব বন্ধ করলে অফলাইন স্ট্যাটাস
  window.addEventListener('beforeunload', () => {
    window.updateDoc(userStatusRef, {
      isOnline: false,
      lastSeen: window.serverTimestamp()
    });
  });
};




// রিয়েলটাইম ইউজার অনলাইন/অফলাইন ট্র্যাক করা
window.listenToUserStatus = function(targetUserId, callback) {
  const dbObj = window.db;
  if (!dbObj || !targetUserId) return;

  const userRef = window.doc(dbObj, "users", targetUserId);
  
  // onSnapshot দিয়ে রিয়েলটাইম ডাটা আপডেট পর্যবেক্ষণ
  window.onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const isOnline = userData.isOnline === true;
      callback(isOnline, userData.lastSeen);
    }
  });
};

// চ্যাট হেডার আপডেট ফাংশন
window.updateChatHeaderStatus = function(targetUserId) {
  window.listenToUserStatus(targetUserId, (isOnline) => {
    const statusElem = document.getElementById('chatUserStatus'); // Active now লেখার Element
    const greenDot = document.getElementById('chatHeaderGreenDot');

    if (statusElem) {
      statusElem.innerText = isOnline ? 'Active now' : 'Offline';
      statusElem.style.color = isOnline ? '#22c55e' : '#9ca3af';
    }
    if (greenDot) {
      greenDot.style.display = isOnline ? 'block' : 'none';
    }
  });
};



// লগইন করা ইউজারের রিয়েলটাইম প্রেজেন্স হ্যান্ডলার
window.initUserPresence = function() {
  const authObj = window.auth || (typeof auth !== 'undefined' ? auth : null) || (window.getAuth ? window.getAuth() : null);
  const dbObj = window.db || (typeof db !== 'undefined' ? db : null);
  const currentUser = authObj ? authObj.currentUser : null;

  if (!currentUser || !dbObj) return;

  const docFn = window.doc || (typeof doc !== 'undefined' ? doc : null);
  const updateDocFn = window.updateDoc || (typeof updateDoc !== 'undefined' ? updateDoc : null);

  if (docFn && updateDocFn) {
    const userRef = docFn(dbObj, "users", currentUser.uid);

    // অ্যাপ চালু হলে অনলাইন সেট করা
    updateDocFn(userRef, {
      isOnline: true,
      lastSeen: new Date().toISOString()
    });

    // অ্যাপ বন্ধ বা রিফ্রেশ করলে অফলাইন সেট করা
    window.addEventListener('beforeunload', () => {
      updateDocFn(userRef, {
        isOnline: false,
        lastSeen: new Date().toISOString()
      });
    });
  }
};

// অ্যাপ লোড হওয়ার পর চালু করা
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof window.initUserPresence === 'function') {
      window.initUserPresence();
    }
  }, 1500);
});






// Smart Pull to Refresh (Without Page Reload/Logout)
(function() {
  let startY = 0;
  let currentY = 0;
  let isPulling = false;
  const ptrElement = document.getElementById('pullToRefresh');

  window.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY;
      isPulling = true;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && window.scrollY === 0) {
      if (distance < 120 && ptrElement) {
        ptrElement.style.top = `${distance - 50}px`;
      }
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (!isPulling) return;
    const distance = currentY - startY;
    
    if (distance > 70 && window.scrollY === 0) {
      if (ptrElement) ptrElement.style.top = '20px';
      
      // 🟢 পেজ রিলোড না করে শুধু ডাটা আপডেট করা
      setTimeout(() => {
        // ১. যদি ইনবক্সে থাকে
        if (typeof window.loadActiveChats === 'function') {
          window.loadActiveChats();
        }
        
        // ২. যদি কোনো চ্যাট ওপেন থাকে, তার স্ট্যাটাস রিফ্রেশ
        if (window.activeChatUserId && typeof window.listenToUserStatus === 'function') {
          window.listenToUserStatus(window.activeChatUserId);
        }
        
        // লোডিং এনিমেশন বন্ধ করা
        setTimeout(() => {
          if (ptrElement) ptrElement.style.top = '-60px';
        }, 300);
      }, 800);
    } else {
      if (ptrElement) ptrElement.style.top = '-60px';
    }

    startY = 0;
    currentY = 0;
    isPulling = false;
  });
})();
      
