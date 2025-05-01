import { ChartConfiguration } from 'chart.js';

export function generateLineChartConfig(data: any[]): ChartConfiguration {
  return {
    type: 'line',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: 'Progress',
        data: data.map(d => d.value),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
}

export function generateBarChartConfig(data: any[]): ChartConfiguration {
  return {
    type: 'bar',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        label: 'Statistics',
        data: data.map(d => d.value),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };
}

export function generatePieChartConfig(data: any[]): ChartConfiguration {
  return {
    type: 'pie',
    data: {
      labels: data.map(d => d.label),
      datasets: [{
        data: data.map(d => d.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true
    }
  };
}

export function generateCharts(data: any[]) {
  return {
    lineChart: generateLineChartConfig(data),
    barChart: generateBarChartConfig(data),
    pieChart: generatePieChartConfig(data)
  };
} 