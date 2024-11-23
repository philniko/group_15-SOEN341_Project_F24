// src/components/GradeChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GradeChartProps {
  grades: {
    cooperation: number;
    conceptual: number;
    practical: number;
    workEthic: number;
    total: number;
  };
}

const GradeChart: React.FC<GradeChartProps> = ({ grades }) => {
  const data = {
    labels: ['Cooperation', 'Conceptual Contribution', 'Practical Contribution', 'Work Ethic', "Total Grade"],
    datasets: [
      {
        label: 'Grade',
        data: [grades.cooperation, grades.conceptual, grades.practical, grades.workEthic, grades.total],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
        text: 'Grade Breakdown',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default GradeChart;