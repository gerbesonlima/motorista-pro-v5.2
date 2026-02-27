export function saveData(data) {
    localStorage.setItem('driverDataV5_2', JSON.stringify(data));
}

export function loadData() {
    const saved = localStorage.getItem('driverDataV5_2');
    return saved ? JSON.parse(saved) : {
        months: {},
        currentMonth: new Date().toISOString().slice(0, 7),
        dailyPersonal: 0,
        dailyMaintenance: 0,
        defaultKmL: 0
    };
}