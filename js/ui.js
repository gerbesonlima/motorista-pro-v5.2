import { formatCurrency, calculateFinances } from './calculate.js';  // ← adicione calculateFinances aqui
import { getInfoMesAtual } from './utils.js';



export function updateUI(data) {
    const fin = calculateFinances(data, data.currentMonth);

    document.getElementById('cardNextFuel').textContent = formatCurrency(fin.nextFuel);
    document.getElementById('cardMaintAcum').textContent = formatCurrency(fin.maint);
    document.getElementById('cardPersonalAcum').textContent = formatCurrency(fin.personal);
    document.getElementById('cardEmergency').textContent = formatCurrency(fin.emergency);
    document.getElementById('cardPerKm').textContent = "R$ " + fin.grossPerKm.toFixed(2) + "/km";

    document.getElementById('totalDespesas').textContent = formatCurrency(fin.totalDespesas);
    document.getElementById('lucroBruto').textContent = formatCurrency(fin.lucroBruto);
    document.getElementById('lucroLiquido').textContent = formatCurrency(fin.lucroLiquido);
    document.getElementById('totalKm').textContent = fin.totalKm.toLocaleString('pt-BR') + " km";
    if (document.getElementById('cardLucroLiquidoSimples')) {
    document.getElementById('cardLucroLiquidoSimples').textContent = formatCurrency(fin.lucroLiquido);
}
    document.getElementById('kmPerLiterInput').value = data.defaultKmL || '';

    // Projeção meta
    const metaDiariaExib = fin.metaDiariaPessoal;
    document.getElementById('projMetaTitle').textContent = `Projeção Meta Pessoal (R$ ${metaDiariaExib.toFixed(0)}/dia)`;
    document.getElementById('metaMensal').textContent = formatCurrency(fin.metaMensalPessoal);
    document.getElementById('acumPessoalProj').textContent = formatCurrency(fin.personal);

    const statusEl = document.getElementById('statusMeta');
    const brutoEl = document.getElementById('brutoNecessario');
    const container = document.getElementById('projecaoContainer');

    const infoMes = getInfoMesAtual();
    const textoCalendario = `Mês com ${infoMes.diasNoMes} dias • Faltam ${infoMes.diasRestantesCalendario} dias no calendário`;

    if (fin.diasTrabalhados === 0) {
        statusEl.textContent = textoCalendario + " • Ainda sem registros";
        brutoEl.textContent = "";
        container.style.background = "#fffde7";
        container.style.color = "#f57f17";
        return;
    }

    if (fin.diasRestantesMeta <= 0) {
        if (fin.faltaParaMeta <= 0) {
            statusEl.textContent = textoCalendario + " • Meta ATINGIDA! 🎉";
            statusEl.style.color = "#2e7d32";
            brutoEl.textContent = `Excedente: ${formatCurrency(-fin.faltaParaMeta)}`;
        } else {
            statusEl.textContent = textoCalendario + " • Meta NÃO atingida";
            statusEl.style.color = "#c62828";
            brutoEl.textContent = `Faltaram ${formatCurrency(fin.faltaParaMeta)}`;
        }
        container.style.background = fin.faltaParaMeta <= 0 ? "#e8f5e9" : "#ffebee";
    } else {
        statusEl.textContent = textoCalendario + ` • Faltam ${fin.diasRestantesMeta} dias para atingir meta de 26`;
        statusEl.style.color = "#555";
        brutoEl.innerHTML = `Precisa fazer <strong style="color:#d81b60; font-size:1.3em">${formatCurrency(fin.brutoNecessarioPorDia)}</strong> bruto/dia (média)`;
        container.style.background = "#e3f2fd";
        container.style.color = "#1565c2";
    }

    document.getElementById('currentMonthTitle').textContent = "Relatório: " + data.currentMonth;
}

export function renderTable(data, currentMonth) {
    const tb = document.querySelector('#tripTable tbody');
    tb.innerHTML = '';
    const m = data.months[currentMonth] || { trips: [], withdrawals: [] };

    const items = [
        ...m.trips.map((t, i) => ({ ...t, type: 'Viagem', idx: i, originalType: 'trip' })),
        ...(m.withdrawals || []).map((w, i) => ({ ...w, type: 'Sangria', idx: i, originalType: 'withdraw' }))
    ];

    items.forEach(item => {
        const valStr = item.originalType === 'trip' 
            ? formatCurrency(item.grossEarned || 0) 
            : '-' + formatCurrency(item.value || 0);
            
        const color = item.originalType === 'trip' ? 'green' : 'red';
        
        let actions = `
          <button class="delete-btn" data-type="${item.originalType}" data-idx="${item.idx}" style="border:none; background:none; color:red; font-size:1.2em;">✖</button>`;

    if (item.originalType === 'withdraw') {
    actions += `
        <button class="edit-btn" data-idx="${item.idx}" style="border:none; background:none; color:#0061A4; font-size:1.1em; margin-left:8px;">✏️</button>
    `;
}

        tb.innerHTML += `<tr>
            <td>${item.date ? item.date.split('/').slice(0,2).join('/') : '—'}</td>
            <td>${item.type} <br><small>${item.description || ''}</small></td>
            <td style="color:${color}">${valStr}</td>
            <td>${actions}</td>
        </tr>`;
    });
}