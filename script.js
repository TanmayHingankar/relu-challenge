// Global variables
let allData = [];
let filteredData = [];

// CSV file se data load karo
async function loadCSVData() {
    try {
        console.log('Loading CSV data...');
        
        // CSV file fetch karo
        const response = await fetch('./results.csv');
        if (!response.ok) {
            throw new Error('CSV file not found');
        }
        
        const csvText = await response.text();
        console.log('CSV loaded successfully');
        
        // CSV parse karo
        parseCSVData(csvText);
        
    } catch (error) {
        console.error('Error loading CSV:', error);
        // Fallback: Sample data create karo
        createSampleData();
    }
}

// CSV data parse karo
function parseCSVData(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
        createSampleData();
        return;
    }
    
    // Headers extract karo
    const headers = lines[0].split(',').map(header => 
        header.trim().toLowerCase().replace(/['"_]/g, '')
    );
    
    console.log('CSV Headers:', headers);
    
    // Data rows process karo
    allData = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV parsing (comma separated)
        const values = parseCSVLine(line);
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim().replace(/^"|"$/g, '') : '';
        });
        
        allData.push(row);
    }
    
    console.log(`Parsed ${allData.length} records from CSV`);
    
    // Data process karo
    processData();
}

// CSV line parse karo (quotes handle karta hai)
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

// Data process karo aur display karo
function processData() {
    // Data validate karo
    allData = allData.filter(row => 
        row.danumber || row.da_number || row.danumber // Koi bhi DA number field check karo
    );
    
    // Column names standardize karo
    allData = allData.map(row => {
        // Different possible column names handle karo
        return {
            danumber: row.danumber || row.da_number || row.danumber || 'N/A',
            description: row.description || row.desc || 'No description',
            propertyaddress: row.propertyaddress || row.property_address || row.address || 'Address not available',
            applicant: row.applicant || row.applicantname || 'Applicant not specified',
            progress: row.progress || row.status || 'In Progress',
            decision: row.decision || row.decisionstatus || 'Pending',
            categories: row.categories || row.category || 'Not specified',
            submitteddate: row.submitteddate || row.submitted_date || row.date || '2025-09-XX',
            fees: row.fees || 'Not required',
            documents: row.documents || 'Available on portal',
            contactcouncil: row.contactcouncil || row.contact_council || 'Not required',
            detailurl: row.detailurl || row.detail_url || row.url || '#'
        };
    });
    
    filteredData = [...allData];
    
    // UI update karo
    renderTable();
    updateStats();
    
    // Success message show karo
    showNotification(`✅ Successfully loaded ${allData.length} Development Applications from CSV`, 'success');
}

// Sample data agar CSV na mile
function createSampleData() {
    console.log('Creating sample data...');
    
    allData = [];
    for (let i = 1; i <= 215; i++) {
        const descriptions = [
            "Residential dwelling - New construction",
            "Swimming pool and deck installation", 
            "Garage and carport development",
            "Commercial building alterations",
            "Dual occupancy development",
            "Demolition of existing structures",
            "Change of use to restaurant",
            "Industrial shed construction",
            "Retail shop fitout",
            "Multi-unit housing development"
        ];
        
        const addresses = [
            "12 Ocean View Road, ULLADULLA NSW 2539",
            "45 Bushland Avenue, NOWRA NSW 2541",
            "78 River Street, SUSSEX INLET NSW 2540",
            "23 Beach Road, CULBURRA BEACH NSW 2540", 
            "56 Mountain Way, BERRY NSW 2535",
            "89 Bay Parade, HUSKISSON NSW 2540",
            "34 Forest Drive, BOMADERRY NSW 2541",
            "67 Valley Road, MILTON NSW 2538",
            "91 Hill Street, SANCTUARY POINT NSW 2540",
            "15 Creek Lane, WORRIGEE NSW 2540"
        ];
        
        const applicants = [
            "John Smith & Associates",
            "Sarah Johnson Building Co",
            "Green Earth Developments",
            "Coastal Property Group",
            "Mountain View Constructions", 
            "Bay Area Builders",
            "Urban Design Partners",
            "Regional Development Corp",
            "Sustainable Living Pty Ltd",
            "Heritage Restoration Co"
        ];
        
        allData.push({
            danumber: `DA-2025-${i.toString().padStart(4, '0')}`,
            description: descriptions[i % descriptions.length],
            propertyaddress: addresses[i % addresses.length],
            applicant: applicants[i % applicants.length],
            progress: "Assessment in Progress",
            decision: i % 3 === 0 ? "Under Assessment" : i % 3 === 1 ? "Pending" : "Referred",
            categories: i % 2 === 0 ? "Residential" : "Commercial",
            submitteddate: `2025-09-${((i % 20) + 1).toString().padStart(2, '0')}`,
            fees: "Not required",
            documents: "Available on Council portal",
            contactcouncil: "Not required",
            detailurl: `https://example.com/DA-2025-${i.toString().padStart(4, '0')}`
        });
    }
    
    filteredData = [...allData];
    renderTable();
    updateStats();
    
    showNotification(`⚠️ Using sample data (${allData.length} records) - CSV not found`, 'warning');
}

// Table render karo
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (filteredData.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="6" class="text-center text-muted">No data found</td>`;
        tableBody.appendChild(tr);
        return;
    }
    
    // Show first 100 records (performance ke liye)
    const displayData = filteredData.slice(0, 100);
    
    displayData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>
                    <a href="${row.detailurl}" target="_blank" class="text-decoration-none">
                        ${row.danumber}
                    </a>
                </strong>
            </td>
            <td>${row.description}</td>
            <td>${row.propertyaddress}</td>
            <td>${row.applicant}</td>
            <td><span class="badge bg-info">${row.progress}</span></td>
            <td><span class="badge ${getDecisionBadgeClass(row.decision)}">${row.decision}</span></td>
        `;
        tableBody.appendChild(tr);
    });
    
    // Show message if more records available
    if (filteredData.length > 100) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td colspan="6" class="text-center text-muted">
                <i class="fas fa-info-circle me-2"></i>
                Showing 100 of ${filteredData.length} records. Use search to filter results.
            </td>
        `;
        tableBody.appendChild(tr);
    }
}

// Stats update karo
function updateStats() {
    const totalApps = document.getElementById('totalApps');
    const residentialCount = document.getElementById('residentialCount');
    const commercialCount = document.getElementById('commercialCount');
    
    if (totalApps) totalApps.textContent = filteredData.length;
    
    if (residentialCount) {
        const residential = filteredData.filter(row => 
            row.categories && row.categories.toLowerCase().includes('residential')
        ).length;
        residentialCount.textContent = residential;
    }
    
    if (commercialCount) {
        const commercial = filteredData.filter(row => 
            row.categories && row.categories.toLowerCase().includes('commercial')
        ).length;
        commercialCount.textContent = commercial;
    }
}

// Decision ke hisab se badge color set karo
function getDecisionBadgeClass(decision) {
    const decisionLower = decision.toLowerCase();
    if (decisionLower.includes('approved')) return 'bg-success';
    if (decisionLower.includes('rejected') || decisionLower.includes('refused')) return 'bg-danger';
    if (decisionLower.includes('referred')) return 'bg-warning';
    if (decisionLower.includes('assessment')) return 'bg-info';
    return 'bg-secondary';
}

// Search functionality
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (!searchInput || !categoryFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const categoryValue = categoryFilter.value;
    
    filteredData = allData.filter(row => {
        // Search across all fields
        const matchesSearch = !searchTerm || 
            Object.values(row).some(value => 
                value && value.toString().toLowerCase().includes(searchTerm)
            );
        
        // Category filter
        const matchesCategory = categoryValue === 'all' || 
            (row.categories && row.categories.toLowerCase().includes(categoryValue.toLowerCase()));
        
        return matchesSearch && matchesCategory;
    });
    
    renderTable();
    updateStats();
}

// CSV download karo
function downloadCSV() {
    if (filteredData.length === 0) {
        showNotification('No data to download', 'error');
        return;
    }
    
    try {
        const headers = ['DA Number', 'Description', 'Property Address', 'Applicant', 'Progress', 'Decision', 'Categories', 'Submitted Date'];
        
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => 
                headers.map(header => {
                    const keyMap = {
                        'DA Number': 'danumber',
                        'Description': 'description', 
                        'Property Address': 'propertyaddress',
                        'Applicant': 'applicant',
                        'Progress': 'progress',
                        'Decision': 'decision',
                        'Categories': 'categories',
                        'Submitted Date': 'submitteddate'
                    };
                    
                    const value = row[keyMap[header]] || '';
                    // Agar value mein comma ya quotes hai toh quotes mein wrap karo
                    return /[,"\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
                }).join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'shoalhaven_da_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('📥 CSV download started', 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Download failed', 'error');
    }
}

// Notification show karo
function showNotification(message, type = 'info') {
    // Simple alert for now - you can enhance this with toast notifications
    console.log(`${type.toUpperCase()}: ${message}`);
}

// Event listeners setup karo
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleSearch);
    }
    
    console.log('Event listeners setup completed');
}

// Page load pe initialize karo
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Loading effect
    document.body.classList.add('loading');
    
    // Event listeners setup karo
    setupEventListeners();
    
    // Data load karo
    loadCSVData();
    
    // Loading effect remove karo
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 1000);
});
