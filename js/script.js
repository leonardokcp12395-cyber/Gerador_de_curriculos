// --- Toast Notification Function ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Remove the toast after 5 seconds
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Firebase Config com suas chaves
const firebaseConfig = {
  apiKey: "AIzaSyBxkmzxao2HOnGsb2Y2R7W0q9FnYdt8dJE",
  authDomain: "gerador-de-curriculos-online.firebaseapp.com",
  projectId: "gerador-de-curriculos-online",
  storageBucket: "gerador-de-curriculos-online.firebasestorage.app",
  messagingSenderId: "114021870709",
  appId: "1:114021870709:web:f73b2d837bb4b5dd7adc3c",
  measurementId: "G-HLWH9KSK0B"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- Auth Modal Functions ---
function openAuthModal() {
  document.getElementById('authModal').style.display = 'block';
}

function closeAuthModal() {
  document.getElementById('authModal').style.display = 'none';
  // Reset forms to default state
  document.getElementById('login-form').style.display = 'block';
  document.getElementById('register-form').style.display = 'none';
}

function toggleAuthForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
  registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

// --- Loading State Helpers ---
function showLoading(button) {
  button.disabled = true;
  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  button.dataset.originalText = button.innerHTML;
  button.innerHTML = '';
  button.appendChild(spinner);
}

function hideLoading(button) {
  button.disabled = false;
  button.innerHTML = button.dataset.originalText;
}

// --- Authentication Functions ---
function registerWithEmail() {
  const button = document.getElementById('registerBtn');
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  showLoading(button);
  auth.createUserWithEmailAndPassword(email, password)
    .then(result => {
      showToast(`Usuário ${result.user.email} registrado com sucesso!`, 'success');
      closeAuthModal();
    })
    .catch(error => {
      showToast(error.message, 'error');
    })
    .finally(() => {
      hideLoading(button);
    });
}

function loginWithEmail() {
  const button = document.getElementById('loginEmailBtn');
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  showLoading(button);
  auth.signInWithEmailAndPassword(email, password)
    .then(result => {
      showToast(`Bem-vindo, ${result.user.email}!`, 'success');
      closeAuthModal();
    })
    .catch(error => {
      showToast(error.message, 'error');
    })
    .finally(() => {
      hideLoading(button);
    });
}

function loginGoogle() {
  const button = document.getElementById('loginGoogleBtn');
  const provider = new firebase.auth.GoogleAuthProvider();

  showLoading(button);
  auth.signInWithPopup(provider)
    .then(result => {
      showToast(`Bem-vindo, ${result.user.email}!`, 'success');
      closeAuthModal();
    })
    .catch(error => {
      showToast(error.message, 'error');
    })
    .finally(() => {
      hideLoading(button);
    });
}

function logout() {
  auth.signOut().then(() => {
    showToast('Você foi desconectado.', 'info');
  });
}

// Monitor login status
auth.onAuthStateChanged(user => {
  const userInfo = document.getElementById('user-info');
  const openLoginModalBtn = document.getElementById('openLoginModalBtn');
  const userEmail = document.getElementById('userEmail');

  if(user){
    userEmail.innerText = user.email;
    userInfo.style.display = 'flex';
    openLoginModalBtn.style.display = 'none';
    db.collection('usuarios').doc(user.uid).get()
      .then(doc => {
        if(doc.exists && doc.data().premium){
          showToast("Você é usuário Premium! Modelos extras liberados.", 'info');
          // Aqui você poderia desbloquear recursos extras no site
        }
      });
  } else {
    userInfo.style.display = 'none';
    openLoginModalBtn.style.display = 'block';
  }
});


function adicionarItem(tipo) {
    const input = document.getElementById(`${tipo.slice(0, -1)}-input`);
    const list = document.getElementById(`${tipo}-list`);
    const value = input.value.trim();

    if (value) {
        const li = document.createElement('li');
        li.textContent = value;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remover';
        removeBtn.className = 'remove-btn';
        removeBtn.onclick = function() {
            list.removeChild(li);
            gerarPreview();
        };

        li.appendChild(removeBtn);
        list.appendChild(li);
        input.value = '';
        gerarPreview();
    }
}

// Gerar Preview
function gerarPreview() {
  const nome = document.getElementById('nome').value;
  const contato = document.getElementById('contato').value;
  const resumo = document.getElementById('resumo').value;

  let html = `<h2>${nome}</h2>`;
  html += `<p><strong>Contato:</strong> ${contato}</p>`;
  html += `<p><strong>Resumo:</strong> ${resumo}</p>`;

  const sections = ['experiencias', 'formacao', 'habilidades', 'idiomas'];
  const sectionTitles = {
      'experiencias': 'Experiências',
      'formacao': 'Formação Acadêmica',
      'habilidades': 'Habilidades',
      'idiomas': 'Idiomas'
  };

  sections.forEach(section => {
      const list = document.getElementById(`${section}-list`);
      const items = Array.from(list.children).map(li => li.firstChild.textContent);
      if (items.length > 0) {
          html += `<h3>${sectionTitles[section]}</h3><ul>`;
          items.forEach(item => {
              if (item.trim()) html += `<li>${item.trim()}</li>`;
          });
          html += `</ul>`;
      }
  });

  document.getElementById('preview').innerHTML = html;
}

// Exportar PDF
function exportarPDF() {
  const element = document.getElementById('preview');
  html2pdf().set({margin:0.5, filename:'curriculo.pdf', html2canvas:{scale:2}}).from(element).save();
}

// Comprar Premium
function comprarPremium() {
  document.getElementById('premiumModal').style.display = 'block';
}

function closePremiumModal() {
  document.getElementById('premiumModal').style.display = 'none';
}

// Event listeners for real-time preview
document.getElementById('nome').addEventListener('keyup', gerarPreview);
document.getElementById('contato').addEventListener('keyup', gerarPreview);
document.getElementById('resumo').addEventListener('keyup', gerarPreview);
