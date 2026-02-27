export function formatCurrency(v) {
    return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
}

export function getInfoMesAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    const diaAtual = hoje.getDate();
    return {
        diasNoMes,
        diaAtual,
        diasPassados: diaAtual - 1,
        diasRestantesCalendario: diasNoMes - diaAtual + 1
    };
}