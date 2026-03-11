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
  ResponsiveContainer
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

  const [categoryKeys, setCategoryKeys] = useState([]);
  const [statusKeys, setStatusKeys] = useState([]);

  // Map scope _id → name for legend labels
  const [scopeNameMap, setScopeNameMap] = useState({});

  const categoryColors = [
    "#7c6ee6", "#f87171", "#60a5fa", "#fbbf24",
    "#4ade80", "#fb923c", "#22c55e", "#e879f9"
  ];

  const statusColors = {
    New: "#60a5fa",
    Solving: "#fbbf24",
    Solved: "#4ade80",
    Failed: "#f87171",
    Draft: "#9ca3af"
  };

  useEffect(() => {

    const fetchDashboardAndScopes = async () => {
      try {

        // Fetch dashboard data
        const res = await api.get(`/admin/dashboard?period=${period}`);
        const data = res.data;

        // Fetch scopes
        const scopesRes = await api.get("/scopes");
        const scopesData = scopesRes.data || [];

        // Build a map from scope _id → scope name for legend labels
        const nameMap = {};
        scopesData.forEach((scope) => {
          nameMap[String(scope._id)] = scope.name;
        });
        setScopeNameMap(nameMap);

        /* ---------- STATS ---------- */
        setStats({
          totalTickets: data.ticketsCreated || 0,
          avgResolution: data.avgResolutionTime || "0h",
          activeTickets: data.activeTickets || 0,
          topCategory: data.topCategory?.name || "-"
        });

        /* ---------- CATEGORY CHART ---------- */
        const categoryRow = { name: "Category" };
        const keys = [];

        // 1. Pre-fill all scopes so they appear even if count is 0
        scopesData.forEach((scope) => {
          if (scope.name) {
            categoryRow[scope.name] = 0;
            if (!keys.includes(scope.name)) keys.push(scope.name);
          }
        });

        // 2. Populate actual counts
        (data.ticketsByCategory || []).forEach((item) => {
          let catName = String(item._id || "Unknown");

          if (nameMap[catName]) {
            catName = nameMap[catName];
          } else if (item._id && typeof item._id === "object" && item._id.name) {
            catName = item._id.name;
          }

          const matchedKey = keys.find(k => k.toLowerCase() === catName.toLowerCase());

          if (matchedKey) {
            categoryRow[matchedKey] = (categoryRow[matchedKey] || 0) + (Number(item.count) || 0);
          } else {
            categoryRow[catName] = Number(item.count) || 0;
            keys.push(catName);
          }
        });

        setCategoryChart([categoryRow]);
        setCategoryKeys(keys);

        /* ---------- STATUS CHART ---------- */
        const statusRow = { name: "Status" };
        const sKeys = [];
        (data.ticketsByStatus || []).forEach((item) => {
          statusRow[item._id] = item.count;
          sKeys.push(item._id);
        });
        setStatusChart([statusRow]);
        setStatusKeys(sKeys);

      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchDashboardAndScopes();

  }, [period]);


  return (
    <div className="h-screen overflow-hidden">
      <div className="flex bg-gray-200 min-h-screen">
        <AdminNavbar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex-1 p-4 md:p-10 min-w-0 overflow-hidden">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <h1 className="text-xl md:text-2xl font-semibold">Dashboard Overview</h1>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 3 Months</option>
            </select>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-gray-500 text-sm">Total Tickets Created</p>
              <h2 className="text-3xl font-bold text-gray-800 mt-2">{stats.totalTickets}</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-gray-500 text-sm">Avg. Resolution Time</p>
              <h2 className="text-3xl font-bold text-blue-600 mt-2">{stats.avgResolution}</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-gray-500 text-sm">Active Tickets</p>
              <h2 className="text-3xl font-bold text-orange-500 mt-2">{stats.activeTickets}</h2>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-gray-500 text-sm">Top Category</p>
              <h2 className="text-2xl font-bold text-purple-600 mt-2">{stats.topCategory}</h2>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* CATEGORY CHART */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-semibold mb-5 text-gray-800">Tickets by Category</h2>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value, name) => [value, scopeNameMap[name] || name]}
                    />
                    <Legend
                      formatter={(value) => scopeNameMap[value] || value}
                    />
                    {categoryKeys.map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        name={key}
                        fill={categoryColors[index % categoryColors.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* STATUS CHART */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-lg font-semibold mb-5 text-gray-800">Tickets by Status</h2>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {statusKeys.map((key) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={statusColors[key] || "#8884d8"}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
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