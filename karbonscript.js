let charts = {};
window.onload = function () {
    const initialData = {
        chart1_last6Days: [
            { x: 0, y: 450 }, { x: 1, y: 414 }, { x: 2, y: 520 },
            { x: 3, y: 460 }, { x: 4, y: 450 }, { x: 5, y: 500 }
        ],
        chart1_lastWeek: [
            { x: 0, y: 380 }, { x: 1, y: 390 }, { x: 2, y: 450 },
            { x: 3, y: 480 }, { x: 4, y: 470 }, { x: 5, y: 510 }
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
            { y: 4181563, indexLabel: "Hindistan", color: "#BADDFF" },
            { y: 2175498, indexLabel: "Türkiye", color: "#FFD6D1" },
            { y: 3125844, indexLabel: "Almanya", color: "#A1FFC0" },
            { y: 1176121, indexLabel: "Kenya", color: "#F0D9FF" },
            { y: 2175498, indexLabel: "Güney Kore", color: "#B5C7EB" },
            { y: 3125844, indexLabel: "Çin", color: "#6F8FAF" },
            { y: 1176121, indexLabel: "Rusya", color: "#FFD5CC" }
        ],
        chart4: [
            { y: 53.37, indexLabel: "İşletme Artıkları", color: "#BADDFF" },
            { y: 35.0, indexLabel: "Lojistik", color: "#D2FFC4" },
            { y: 123, indexLabel: "Dağıtım", color: "#F1E8CF" },
            { y: 54, indexLabel: "İş Seyahatleri", color: "#C4D6FF" },
            { y: 32, indexLabel: "Ürün Kullanımı", color: "#FFDBE8" },
            { y: 53, indexLabel: "Ofis", color: "#80D0FF" },
            { y: 8, indexLabel: "Üretim Süreçleri", color: "#FDFBD4" },
            { y: 5, indexLabel: "Diğer", color: "#DBD4FF" }
        ],
        chart5_scope1: [
            { y: 1800, label: "2019" }, { y: 2000, label: "2020" },
            { y: 1500, label: "2021" }, { y: 2700, label: "2022" },
            { y: 4000, label: "2023" }
        ],
        chart5_scope2: [
            { y: 3000, label: "2019" }, { y: 3500, label: "2020" },
            { y: 4000, label: "2021" }, { y: 4500, label: "2022" },
            { y: 1000, label: "2023" }
        ],
        chart5_scope3: [
            { y: 2000, label: "2019" }, { y: 2500, label: "2020" },
            { y: 3000, label: "2021" }, { y: 3500, label: "2022" },
            { y: 4000, label: "2023" }
        ],
        chart6: [
            { y: 4181563, indexLabel: "Ürün A", color: "#ffe2f1" },
            { y: 2175498, indexLabel: "Ürün B", color: "#FFD6D1" },
            { y: 3125844, indexLabel: "Ürün C", color: "#A1FFC0" },
            { y: 3125844, indexLabel: "Ürün D", color: "#befcff" }
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
 * Bu fonksiyon, gelen CSV verisini grafiklerinize göre işlemek için özelleştirilmiştir.
 * CSV başlıklarınız bu fonksiyon içindeki beklentilerle eşleşmelidir.
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
        chart1_last6Days: [], chart1_lastWeek: [],
        chart2: [], chart3: [], chart4: [],
        chart5_scope1: [], chart5_scope2: [], chart5_scope3: [],
        chart6: []
    };
    if (headers.includes('Gün') && headers.includes('Son 6 Gün CO2e') && headers.includes('Geçen Hafta CO2e')) {
        data.forEach(row => {
            const day = parseInt(row['Gün']);
            const last6DaysCo2e = row['Son 6 Gün CO2e'];
            const lastWeekCo2e = row['Geçen Hafta CO2e'];

            if (typeof day === 'number' && typeof last6DaysCo2e === 'number' && typeof lastWeekCo2e === 'number') {
                processedChartsData.chart1_last6Days.push({ x: day, y: last6DaysCo2e });
                processedChartsData.chart1_lastWeek.push({ x: day, y: lastWeekCo2e });
            }
        });
    } else {
        console.warn("Uyarı: Grafik 1 için gerekli sütunlar (Gün, Son 6 Gün CO2e, Geçen Hafta CO2e) bulunamadı.");
    }
    if (headers.includes('Ay') && headers.includes('Aylık CO2e')) {
        const monthlyCo2e = {}; 
        const monthOrder = { "Ocak": 0, "Şubat": 1, "Mart": 2, "Nisan": 3, "Mayıs": 4, "Haziran": 5,
                             "Temmuz": 6, "Ağustos": 7, "Eylül": 8, "Ekim": 9, "Kasım": 10, "Aralık": 11 };
        data.forEach(row => {
            const month = row['Ay'];
            const co2e = row['Aylık CO2e'];
            if (month && typeof co2e === 'number' && monthOrder.hasOwnProperty(month)) {
                monthlyCo2e[month] = (monthlyCo2e[month] || 0) + co2e;
            }
        });
        processedChartsData.chart2 = Object.keys(monthlyCo2e)
            .map(month => ({
                x: monthOrder[month],
                y: monthlyCo2e[month], 
                label: month
            }))
            .sort((a, b) => a.x - b.x);
    } else {
        console.warn("Uyarı: Grafik 2 için gerekli sütunlar (Ay, Aylık CO2e) bulunamadı.");
    }
    if (headers.includes('Ülke') && headers.includes('Yıllık Emisyon Ton')) {
        const geographicEmissions = {};
        data.forEach(row => {
            const country = row['Ülke'];
            const emission = row['Yıllık Emisyon Ton'];
            if (country && typeof emission === 'number') {
                geographicEmissions[country] = (geographicEmissions[country] || 0) + emission;
            }
        });
        const pieColors = ["#BADDFF", "#FFD6D1", "#A1FFC0", "#F0D9FF", "#B5C7EB", "#6F8FAF", "#FFD5CC", "#C0D9FF"];
        let colorIndex = 0;
        for (const country in geographicEmissions) {
            processedChartsData.chart3.push({
                y: geographicEmissions[country],
                indexLabel: country,
                color: pieColors[colorIndex % pieColors.length]
            });
            colorIndex++;
        }
    } else {
        console.warn("Uyarı: Grafik 3 için gerekli sütunlar (Ülke, Yıllık Emisyon Ton) bulunamadı.");
    }
    if (headers.includes('Kaynak') && headers.includes('Emisyon Miktarı')) {
        const sourceDistribution = {};
        data.forEach(row => {
            const source = row['Kaynak'];
            const amount = row['Emisyon Miktarı'];
            if (source && typeof amount === 'number') {
                sourceDistribution[source] = (sourceDistribution[source] || 0) + amount;
            }
        });
        const doughnutColors = ["#BADDFF", "#D2FFC4", "#F1E8CF", "#C4D6FF", "#FFDBE8", "#80D0FF", "#FDFBD4", "#DBD4FF"];
        let colorIndex = 0;
        for (const source in sourceDistribution) {
            processedChartsData.chart4.push({
                y: sourceDistribution[source],
                indexLabel: source,
                color: doughnutColors[colorIndex % doughnutColors.length]
            });
            colorIndex++;
        }
    } else {
        console.warn("Uyarı: Grafik 4 için gerekli sütunlar (Kaynak, Emisyon Miktarı) bulunamadı.");
    }
    if (headers.includes('Yıl') && headers.includes('Kapsam 1') && headers.includes('Kapsam 2') && headers.includes('Kapsam 3')) {
        const yearlyScopes = {};
        data.forEach(row => {
            const year = String(row['Yıl']);
            const scope1 = row['Kapsam 1'];
            const scope2 = row['Kapsam 2'];
            const scope3 = row['Kapsam 3'];

            if (year && typeof scope1 === 'number' && typeof scope2 === 'number' && typeof scope3 === 'number') {
                if (!yearlyScopes[year]) {
                    yearlyScopes[year] = { 'Kapsam 1': 0, 'Kapsam 2': 0, 'Kapsam 3': 0 };
                }
                yearlyScopes[year]['Kapsam 1'] += scope1;
                yearlyScopes[year]['Kapsam 2'] += scope2;
                yearlyScopes[year]['Kapsam 3'] += scope3;
            }
        });
        Object.keys(yearlyScopes).sort().forEach(year => {
            processedChartsData.chart5_scope1.push({ y: yearlyScopes[year]['Kapsam 1'], label: year });
            processedChartsData.chart5_scope2.push({ y: yearlyScopes[year]['Kapsam 2'], label: year });
            processedChartsData.chart5_scope3.push({ y: yearlyScopes[year]['Kapsam 3'], label: year });
        });
    } else {
        console.warn("Uyarı: Grafik 5 için gerekli sütunlar (Yıl, Kapsam 1, Kapsam 2, Kapsam 3) bulunamadı.");
    }
    if (headers.includes('Ürün Adı') && headers.includes('Karbon Ayak İzi')) {
        const productCarbonFootprint = {};
        data.forEach(row => {
            const productName = row['Ürün Adı'];
            const carbonFootprint = row['Karbon Ayak İzi'];
            if (productName && typeof carbonFootprint === 'number') {
                productCarbonFootprint[productName] = (productCarbonFootprint[productName] || 0) + carbonFootprint;
            }
        });
        const productColors = ["#ffe2f1", "#FFD6D1", "#A1FFC0", "#befcff", "#E0BBE4", "#957DAD"];
        let colorIndex = 0;
        for (const product in productCarbonFootprint) {
            processedChartsData.chart6.push({
                y: productCarbonFootprint[product],
                indexLabel: product,
                color: productColors[colorIndex % productColors.length]
            });
            colorIndex++;
        }
    } else {
        console.warn("Uyarı: Grafik 6 için gerekli sütunlar (Ürün Adı, Karbon Ayak İzi) bulunamadı.");
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
            axisX: {
                title: "Günler",
                interval: 1,
                labelFormatter: function (e) {
                    return (e.value + 1).toString(); 
                }
            },
            toolTip: commonChartOptions.toolTip, 
            data: [
                { type: "line", name: "Son 6 Gün", color: "#103A00", showInLegend: true, dataPoints: [] },
                { type: "line", name: "Geçen Hafta", color: "#CE3C10", showInLegend: true, dataPoints: [] }
            ]
        });
    }
    charts.chart1.options.data[0].dataPoints = data.chart1_last6Days || [];
    charts.chart1.options.data[1].dataPoints = data.chart1_lastWeek || [];
    charts.chart1.render();

    if (!charts.chart2) {
        charts.chart2 = new CanvasJS.Chart("2grafik", {
            ...commonChartOptions,
            toolTip: singleSeriesToolTip,
            axisX: { ...commonChartOptions.axisX, interval: 1, labelFormatter: function(e){ return e.label; } },
            data: [{ name: "CO2e", color: "#CDCDCD", type: "column", dataPoints: [] }]
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
            legend: { ...commonChartOptions.legend, horizontalAlign: "center", verticalAlign: "bottom", maxWidth: 350 },
            toolTip: {
                contentFormatter: function (e) {
                    return e.entries[0].dataPoint.indexLabel + ": <strong>" + e.entries[0].dataPoint.y.toLocaleString('tr-TR') + "</strong>";
                }
            },
            data: [{
                type: "doughnut",
                showInLegend: true,
                legendText: "{indexLabel}",
                indexLabelFontSize: 13,
                indexLabel: "{indexLabel} - #percent%",
                toolTipContent: "{indexLabel}: {y} (#percent%)",
                dataPoints: []
            }]
        });
    }
    charts.chart4.options.data[0].dataPoints = data.chart4 || [];
    charts.chart4.render();

    if (!charts.chart5) {
        charts.chart5 = new CanvasJS.Chart("5grafik", {
            ...commonChartOptions,
            axisY: { ...commonChartOptions.axisY, title: "Emisyon (ton)"},
            data: [
                { type: "stackedColumn", name: "Kapsam 1", color: "#ffdef2", showInLegend: true, dataPoints: [] },
                { type: "stackedColumn", name: "Kapsam 2", color: "#e2eeff", showInLegend: true, dataPoints: [] },
                { type: "stackedColumn", name: "Kapsam 3", color: "#f2e2ff", showInLegend: true, dataPoints: [] }
            ]
        });
    }
    charts.chart5.options.data[0].dataPoints = data.chart5_scope1 || [];
    charts.chart5.options.data[1].dataPoints = data.chart5_scope2 || [];
    charts.chart5.options.data[2].dataPoints = data.chart5_scope3 || [];
    charts.chart5.render();

    if (!charts.chart6) {
        charts.chart6 = new CanvasJS.Chart("6grafik", {
            ...commonChartOptions,
            toolTip: {
                contentFormatter: function (e) {
                    return e.entries[0].dataPoint.indexLabel + ": <strong>" + e.entries[0].dataPoint.y.toLocaleString('tr-TR') + "</strong> (#percent%)";
                }
            },
            legend: { ...commonChartOptions.legend, horizontalAlign: "center", verticalAlign: "bottom", maxWidth: 350 },
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
    charts.chart6.options.data[0].dataPoints = data.chart6 || [];
    charts.chart6.render();
}