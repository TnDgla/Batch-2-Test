

const ctx = document.getElementById('section-pie-chart').getContext('2d');
new Chart(ctx, {
    type: 'pie',
    data: sectionData,
});
