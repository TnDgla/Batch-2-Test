
const sectionData = {
    labels: ['Section A', 'Section B', 'Section C', 'Section D'],
    datasets: [
        {
            label: 'Participants by Section',
            data: [30, 50, 20, 40], // Replace with dynamic data
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50'],
            hoverOffset: 4,
        },
    ],
};

const ctx = document.getElementById('section-pie-chart').getContext('2d');
new Chart(ctx, {
    type: 'pie',
    data: sectionData,
});
