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
    <div className="h-screen overflow-hidden">
    <div className="flex bg-gray-200 min-h-screen">

      <AdminNavbar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex-1 p-4 md:p-10 min-w-0 overflow-hidden">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">

          <h1 className="text-xl md:text-2xl font-semibold">
            Dashboard Overview
          </h1>

          <select
            className="border border-gray-300 rounded-lg px-3 py-1.5 md:py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-auto"
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10">

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-gray-500 text-xs md:text-sm font-medium">Total Tickets Created</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-gray-800">{stats.totalTickets}</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-gray-500 text-xs md:text-sm font-medium">Avg. Resolution Time</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-blue-600">{stats.avgResolution}</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-gray-500 text-xs md:text-sm font-medium">Active Tickets</p>
            <h2 className="text-2xl md:text-3xl font-bold mt-1 md:mt-2 text-orange-500">{stats.activeTickets}</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col items-center md:items-start text-center md:text-left">
            <p className="text-gray-500 text-xs md:text-sm font-medium">Top Category</p>
            <h2 className="text-xl md:text-2xl font-bold mt-1 md:mt-2 text-purple-600 truncate w-full">{stats.topCategory}</h2>
          </div>

        </div>


        {/* CHARTS */}
        <div className="h-[calc(100vh-280px)] overflow-y-auto pb-20 pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

            {/* CATEGORY CHART */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 flex flex-col">

              <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-5 text-gray-800">
                Tickets by Category
              </h2>

              <div className="w-full flex-1 min-h-[300px] md:min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={categoryChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                    <Legend wrapperStyle={{paddingTop: '10px'}} />

                    <Bar dataKey="Access" fill="#7c6ee6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Feature" fill="#f87171" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Hardware" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Network" fill="#fbbf24" radius={[4, 4, 0, 0]} />

                  </BarChart>

                </ResponsiveContainer>
              </div>

            </div>



            {/* STATUS CHART */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8 flex flex-col">

              <h2 className="text-base md:text-lg font-semibold mb-4 md:mb-5 text-gray-800">
                Tickets by Status
              </h2>

              <div className="w-full flex-1 min-h-[300px] md:min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">

                  <BarChart data={statusChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>

                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                    <Legend wrapperStyle={{paddingTop: '10px'}} />

                    <Bar dataKey="New" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Solving" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Solved" fill="#4ade80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Failed" fill="#f87171" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Draft" fill="#9ca3af" radius={[4, 4, 0, 0]} />

                  </BarChart>

                </ResponsiveContainer>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  </div>
  );
}