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
    topCategory: "-",
  });

  const [chartData, setChartData] = useState([]);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const res = await api.get("/dashboard");

        setStats(res.data.stats);
        setChartData(res.data.chart);

      } catch (error) {

        console.log("Backend not ready yet");

      }

    };

    fetchDashboard();

  }, []);

  return (

    /* FLEX LAYOUT FIX */
    <div className="flex bg-gray-200 min-h-screen">

      {/* Sidebar */}
      <AdminNavbar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content */}
      <div className="flex-1 p-10 transition-all duration-300">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">

          <h1 className="text-2xl font-semibold">
            Dashboard overview
          </h1>

          <select className="border rounded-lg px-3 py-1 text-sm bg-white">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
          </select>

        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Tickets Created</p>
            <h2 className="text-2xl font-bold mt-2">
              {stats.totalTickets}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Avg. Resolution Time</p>
            <h2 className="text-2xl font-bold mt-2">
              {stats.avgResolution}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Active Tickets</p>
            <h2 className="text-2xl font-bold mt-2">
              {stats.activeTickets}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Top Category</p>
            <h2 className="text-2xl font-bold mt-2">
              {stats.topCategory}
            </h2>
          </div>

        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow p-8">

          <ResponsiveContainer width="100%" height={350}>

            <BarChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar dataKey="Access" stackId="a" fill="#7c6ee6" />

              <Bar dataKey="Hardware" stackId="a" fill="#f28b82" />

              <Bar dataKey="Network" stackId="a" fill="#5fb3c8" />

              <Bar dataKey="Feature" stackId="a" fill="#f5b461" />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>
    </div>
  );
}