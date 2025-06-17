let charts = {};
window.onload = function () {
    const initialData = {
        chart1_renewable: [
            { label: "2020", y: 111338 }, { label: "2021", y: 44444 },
            { label: "2022", y: 111138 }, { label: "2023", y: 135305 },
            { label: "2024", y: 188888 }
        ],
        chart1_fossil: [
            { label: "2020", y: 222222 }, { label: "2021", y: 55555 },
            { label: "2022", y: 4578 },   { label: "2023", y: 111111 },
            { label: "2024", y: 1888 }
        ],
        chart2: [
            { x: 0, y: 20, label: "Ocak" }, { x: 1, y: 79, label: "Şubat" },
            { x: 2, y: 60, label: "Mart" }, { x: 3, y: 100, label: "Nisan" },
            { x: 4, y: 109, label: "Mayıs" }, { x: 5, y: 200, label: "Haziran" },
            { x: 6, y: 269, label: "Temmuz" }, { x: 7, y: 300, label: "Ağustos" },
            { x: 8, y: 350, label: "Eylül" }, { x: 9, y: 589, label: "Ekim" },
            { x: 10, y: 1000, label: "Kasım" }, { x: 11, y: 1200, label: "Aralık" }
        ],
        chart3: [
            { y: 4181563, indexLabel: "Elektrik", color: "#fbc858" },
            { y: 2175498, indexLabel: "Sıvı Yakıt", color: "#b1dec1" },
            { y: 3125844, indexLabel: "Doğal Gaz", color: "#2b3236" },
            { y: 1176121, indexLabel: "Yenilenebilir (on-site/off-site)", color: "#9bb4a8" }
        ],
        chart4: [
            { label: "x", y: 1352 }, { label: "y", y: 514 }, { label: "z", y: 5321 },
            { label: "k", y: 2163 }, { label: "l", y: 950 }, { label: "m", y: 1201 },
            { label: "n", y: 1186 }, { label: "o", y: 1281 }, { label: "a", y: 4480 },
            { label: "b", y: 1291 }
        ],
        chart5_electricity: [
            { y: 50000, label: "2019" }, { y: 60000, label: "2020" },
            { y: 55000, label: "2021" }, { y: 70000, label: "2022" },
            { y: 40000, label: "2023" }
        ],
        chart5_natural_gas: [
            { y: 3000, label: "2019" },  { y: 35000, label: "2020" },
            { y: 4000, label: "2021" },  { y: 45000, label: "2022" },
            { y: 50000, label: "2023" }
        ],
        chart5_coal: [
            { y: 20000, label: "2019" }, { y: 2500, label: "2020" },
            { y: 3000, label: "2021" },  { y: 3500, label: "2022" },
            { y: 4000, label: "2023" }
        ],
        chart6: [
            { y: 30001, label: "Üretim", color: "#b0cbe4" },
            { y: 25678, label: "Ofis", color: "#f1fdb6" },
            { y: 22222, label: "HVAC", color: "#a1a100" },
            { y: 11111, label: "Aydınlatma", color: "#FFE094" }
        ]
    };
    renderCharts(initialData);
    document.getElementById('uploadButton').addEventListener('click', function() {
        document.getElementById('csvFileInput').click(); 
    });
    document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);
};

/**
 * Yüklenen CSV dosyasını okur ve işler.
 * @param {Event} event - Dosya yükleme olayı
 */
async function handleFileUpload(event) {
    const file = event.target.files[0]; 
    const messageArea = document.getElementById('messageArea');

    if (!file) {
        messageArea.innerHTML = '<div class="error-message">Lütfen bir CSV dosyası seçin.</div>';
        return;
    }

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        messageArea.innerHTML = '<div class="error-message">Lütfen sadece CSV formatında bir dosya yükleyin.</div>';
        return;
    }

    messageArea.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Dosya okunuyor ve grafikler hazırlanıyor...</div>';

    const reader = new FileReader();

    reader.onload = function(e) {
        const csvContent = e.target.result;

        try {
            const processedData = processCsvData(csvContent);
            renderCharts(processedData);

            messageArea.innerHTML = '<div class="success-message"><i class="fas fa-check-circle"></i> Veriler başarıyla yüklendi ve grafikler güncellendi!</div>';

        } catch (error) {
            console.error('Veri işleme hatası:', error);
            messageArea.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Veri işlenirken bir hata oluştu: ${error.message}</div>`;
        } finally {
             event.target.value = null;
        }
    };
    reader.onerror = function() {
        console.error('Dosya okuma hatası:', reader.error);
        messageArea.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Dosya okunamadı.</div>';
        event.target.value = null;
    };
    reader.readAsText(file, 'UTF-8'); 
}

/**
 * CSV içeriğini ayrıştırır ve CanvasJS için uygun veri formatına dönüştürür.
 * @param {string} csv - CSV dosyasının metin içeriği
 * @returns {Object} Grafik verilerini içeren bir obje
 */
function processCsvData(csv) {
    const lines = csv.split(/\r\n|\n/).filter(line => line.trim() !== ''); 
    if (lines.length < 2) {
        throw new Error("CSV dosyası yeterli veri içermiyor (başlık satırı ve en az bir veri satırı olmalı).");
    }

    const headers = lines[0].split(',').map(header => header.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        if (values.length !== headers.length) {
            console.warn(`Satır ${i + 1} başlık sayısı (${headers.length}) ile sütun sayısı (${values.length}) uyuşmuyor. Atlanıyor: ${lines[i]}`);
            continue;
        }
        let row = {};
        for (let j = 0; j < headers.length; j++) {
            const numValue = parseFloat(values[j].replace(',', '.')); 
            row[headers[j]] = isNaN(numValue) ? values[j] : numValue;
        }
        data.push(row);
    }

    const processedChartsData = {
        chart1_renewable: [], chart1_fossil: [],
        chart2: [], chart3: [], chart4: [],
        chart5_electricity: [], chart5_natural_gas: [], chart5_coal: [],
        chart6: []
    };

    if (headers.includes('Yıl') && headers.includes('Enerji Tipi') && headers.includes('Tüketim (kWh)')) {
        const energyByYearAndType = {};
        data.forEach(row => {
            const year = String(row['Yıl']); 
            const energyType = row['Enerji Tipi'];
            const consumption = row['Tüketim (kWh)'];

            if (year && energyType && typeof consumption === 'number') {
                if (!energyByYearAndType[year]) {
                    energyByYearAndType[year] = { 'Yenilenebilir': 0, 'Fosil': 0 };
                }
                if (energyType.toLowerCase().includes('yenilenebilir')) { 
                    energyByYearAndType[year]['Yenilenebilir'] += consumption;
                } else if (energyType.toLowerCase().includes('fosil')) { 
                    energyByYearAndType[year]['Fosil'] += consumption;
                } else { 
                     console.warn(`Grafik 1 için bilinmeyen enerji tipi: ${energyType} - Yıl: ${year}`);
                }
            }
        });
        Object.keys(energyByYearAndType).sort().forEach(year => {
            processedChartsData.chart1_renewable.push({ label: year, y: energyByYearAndType[year]['Yenilenebilir'] });
            processedChartsData.chart1_fossil.push({ label: year, y: energyByYearAndType[year]['Fosil'] });
        });
    } else {
        console.warn("Uyarı: Grafik 1 için gerekli sütunlar (Yıl, Enerji Tipi, Tüketim (kWh)) bulunamadı.");
    }

    if (headers.includes('Ay') && headers.includes('Tüketim (kWh)')) {
        const monthlyConsumption = {};
        const monthOrder = { "Ocak": 0, "Şubat": 1, "Mart": 2, "Nisan": 3, "Mayıs": 4, "Haziran": 5,
                             "Temmuz": 6, "Ağustos": 7, "Eylül": 8, "Ekim": 9, "Kasım": 10, "Aralık": 11 };
        data.forEach(row => {
            const month = row['Ay'];
            const consumption = row['Tüketim (kWh)'];
            if (month && typeof consumption === 'number' && monthOrder.hasOwnProperty(month)) {
                monthlyConsumption[month] = (monthlyConsumption[month] || 0) + consumption;
            }
        });
        processedChartsData.chart2 = Object.keys(monthlyConsumption)
            .map(month => ({
                x: monthOrder[month],
                y: monthlyConsumption[month],
                label: month
            }))
            .sort((a, b) => a.x - b.x);
    } else {
        console.warn("Uyarı: Grafik 2 için gerekli sütunlar (Ay, Tüketim (kWh)) bulunamadı.");
    }

    if (headers.includes('Enerji Tipi') && headers.includes('Tüketim (kWh)')) {
        const sourceDistribution = {};
        data.forEach(row => {
            const energyType = row['Enerji Tipi'];
            const consumption = row['Tüketim (kWh)'];
            if (energyType && typeof consumption === 'number') {
                sourceDistribution[energyType] = (sourceDistribution[energyType] || 0) + consumption;
            }
        });
        const pieColors = ["#fbc858", "#b1dec1", "#2b3236", "#9bb4a8", "#a2b9bc", "#e0e0e0", "#7cb5ec", "#434348"];
        let colorIndex = 0;
        for (const type in sourceDistribution) {
            processedChartsData.chart3.push({
                y: sourceDistribution[type],
                indexLabel: type,
                color: pieColors[colorIndex % pieColors.length]
            });
            colorIndex++;
        }
    } else {
        console.warn("Uyarı: Grafik 3 için gerekli sütunlar (Enerji Tipi, Tüketim (kWh)) bulunamadı.");
    }

    if (headers.includes('Tesis') && headers.includes('Tüketim (kWh)')) {
        const facilityConsumption = {};
        data.forEach(row => {
            const facility = row['Tesis'];
            const consumption = row['Tüketim (kWh)'];
            if (facility && typeof consumption === 'number') {
                facilityConsumption[facility] = (facilityConsumption[facility] || 0) + consumption;
            }
        });
        for (const facility in facilityConsumption) {
            processedChartsData.chart4.push({ label: facility, y: facilityConsumption[facility] });
        } 
    } else {
        console.warn("Uyarı: Grafik 4 için gerekli sütunlar (Tesis, Tüketim (kWh)) bulunamadı.");
    }

    if (headers.includes('Yıl') && headers.includes('Enerji Tipi') && headers.includes('Maliyet ($)')) {
        const costByYearAndType = {};
        const costTypes = ['Elektrik', 'Doğal Gaz', 'Kömür']; 
        data.forEach(row => {
            const year = String(row['Yıl']);
            const energyType = row['Enerji Tipi'];
            const cost = row['Maliyet ($)'];

            if (year && energyType && typeof cost === 'number') {
                if (!costByYearAndType[year]) {
                    costByYearAndType[year] = {};
                    costTypes.forEach(type => costByYearAndType[year][type] = 0);
                }
                // Enerji tipini esnek kontrol et
                let foundType = costTypes.find(ct => energyType.toLowerCase().includes(ct.toLowerCase()));
                if (foundType) {
                     costByYearAndType[year][foundType] += cost;
                } else {
                    console.warn(`Grafik 5 için bilinmeyen maliyet enerji tipi: ${energyType} - Yıl: ${year}`);
                }
            }
        });
        Object.keys(costByYearAndType).sort().forEach(year => {
            processedChartsData.chart5_electricity.push({ y: costByYearAndType[year]['Elektrik'], label: year });
            processedChartsData.chart5_natural_gas.push({ y: costByYearAndType[year]['Doğal Gaz'], label: year });
            processedChartsData.chart5_coal.push({ y: costByYearAndType[year]['Kömür'], label: year });
        });
    } else {
        console.warn("Uyarı: Grafik 5 için gerekli sütunlar (Yıl, Enerji Tipi, Maliyet ($)) bulunamadı.");
    }

    if (headers.includes('Operasyonel Alan') && headers.includes('Tüketim (kWh)')) {
        const operationalAreaConsumption = {};
        data.forEach(row => {
            const area = row['Operasyonel Alan'];
            const consumption = row['Tüketim (kWh)'];
            if (area && typeof consumption === 'number') {
                operationalAreaConsumption[area] = (operationalAreaConsumption[area] || 0) + consumption;
            }
        });
        const pyramidColors = ["#b0cbe4", "#f1fdb6", "#a1a100", "#FFE094", "#7b9e87", "#c2d4dd"];
        let colorIndex = 0;
        for (const area in operationalAreaConsumption) {
            processedChartsData.chart6.push({
                y: operationalAreaConsumption[area],
                label: area,
                color: pyramidColors[colorIndex % pyramidColors.length]
            });
            colorIndex++;
        }
        processedChartsData.chart6.sort((a,b) => b.y - a.y);
    } else {
        console.warn("Uyarı: Grafik 6 için gerekli sütunlar (Operasyonel Alan, Tüketim (kWh)) bulunamadı.");
    }

    return processedChartsData;
}
/**
 * Gelen verilerle CanvasJS grafiklerini çizer veya günceller.
 * @param {Object} data - İşlenmiş grafik verileri
 */
function renderCharts(data) {
    const commonChartOptions = {
        animationEnabled: true,
        theme: "light2", 
        culture: "tr", 
        axisX: {
            labelFontColor: "#555",
            titleFontColor: "#444",
            lineColor: "#ddd",
            tickColor: "#ddd",
            gridThickness: 0
        },
        axisY: {
            labelFontColor: "#555",
            titleFontColor: "#444",
            lineColor: "#ddd",
            tickColor: "#ddd",
            gridColor: "#eee" 
        },
        legend: {
            cursor: "pointer",
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                    e.dataSeries.visible = false;
                } else {
                    e.dataSeries.visible = true;
                }
                e.chart.render();
            },
            fontSize: 12,
            fontColor: "#333"
        },
        toolTip: {
            shared: true, 
            contentFormatter: function (e) {
                var content = "<strong>" + e.entries[0].dataPoint.label + "</strong><br/>";
                 e.entries.forEach(function (entry) {
                    content += entry.dataSeries.name + ": " + entry.dataPoint.y.toLocaleString('tr-TR') + "<br/>";
                });
                return content;
            }
        }
    };
     const singleSeriesToolTip = {
        contentFormatter: function (e) {
            var entry = e.entries[0];
            var content = "";
            if (entry.dataPoint.label) {
                 content += "<strong>" + entry.dataPoint.label + "</strong><br/>";
            } else if (entry.dataPoint.indexLabel) { 
                 content += "<strong>" + entry.dataPoint.indexLabel + "</strong><br/>";
            }
            content += (entry.dataSeries.name || "Değer") + ": " + entry.dataPoint.y.toLocaleString('tr-TR');
             if (entry.dataPoint.percent) { 
                content += " (" + entry.dataPoint.percent.toFixed(2) + "%)";
            }
            return content;
        }
    };

    if (!charts.chart1) {
        charts.chart1 = new CanvasJS.Chart("1grafik", {
            ...commonChartOptions,
            title: { text: null },
            data: [
                { type: "stackedColumn", name: "Yenilenebilir Enerji", color: "#fddf86", showInLegend: true, dataPoints: [] },
                { type: "stackedColumn", name: "Fosil Yakıt", color: "#ba9973", showInLegend: true, dataPoints: [] }
            ]
        });
    }
    charts.chart1.options.data[0].dataPoints = data.chart1_renewable || [];
    charts.chart1.options.data[1].dataPoints = data.chart1_fossil || [];
    charts.chart1.render();

    if (!charts.chart2) {
        charts.chart2 = new CanvasJS.Chart("2grafik", {
            ...commonChartOptions,
            toolTip: singleSeriesToolTip,
            axisX: { ...commonChartOptions.axisX, interval: 1, labelFormatter: function(e){ return e.label; } }, 
            data: [{ name: "Tüketim", color: "#a1cff3", type: "column", dataPoints: [] }] 
        });
    }
    charts.chart2.options.data[0].dataPoints = data.chart2 || [];
    charts.chart2.render();

    if (!charts.chart3) {
        charts.chart3 = new CanvasJS.Chart("3grafik", {
            ...commonChartOptions,
            legend: { ...commonChartOptions.legend, horizontalAlign: "center", verticalAlign: "bottom", maxWidth: 350 },
            toolTip: {
                contentFormatter: function (e) {
                     return e.entries[0].dataPoint.indexLabel + ": <strong>" + e.entries[0].dataPoint.y.toLocaleString('tr-TR') + "</strong> (#percent%)";
                }
            },
            data: [{
                type: "pie",
                showInLegend: true,
                legendText: "{indexLabel}",
                indexLabelFontSize: 13,
                indexLabel: "{indexLabel} - #percent%",
                toolTipContent: "{indexLabel}: {y} (#percent%)",
                dataPoints: []
            }]
        });
    }
    charts.chart3.options.data[0].dataPoints = data.chart3 || [];
    charts.chart3.render();

    if (!charts.chart4) {
        charts.chart4 = new CanvasJS.Chart("4grafik", {
            ...commonChartOptions,
            toolTip: singleSeriesToolTip,
            axisX: { ...commonChartOptions.axisX, title: "Tesisler", labelFontSize: 11, labelAngle: -30 },
            axisY: { ...commonChartOptions.axisY, title: "Enerji Harcanımı (kWh)", prefix: "", suffix:" kWh" },
            data: [{ name:"Harcanım", color: "#fb8c00", type: "splineArea", markerType: "circle", markerSize: 8, dataPoints: [] }] // Turuncu splineArea
        });
    }
    charts.chart4.options.data[0].dataPoints = data.chart4 || [];
    charts.chart4.render();

    if (!charts.chart5) {
        charts.chart5 = new CanvasJS.Chart("5grafik", {
            ...commonChartOptions,
            axisY: { ...commonChartOptions.axisY, prefix: "$", title:"Maliyet ($)"},
            data: [
                { type: "stackedColumn", name: "Elektrik", color: "#ffe4b5", showInLegend: true, dataPoints: [] },
                { type: "stackedColumn", name: "Doğal Gaz", color: "#cdc9c9", showInLegend: true, dataPoints: [] },
                { type: "stackedColumn", name: "Kömür", color: "#8b8378", showInLegend: true, dataPoints: [] }
            ]
        });
    }
    charts.chart5.options.data[0].dataPoints = data.chart5_electricity || [];
    charts.chart5.options.data[1].dataPoints = data.chart5_natural_gas || [];
    charts.chart5.options.data[2].dataPoints = data.chart5_coal || [];
    charts.chart5.render();

    if (!charts.chart6) {
        charts.chart6 = new CanvasJS.Chart("6grafik", {
            ...commonChartOptions,
             toolTip: {
                 contentFormatter: function (e) {
                     return e.entries[0].dataPoint.label + ": <strong>" + e.entries[0].dataPoint.y.toLocaleString('tr-TR') + "</strong> (#percent%)";
                 }
            },
            legend: {...commonChartOptions.legend, enabled: false }, 
            data: [{
                type: "pyramid",
                showInLegend: false, 
                indexLabelFontSize: 13,
                indexLabel: "{label} - #percent%",
                valueRepresents: "area", 
                dataPoints: []
            }]
        });
    }
    charts.chart6.options.data[0].dataPoints = data.chart6 || [];
    charts.chart6.render();
}