// Importações oficiais do Firebase v10
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Suas credenciais originais
const firebaseConfig = {
    apiKey: "AIzaSyBH4hDVSqv7enMugPWUaM9CksO4F1yKvuQ",
    authDomain: "controle-de-validade-3e66a.firebaseapp.com",
    projectId: "controle-de-validade-3e66a",
    storageBucket: "controle-de-validade-3e66a.firebasestorage.app",
    messagingSenderId: "163605465156",
    appId: "1:163605465156:web:8f7728cbf73e6bf6265411"
};

// Inicializa o Firebase e o Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const produtosCollection = collection(db, "produtos");
const catalogoCollection = collection(db, "catalogo");
const setoresCollection = collection(db, "setores");

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Formulário e UI de Produtos
    const productForm = document.getElementById('product-form');
    const productBarcodeInput = document.getElementById('product-barcode');
    const productNameInput = document.getElementById('product-name');
    const productQuantityInput = document.getElementById('product-quantity');
    const productExpiryInput = document.getElementById('product-expiry');
    const productSectorSelect = document.getElementById('product-sector');

    // Elementos da Nova Tela de Setores
    const sectorForm = document.getElementById('sector-form');
    const newSectorNameInput = document.getElementById('new-sector-name');
    const setoresTableBody = document.getElementById('setores-table-body');
    const dashSetorCounter = document.getElementById('dash-setor-counter');

    // Botões de Navegação do Dashboard
    const btnCardAdicionar = document.getElementById('btn-card-adicionar');
    const btnCardVencidos = document.getElementById('btn-card-vencidos');
    const btnCardVencendo = document.getElementById('btn-card-vencendo');
    const btnCardAvencer = document.getElementById('btn-card-avencer');
    const btnCardBanco = document.getElementById('btn-card-banco');
    const btnCardSetor = document.getElementById('btn-card-setor');

    const btnBack = document.getElementById('btn-back');
    const btnHome = document.getElementById('btn-home');
    const btnLogout = document.getElementById('btn-logout');

    // Telas (Views)
    const viewDashboard = document.getElementById('view-dashboard');
    const viewAdicionar = document.getElementById('view-adicionar');
    const viewVencidos = document.getElementById('view-vencidos');
    const viewVencendo = document.getElementById('view-vencendo');
    const viewBanco = document.getElementById('view-banco');
    const viewAvencer = document.getElementById('view-avencer');
    const viewSetores = document.getElementById('view-setores');

    // Tabelas e Contadores Gerais
    const vencidosTableBody = document.getElementById('vencidos-table-body');
    const vencendoTableBody = document.getElementById('vencendo-table-body');
    const avencerTableBody = document.getElementById('avencer-table-body');
    
    const dashVencidosCounter = document.getElementById('dash-vencidos-counter');
    const dashVencendoCounter = document.getElementById('dash-vencendo-counter');
    const dashAvencerCounter = document.getElementById('dash-avencer-counter');
    const panelCloudCounter = document.getElementById('panel-cloud-counter');

    // Input CSV
    const csvFileInput = document.getElementById('csv-file-input');

    // Variável de controle do Scanner de Câmera
    let html5QrcodeScanner = null;
    const btnStartScan = document.getElementById('btn-start-scan');
    const btnStopScan = document.getElementById('btn-stop-scan');

    // --- SISTEMA DE NAVEGAÇÃO DE TELAS ---
    function switchView(targetView) {
        const views = [viewDashboard, viewAdicionar, viewVencidos, viewVencendo, viewBanco, viewAvencer, viewSetores];
        views.forEach(v => { if (v) v.classList.add('hidden'); });
        
        if (targetView) targetView.classList.remove('hidden');

        if (targetView === viewDashboard) {
            if (btnBack) btnBack.classList.add('hidden');
            stopScanner(); 
        } else {
            if (btnBack) btnBack.classList.remove('hidden');
        }
    }

    if (btnCardAdicionar) btnCardAdicionar.addEventListener('click', () => { switchView(viewAdicionar); if (productBarcodeInput) productBarcodeInput.focus(); });
    if (btnCardVencidos) btnCardVencidos.addEventListener('click', () => switchView(viewVencidos));
    if (btnCardVencendo) btnCardVencendo.addEventListener('click', () => switchView(viewVencendo));
    if (btnCardAvencer) btnCardAvencer.addEventListener('click', () => switchView(viewAvencer));
    if (btnCardBanco) btnCardBanco.addEventListener('click', () => switchView(viewBanco));
    if (btnCardSetor) btnCardSetor.addEventListener('click', () => switchView(viewSetores));

    if (btnBack) btnBack.addEventListener('click', () => switchView(viewDashboard));
    if (btnHome) btnHome.addEventListener('click', () => switchView(viewDashboard));

    // --- LOGICA EXCLUSIVA DA PÁGINA DE SETORES ---
    if (sectorForm) {
        sectorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nomeSetor = newSectorNameInput.value.trim();
            if (nomeSetor) {
                try {
                    await addDoc(setoresCollection, { nome: nomeSetor });
                    newSectorNameInput.value = '';
                } catch (err) {
                    alert("Erro ao cadastrar setor: " + err.message);
                }
            }
        });
    }

    // Escuta em tempo real a coleção de setores
    onSnapshot(setoresCollection, (snapshot) => {
        if (productSectorSelect) productSectorSelect.innerHTML = '<option value="">Selecione um Setor</option>';
        if (setoresTableBody) setoresTableBody.innerHTML = '';
        
        let listaSetores = [];
        snapshot.forEach(docSnap => {
            listaSetores.push({ id: docSnap.id, nome: docSnap.data().nome });
        });
        
        // Ordena em ordem alfabética
        listaSetores.sort((a, b) => a.nome.localeCompare(b.nome));

        listaSetores.forEach(setor => {
            // 1. Alimenta o menu de escolha (Select) na página de adicionar produto
            if (productSectorSelect) {
                const option = document.createElement('option');
                option.value = setor.nome;
                option.textContent = setor.nome;
                productSectorSelect.appendChild(option);
            }
            
            // 2. Alimenta a tabela de listagem na página gerenciadora de setores
            if (setoresTableBody) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>📍 <strong>${setor.nome}</strong></td>
                    <td style="text-align: center;"><button class="btn-del" data-id="${setor.id}">Apagar</button></td>
                `;
                
                const btnDelSector = tr.querySelector('.btn-del');
                btnDelSector.addEventListener('click', async () => {
                    if (confirm(`Deseja remover o setor "${setor.nome}" permanentemente?`)) {
                        try {
                            await deleteDoc(doc(db, "setores", setor.id));
                        } catch (err) {
                            alert("Erro ao excluir setor: " + err.message);
                        }
                    }
                });
                
                setoresTableBody.appendChild(tr);
            }
        });

        // Atualiza o número do contador no card roxo do painel principal
        if (dashSetorCounter) dashSetorCounter.textContent = listaSetores.length;
    });

    // --- CONTROLES E GERENCIAMENTO DA CÂMERA (SCANNER) ---
    function startScanner() {
        if (!html5QrcodeScanner) {
            html5QrcodeScanner = new Html5Qrcode("reader");
        }
        
        btnStartScan.classList.add('hidden');
        btnStopScan.classList.remove('hidden');

        html5QrcodeScanner.start(
            { facingMode: "environment" },
            { fps: 15, qrbox: { width: 260, height: 150 } },
            (decodedText) => {
                if (productBarcodeInput) {
                    productBarcodeInput.value = decodedText;
                    const event = new Event('input', { bubbles: true });
                    productBarcodeInput.dispatchEvent(event);
                }
                stopScanner();
            },
            (errorMessage) => { }
        ).catch(err => {
            alert("Erro ao iniciar câmera: " + err);
            stopScanner();
        });
    }

    function stopScanner() {
        if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop().then(() => {
                btnStartScan.classList.remove('hidden');
                btnStopScan.classList.add('hidden');
            }).catch(err => console.log("Erro ao parar:", err));
        } else {
            if (btnStartScan) btnStartScan.classList.remove('hidden');
            if (btnStopScan) btnStopScan.classList.add('hidden');
        }
    }

    if (btnStartScan) btnStartScan.addEventListener('click', startScanner);
    if (btnStopScan) btnStopScan.addEventListener('click', stopScanner);

    // --- BUSCA AUTOMÁTICA NO CATÁLOGO DO PRODUTO ---
    if (productBarcodeInput) {
        productBarcodeInput.addEventListener('input', () => {
            const code = productBarcodeInput.value.trim();
            if (code.length >= 8) {
                const unsub = onSnapshot(catalogoCollection, (snapshot) => {
                    snapshot.forEach(doc => {
                        if (String(doc.data().barcode).trim() === code) {
                            if (productNameInput) productNameInput.value = doc.data().name;
                        }
                    });
                    unsub();
                });
            }
        });
    }

    // --- LEITURA REAL-TIME DOS PRODUTOS DO FIRESTORE ---
    onSnapshot(produtosCollection, (snapshot) => {
        if (vencidosTableBody) vencidosTableBody.innerHTML = '';
        if (vencendoTableBody) vencendoTableBody.innerHTML = '';
        if (avencerTableBody) avencerTableBody.innerHTML = '';

        let countVencidos = 0;
        let countVencendo = 0;
        let countAvencer = 0;
        let countTotalNuvem = 0;

        const hojeStr = new Date().toISOString().split('T')[0];
        const hoje = new Date(hojeStr + 'T00:00:00');

        snapshot.forEach((docSnap) => {
            countTotalNuvem++;
            const data = docSnap.data();
            const id = docSnap.id;

            const vencimento = new Date(data.expiry + 'T00:00:00');
            const diferencaTempo = vencimento.getTime() - hoje.getTime();
            const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));

            const dataFormatada = data.expiry.split('-').reverse().join('/');

            if (diferencaDias < 0) {
                countVencidos++;
                renderRow(vencidosTableBody, id, data, dataFormatada, `Vencido há ${Math.abs(diferencaDias)} dias`);
            } else if (diferencaDias === 0) {
                countVencendo++;
                renderRow(vencendoTableBody, id, data, dataFormatada, 'Vence HOJE!');
            } else if (diferencaDias > 0 && diferencaDias <= 10) {
                countAvencer++;
                renderRow(avencerTableBody, id, data, dataFormatada, `${diferencaDias} dias`);
            }
        });

        if (dashVencidosCounter) dashVencidosCounter.textContent = countVencidos;
        if (dashVencendoCounter) dashVencendoCounter.textContent = countVencendo;
        if (dashAvencerCounter) dashAvencerCounter.textContent = countAvencer;
        if (panelCloudCounter) panelCloudCounter.textContent = `${countTotalNuvem} PRODUTOS NA NUVEM`;
    });

    function renderRow(tableBody, id, data, dataFormatada, statusText) {
        if (!tableBody) return;
        const tr = document.createElement('tr');
        const isAvencerTable = tableBody.id === 'avencer-table-body';

        tr.innerHTML = `
            <td>${data.barcode || '---'}</td>
            <td>
                <span class="product-title-cell">${data.name}</span>
                ${data.sector ? `<span style="display:block; font-size:11px; color:#64748b; margin-top:2px;">📍 ${data.sector}</span>` : ''}
            </td>
            <td>${data.quantity}</td>
            <td>${dataFormatada}</td>
            <td>${isAvencerTable ? `<strong>${statusText}</strong>` : `<button class="btn-del" data-id="${id}">Apagar</button>`}</td>
        `;

        if (!isAvencerTable) {
            const btnDel = tr.querySelector('.btn-del');
            btnDel.addEventListener('click', async () => {
                if (confirm("Deseja realmente remover este produto permanentemente?")) {
                    try {
                        await deleteDoc(doc(db, "produtos", id));
                    } catch (err) {
                        alert("Erro ao excluir documento: " + err.message);
                    }
                }
            });
        }

        tableBody.appendChild(tr);
    }

    // --- IMPORTADOR DE PLANILHA CSV ---
    if (csvFileInput) {
        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (evt) => {
                const text = evt.target.result;
                const lines = text.split('\n');
                const batch = writeBatch(db);
                let count = 0;

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const cols = line.split(/[;,]/);
                    if (cols.length >= 4) {
                        const barcode = cols[0].replace(/"/g, '').trim();
                        const name = cols[1].replace(/"/g, '').trim();
                        const quantity = parseInt(cols[2].replace(/"/g, '').trim()) || 1;
                        const expiry = cols[3].replace(/"/g, '').trim();

                        if (name && expiry) {
                            const newDocRef = doc(collection(db, "produtos"));
                            batch.set(newDocRef, { barcode, name, quantity, expiry });
                            count++;
                        }
                    }
                }

                if (count > 0) {
                    try {
                        await batch.commit();
                        alert(`${count} produtos importados com sucesso!`);
                        csvFileInput.value = '';
                    } catch (err) {
                        alert("Erro ao salvar lote de CSV: " + err.message);
                    }
                } else {
                    alert("Nenhum produto válido foi encontrado no arquivo CSV.");
                }
            };
            reader.readAsText(file, 'UTF-8');
        });
    }

    // --- SALVAR PRODUTO MANUAL NO FIRESTORE ---
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const barcode = productBarcodeInput.value.trim();
            const name = productNameInput.value.trim();
            const quantity = productQuantityInput.value || 1;
            const expiry = productExpiryInput.value;
            const sector = productSectorSelect ? productSectorSelect.value : '';

            if (name && expiry) {
                try {
                    await addDoc(produtosCollection, {
                        barcode,
                        name,
                        quantity,
                        expiry,
                        sector
                    });
                    
                    productBarcodeInput.value = '';
                    productNameInput.value = '';
                    productExpiryInput.value = '';
                    if (productQuantityInput) productQuantityInput.value = "1";
                    if (productSectorSelect) productSectorSelect.value = "";
                    if (productBarcodeInput) productBarcodeInput.focus();
                } catch (err) {
                    alert("Erro ao salvar no Firestore: " + err.message);
                }
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            window.location.replace(window.location.origin + basePath + "index.html");
        });
    }
});
