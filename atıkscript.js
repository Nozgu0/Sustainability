let charts = {};
window.onload = function () {
    const initialData = {
        chart1: [
            { y: 23456, indexLabel: "Tehlikeli Atık", color: "#FF6961" },
            { y: 333333, indexLabel: "Tehlikesiz Atık", color: "#ADD8E6" },
            { y: 221222, indexLabel: "Geri Dönüştürülebilir Atık", color: "#ADE6BB" },
            { y: 88888, indexLabel: "Organik Atık", color: "#E3BC9A" }
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
            { y: 198, label: "Geri Dönüşüm", color: "#3ad6a1" },
            { y: 256, label: "Yakma", color:"#f0c2d3" },
            { y: 202, label: "Düzenli Depolama", color: "#0d9a66" },
            { y: 236, label: "Kompost", color: "#d9cbb8" },
            { y: 79, label: "Diğer", color: "#d3f418" }
        ],
        chart4: [
            { label: "tesis a", y: 1352 }, { label: "tesis d", y: 514 }, { label: "tesis g", y: 5321 },
            { label: "tesis b", y: 2163 }, { label: "tesis e", y: 950 }, { label: "tesis h", y: 1201 },
            { label: "tesis c", y: 1186 }, { label: "tesis f", y: 1281 }, { label: "tesis z", y: 4480 },
            { label: "tesis d", y: 1291 }
        ],
        chart5: [
            { y: 4181563, indexLabel: "Rusya", color: "#8c9620" },
            { y: 2175498, indexLabel: "Kanada", color: "#27949d" },
            { y: 3125844, indexLabel: "Sudan", color: "#f7ff62" },
            { y: 1176121, indexLabel: "Almanya", color: "#5fc0d0" },
            { y: 2175498, indexLabel: "Güney Kore", color: "#2a891f" },
            { y: 3125844, indexLabel: "İtalya", color: "#584b32" },
            { y: 1176121, indexLabel: "Japonya", color: "#e4d8c9" }
        ],
        chart6: [
            { x: new Date(2018, 0), y: 5556000 },
            { x: new Date(2019, 0), y: 3262222 },
            { x: new Date(2020, 0), y: 6944000 },
            { x: new Date(2021, 0), y: 6026000 },
            { x: new Date(2022, 0), y: 2394000 },
            { x: new Date(2023, 0), y: 1372000 },
            { x: new Date(2024, 0), y: 200111 }
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
        chart1: [], chart2: [], chart3: [],
        chart4: [], chart5: [], chart6: []
    };
    if (headers.includes('Atık Türü') && headers.includes('Miktar (ton)')) {
        const wasteByType = {};
        data.forEach(row => {
            const wasteType = row['Atık Türü'];
            const amount = row['Miktar (ton)'];
            if (wasteType && typeof amount === 'number') {
                wasteByType[wasteType] = (wasteByType[wasteType] || 0) + amount;
            }
        });
        const pieColors = ["#90b04f", "#ADD8E6", "#ADE6BB", "#E3BC9A", "#A2B9BC", "#E0E0E0"];
        let colorIndex = 0;
        for (const type in wasteByType) {
            processedChartsData.chart1.push({
                y: wasteByType[type],
                indexLabel: type,
                color: pieColors[colorIndex % pieColors.length]
            });
            colorIndex++;
        }
    }
    if (headers.includes('Ay') && headers.includes('Miktar (ton)')) {
        const monthlyWaste = {};
        const monthOrder = { "Ocak": 0, "Şubat": 1, "Mart": 2, "Nisan": 3, "Mayıs": 4, "Haziran": 5,
                           "Temmuz": 6, "Ağustos": 7, "Eylül": 8, "Ekim": 9, "Kasım": 10, "Aralık": 11 };
        data.forEach(row => {
            const month = row['Ay'];
            const amount = row['Miktar (ton)'];
            if (month && typeof amount === 'number' && monthOrder.hasOwnProperty(month)) {
                monthlyWaste[month] = (monthlyWaste[month] || 0) + amount;
            }
        });
        processedChartsData.chart2 = Object.keys(monthlyWaste)
            .map(month => ({
                x: monthOrder[month],
                y: monthlyWaste[month],
                label: month
            }))
            .sort((a, b) => a.x - b.x);
    }
    if (headers.includes('Bertaraf Şekli') && headers.includes('Miktar (ton)')) {
        const disposalByType = {};
        data.forEach(row => {
            const disposalType = row['Bertaraf Şekli'];
            const amount = row['Miktar (ton)'];
            if (disposalType && typeof amount === 'number') {
                disposalByType[disposalType] = (disposalByType[disposalType] || 0) + amount;
            }
        });
        const barColors = ["#c8e6c9", "#EF9A9A", "#93B1B5", "#d7ccc8", "#E5E7E9"];
        let colorIndex = 0;
        for (const type in disposalByType) {
            processedChartsData.chart3.push({
                y: disposalByType[type],
                label: type,
                color: barColors[colorIndex % barColors.length]
            });
            colorIndex++;
        }
    }
    if (headers.includes('Tesis') && headers.includes('Miktar (ton)')) {
        const facilityWaste = {};
        data.forEach(row => {
            const facility = row['Tesis'];
            const amount = row['Miktar (ton)'];
            if (facility && typeof amount === 'number') {
                facilityWaste[facility] = (facilityWaste[facility] || 0) + amount;
            }
        });
        for (const facility in facilityWaste) {
            processedChartsData.chart4.push({ label: facility, y: facilityWaste[facility] });
        }
    }
    if (headers.includes('Bölge') && headers.includes('Miktar (ton)')) {
        const regionWaste = {};
        data.forEach(row => {
            const region = row['Bölge'];
            const amount = row['Miktar (ton)'];
            if (region && typeof amount === 'number') {
                regionWaste[region] = (regionWaste[region] || 0) + amount;
            }
        });
        const pieColors = ["#ddb860", "#324996", "#6c3e4b", "#5fc0d0", "#d85459", "#584b32", "#fffff0"];
        let colorIndex = 0;
        for (const region in regionWaste) {
            processedChartsData.chart5.push({
                y: regionWaste[region],
                indexLabel: region,
                color: pieColors[colorIndex % pieColors.length]
            });
            colorIndex++;
        }
    }
    if (headers.includes('Yıl') && headers.includes('Miktar (ton)')) {
        const yearlyWaste = {};
        data.forEach(row => {
            const year = row['Yıl'];
            const amount = row['Miktar (ton)'];
            if (year && typeof amount === 'number') {
                yearlyWaste[year] = (yearlyWaste[year] || 0) + amount;
            }
        });
        for (const year in yearlyWaste) {
            processedChartsData.chart6.push({ 
                x: new Date(parseInt(year), 0), 
                y: yearlyWaste[year] 
            });
        }
        processedChartsData.chart6.sort((a, b) => a.x - b.x);
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
            legend: { ...commonChartOptions.legend, horizontalAlign: "center", verticalAlign: "bottom" },
            toolTip: {
                contentFormatter: function (e) {
                    return e.entries[0].dataPoint.indexLabel + ": <strong>" + 
                           e.entries[0].dataPoint.y.toLocaleString('tr-TR') + "</strong> (#percent%)";
                }
            },
            data: [{
                type: "pie",
                showInLegend: true,
                legendText: "{indexLabel}",
                indexLabelFontSize: 13,
                indexLabel: "{indexLabel} - #percent%",
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
            data: [{ name: "Atık Miktarı", color: "#AFCCA9", type: "column", dataPoints: [] }]
        });
    }
    charts.chart2.options.data[0].dataPoints = data.chart2 || [];
    charts.chart2.render();
    if (!charts.chart3) {
        charts.chart3 = new CanvasJS.Chart("3grafik", {
            ...commonChartOptions,
            toolTip: singleSeriesToolTip,
            data: [{ name: "Atık Miktarı", type: "bar", dataPointWidth: 20, dataPoints: [] }]
        });
    }
    charts.chart3.options.data[0].dataPoints = data.chart3 || [];
    charts.chart3.render();
    if (!charts.chart4) {
        charts.chart4 = new CanvasJS.Chart("4grafik", {
            ...commonChartOptions,
            toolTip: singleSeriesToolTip,
            axisX: { ...commonChartOptions.axisX, title: "Tesisler", labelFontSize: 11, labelAngle: -30 },
            axisY: { ...commonChartOptions.axisY, title: "Atık Miktarı (ton)" },
            data: [{ name: "Atık Miktarı", color: "#795548", type: "spline", dataPoints: [] }]
        });
    }
    charts.chart4.options.data[0].dataPoints = data.chart4 || [];
    charts.chart4.render();
    if (!charts.chart5) {
        charts.chart5 = new CanvasJS.Chart("5grafik", {
            ...commonChartOptions,
            legend: { ...commonChartOptions.legend, horizontalAlign: "center", verticalAlign: "bottom" },
            toolTip: {
                contentFormatter: function (e) {
                    return e.entries[0].dataPoint.indexLabel + ": <strong>" + 
                           e.entries[0].dataPoint.y.toLocaleString('tr-TR') + "</strong> (#percent%)";
                }
            },
            data: [{
                type: "pie",
                showInLegend: true,
                legendText: "{indexLabel}",
                indexLabelFontSize: 13,
                indexLabel: "{indexLabel} - #percent%",
                dataPoints: []
            }]
        });
    }
    charts.chart5.options.data[0].dataPoints = data.chart5 || [];
    charts.chart5.render();
    if (!charts.chart6) {
        charts.chart6 = new CanvasJS.Chart("6grafik", {
            ...commonChartOptions,
            toolTip: singleSeriesToolTip,
            axisY: {
                title: "Atık Üretimi",
                valueFormatString: "#0,,.",
                stripLines: [{
                    value: 3366500,
                    label: "Ortalama"
                }]
            },
            data: [{
                yValueFormatString: "#,### ton",
                xValueFormatString: "YYYY",
                type: "spline",
                dataPoints: []
            }]
        });
    }
    charts.chart6.options.data[0].dataPoints = data.chart6 || [];
    charts.chart6.render();
}