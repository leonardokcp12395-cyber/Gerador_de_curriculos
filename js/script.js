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
  const preview = document.getElementById('preview');
  const template = document.getElementById('template-select').value;

  // Reset classes and content
  preview.className = '';
  preview.innerHTML = '';

  // Add the selected template class
  if (template === 'moderno') {
    preview.classList.add('template-modern');
  } else {
    preview.classList.add('template-padrao'); // Assuming you'll have a 'padrao' class or just use the default #preview styles
  }

  // Get form data
  const nome = document.getElementById('nome').value;
  const contato = document.getElementById('contato').value;
  const resumo = document.getElementById('resumo').value;
  const experiencia = Array.from(document.getElementById('experiencia-list').children).map(li => li.firstChild.textContent.trim());
  const formacao = Array.from(document.getElementById('formacao-list').children).map(li => li.firstChild.textContent.trim());
  const habilidade = Array.from(document.getElementById('habilidade-list').children).map(li => li.firstChild.textContent.trim());
  const idioma = Array.from(document.getElementById('idioma-list').children).map(li => li.firstChild.textContent.trim());

  let html = '';

  if (template === 'moderno') {
    // Two-column layout for Modern template
    let sidebarHtml = `<div class="resume-sidebar">`;
    sidebarHtml += `<div class="resume-header">`;
    if (nome) sidebarHtml += `<h2>${nome}</h2>`;
    if (contato) sidebarHtml += `<p>${contato}</p>`;
    sidebarHtml += `</div>`;
    if (habilidade.length > 0) {
        sidebarHtml += `<div class="sidebar-section"><h3>Habilidades</h3><ul>${habilidade.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
    }
    if (idioma.length > 0) {
        sidebarHtml += `<div class="sidebar-section"><h3>Idiomas</h3><ul>${idioma.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
    }
    sidebarHtml += `</div>`;

    let mainHtml = `<div class="resume-main-content">`;
    if (resumo) {
        mainHtml += `<div class="resume-section"><h3>Resumo Profissional</h3><p>${resumo}</p></div>`;
    }
    if (experiencia.length > 0) {
        mainHtml += `<div class="resume-section"><h3>Experiência Profissional</h3><ul>${experiencia.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
    }
    if (formacao.length > 0) {
        mainHtml += `<div class="resume-section"><h3>Formação Acadêmica</h3><ul>${formacao.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
    }
    mainHtml += `</div>`;

    html = sidebarHtml + mainHtml;

  } else {
    // Single-column layout for Standard template
    html += `<div class="resume-preview">`;
    if (nome || contato) {
      html += `<div class="resume-header">`;
      if (nome) html += `<h2>${nome}</h2>`;
      if (contato) html += `<p>${contato}</p>`;
      html += `</div>`;
    }
    if (resumo) {
      html += `<div class="resume-section"><h3>Resumo Profissional</h3><p>${resumo}</p></div>`;
    }
    const allSections = {
        'Experiência Profissional': experiencia,
        'Formação Acadêmica': formacao,
        'Habilidades': habilidade,
        'Idiomas': idioma
    };
    for (const [title, items] of Object.entries(allSections)) {
        if (items.length > 0) {
            html += `<div class="resume-section"><h3>${title}</h3><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul></div>`;
        }
    }
    html += `</div>`;
  }

  preview.innerHTML = html;
}


// Exportar PDF
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'in', format: 'letter' });
  const template = document.getElementById('template-select').value;

  // --- Get form data ---
  const nome = document.getElementById('nome').value;
  const contato = document.getElementById('contato').value;
  const resumo = document.getElementById('resumo').value;
  const experiencia = Array.from(document.getElementById('experiencia-list').children).map(li => li.firstChild.textContent.trim());
  const formacao = Array.from(document.getElementById('formacao-list').children).map(li => li.firstChild.textContent.trim());
  const habilidade = Array.from(document.getElementById('habilidade-list').children).map(li => li.firstChild.textContent.trim());
  const idioma = Array.from(document.getElementById('idioma-list').children).map(li => li.firstChild.textContent.trim());

  if (template === 'moderno') {
    // --- Modern Template PDF Generation ---
    const sidebarWidth = 3;
    const mainContentWidth = 8.5 - sidebarWidth - 0.5;
    const margin = 0.5;
    let y = 0;

    // Sidebar
    doc.setFillColor('#34495e');
    doc.rect(0, 0, sidebarWidth, 11, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    y = margin + 0.5;
    if (nome) {
        doc.setFontSize(22);
        doc.text(nome, margin, y);
        y += 0.35;
    }
    doc.setFont('helvetica', 'normal');
    if (contato) {
        doc.setFontSize(10);
        doc.text(contato, margin, y);
        y += 0.5;
    }

    function addSidebarSection(title, items) {
        if (!items || items.length === 0) return;
        doc.setFontSize(14);
        doc.text(title, margin, y);
        y += 0.25;
        doc.setLineWidth(0.01);
        doc.setDrawColor(255, 255, 255);
        doc.line(margin, y, sidebarWidth - margin, y);
        y += 0.2;
        doc.setFontSize(10);
        items.forEach(item => {
            const splitText = doc.splitTextToSize(item, sidebarWidth - margin * 2);
            doc.text(splitText, margin, y);
            y += (splitText.length * 0.18) + 0.1;
        });
        y += 0.3;
    }
    addSidebarSection("Habilidades", habilidade);
    addSidebarSection("Idiomas", idioma);

    // Main Content
    doc.setTextColor(0, 0, 0);
    y = margin + 0.5;
    function addMainSection(title, items, isSummary = false) {
        if (!items || items.length === 0) return;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor('#3498db');
        doc.text(title, sidebarWidth, y);
        y += 0.25;
        doc.setLineWidth(0.02);
        doc.setDrawColor('#3498db');
        doc.line(sidebarWidth, y, 8.5 - margin, y);
        y += 0.25;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        items.forEach(item => {
             const splitText = doc.splitTextToSize(item, mainContentWidth);
             doc.text(splitText, sidebarWidth, y);
             y += (splitText.length * 0.18) + (isSummary ? 0.1 : 0.2);
        });
        y += 0.3;
    }
    addMainSection("Resumo Profissional", [resumo], true);
    addMainSection("Experiência Profissional", experiencia);
    addMainSection("Formação Acadêmica", formacao);

  } else {
    // --- Standard Template PDF Generation ---
    const margin = 0.75;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - (margin * 2);
    let y = margin;
    function addSection(title, items) {
      if (!items || items.length === 0) return;
      if (y + 0.5 > pageHeight - margin) { doc.addPage(); y = margin; }
      doc.setFontSize(18);
      doc.text(title, margin, y);
      y += 0.25;
      doc.setLineWidth(0.01);
      doc.line(margin, y, pageWidth - margin, y);
      y += 0.25;
      doc.setFontSize(12);
      items.forEach(item => {
        if (y + 0.3 > pageHeight - margin) { doc.addPage(); y = margin; }
        const splitText = doc.splitTextToSize(item, maxWidth);
        doc.text(splitText, margin + 0.2, y);
        y += (splitText.length * 0.2) + 0.1;
      });
      y += 0.2;
    }
    if (nome) { doc.setFontSize(28); doc.text(nome, pageWidth / 2, y, { align: 'center' }); y += 0.4; }
    if (contato) { doc.setFontSize(14); doc.text(contato, pageWidth / 2, y, { align: 'center' }); y += 0.3; }
    doc.setLineWidth(0.02);
    doc.line(margin, y, pageWidth - margin, y);
    y += 0.4;
    if (resumo) { addSection("Resumo Profissional", [resumo]); }
    addSection("Experiência Profissional", experiencia);
    addSection("Formação Acadêmica", formacao);
    addSection("Habilidades", habilidade);
    addSection("Idiomas", idioma);
  }

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
