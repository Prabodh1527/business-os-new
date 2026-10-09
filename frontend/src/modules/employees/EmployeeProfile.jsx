import { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  IndianRupee,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";


export default function EmployeeProfile() {


  const [editing,setEditing] = useState(false);


  const [employee,setEmployee] = useState({

    name:"Rahul Kumar",
    role:"Manager",
    phone:"+91 9876543210",
    email:"rahul@gmail.com",
    salary:"₹55,000",
    department:"Operations",
    status:"Active",

  });



  const handleChange=(e)=>{

    setEmployee({
      ...employee,
      [e.target.name]:e.target.value
    });

  };



  const deleteEmployee=()=>{

    alert(
      `${employee.name} deleted successfully`
    );

  };



  return (

    <div className="space-y-6">


      {/* Header */}

      <div className="flex items-center justify-between">


        <div>

          <Link
            to="/employees"
            className="mb-3 block text-sm text-slate-400 hover:text-white"
          >
            ← Back to Employees
          </Link>


          <h1 className="text-3xl font-bold text-white">
            Employee Profile
          </h1>


          <p className="mt-1 text-slate-400">
            View and manage employee information.
          </p>


        </div>




        <div className="flex gap-3">


          {!editing ? (

            <button
              onClick={()=>setEditing(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white"
            >

              <Edit size={17}/>

              Edit

            </button>

          ):(

            <button
              onClick={()=>{

                setEditing(false);
                alert("Employee details saved");

              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white"
            >

              <Save size={17}/>

              Save

            </button>

          )}



          <button
            onClick={deleteEmployee}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-white"
          >

            <Trash2 size={17}/>

            Delete

          </button>


        </div>


      </div>






      {/* Profile Card */}


      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">


        <div className="grid gap-6 md:grid-cols-2">



          <div>

            <label className="text-sm text-slate-400">
              Name
            </label>


            <input
              name="name"
              value={employee.name}
              disabled={!editing}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white disabled:opacity-70"
            />

          </div>





          <div>

            <label className="text-sm text-slate-400">
              Role
            </label>


            <input
              name="role"
              value={employee.role}
              disabled={!editing}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white disabled:opacity-70"
            />

          </div>






          <div>

            <label className="text-sm text-slate-400">
              Phone
            </label>


            <input
              name="phone"
              value={employee.phone}
              disabled={!editing}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white disabled:opacity-70"
            />

          </div>





          <div>

            <label className="text-sm text-slate-400">
              Email
            </label>


            <input
              name="email"
              value={employee.email}
              disabled={!editing}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white disabled:opacity-70"
            />

          </div>






          <div>

            <label className="text-sm text-slate-400">
              Salary
            </label>


            <input
              name="salary"
              value={employee.salary}
              disabled={!editing}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white disabled:opacity-70"
            />

          </div>






          <div>

            <label className="text-sm text-slate-400">
              Department
            </label>


            <input
              name="department"
              value={employee.department}
              disabled={!editing}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white disabled:opacity-70"
            />

          </div>




        </div>


      </div>







      {/* Summary Cards */}


      <div className="grid gap-4 md:grid-cols-3">


        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <User className="text-indigo-400"/>

          <p className="mt-3 text-sm text-slate-400">
            Status
          </p>

          <h2 className="text-xl text-white">
            {employee.status}
          </h2>

        </div>




        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <Briefcase className="text-indigo-400"/>

          <p className="mt-3 text-sm text-slate-400">
            Department
          </p>

          <h2 className="text-xl text-white">
            {employee.department}
          </h2>

        </div>




        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <IndianRupee className="text-emerald-400"/>

          <p className="mt-3 text-sm text-slate-400">
            Monthly Salary
          </p>

          <h2 className="text-xl text-white">
            {employee.salary}
          </h2>

        </div>


      </div>


    </div>

  );

}