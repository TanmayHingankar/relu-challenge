// Sample data - CSV se load karenge
let allData = [];
let filteredData = [];

// CSV data load karo
async function loadCSVData() {
    try {
        const response = await fetch('results.csv');
        const csvText = await response.text();
        parseCSV(csvText);
    } catch (error) {
        console.error('Error loading CSV:', error);
        // Fallback sample data
        createSampleData();
    }
}

// CSV parse karo
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase().replace('_', ''));
    
    allData = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = parseCSVLine(lines[i]);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] ? values[index].trim() : '';
            });
            allData.push(row);
        }
    }
    
    filteredData = [...allData];
    renderTable();
    updateStats();
}

// CSV line parse karo (comma separated values handle karta hai)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Sample data agar CSV na mile
function createSampleData() {
    allData = [];
    for (let i = 1; i <= 215; i++) {
        allData.push({
            danumber: `DA-2025-${i.toString().padStart(4, '0')}`,
            description: `Development Application ${i}`,
            propertyaddress: `${i} Sample Street, SHOALHAVEN NSW`,
            applicant: `Applicant ${i}`,
            progress: 'Under Assessment',
            decision: 'Pending',
            categories: i % 2 === 0 ? 'Residential' : 'Commercial',
            submitteddate: '2025-09-15',
            fees: 'Not required',
            documents: 'Available online',
            contactcouncil: 'Not required',
            detailurl: `https://example.com/DA-2025-${i.toString().padStart(4, '0')}`
        });
    }
    filteredData = [...allData];
    renderTable();
    updateStats();
}

// Table render karo
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    filteredData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.danumber || ''}</strong></td>
            <td>${row.description || ''}</td>
            <td>${row.propertyaddress || ''}</td>
            <td>${row.applicant || ''}</td>
            <td><span class="badge bg-info">${row.progress || ''}</span></td>
            <td><span class="badge bg-warning">${row.decision || ''}</span></td>
        `;
        tableBody.appendChild(tr);
    });
}

// Stats update karo
function updateStats() {
    document.getElementById('totalApps').textContent = filteredData.length;
    
    const residentialCount = filteredData.filter(row => 
        row.categories && row.categories.toLowerCase().includes('residential')
    ).length;
    document.getElementById('residentialCount').textContent = residentialCount;
    
    const commercialCount = filteredData.filter(row => 
        row.categories && row.categories.toLowerCase().includes('commercial')
    ).length;
    document.getElementById('commercialCount').textContent = commercialCount;
}

// Search functionality
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    filteredData = allData.filter(row => {
        const matchesSearch = !searchTerm || Object.values(row).some(value => 
            value && value.toString().toLowerCase().includes(searchTerm)
        );
        
        const matchesCategory = categoryFilter === 'all' || 
            (row.categories && row.categories.toLowerCase().includes(categoryFilter.toLowerCase()));
        
        return matchesSearch && matchesCategory;
    });
    
    renderTable();
    updateStats();
}

// CSV download karo
function downloadCSV() {
    if (filteredData.length === 0) return;
    
    const headers = Object.keys(filteredData[0]);
    const csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                // Agar value mein comma hai toh quotes mein wrap karo
                return value.includes(',') ? `"${value}"` : value;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shoalhaven_da_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    loadCSVData();
    
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('categoryFilter').addEventListener('change', handleSearch);
    
    // Loading effect
    document.body.classList.add('loading');
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 1000);
});
