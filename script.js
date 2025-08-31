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
const storage = firebase.storage();

// --- Upload de Foto ---
function handleProfilePicUpload(file) {
    const user = auth.currentUser;
    if (!user) {
        alert("Você precisa estar logado para fazer o upload de uma foto.");
        return;
    }
    if (!file) return;

    const profilePicPreview = document.getElementById('profilePicPreview');
    const profilePicUrlInput = document.getElementById('profilePicUrl');

    // Mostra uma preview local imediata
    const reader = new FileReader();
    reader.onload = (e) => {
        profilePicPreview.src = e.target.result;
        profilePicPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    // Inicia o upload para o Firebase Storage
    const storageRef = storage.ref(`profile_pics/${user.uid}/${file.name}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed',
        (snapshot) => {
            // Opcional: mostrar progresso do upload
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        },
        (error) => {
            console.error("Erro no upload: ", error);
            alert("Falha no upload da imagem.");
        },
        () => {
            // Upload completo
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log('File available at', downloadURL);
                profilePicUrlInput.value = downloadURL; // Salva a URL no input escondido
                gerarPreview(); // Atualiza o preview do currículo
            });
        }
    );
}

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

function adicionarProjeto() {
    const container = document.getElementById('projetos-container');
    const newEntry = document.createElement('div');
    newEntry.className = 'projeto-entry';
    newEntry.innerHTML = `
        <input type="text" placeholder="Nome do Projeto">
        <input type="text" placeholder="Link do Projeto (opcional)">
        <textarea rows="2" placeholder="Descrição do projeto..."></textarea>
        <button type="button" class="remove-btn" onclick="this.parentElement.remove()">Remover</button>
    `;
    container.appendChild(newEntry);
}

function adicionarLink() {
    const container = document.getElementById('links-container');
    const newEntry = document.createElement('div');
    newEntry.className = 'link-entry';
    newEntry.innerHTML = `
        <input type="text" placeholder="Nome do Link (ex: LinkedIn, GitHub)">
        <input type="text" placeholder="URL do Link">
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
  previewElement.className = 'template-' + template;

  const nome = document.getElementById('nome').value;
  const contato = document.getElementById('contato').value;
  const resumo = document.getElementById('resumo').value;
  const idiomas = document.getElementById('idiomas').value;
  const profilePicUrl = document.getElementById('profilePicUrl').value;
  const profilePicHtml = profilePicUrl ? `<img src="${profilePicUrl}" alt="Foto de Perfil" class="profile-pic">` : '';

  let html = '';

  if (template === 'classico') {
    html = `${profilePicHtml}<h2>${nome}</h2>`;
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

    // Projetos
    const projetos = document.querySelectorAll('#projetos-container .projeto-entry');
    if (projetos.length > 0 && projetos[0].querySelector('input').value) {
        html += `<hr><h3>Projetos</h3>`;
        projetos.forEach(entry => {
            const nome = entry.querySelector('input:nth-child(1)').value;
            const link = entry.querySelector('input:nth-child(2)').value;
            const descricao = entry.querySelector('textarea').value;
            if (nome) {
                html += `<div><h4>${nome}</h4>${link ? `<a href="${link}" target="_blank">${link}</a>` : ''}<p>${descricao}</p></div>`;
            }
        });
    }

    // Links
    const links = document.querySelectorAll('#links-container .link-entry');
    if (links.length > 0 && links[0].querySelector('input').value) {
        html += `<hr><h3>Links Profissionais</h3><ul>`;
        links.forEach(entry => {
            const nome = entry.querySelector('input:nth-child(1)').value;
            const url = entry.querySelector('input:nth-child(2)').value;
            if (nome && url) {
                html += `<li><a href="${url}" target="_blank">${nome}</a></li>`;
            }
        });
        html += `</ul>`;
    }
  } else if (template === 'moderno') {
    // --- Template Moderno (Duas Colunas) ---
    html = `
        <div class="moderno-sidebar">
            ${profilePicHtml}
            <div class="moderno-contato">
                <h3>Contato</h3>
                <p>${contato.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="moderno-habilidades">
                <h3>Habilidades</h3>
                <ul>
                    ${Array.from(document.querySelectorAll('#habilidades-container .habilidade-entry input[type="text"]'))
                             .map(h => h.value.trim() ? `<li>${h.value.trim()}</li>` : '')
                             .join('')}
                </ul>
            </div>
            <div class="moderno-idiomas">
                <h3>Idiomas</h3>
                <ul>
                    ${idiomas.trim() ? idiomas.split(',').map(i => i.trim() ? `<li>${i.trim()}</li>` : '').join('') : ''}
                </ul>
            </div>
        </div>
        <div class="moderno-main">
            <div class="moderno-header">
                <h2>${nome}</h2>
            </div>
            <div class="moderno-resumo">
                <h3>Resumo Profissional</h3>
                <p>${resumo}</p>
            </div>
            <div class="moderno-experiencia">
                <h3>Experiências</h3>
                ${Array.from(document.querySelectorAll('#experiencias-container .experiencia-entry'))
                         .map(entry => {
                            const cargo = entry.querySelector('input:nth-child(1)').value;
                            const empresa = entry.querySelector('input:nth-child(2)').value;
                            const descricao = entry.querySelector('textarea').value;
                            return (cargo || empresa) ? `<div class="job"><h4>${cargo}</h4><h5>${empresa}</h5><p>${descricao.replace(/\n/g, '<br>')}</p></div>` : '';
                         }).join('')}
            </div>
            <div class="moderno-formacao">
                <h3>Formação Acadêmica</h3>
                ${Array.from(document.querySelectorAll('#formacao-container .formacao-entry'))
                         .map(entry => {
                            const curso = entry.querySelector('input:nth-child(1)').value;
                            const instituicao = entry.querySelector('input:nth-child(2)').value;
                            const ano = entry.querySelector('input:nth-child(3)').value;
                            return (curso || instituicao) ? `<div class="education"><h4>${curso}</h4><h5>${instituicao} (${ano})</h5></div>` : '';
                         }).join('')}
            </div>
            <div class="moderno-projetos">
                <h3>Projetos</h3>
                ${Array.from(document.querySelectorAll('#projetos-container .projeto-entry'))
                         .map(entry => {
                            const nome = entry.querySelector('input:nth-child(1)').value;
                            const link = entry.querySelector('input:nth-child(2)').value;
                            const descricao = entry.querySelector('textarea').value;
                            return (nome) ? `<div class="job"><h4>${nome}</h4>${link ? `<h5><a href="${link}" target="_blank">${link}</a></h5>` : ''}<p>${descricao.replace(/\n/g, '<br>')}</p></div>` : '';
                         }).join('')}
            </div>
             <div class="moderno-links">
                <h3>Links</h3>
                <ul>
                ${Array.from(document.querySelectorAll('#links-container .link-entry'))
                         .map(entry => {
                            const nome = entry.querySelector('input:nth-child(1)').value;
                            const url = entry.querySelector('input:nth-child(2)').value;
                            return (nome && url) ? `<li><a href="${url}" target="_blank">${nome}</a></li>` : '';
                         }).join('')}
                </ul>
            </div>
        </div>
    `;
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
        profilePicUrl: document.getElementById('profilePicUrl').value,
        experiencias: [],
        formacao: [],
        habilidades: [],
        projetos: [],
        links: [],
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

    document.querySelectorAll('#projetos-container .projeto-entry').forEach(entry => {
        curriculoData.projetos.push({
            nome: entry.querySelector('input:nth-child(1)').value,
            link: entry.querySelector('input:nth-child(2)').value,
            descricao: entry.querySelector('textarea').value
        });
    });

    document.querySelectorAll('#links-container .link-entry').forEach(entry => {
        curriculoData.links.push({
            nome: entry.querySelector('input:nth-child(1)').value,
            url: entry.querySelector('input:nth-child(2)').value
        });
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
            document.getElementById('projetos-container').innerHTML = '';
            document.getElementById('links-container').innerHTML = '';

            // Preencher campos
            document.getElementById('template-select').value = cv.template || 'classico';
            document.getElementById('nome').value = cv.nome || '';
            document.getElementById('contato').value = cv.contato || '';
            document.getElementById('resumo').value = cv.resumo || '';
            document.getElementById('idiomas').value = cv.idiomas || '';
            document.getElementById('profilePicUrl').value = cv.profilePicUrl || '';

            // Atualizar a preview da foto no formulário
            const profilePicPreview = document.getElementById('profilePicPreview');
            if (cv.profilePicUrl) {
                profilePicPreview.src = cv.profilePicUrl;
                profilePicPreview.style.display = 'block';
            } else {
                profilePicPreview.src = '';
                profilePicPreview.style.display = 'none';
            }

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

            if (cv.projetos) {
                cv.projetos.forEach(proj => {
                    adicionarProjeto();
                    const newEntry = document.querySelector('#projetos-container .projeto-entry:last-child');
                    newEntry.querySelector('input:nth-child(1)').value = proj.nome;
                    newEntry.querySelector('input:nth-child(2)').value = proj.link;
                    newEntry.querySelector('textarea').value = proj.descricao;
                });
            }

            if (cv.links) {
                cv.links.forEach(link => {
                    adicionarLink();
                    const newEntry = document.querySelector('#links-container .link-entry:last-child');
                    newEntry.querySelector('input:nth-child(1)').value = link.nome;
                    newEntry.querySelector('input:nth-child(2)').value = link.url;
                });
            }

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

// --- Drag and Drop ---
function inicializarArrastarESoltar() {
    const options = {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: gerarPreview // Atualiza o preview ao final do arraste
    };

    new Sortable(document.getElementById('experiencias-container'), options);
    new Sortable(document.getElementById('formacao-container'), options);
    new Sortable(document.getElementById('habilidades-container'), options);
    new Sortable(document.getElementById('projetos-container'), options);
    new Sortable(document.getElementById('links-container'), options);
}

// Gera um preview inicial ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
    adicionarExperiencia();
    adicionarFormacao();
    adicionarHabilidade();
    adicionarProjeto();
    adicionarLink();
    gerarPreview();
    inicializarArrastarESoltar(); // Ativa o drag and drop
});
