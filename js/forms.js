import { saveData } from './storage.js';
import { updateUI, renderTable } from './ui.js';
import { calculateFinances } from './calculate.js';

export function setupForms(data) {
    // Salvar configurações de metas
    document.getElementById('saveSettingsBtn').onclick = () => {
        data.dailyPersonal    = parseFloat(document.getElementById('inputDailyPersonal').value.replace(',', '.')) || 0;
        data.dailyMaintenance = parseFloat(document.getElementById('inputDailyMaint').value.replace(',', '.')) || 0;
        data.defaultKmL       = parseFloat(document.getElementById('inputDefaultKmL').value.replace(',', '.')) || 0;

        saveData(data);
        updateUI(data);

        alert('Configurações salvas!\n\n' +
              'Ganhos Pessoais/Dia: ' + data.dailyPersonal + '\n' +
              'Manutenção/Dia: ' + data.dailyMaintenance + '\n' +
              'Consumo (KM/L): ' + data.defaultKmL);
    };

    // Registrar viagem (turno completo)
    document.getElementById('tripForm').onsubmit = (e) => {
        e.preventDefault();

        const initialKm = +document.getElementById('initialKm').value;
        const finalKm   = +document.getElementById('finalKm').value;
        const fuelCostStr = document.getElementById('fuelCost').value.trim();
        const fuelCost  = fuelCostStr ? parseFloat(fuelCostStr.replace(',', '.')) : 0;
        const grossEarned = +document.getElementById('grossEarned').value;

        // Validações básicas
        if (isNaN(initialKm) || isNaN(finalKm) || isNaN(grossEarned)) {
            alert('Preencha KM Inicial, KM Final e Ganhos Brutos corretamente.');
            return;
        }
        if (finalKm <= initialKm) {
            alert('KM Final deve ser maior que KM Inicial.');
            return;
        }

        const trip = {
            date: new Date().toLocaleDateString('pt-BR'),
            initialKm,
            finalKm,
            fuelCost,
            grossEarned
        };

        if (!data.months[data.currentMonth]) {
            data.months[data.currentMonth] = { trips: [], withdrawals: [], startingBalance: 0 };
        }
        data.months[data.currentMonth].trips.unshift(trip);

        saveData(data);
        renderTable(data, data.currentMonth);
        updateUI(data);
        e.target.reset();
    };

    // Sangria (retirada)
    document.getElementById('withdrawForm').onsubmit = (e) => {
        e.preventDefault();

        const withdraw = {
            date: new Date().toLocaleDateString('pt-BR'),
            category: document.getElementById('withdrawCategory').value,
            value: +document.getElementById('withdrawVal').value,
            description: document.getElementById('withdrawDesc').value
        };

        if (!data.months[data.currentMonth]) {
            data.months[data.currentMonth] = { trips: [], withdrawals: [], startingBalance: 0 };
        }
        if (!data.months[data.currentMonth].withdrawals) {
            data.months[data.currentMonth].withdrawals = [];
        }
        data.months[data.currentMonth].withdrawals.unshift(withdraw);

        saveData(data);
        renderTable(data, data.currentMonth);
        updateUI(data);
        e.target.reset();
    };

    // Fechar mês
    document.getElementById('closeMonthBtn').onclick = () => {
        if (!confirm('Fechar mês? Isso inicia um novo mês com o saldo de emergência atual.')) return;

        const fin = calculateFinances(data, data.currentMonth);
        const next = new Date(data.currentMonth + '-01');
        next.setMonth(next.getMonth() + 1);
        const nk = next.toISOString().slice(0, 7);

        data.months[nk] = { trips: [], withdrawals: [], startingBalance: fin.emergency };
        data.currentMonth = nk;

        saveData(data);
        location.reload();
    };

    // Reset total do app
    document.getElementById('resetAppBtn').onclick = () => {
        if (confirm('Zerar TUDO? Isso apagará todos os dados salvos.')) {
            localStorage.removeItem('driverDataV5_2');
            location.reload();
        }
    };

    // Gerar PDF do relatório atual
    document.getElementById('downloadPdfBtn').onclick = () => {
        html2pdf().from(document.getElementById('reportArea')).save(`relatorio-${data.currentMonth}.pdf`);
    };
}