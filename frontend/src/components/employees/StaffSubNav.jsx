import { NavLink } from "react-router-dom";
import { Users, Clock3, FileText, BadgeCheck, ListTodo } from "lucide-react";

export default function StaffSubNav() {
  const tabs = [
    { label: "All Staff", path: "/employees", icon: Users },
    { label: "Attendance", path: "/employees/attendance", icon: Clock3 },
    { label: "Leave Requests", path: "/employees/leaves", icon: FileText },
    { label: "Payroll", path: "/employees/payroll", icon: BadgeCheck },
    { label: "Task Assignments", path: "/employees/tasks", icon: ListTodo },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === "/employees"}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
              }`
            }
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
