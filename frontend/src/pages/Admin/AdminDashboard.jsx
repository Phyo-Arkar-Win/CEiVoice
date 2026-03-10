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

        setStats({
          totalTickets: data.ticketsCreated,
          avgResolution: data.avgResolutionTime,
          activeTickets: data.activeTickets,
          topCategory: data.topCategory?.name || "-"
        });

        const categoryRow = { name: "Category" };

        data.ticketsByCategory.forEach((item) => {
          categoryRow[item._id] = item.count;
        });

        setCategoryChart([categoryRow]);

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
    <div className="flex bg-gray-200 min-h-screen flex-col md:flex-row">

      <AdminNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 p-4 md:p-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">

          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <p className="text-gray-500 text-xs md:text-sm text-center">
              Total Tickets
            </p>
            <h2 className="text-lg md:text-2xl font-bold mt-2">
              {stats.totalTickets}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <p className="text-gray-500 text-xs md:text-sm text-center">
              Avg Resolution
            </p>
            <h2 className="text-lg md:text-2xl font-bold mt-2">
              {stats.avgResolution}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <p className="text-gray-500 text-xs md:text-sm text-center">
              Active Tickets
            </p>
            <h2 className="text-lg md:text-2xl font-bold mt-2">
              {stats.activeTickets}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
            <p className="text-gray-500 text-xs md:text-sm text-center">
              Top Category
            </p>
            <h2 className="text-lg md:text-2xl font-bold mt-2">
              {stats.topCategory}
            </h2>
          </div>

        </div>


        {/* CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

          {/* CATEGORY CHART */}
          <div className="bg-white rounded-xl shadow p-4 md:p-8">

            <h2 className="text-base md:text-lg font-semibold mb-4">
              Tickets by Category
            </h2>

            <div className="overflow-x-auto">
              <div className="min-w-[500px] h-64 md:h-[350px]">

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChart} barCategoryGap={20}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis tick={{ fontSize: 12 }} />

                    <Tooltip />

                    <Legend wrapperStyle={{ fontSize: "12px" }} />

                    <Bar dataKey="Access" fill="#7c6ee6" maxBarSize={40} />
                    <Bar dataKey="Feature" fill="#f87171" maxBarSize={40} />
                    <Bar dataKey="Hardware" fill="#60a5fa" maxBarSize={40} />
                    <Bar dataKey="Network" fill="#fbbf24" maxBarSize={40} />

                  </BarChart>
                </ResponsiveContainer>

              </div>
            </div>

          </div>


          {/* STATUS CHART */}
          <div className="bg-white rounded-xl shadow p-4 md:p-8">

            <h2 className="text-base md:text-lg font-semibold mb-4">
              Tickets by Status
            </h2>

            <div className="overflow-x-auto">
              <div className="min-w-[500px] h-64 md:h-[350px]">

                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChart} barCategoryGap={20}>

                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                    />

                    <YAxis tick={{ fontSize: 12 }} />

                    <Tooltip />

                    <Legend wrapperStyle={{ fontSize: "12px" }} />

                    <Bar dataKey="New" fill="#60a5fa" maxBarSize={40} />
                    <Bar dataKey="Solving" fill="#fbbf24" maxBarSize={40} />
                    <Bar dataKey="Solved" fill="#4ade80" maxBarSize={40} />
                    <Bar dataKey="Failed" fill="#f87171" maxBarSize={40} />
                    <Bar dataKey="Draft" fill="#9ca3af" maxBarSize={40} />

                  </BarChart>
                </ResponsiveContainer>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}