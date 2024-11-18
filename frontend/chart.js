
const generateChart = (data) => {
    try {
      const validData = data.filter((item) => item.totalSolved && !item.info);
  
      const sectionTotals = validData.reduce((acc, curr) => {
        acc[curr.section] = (acc[curr.section] || 0) + curr.totalSolved;
        return acc;
      }, {});
  
      const sections = Object.keys(sectionTotals);
      const totalSolved = Object.values(sectionTotals);
  
      const ctx = document.getElementById('sectionPieChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: sections,
          datasets: [{
            label: 'Total Solved Questions',
            data: totalSolved,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  return `${tooltipItem.label}: ${tooltipItem.raw}`;
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error("Error generating chart:", error);
    }
  };
  
  
  
  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:3001/data");
      const data = await response.json();
      generateChart(data);
    }
    catch (error) {
      console.error(error);
    }
  }
  
  fetchData();