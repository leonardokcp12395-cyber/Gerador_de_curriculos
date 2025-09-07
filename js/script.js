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

// --- Validation Helper ---
function isValidEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// --- Authentication Functions ---
function registerWithEmail() {
  const button = document.getElementById('registerBtn');
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  if (!isValidEmail(email)) {
    showToast('Por favor, insira um formato de e-mail válido.', 'error');
    return;
  }
  if (password.length < 6) {
    showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
    return;
  }

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

  if (!isValidEmail(email)) {
    showToast('Por favor, insira um formato de e-mail válido.', 'error');
    return;
  }

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
    const input = document.getElementById(`${tipo}-input`);
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

  let html = `<div class="resume-preview">`;

  // Cabeçalho
  if (nome || contato) {
    html += `<div class="resume-header">`;
    if (nome) html += `<h2>${nome}</h2>`;
    if (contato) html += `<p>${contato}</p>`;
    html += `</div>`;
  }

  // Resumo
  if (resumo) {
    html += `<div class="resume-section">`;
    html += `<h3>Resumo Profissional</h3>`;
    html += `<p>${resumo}</p>`;
    html += `</div>`;
  }

  const sections = {
      'experiencia': 'Experiência Profissional',
      'formacao': 'Formação Acadêmica',
      'habilidade': 'Habilidades',
      'idioma': 'Idiomas'
  };

  Object.keys(sections).forEach(tipo => {
      const list = document.getElementById(`${tipo}-list`);
      const items = Array.from(list.children).map(li => li.firstChild.textContent.trim()).filter(item => item);
      if (items.length > 0) {
          html += `<div class="resume-section">`;
          html += `<h3>${sections[tipo]}</h3><ul>`;
          items.forEach(item => {
              html += `<li>${item}</li>`;
          });
          html += `</ul></div>`;
      }
  });

  html += `</div>`; // Fechar resume-preview
  document.getElementById('preview').innerHTML = html;
}

// Exportar PDF
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'in',
    format: 'letter'
  });

  const margin = 0.75;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - (margin * 2);
  let y = margin;

  // --- Helper function to add sections ---
  function addSection(title, items) {
    if (!items || items.length === 0) return;

    if (y + 0.5 > pageHeight - margin) { // Check for page break
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(18);
    doc.text(title, margin, y);
    y += 0.25;
    doc.setLineWidth(0.01);
    doc.line(margin, y, pageWidth - margin, y);
    y += 0.25;

    doc.setFontSize(12);
    items.forEach(item => {
      if (y + 0.3 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      const splitText = doc.splitTextToSize(item, maxWidth);
      doc.text(splitText, margin + 0.2, y);
      y += (splitText.length * 0.2) + 0.1;
    });
    y += 0.2; // Extra space after section
  }

  // --- Get form data ---
  const nome = document.getElementById('nome').value;
  const contato = document.getElementById('contato').value;
  const resumo = document.getElementById('resumo').value;
  const experiencia = Array.from(document.getElementById('experiencia-list').children).map(li => li.firstChild.textContent.trim());
  const formacao = Array.from(document.getElementById('formacao-list').children).map(li => li.firstChild.textContent.trim());
  const habilidade = Array.from(document.getElementById('habilidade-list').children).map(li => li.firstChild.textContent.trim());
  const idioma = Array.from(document.getElementById('idioma-list').children).map(li => li.firstChild.textContent.trim());

  // --- Build PDF ---
  // Header
  if (nome) {
    doc.setFontSize(28);
    doc.text(nome, pageWidth / 2, y, { align: 'center' });
    y += 0.4;
  }
  if (contato) {
    doc.setFontSize(14);
    doc.text(contato, pageWidth / 2, y, { align: 'center' });
    y += 0.3;
  }
  doc.setLineWidth(0.02);
  doc.line(margin, y, pageWidth - margin, y);
  y += 0.4;

  // Resumo
  if (resumo) {
    addSection("Resumo Profissional", [resumo]);
  }

  // Other Sections
  addSection("Experiência Profissional", experiencia);
  addSection("Formação Acadêmica", formacao);
  addSection("Habilidades", habilidade);
  addSection("Idiomas", idioma);

  doc.save('curriculo.pdf');
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
