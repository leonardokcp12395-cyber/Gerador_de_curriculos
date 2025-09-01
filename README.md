# Gerador de Currículos Profissional

Um aplicativo web interativo para criar, customizar e exportar currículos profissionais de forma rápida e fácil.

## Screenshot

![Placeholder para Screenshot do Aplicativo](https://via.placeholder.com/800x450.png?text=Preview+do+Aplicativo)
*(Substitua este placeholder por uma imagem real do aplicativo)*

## Funcionalidades Atuais

-   **Editor Intuitivo:** Interface de duas colunas com formulário à esquerda e preview ao vivo à direita.
-   **Seções Dinâmicas:** Adicione, remova e reordene seções de Experiência, Formação, Habilidades, Projetos e mais.
-   **Customização Avançada:**
    -   Múltiplos templates (Clássico e Moderno).
    -   Seleção de cores de destaque e fontes.
    -   Ícones para cada seção do currículo.
    -   Ajuste de margens e espaçamentos.
-   **Login e Persistência:** Salve múltiplos currículos na sua conta (Firebase Auth) e continue editando mais tarde.
-   **Exportação Múltipla:** Exporte seu currículo em formato PDF ou DOCX.

## Tecnologias Utilizadas

-   **Front-End:** HTML5, CSS3, JavaScript (Vanilla JS)
-   **Back-End / BaaS:** Google Firebase (Authentication, Firestore, Storage)
-   **Bibliotecas Principais:**
    -   `html2pdf.js`: Para exportação em PDF.
    -   `docshift`: Para exportação em DOCX.
    -   `SortableJS`: Para a funcionalidade de arrastar e soltar.
    -   `Font Awesome`: Para a biblioteca de ícones.

## Como Rodar Localmente

O projeto é 100% front-end e não requer um servidor ou build steps complexos.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    ```
2.  **Navegue até o diretório:**
    ```bash
    cd seu-repositorio
    ```
3.  **Abra o arquivo principal:**
    -   Abra o arquivo `frontend/index.html` diretamente no seu navegador de preferência (Chrome, Firefox, etc.).

## Roadmap de Melhorias Futuras

Esta é uma lista de funcionalidades planejadas para o futuro, baseada no plano original:

-   [ ] **Sistema de Pagamentos:** Integração com Stripe ou PagSeguro para gerenciar as assinaturas Premium.
-   [ ] **Autenticação Social Adicional:** Adicionar mais provedores de login (ex: Facebook, Apple ID).
-   [ ] **Histórico de Versões:** Permitir que o usuário visualize e restaure versões antigas de um currículo.
-   [ ] **Empacotamento para Mobile:** Usar o Kodular ou outra ferramenta de WebView para criar um aplicativo Android.
-   [...e mais!]

---
*Gerado com a ajuda de um assistente de IA.*
