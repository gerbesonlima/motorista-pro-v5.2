export function formatCurrency(v) {
    return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
}

export function calculateFinances(data, key) {
    const m = data.months[key] || { trips: [], withdrawals: [], startingBalance: 0 };
    const chronTrips = [...m.trips].reverse();

    let currentEmergency = m.startingBalance || 0;
    let accMaint = 0;
    let accPersonal = 0;
    let totalFuel = 0;
    let totalGross = 0;
    let totalKm = 0;
    let lastFuel = 0;

    chronTrips.forEach(t => {
        totalGross += t.grossEarned || 0;
        totalFuel += t.fuelCost || 0;
        totalKm += (t.finalKm - t.initialKm) || 0;
        lastFuel = t.fuelCost || 0;

        let saldoDia = (t.grossEarned || 0) - (t.fuelCost || 0);
        currentEmergency += saldoDia;

        if (currentEmergency > 0) {
            let moveM = Math.min(currentEmergency, data.dailyMaintenance || 0);
            accMaint += moveM;
            currentEmergency -= moveM;

            let moveP = Math.min(currentEmergency, data.dailyPersonal || 0);
            accPersonal += moveP;
            currentEmergency -= moveP;
        }
    });

    (m.withdrawals || []).forEach(w => {
        if (w.category === 'maint') accMaint -= w.value || 0;
        if (w.category === 'personal') accPersonal -= w.value || 0;
    });

    accMaint -= (m.maintAdjustment || 0);
    accPersonal -= (m.personalAdjustment || 0);

    const totalDespesas = totalFuel;
    const lucroBruto = totalGross;
    const lucroLiquido = totalGross - totalFuel;

    const diasTrabalhados = m.trips.length;

    const metaDiariaPessoal    = data.dailyPersonal    || 0;
    const metaDiariaManutencao = data.dailyMaintenance || 0;

    const metaMensalPessoal = 26 * metaDiariaPessoal;
    const faltaParaMeta = metaMensalPessoal - accPersonal;
    const diasRestantesMeta = Math.max(0, 26 - diasTrabalhados);

    let brutoNecessarioPorDia = 0;

    if (diasTrabalhados > 0) {
        const combustivelMedioDia = totalFuel / diasTrabalhados;

        // Meta acumulada esperada até o momento (pessoal + manutenção)
        const metaAcumuladaEsperada = diasTrabalhados * (metaDiariaPessoal + metaDiariaManutencao);

        // Quanto já foi transferido para as duas caixinhas
        const metaAcumuladaReal = accMaint + accPersonal;

        // Atraso real (positivo = atrasado, zero ou negativo = no ritmo ou adiantado)
        const atraso = metaAcumuladaEsperada - metaAcumuladaReal;

        if (diasRestantesMeta > 0) {
            // Combustível futuro estimado
            const combustivelRestanteEstimado = combustivelMedioDia * diasRestantesMeta;

            // Total a cobrir nos dias restantes (atraso + combustível futuro)
            const totalNecessarioRestante = Math.max(0, atraso) + combustivelRestanteEstimado;

            // Esforço extra por dia (só se houver atraso)
            let esforcoExtra = 0;
            if (atraso > 0) {
                esforcoExtra = totalNecessarioRestante / diasRestantesMeta;
            }

            // Bruto necessário = combustível médio + metas diárias (pessoal + manutenção) + esforço extra
            brutoNecessarioPorDia = combustivelMedioDia + metaDiariaPessoal + metaDiariaManutencao + esforcoExtra;
        } else {
            // Meta já cumprida ou sem dias restantes → só mantém o saudável
            brutoNecessarioPorDia = combustivelMedioDia + metaDiariaPessoal + metaDiariaManutencao;
        }
    }

    return {
        nextFuel: (currentEmergency < 0) ? Math.max(0, lastFuel + currentEmergency) : lastFuel,
        maint: accMaint,
        personal: accPersonal,
        emergency: currentEmergency,
        grossPerKm: totalKm > 0 ? totalGross / totalKm : 0,
        totalDespesas,
        lucroBruto,
        lucroLiquido,
        totalKm,
        diasTrabalhados,
        metaMensalPessoal,
        acumPessoal: accPersonal,
        faltaParaMeta,
        diasRestantesMeta,
        brutoNecessarioPorDia,
        metaDiariaPessoal,
        metaDiariaManutencao  // opcional: se quiser exibir na UI
    };
}