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

// Login Google
function loginGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      document.getElementById('userEmail').innerText = result.user.email;
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'inline';
    })
    .catch(error => alert(error.message));
}

function logout() {
  auth.signOut().then(() => {
    document.getElementById('userEmail').innerText = '';
    document.getElementById('loginBtn').style.display = 'inline';
    document.getElementById('logoutBtn').style.display = 'none';
  });
}

// Monitor login status
auth.onAuthStateChanged(user => {
  if(user){
    document.getElementById('userEmail').innerText = user.email;
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline';
  } else {
    document.getElementById('userEmail').innerText = '';
    document.getElementById('loginBtn').style.display = 'inline';
    document.getElementById('logoutBtn').style.display = 'none';
  }
});

// --- Funções para Campos Dinâmicos ---

function adicionarExperiencia() {
    const container = document.getElementById('experiencias-container');
    const newEntry = document.createElement('div');
    newEntry.className = 'experiencia-entry';
    newEntry.innerHTML = `
        <input type="text" placeholder="Cargo">
        <input type="text" placeholder="Empresa">
        <textarea rows="2" placeholder="Descrição das atividades..."></textarea>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remover</button>
    `;
    container.appendChild(newEntry);
}

function adicionarFormacao() {
    const container = document.getElementById('formacao-container');
    const newEntry = document.createElement('div');
    newEntry.className = 'formacao-entry';
    newEntry.innerHTML = `
        <input type="text" placeholder="Curso ou Formação">
        <input type="text" placeholder="Instituição de Ensino">
        <input type="text" placeholder="Ano de Conclusão">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remover</button>
    `;
    container.appendChild(newEntry);
}

function adicionarHabilidade() {
    const container = document.getElementById('habilidades-container');
    const newEntry = document.createElement('div');
    newEntry.className = 'habilidade-entry';
    newEntry.innerHTML = `
        <input type="text" placeholder="Habilidade (ex: Comunicação, Pacote Office)">
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remover</button>
    `;
    container.appendChild(newEntry);
}


// Gerar Preview
function gerarPreview() {
  const template = document.getElementById('template-select').value;
  const previewElement = document.getElementById('preview');
  previewElement.className = 'template-' + template; // Adiciona a classe do template

  const nome = document.getElementById('nome').value;
  const contato = document.getElementById('contato').value;
  const resumo = document.getElementById('resumo').value;
  const idiomas = document.getElementById('idiomas').value;
  let html = '';

  if (template === 'classico') {
    html = `<h2>${nome}</h2>`;
    html += `<p><strong>Contato:</strong> ${contato}</p>`;
    html += `<p><strong>Resumo:</strong> ${resumo}</p>`;
    html += '<hr>';

    // Experiências
    const experiencias = document.querySelectorAll('#experiencias-container .experiencia-entry');
    if (experiencias.length > 0 && experiencias[0].querySelector('input').value) {
      html += `<h3>Experiências</h3><ul>`;
      experiencias.forEach(entry => {
          const cargo = entry.querySelector('input:nth-child(1)').value;
          const empresa = entry.querySelector('input:nth-child(2)').value;
          const descricao = entry.querySelector('textarea').value;
          if (cargo || empresa) {
              html += `<li><strong>${cargo || 'Cargo'}</strong> em ${empresa || 'Empresa'}<br>${descricao}</li>`;
          }
      });
      html += `</ul><hr>`;
    }

    // Formação Acadêmica
    const formacoes = document.querySelectorAll('#formacao-container .formacao-entry');
    if (formacoes.length > 0 && formacoes[0].querySelector('input').value) {
      html += `<h3>Formação Acadêmica</h3><ul>`;
      formacoes.forEach(entry => {
          const curso = entry.querySelector('input:nth-child(1)').value;
          const instituicao = entry.querySelector('input:nth-child(2)').value;
          const ano = entry.querySelector('input:nth-child(3)').value;
          if (curso || instituicao) {
              html += `<li><strong>${curso}</strong> - ${instituicao} (${ano})</li>`;
          }
      });
      html += `</ul><hr>`;
    }

    // Habilidades
    const habilidades = document.querySelectorAll('#habilidades-container .habilidade-entry input[type="text"]');
    if (habilidades.length > 0 && habilidades[0].value) {
      html += `<h3>Habilidades</h3><ul>`;
      habilidades.forEach(habilidade => {
        if (habilidade.value.trim()) {
          html += `<li>${habilidade.value.trim()}</li>`;
        }
      });
      html += `</ul><hr>`;
    }

    // Idiomas
    if (idiomas.trim()) {
        html += `<h3>Idiomas</h3><ul>`;
        idiomas.split(',').forEach(i => { if(i.trim()) html += `<li>${i.trim()}</li>`; });
        html += `</ul>`;
    }
  } else if (template === 'moderno') {
      // Lógica para o template moderno (a ser implementada)
      html = `<h1>${nome || 'Seu Nome'}</h1><p>Template Moderno em breve!</p>`;
  }

  previewElement.innerHTML = html;
}

// Exportar PDF
function exportarPDF() {
  const element = document.getElementById('preview');
  html2pdf().set({margin:0.5, filename:'curriculo.pdf', html2canvas:{scale:2}}).from(element).save();
}

// --- Funções de Persistência (Salvar/Carregar) ---

function salvarCurriculo() {
    const user = auth.currentUser;
    if (!user) {
        alert("Por favor, faça login para salvar seu currículo.");
        return;
    }

    const curriculoData = {
        template: document.getElementById('template-select').value,
        nome: document.getElementById('nome').value,
        contato: document.getElementById('contato').value,
        resumo: document.getElementById('resumo').value,
        idiomas: document.getElementById('idiomas').value,
        experiencias: [],
        formacao: [],
        habilidades: [],
        salvoEm: new Date()
    };

    document.querySelectorAll('#experiencias-container .experiencia-entry').forEach(entry => {
        curriculoData.experiencias.push({
            cargo: entry.querySelector('input:nth-child(1)').value,
            empresa: entry.querySelector('input:nth-child(2)').value,
            descricao: entry.querySelector('textarea').value
        });
    });
    document.querySelectorAll('#formacao-container .formacao-entry').forEach(entry => {
        curriculoData.formacao.push({
            curso: entry.querySelector('input:nth-child(1)').value,
            instituicao: entry.querySelector('input:nth-child(2)').value,
            ano: entry.querySelector('input:nth-child(3)').value
        });
    });
    document.querySelectorAll('#habilidades-container .habilidade-entry input[type="text"]').forEach(entry => {
        if (entry.value.trim()) curriculoData.habilidades.push(entry.value.trim());
    });

    db.collection('usuarios').doc(user.uid).collection('curriculos').add(curriculoData)
        .then(() => {
            alert(`Currículo salvo com sucesso!`);
            carregarListaCurriculos(); // Atualiza a lista
        })
        .catch(error => console.error("Erro ao salvar: ", error));
}

function carregarListaCurriculos() {
    const user = auth.currentUser;
    if (!user) return;

    const savedCvArea = document.getElementById('savedCvArea');
    const select = document.getElementById('savedCvSelect');
    select.innerHTML = '<option value="">Selecione um currículo...</option>';

    db.collection('usuarios').doc(user.uid).collection('curriculos').orderBy('salvoEm', 'desc').get()
        .then(snapshot => {
            if (snapshot.empty) {
                savedCvArea.style.display = 'none';
                return;
            }
            snapshot.forEach(doc => {
                const cv = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                const dataFormatada = cv.salvoEm.toDate().toLocaleString('pt-BR');
                option.textContent = `${cv.nome || 'Currículo'} - ${dataFormatada}`;
                select.appendChild(option);
            });
            savedCvArea.style.display = 'block';
        });
}

function carregarCurriculo() {
    const user = auth.currentUser;
    const cvId = document.getElementById('savedCvSelect').value;
    if (!user || !cvId) return;

    db.collection('usuarios').doc(user.uid).collection('curriculos').doc(cvId).get()
        .then(doc => {
            if (!doc.exists) {
                alert("Currículo não encontrado.");
                return;
            }
            const cv = doc.data();

            // Limpar campos existentes
            document.getElementById('experiencias-container').innerHTML = '';
            document.getElementById('formacao-container').innerHTML = '';
            document.getElementById('habilidades-container').innerHTML = '';

            // Preencher campos
            document.getElementById('template-select').value = cv.template || 'classico';
            document.getElementById('nome').value = cv.nome || '';
            document.getElementById('contato').value = cv.contato || '';
            document.getElementById('resumo').value = cv.resumo || '';
            document.getElementById('idiomas').value = cv.idiomas || '';

            cv.experiencias.forEach(exp => {
                adicionarExperiencia();
                const newEntry = document.querySelector('#experiencias-container .experiencia-entry:last-child');
                newEntry.querySelector('input:nth-child(1)').value = exp.cargo;
                newEntry.querySelector('input:nth-child(2)').value = exp.empresa;
                newEntry.querySelector('textarea').value = exp.descricao;
            });
            cv.formacao.forEach(form => {
                adicionarFormacao();
                const newEntry = document.querySelector('#formacao-container .formacao-entry:last-child');
                newEntry.querySelector('input:nth-child(1)').value = form.curso;
                newEntry.querySelector('input:nth-child(2)').value = form.instituicao;
                newEntry.querySelector('input:nth-child(3)').value = form.ano;
            });
            cv.habilidades.forEach(hab => {
                adicionarHabilidade();
                const newEntry = document.querySelector('#habilidades-container .habilidade-entry:last-child');
                newEntry.querySelector('input[type="text"]').value = hab;
            });

            gerarPreview(); // Atualiza o preview com os dados carregados
        });
}

function deletarCurriculo() {
    const user = auth.currentUser;
    const cvId = document.getElementById('savedCvSelect').value;
    if (!user || !cvId) return;

    if (confirm("Tem certeza que deseja deletar este currículo? Esta ação não pode ser desfeita.")) {
        db.collection('usuarios').doc(user.uid).collection('curriculos').doc(cvId).delete()
            .then(() => {
                alert("Currículo deletado com sucesso.");
                carregarListaCurriculos(); // Atualiza a lista
            })
            .catch(error => console.error("Erro ao deletar: ", error));
    }
}

// Comprar Premium (Lógica mantida)
function comprarPremium() {
    const user = auth.currentUser;
    if(!user){
        alert("Você precisa fazer login para comprar Premium.");
        loginGoogle();
        return;
    }
    db.collection('usuarios').doc(user.uid).set({premium:true}, {merge:true})
        .then(()=>alert("Premium ativado!"))
        .catch(err=>alert("Erro: "+err));
}

// Monitorar Status de Autenticação e Premium
auth.onAuthStateChanged(user => {
  const savedCvArea = document.getElementById('savedCvArea');
  if(user){
    // Usuário logado
    document.getElementById('userEmail').innerText = user.email;
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline';

    // Checar status premium e carregar currículos
    db.collection('usuarios').doc(user.uid).get().then(doc => {
        if(doc.exists && doc.data().premium){
          console.log("Usuário Premium verificado.");
          document.querySelector('#template-select option[value="moderno"]').disabled = false;
        } else {
          document.querySelector('#template-select option[value="moderno"]').disabled = true;
        }
    });
    carregarListaCurriculos();

  } else {
    // Usuário deslogado
    document.getElementById('userEmail').innerText = '';
    document.getElementById('loginBtn').style.display = 'inline';
    document.getElementById('logoutBtn').style.display = 'none';
    savedCvArea.style.display = 'none'; // Esconde a área de currículos salvos
    document.querySelector('#template-select option[value="moderno"]').disabled = true;
  }
});

// --- Pré-visualização em Tempo Real ---
document.getElementById('cvForm').addEventListener('input', gerarPreview);

// Gera um preview inicial ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    adicionarExperiencia();
    adicionarFormacao();
    adicionarHabilidade();
    gerarPreview();
});
