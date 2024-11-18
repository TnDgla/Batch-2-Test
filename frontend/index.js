document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch("http://localhost:3001/data");
        const data = await response.json();
        let filteredData = [...data];
        const leaderboardBody = document.getElementById('leaderboard-body');
        const sectionFilter = document.getElementById('section-filter');

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

        // Pie Chart
        const ctx = document.querySelector('#myChart');
        if (ctx) {
            const sectionCounts = ['d', 'e', 'c', 'ah', 'ac'].map(sectionKey =>
                data.filter(student => (student.section || '').toLowerCase().includes(sectionKey)).length
            );

            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['D', 'E', 'C', 'AH', 'AC'],
                    datasets: [{
                        label: 'Section Distribution',
                        data: sectionCounts,
                        borderWidth: 1
                    }]
                }
            });
        }

        // Export data to CSV
        const exportToCSV = (data) => {
            const headers = ['Rank', 'Roll Number', 'Name', 'Section', 'Total Solved', 'Easy', 'Medium', 'Hard', 'LeetCode URL'];
            const csvRows = data.map((student, index) => {
                return [
                    index + 1,
                    student.roll || 'N/A',
                    student.name || 'N/A',
                    student.section || 'N/A',
                    student.totalSolved || 'N/A',
                    student.easySolved || 'N/A',
                    student.mediumSolved || 'N/A',
                    student.hardSolved || 'N/A',
                    student.url || 'N/A'
                ].join(',');
            });

            const csvContent = [headers.join(','), ...csvRows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'leaderboard.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // Render the leaderboard
        const renderLeaderboard = (sortedData) => {
            leaderboardBody.innerHTML = '';
            sortedData.forEach((student, index) => {
                const row = document.createElement('tr');
                row.classList.add('border-b', 'border-gray-700');
                row.innerHTML = `
                    <td class="p-4">${index + 1}</td>
                    <td class="p-4">${student.roll || 'N/A'}</td>
                    <td class="p-4">
                        ${student.url?.startsWith('https://leetcode.com/')
                            ? `<a href="${student.url}" target="_blank" class="text-blue-400">${student.name || 'N/A'}</a>`
                            : `<span class="text-red-500">${student.name || 'N/A'}</span>`}
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

        // Search functionality
        const searchInput = document.querySelector(".username-search");
        const searchBtn = document.querySelector("#search-btn");
        searchBtn.addEventListener('click', () => {
            const searchText = searchInput.value.toLowerCase();
            const filteredData = data.filter(student => {
                const name = (student.name || '').toLowerCase();
                const roll = (student.roll || '').toLowerCase();
                return name.includes(searchText) || roll.includes(searchText);
            });
            renderLeaderboard(filteredData);
        });

        // Filter data by section
        const filterData = (section) => {
            filteredData = section === 'all'
                ? [...data]
                : data.filter(student => (student.section || 'N/A') === section);
            renderLeaderboard(filteredData);
        };

        // Sort data with direction toggling
        const sortData = (data, field, direction, isNumeric = false) => {
            return data.sort((a, b) => {
                const valA = a[field] || (isNumeric ? 0 : '');
                const valB = b[field] || (isNumeric ? 0 : '');
                if (isNumeric) {
                    return direction === 'desc' ? valB - valA : valA - valB;
                }
                return direction === 'desc'
                    ? valB.toString().localeCompare(valA.toString())
                    : valA.toString().localeCompare(valB.toString());
            });
        };

        // Sorting event listeners
        let sortDirections = {
            totalSolved: 'desc',
            easySolved: 'desc',
            mediumSolved: 'desc',
            hardSolved: 'desc',
            section: 'asc'
        };

        const setupSortListener = (id, field, isNumeric = false) => {
            document.getElementById(id).addEventListener('click', () => {
                sortDirections[field] = sortDirections[field] === 'desc' ? 'asc' : 'desc';
                const sortedData = sortData(filteredData, field, sortDirections[field], isNumeric);
                renderLeaderboard(sortedData);
            });
        };

        setupSortListener('sort-total', 'totalSolved', true);
        setupSortListener('sort-easy', 'easySolved', true);
        setupSortListener('sort-medium', 'mediumSolved', true);
        setupSortListener('sort-hard', 'hardSolved', true);
        setupSortListener('sort-section', 'section');

        // Initialize page
        populateSectionFilter();
        renderLeaderboard(data);

        // Filter event listener
        sectionFilter.addEventListener('change', (e) => {
            filterData(e.target.value);
        });

        // Export button listener
        document.getElementById('export-btn').addEventListener('click', () => {
            exportToCSV(filteredData);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});
