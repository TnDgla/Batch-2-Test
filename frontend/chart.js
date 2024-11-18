const xValues=document.getElementsById("sort-section")
        new Chart("myChart", {
            type: "pie",
            data: {
              labels: xValues,
              datasets: [{
                backgroundColor: barColors,
                data: xValues
              }]
            },
            options: {
              title: {
                display: true,
                text: "Progress"
              }
            }
          });