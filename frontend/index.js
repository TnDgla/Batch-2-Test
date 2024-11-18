// Search implementation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch("http://localhost:3001/data");
        const data = await response.json();
        let filteredData = [...data]; // Keep original data separate
        const leaderboardBody = document.getElementById('leaderboard-body');
        const sectionFilter = document.getElementById('section-filter');
        const searchInput = document.getElementById('srch'); // Reference to the search input

        // Populate section filter dropdown
        const populateSectionFilter = () => {
            const sections = [...new Set(data.map(student => student.section || 'N/A'))].sort();
            sectionFilter.innerHTML = '<option value="all">All Sections</option>';
            sections.forEach(section => {
                const option = document.createElement('option');
                option.value = section;
                option.textContent = section;
                sectionFilter.appendChild(option);
            });
        };

        // Function to render the leaderboard
        const renderLeaderboard = (sortedData) => {
            leaderboardBody.innerHTML = '';
            sortedData.forEach((student, index) => {
                const row = document.createElement('tr');
                row.classList.add('border-b', 'border-gray-700');
                row.innerHTML = `
                    <td class="p-4">${index + 1}</td>
                    <td class="p-4">${student.roll}</td>
                    <td class="p-4">
                        ${student.url.startsWith('https://leetcode.com/u/') 
                            ? `<a href="${student.url}" target="_blank" class="text-blue-400">${student.name}</a>`
                            : `<div class="text-red-500">${student.name}</div>`}
                    </td>
                    <td class="p-4">${student.section || 'N/A'}</td>
                    <td class="p-4">${student.totalSolved || 'N/A'}</td>
                    <td class="p-4 text-green-400">${student.easySolved || 'N/A'}</td>
                    <td class="p-4 text-yellow-400">${student.mediumSolved || 'N/A'}</td>
                    <td class="p-4 text-red-400">${student.hardSolved || 'N/A'}</td>
                `;
                leaderboardBody.appendChild(row);
            });
        };

        // Function to filter data by name
        const filterDataByName = (query) => {
            const filteredByName = filteredData.filter(student => 
                student.name.toLowerCase().includes(query.toLowerCase())
            );
            renderLeaderboard(filteredByName);
        };

        // Filter function for section
        const filterDataBySection = (section) => {
            const filteredBySection = section === 'all' 
                ? [...filteredData] 
                : filteredData.filter(student => (student.section || 'N/A') === section);
            renderLeaderboard(filteredBySection);
        };

        // Initialize the page
        populateSectionFilter();
        renderLeaderboard(filteredData);

        // Event Listeners
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            filterDataByName(query); // Filter data based on name
        }, 300)); // Debounce time of 300ms

        sectionFilter.addEventListener('change', (e) => {
            const section = e.target.value;
            filterDataBySection(section); // Filter data based on section
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});

// Debounce function to limit the frequency of search input events
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
