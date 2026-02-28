import { loadData, saveData } from './storage.js';
import { updateUI, renderTable } from './ui.js';
import { setupForms } from './forms.js';

// Função de backup (definida aqui)
function exportBackup(data) {
    if (!data || Object.keys(data).length === 0) {
        alert('Nenhum dado para exportar ainda.');
        return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motorista-pro-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Função de importação (agora recebe data como parâmetro)
function importBackup(event, currentData) {
    const file = event.target.files[0];
    if (!file) return;

    console.log("📄 Arquivo selecionado:", file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            console.log("✅ Conteúdo lido");
            const importedData = JSON.parse(ev.target.result);

            if (!importedData || !importedData.months || !importedData.currentMonth) {
                alert('Arquivo inválido ou corrompido.');
                return;
            }

            // Mescla os dados importados com os atuais (ou sobrescreve)
            Object.assign(currentData, importedData);

            console.log("💾 Dados importados:", currentData);

            saveData(currentData);

            alert('✅ Dados importados com sucesso!\nA página será recarregada.');

            location.reload();
        } catch (err) {
            console.error("❌ Erro:", err);
            alert('Erro ao importar: ' + err.message);
        }
    };

    reader.readAsText(file);
}

export function initApp() {
    let data = loadData();

    // Inicializa select de meses
    const sel = document.getElementById('monthSelect');
    if (!data.months[data.currentMonth]) data.months[data.currentMonth] = {trips:[], withdrawals:[], startingBalance:0};
    
    Object.keys(data.months).sort().reverse().forEach(m => {
        sel.innerHTML += `<option value="${m}" ${m === data.currentMonth ? 'selected' : ''}>${m}</option>`;
    });

    sel.onchange = (e) => {
        data.currentMonth = e.target.value;
        saveData(data);
        renderTable(data, data.currentMonth);
        updateUI(data);
    };

    // Preenche campos de configuração
    document.getElementById('inputDailyPersonal').value = data.dailyPersonal || "";
    document.getElementById('inputDailyMaint').value = data.dailyMaintenance || "";
    document.getElementById('inputDefaultKmL').value = data.defaultKmL || "";

    // Configura eventos dos formulários
    setupForms(data);

    // Botão Backup
    document.getElementById('backupBtn').addEventListener('click', () => {
        exportBackup(data);
    });

    // Importar Backup (listener correto, passando data)
    document.getElementById('fileInput').addEventListener('change', (event) => {
        importBackup(event, data);
    });

    // Primeira renderização
    renderTable(data, data.currentMonth);
    updateUI(data);

    // Event delegation para ações da tabela (excluir e editar)
document.querySelector('#tripTable tbody').addEventListener('click', (e) => {
    const target = e.target;

    // Botão excluir
    if (target.classList.contains('delete-btn')) {
        const type = target.dataset.type;
        const idx = parseInt(target.dataset.idx);
        if (confirm('Excluir este registro?')) {
            if (type === 'trip') {
                data.months[data.currentMonth].trips.splice(idx, 1);
            } else {
                data.months[data.currentMonth].withdrawals.splice(idx, 1);
            }
            saveData(data);
            renderTable(data, data.currentMonth);
            updateUI(data);
        }
    }

    // Botão editar sangria
    if (target.classList.contains('edit-btn')) {
        const idx = parseInt(target.dataset.idx);
        editWithdrawal(idx, data); // função que já existe ou vamos criar
    }
});
}