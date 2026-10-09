import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  CreditCard,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";

export default function AppointmentDetails() {
  const navigate = useNavigate();
  const [appointment] = useState({
    id: "APT-1001",
    status: "Confirmed",
    customer: "Rahul Sharma",
    phone: "+91 9876543210",
    email: "rahul@gmail.com",
    employee: "Priya",
    service: "Haircut + Beard Styling",
    date: "21 July 2026",
    time: "11:30 AM",
    duration: "45 mins",
    payment: "Paid",
    amount: "₹850",
    notes:
      "Customer prefers a medium fade. Apply premium hair serum after styling.",
  });

  return (
    <div className="space-y-6 p-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <button
            onClick={() => navigate("/appointments")}
            className="mb-3 text-sm text-slate-400 hover:text-white"
          >
            ← Back to Appointments
          </button>

          <h1 className="text-3xl font-bold text-white">
            Appointment Details
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Appointment ID : {appointment.id}
          </p>

        </div>


        <div className="flex gap-3">

          <button
            onClick={() => alert("Edit appointment mode")}
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 hover:border-indigo-500"
          >
            <Edit size={18} />
            Edit
          </button>


          <button
            onClick={() => {
              alert("Appointment cancelled");
              navigate("/appointments");
            }}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white hover:bg-red-500"
          >
            <Trash2 size={18} />
            Cancel
          </button>

        </div>

      </div>


      {/* Status Cards */}

      <div className="grid gap-5 md:grid-cols-4">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <Calendar className="text-indigo-400" />

          <p className="mt-3 text-sm text-slate-400">
            Date
          </p>

          <h3 className="mt-1 font-semibold text-white">
            {appointment.date}
          </h3>

        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <Clock className="text-indigo-400" />

          <p className="mt-3 text-sm text-slate-400">
            Time
          </p>

          <h3 className="mt-1 font-semibold text-white">
            {appointment.time}
          </h3>

        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <CheckCircle className="text-emerald-400" />

          <p className="mt-3 text-sm text-slate-400">
            Status
          </p>

          <h3 className="mt-1 font-semibold text-white">
            {appointment.status}
          </h3>

        </div>


        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <CreditCard className="text-indigo-400" />

          <p className="mt-3 text-sm text-slate-400">
            Payment
          </p>

          <h3 className="mt-1 font-semibold text-white">
            {appointment.payment}
          </h3>

        </div>


      </div>



      {/* Details */}

      <div className="grid gap-6 lg:grid-cols-2">


        {/* Customer */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-5 text-xl font-semibold text-white">
            Customer
          </h2>


          <div className="space-y-5">


            <div className="flex items-center gap-3 text-slate-300">
              <User className="text-indigo-400" />
              {appointment.customer}
            </div>


            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="text-indigo-400" />
              {appointment.phone}
            </div>


            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="text-indigo-400" />
              {appointment.email}
            </div>


          </div>

        </div>



        {/* Appointment */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <h2 className="mb-5 text-xl font-semibold text-white">
            Appointment
          </h2>


          <div className="space-y-4">


            <div className="flex justify-between">
              <span className="text-slate-400">
                Employee
              </span>

              <span className="text-white">
                {appointment.employee}
              </span>
            </div>



            <div className="flex justify-between">
              <span className="text-slate-400">
                Service
              </span>

              <span className="text-white">
                {appointment.service}
              </span>
            </div>



            <div className="flex justify-between">
              <span className="text-slate-400">
                Duration
              </span>

              <span className="text-white">
                {appointment.duration}
              </span>
            </div>



            <div className="flex justify-between">
              <span className="text-slate-400">
                Amount
              </span>

              <span className="text-white">
                {appointment.amount}
              </span>
            </div>


          </div>

        </div>


      </div>



      {/* Notes */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">


        <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">

          <FileText />

          Notes

        </h2>


        <p className="leading-7 text-slate-400">
          {appointment.notes}
        </p>


      </div>


    </div>
  );
}