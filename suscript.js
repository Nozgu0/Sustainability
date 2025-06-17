let charts = {};
window.onload = function () {
    const initialData = {
        chart1: [
            { y: 4181563, indexLabel: "Şebeke Suyu", color: "#40B5AD"},
            { y: 2175498, indexLabel: "Yeraltı Suyu", color: "#000080"},
            { y: 3125844, indexLabel: "Geri Kazanılmış Su", color: "#6F8FAF"},
            { y: 1176121, indexLabel: "Yağmur Suyu", color: "#87CEEB"}
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
            { y: 198, label: "Üretim Süreci",color: "#1974D2"},
            { y: 201, label: "Soğutma",color: "#6698FF"},
            { y: 202, label: "Temizlik/Hijyen",color: "#93B1B5"},
            { y: 236, label: "Bahçe",color: "#40B5AD"},
            { y: 395, label: "Diğer",color: "#557C99"}
        ],
        chart4: [
            { y: 53.37, indexLabel: "Değer",color: "#40B5AD" },
            { y: 35.0, indexLabel: "Hedeflenen",color: "#557C99" }
        ],
        chart5_winter: [
            { label: "2019" , y: 44 },
            { label:"2020", y: 37 },
            { label: "2021", y: 36 },
            { label: "2022", y: 36 },
            { label: "2023", y: 46 },
            { label: "2024", y: 46 }
        ],
        chart5_spring: [
            { label: "2019" , y: 26 },
            { label:"2020", y: 32 },
            { label: "2021", y: 28 },
            { label: "2022", y: 22 },
            { label: "2023", y: 20 },
            { label: "2024", y: 19 }
        ],
        chart5_summer: [
            { label:"2019", y: 7 },
            { label:"2020", y: 8 },
            { label: "2021", y: 9 },
            { label: "2022", y: 13 },
            { label: "2023", y: 13 },
            { label: "2024", y: 9 }
        ],
        chart5_autumn: [
            { label: "2019" , y: 20 },
            { label:"2020", y: 13 },
            { label: "2021", y: 13 },
            { label: "2022", y: 16 },
            { label: "2023", y: 11 },
            { label: "2024", y: 17 }
        ],
        chart6: [
            {x: new Date(2019, 0), y: 3386000},
            {x: new Date(2020, 0), y: 6944000},
            {x: new Date(2021, 0), y: 6026000},
            {x: new Date(2022, 0), y: 2394000},
            {x: new Date(2023, 0), y: 1872000},
            {x: new Date(2024, 0), y: 2000000}
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
        event.target.value = null; // Hata durumunda da sıfırla
    };
    reader.readAsText(file, 'UTF-8'); 
}

/**
 * CSV içeriğini ayrıştırır ve CanvasJS için uygun veri formatına dönüştürür.
 * Bu fonksiyon, su tüketimi verilerine göre uyarlanmalıdır.
 * Örneğin: "Kaynak", "Yıl", "Ay", "Miktar (m³)", "Süreç", "Oran" gibi sütunlar beklenebilir.
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
        chart1: [], chart2: [], chart3: [], chart4: [],
        chart5_winter: [], chart5_spring: [], chart5_summer: [], chart5_autumn: [],
        chart6: []
    };
    if (headers.includes('Su Kaynağı') && headers.includes('Tüketim (m³)')) {
        const sourceDistribution = {};
        data.forEach(row => {
            const source = row['Su Kaynağı'];
            const consumption = row['Tüketim (m³)'];
            if (source && typeof consumption === 'number') {
                sourceDistribution[source] = (sourceDistribution[source] || 0) + consumption;
            }
        });
        const pieColors = ["#40B5AD", "#000080", "#6F8FAF", "#87CEEB", "#A9A9A9", "#D3D3D3"];
        let colorIndex = 0;
        for (const source in sourceDistribution) {
            processedChartsData.chart1.push({
                y: sourceDistribution[source],
                indexLabel: source,
                color: pieColors[colorIndex % pieColors.length]
            });
            colorIndex++;
        }
    } else {
        console.warn("Uyarı: Grafik 1 için gerekli sütunlar (Su Kaynağı, Tüketim (m³)) bulunamadı.");
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
        console.warn("Uyarı: Grafik 2 için gerekli sütunlar (Ay, Tüketim (m³)) bulunamadı.");
    }
    if (headers.includes('Su Kullanım Süreci') && headers.includes('Süreç Tüketimi (m³)')) {
        const processDistribution = {};
        data.forEach(row => {
            const process = row['Su Kullanım Süreci'];
            const consumption = row['Süreç Tüketimi (m³)'];
            if (process && typeof consumption === 'number') {
                processDistribution[process] = (processDistribution[process] || 0) + consumption;
            }
        });
        const barColors = ["#1974D2", "#6698FF", "#93B1B5", "#40B5AD", "#557C99", "#C0C0C0"];
        let colorIndex = 0;
        for (const process in processDistribution) {
            processedChartsData.chart3.push({
                y: processDistribution[process],
                label: process,
                color: barColors[colorIndex % barColors.length]
            });
            colorIndex++;
        }
        processedChartsData.chart3.sort((a,b) => b.y - a.y); 
    } else {
        console.warn("Uyarı: Grafik 3 için gerekli sütunlar (Su Kullanım Süreci, Süreç Tüketimi (m³)) bulunamadı.");
    }
    if (headers.includes('Oran Türü') && headers.includes('Oran Yüzdesi')) {
        const recoveryData = [];
        data.forEach(row => {
            const type = row['Oran Türü'];
            const percentage = row['Oran Yüzdesi'];
            if (type && typeof percentage === 'number') {
                recoveryData.push({
                    y: percentage,
                    indexLabel: type,
                    color: type === "Değer" ? "#40B5AD" : "#557C99" // Renkleri sabitle
                });
            }
        });
        processedChartsData.chart4 = recoveryData;
    } else {
        console.warn("Uyarı: Grafik 4 için gerekli sütunlar (Oran Türü, Oran Yüzdesi) bulunamadı.");
    }
    if (headers.includes('Yıl') && headers.includes('Sezon') && headers.includes('Sezonluk Tüketim (m³)')) {
        const seasonalConsumption = {};
        const seasons = ['Kış', 'İlkbahar', 'Yaz', 'Sonbahar'];
        seasons.forEach(season => seasonalConsumption[season] = {});
        data.forEach(row => {
            const year = String(row['Yıl']);
            const season = row['Sezon'];
            const consumption = row['Sezonluk Tüketim (m³)'];

            if (year && seasons.includes(season) && typeof consumption === 'number') {
                seasonalConsumption[season][year] = (seasonalConsumption[season][year] || 0) + consumption;
            }
        });
        Object.keys(seasonalConsumption.Kış).sort().forEach(year => processedChartsData.chart5_winter.push({ label: year, y: seasonalConsumption.Kış[year] }));
        Object.keys(seasonalConsumption.İlkbahar).sort().forEach(year => processedChartsData.chart5_spring.push({ label: year, y: seasonalConsumption.İlkbahar[year] }));
        Object.keys(seasonalConsumption.Yaz).sort().sort().forEach(year => processedChartsData.chart5_summer.push({ label: year, y: seasonalConsumption.Yaz[year] }));
        Object.keys(seasonalConsumption.Sonbahar).sort().forEach(year => processedChartsData.chart5_autumn.push({ label: year, y: seasonalConsumption.Sonbahar[year] }));

    } else {
        console.warn("Uyarı: Grafik 5 için gerekli sütunlar (Yıl, Sezon, Sezonluk Tüketim (m³)) bulunamadı.");
    }
    if (headers.includes('Yıl') && headers.includes('Şirket Tüketimi (m³)')) { 
        const companyConsumption = [];
        data.forEach(row => {
            const year = row['Yıl'];
            const consumption = row['Şirket Tüketimi (m³)'];
            if (year && typeof consumption === 'number') {
                companyConsumption.push({ x: new Date(year, 0), y: consumption });
            }
        });
        processedChartsData.chart6 = companyConsumption.sort((a,b) => a.x.getTime() - b.x.getTime());
    } else {
        console.warn("Uyarı: Grafik 6 için gerekli sütunlar (Yıl, Şirket Tüketimi (m³)) bulunamadı.");
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
                var content = "<strong>" + (e.entries[0].dataPoint.label || e.entries[0].dataPoint.x.toLocaleDateString('tr-TR', {year: 'numeric'})) + "</strong><br/>";
                e.entries.forEach(function (entry) {
                    content += entry.dataSeries.name + ": " + entry.dataPoint.y.toLocaleString('tr-TR') + " m³<br/>";
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
            content += (entry.dataSeries.name || "Miktar") + ": " + entry.dataPoint.y.toLocaleString('tr-TR') + " m³";
             if (entry.dataPoint.percent) {
                content += " (" + entry.dataPoint.percent.toFixed(2) + "%)";
            }
            return content;
        }
    };
    if (!charts.chart1) {
        charts.chart1 = new CanvasJS.Chart("1grafik", {
            ...commonChartOptions,
            toolTip: {
                contentFormatter: function (e) {
                    return e.entries[0].dataPoint.indexLabel + ": <strong>" + e.entries[0].dataPoint.y.toLocaleString('tr-TR') + " m³</strong> (#percent%)";
                }
            },
            data: [{
                type: "pie",
                showInLegend: true,
                toolTipContent: "{y} - #percent %",
                legendText: "{indexLabel}",
                indexLabel: "{indexLabel} - #percent%",
                indexLabelFontSize: 13,
                dataPoints: []
            }]
        });
    }
    charts.chart1.options.data[0].dataPoints = data.chart1 || [];
    charts.chart1.render();
    if (!charts.chart2) {
        charts.chart2 = new CanvasJS.Chart("2grafik", {
            ...commonChartOptions,
            toolTip: singleSeriesToolTip,
            axisX: { ...commonChartOptions.axisX, interval: 1, labelFormatter: function(e){ return e.label; } },
            data: [{
                color: "#0000FF",
                type: "column",
                name: "Su Tüketimi",
                dataPoints: []
            }]
        });
    }
    charts.chart2.options.data[0].dataPoints = data.chart2 || [];
    charts.chart2.render();
    if (!charts.chart3) {
        charts.chart3 = new CanvasJS.Chart("3grafik", {
            ...commonChartOptions,
            toolTip: singleSeriesToolTip,
            axisX: { ...commonChartOptions.axisX, title: "Süreçler", labelFontSize: 11, labelAngle: -30 },
            axisY: { ...commonChartOptions.axisY, title: "Tüketim (m³)", suffix:" m³" },
            data: [{
                type: "bar",
                name: "Tüketim",
                dataPointWidth:20,
                dataPoints: []
            }]
        });
    }
    charts.chart3.options.data[0].dataPoints = data.chart3 || [];
    charts.chart3.render();
    if (!charts.chart4) {
        charts.chart4 = new CanvasJS.Chart("4grafik", {
            ...commonChartOptions,
            toolTip: {
                contentFormatter: function (e) {
                    return e.entries[0].dataPoint.indexLabel + ": <strong>" + e.entries[0].dataPoint.y.toLocaleString('tr-TR') + "%</strong>";
                }
            },
            data: [{
                type: "doughnut",
                showInLegend: true,
                legendText: "{indexLabel}",
                toolTipContent: "{indexLabel}: {y}%",
                indexLabel: "{indexLabel} - {y}%",
                dataPoints: []
            }]
        });
    }
    charts.chart4.options.data[0].dataPoints = data.chart4 || [];
    charts.chart4.render();
    if (!charts.chart5) {
        charts.chart5 = new CanvasJS.Chart("5grafik", {
            ...commonChartOptions,
            axisY: {
                ...commonChartOptions.axisY,
                title: "Su Tüketimi (m³)",
                valueFormatString: "#0,,.",
            },
            toolTip: {
                shared: true,
                contentFormatter: function (e) {
                    var content = "<strong>" + e.entries[0].dataPoint.label + "</strong><br/>";
                    e.entries.forEach(function (entry) {
                        content += entry.dataSeries.name + ": " + entry.dataPoint.y.toLocaleString('tr-TR') + " m³<br/>";
                    });
                    return content;
                }
            },
            data: [
                { type: "spline", name: "Kış", showInLegend: true, dataPoints: [] },
                { type: "spline", name: "İlkbahar", showInLegend: true, dataPoints: [] },
                { type: "spline", name: "Yaz", showInLegend: true, dataPoints: [] },
                { type: "spline", name: "Sonbahar", showInLegend: true, dataPoints: [] }
            ]
        });
    }
    charts.chart5.options.data[0].dataPoints = data.chart5_winter || [];
    charts.chart5.options.data[1].dataPoints = data.chart5_spring || [];
    charts.chart5.options.data[2].dataPoints = data.chart5_summer || [];
    charts.chart5.options.data[3].dataPoints = data.chart5_autumn || [];
    charts.chart5.render();
    if (!charts.chart6) {
        charts.chart6 = new CanvasJS.Chart("6grafik", {
            ...commonChartOptions,
            axisY: {
                ...commonChartOptions.axisY,
                title: "Su Tüketimi (m³)",
                valueFormatString: "#0,,.",
                stripLines: [{
                    value: 3333333, 
                    label: "Sektör Ortalaması",
                    color: "#ff0000",
                    lineDashType: "dash"
                }]
            },
            toolTip: {
                shared: true,
                contentFormatter: function (e) {
                    var content = "<strong>" + e.entries[0].dataPoint.x.toLocaleDateString('tr-TR', {year: 'numeric'}) + "</strong><br/>";
                    e.entries.forEach(function (entry) {
                        content += entry.dataSeries.name + ": " + entry.dataPoint.y.toLocaleString('tr-TR') + " m³<br/>";
                    });
                    return content;
                }
            },
            data: [{
                yValueFormatString: "#,### m³",
                xValueFormatString: "YYYY",
                type: "spline",
                name: "Şirket Tüketimi",
                dataPoints: []
            }]
        });
    }
    charts.chart6.options.data[0].dataPoints = data.chart6 || [];
    charts.chart6.render();
}