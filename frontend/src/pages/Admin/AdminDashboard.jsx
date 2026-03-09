import React, { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import api from "../../api/axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Admin_Dashboard() {

  const [collapsed, setCollapsed] = useState(false);

  const [stats, setStats] = useState({
    totalTickets: 0,
    avgResolution: "0h",
    activeTickets: 0,
    topCategory: "-"
  });

  const [chartData, setChartData] = useState([]);

  const [period, setPeriod] = useState(7);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const res = await api.get(`/dashboard?period=${period}`);

        const data = res.data;

        // Stats
        setStats({
          totalTickets: data.ticketsCreated,
          avgResolution: data.avgResolutionTime,
          activeTickets: data.activeTickets,
          topCategory: data.topCategory?.name || "-"
        });

        // Convert chart data
        const formattedChart = data.ticketsByCategory.map((item) => ({
          name: item._id,
          count: item.count
        }));

        setChartData(formattedChart);

      } catch (error) {
        console.log("Dashboard error:", error);
      }

    };

    fetchDashboard();

  }, [period]);

  return (

    <div className="flex bg-gray-200 min-h-screen">

      {/* Sidebar */}
      <AdminNavbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">

          <h1 className="text-2xl font-semibold">
            Dashboard Overview
          </h1>

          <select
            className="border rounded-lg px-3 py-1 text-sm bg-white"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Total Tickets Created
            </p>
            <h2 className="text-2xl font-bold mt-2">
              {stats.totalTickets}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Avg. Resolution Time
            </p>
            <h2 className="text-2xl font-bold mt-2">
              {stats.avgResolution}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Active Tickets
            </p>
            <h2 className="text-2xl font-bold mt-2">
              {stats.activeTickets}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">
              Top Category
            </p>
            <h2 className="text-2xl font-bold mt-2">
              {stats.topCategory}
            </h2>
          </div>

        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl shadow p-8">

          <h2 className="text-lg font-semibold mb-5">
            Tickets by Category
          </h2>

          <ResponsiveContainer width="100%" height={350}>

            <BarChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar dataKey="count" fill="#7c6ee6" />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}