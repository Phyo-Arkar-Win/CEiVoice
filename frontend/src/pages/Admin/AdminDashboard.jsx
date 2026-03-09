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
  const [period, setPeriod] = useState(7);

  const [stats, setStats] = useState({
    totalTickets: 0,
    avgResolution: "0h",
    activeTickets: 0,
    topCategory: "-"
  });

  const [categoryChart, setCategoryChart] = useState([]);
  const [statusChart, setStatusChart] = useState([]);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const res = await api.get(`/admin/dashboard?period=${period}`);
        const data = res.data;

        /* ---------- STATS ---------- */

        setStats({
          totalTickets: data.ticketsCreated,
          avgResolution: data.avgResolutionTime,
          activeTickets: data.activeTickets,
          topCategory: data.topCategory?.name || "-"
        });


        /* ---------- CATEGORY CHART (dynamic but same design) ---------- */

        const categoryRow = { name: "Category" };

        data.ticketsByCategory.forEach((item) => {
          categoryRow[item._id] = item.count;
        });

        setCategoryChart([categoryRow]);


        /* ---------- STATUS CHART (dynamic but same design) ---------- */

        const statusRow = { name: "Status" };

        data.ticketsByStatus.forEach((item) => {
          statusRow[item._id] = item.count;
        });

        setStatusChart([statusRow]);

      } catch (error) {
        console.error("Dashboard error:", error);
      }

    };

    fetchDashboard();

  }, [period]);


  return (

    <div className="flex bg-gray-200 min-h-screen">

      <AdminNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 p-10">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-2xl font-semibold">
            Dashboard Overview
          </h1>

          <select
            className="border rounded-lg px-3 py-1 text-sm bg-white"
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 3 Months</option>
          </select>

        </div>


        {/* STATS */}

        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Total Tickets Created</p>
            <h2 className="text-2xl font-bold mt-2">{stats.totalTickets}</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Avg. Resolution Time</p>
            <h2 className="text-2xl font-bold mt-2">{stats.avgResolution}</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Active Tickets</p>
            <h2 className="text-2xl font-bold mt-2">{stats.activeTickets}</h2>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-sm">Top Category</p>
            <h2 className="text-2xl font-bold mt-2">{stats.topCategory}</h2>
          </div>

        </div>


        {/* CHARTS */}

        <div className="grid grid-cols-2 gap-8">

          {/* CATEGORY CHART */}

          <div className="bg-white rounded-xl shadow p-8">

            <h2 className="text-lg font-semibold mb-5">
              Tickets by Category
            </h2>

            <ResponsiveContainer width="100%" height={350}>

              <BarChart data={categoryChart}>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="Access" fill="#7c6ee6" />
                <Bar dataKey="Feature" fill="#f87171" />
                <Bar dataKey="Hardware" fill="#60a5fa" />
                <Bar dataKey="Network" fill="#fbbf24" />

              </BarChart>

            </ResponsiveContainer>

          </div>



          {/* STATUS CHART */}

          <div className="bg-white rounded-xl shadow p-8">

            <h2 className="text-lg font-semibold mb-5">
              Tickets by Status
            </h2>

            <ResponsiveContainer width="100%" height={350}>

              <BarChart data={statusChart}>

                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="New" fill="#60a5fa" />
                <Bar dataKey="Solving" fill="#fbbf24" />
                <Bar dataKey="Solved" fill="#4ade80" />
                <Bar dataKey="Failed" fill="#f87171" />
                <Bar dataKey="Draft" fill="#9ca3af" />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>

  );
}