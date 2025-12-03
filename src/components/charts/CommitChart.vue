<template>
  <div class="bg-white rounded-xl p-6 shadow">
    <h3 class="text-lg font-semibold mb-5">
      {{ repoName }}
    </h3>
    <Line :data="chartData" :options="chartOptions" class="mb-5" />
    <div class="flex justify-around pt-4 border-t border-gray-100">
      <div class="flex flex-col text-center">
        <span class="text-xs text-gray-500 mb-1">Total Commits:</span>
        <span class="text-2xl font-bold text-blue-600">{{ totalCommits }}</span>
      </div>
      <div class="flex flex-col text-center">
        <span class="text-xs text-gray-500 mb-1">Days with Activity:</span>
        <span class="text-2xl font-bold text-blue-600">{{
          commits.length
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps({
  repoName: {
    type: String,
    required: true,
  },
  commits: {
    type: Array,
    required: true,
  },
});

const totalCommits = computed(() => {
  return props.commits.reduce((sum, commit) => sum + commit.count, 0);
});

const chartData = computed(() => {
  const sortedCommits = [...props.commits].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );

  return {
    labels: sortedCommits.map((commit) => {
      const date = new Date(commit.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }),
    datasets: [
      {
        label: "Commits",
        data: sortedCommits.map((commit) => commit.count),
        borderColor: "#155dfc",
        backgroundColor: "rgba(21,93,252,0.1)",
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#155dfc",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 3,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "#155dfc",
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        label: function (context) {
          return `Commits: ${context.parsed.y}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 45,
        minRotation: 45,
        font: {
          size: 11,
        },
        color: "#666",
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
      ticks: {
        precision: 0,
        font: {
          size: 11,
        },
        color: "#666",
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
};
</script>
