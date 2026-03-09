import React, { useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import api from "../../api/axios";


export default function Tickets() {
  return (
    <div className="min-h-screen flex bg-gray-200">
      <AdminNavbar />
    </div>
  );
}