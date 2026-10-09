import {
  ArrowLeft,
  Download,
  Edit,
  Printer,
  User,
  Mail,
  Phone,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function InvoiceDetails() {

  const invoice = {
    id: "INV-1001",
    customer: "Rahul Sharma",
    email: "rahul@gmail.com",
    phone: "+91 9876543210",
    date: "21 July 2026",
    payment: "UPI",
    status: "Paid",
    items: [
      {
        name: "Hair Spa",
        quantity: 1,
        price: "₹1500",
      },
      {
        name: "Beard Styling",
        quantity: 1,
        price: "₹950",
      },
    ],
    subtotal: "₹2450",
    tax: "₹0",
    total: "₹2450",
  };


  return (

    <div className="space-y-6 p-8">


      {/* Header */}

      <div className="flex items-center justify-between">


        <div>

          <Link
            to="/billing/invoices"
            className="mb-3 flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft size={16}/>
            Back to Invoices
          </Link>


          <h1 className="text-3xl font-bold text-white">
            Invoice Details
          </h1>


          <p className="mt-1 text-sm text-slate-400">
            Invoice ID : {invoice.id}
          </p>

        </div>



        <div className="flex gap-3">


          <button className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 hover:border-indigo-500">

            <Printer size={17}/>

            Print

          </button>



          <button className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 hover:border-indigo-500">

            <Download size={17}/>

            Download

          </button>



          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">

            <Edit size={17}/>

            Edit

          </button>


        </div>


      </div>




      {/* Customer + Payment */}


      <div className="grid gap-6 lg:grid-cols-2">


        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">


          <h2 className="mb-5 text-xl font-semibold text-white">
            Customer Details
          </h2>



          <div className="space-y-4 text-slate-300">


            <div className="flex items-center gap-3">

              <User className="text-indigo-400"/>

              {invoice.customer}

            </div>



            <div className="flex items-center gap-3">

              <Mail className="text-indigo-400"/>

              {invoice.email}

            </div>



            <div className="flex items-center gap-3">

              <Phone className="text-indigo-400"/>

              {invoice.phone}

            </div>


          </div>


        </div>




        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">


          <h2 className="mb-5 text-xl font-semibold text-white">
            Payment Details
          </h2>



          <div className="space-y-4">


            <div className="flex justify-between">

              <span className="text-slate-400">
                Payment Method
              </span>

              <span className="text-white">
                {invoice.payment}
              </span>

            </div>



            <div className="flex justify-between">

              <span className="text-slate-400">
                Status
              </span>

              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                {invoice.status}
              </span>

            </div>



            <div className="flex justify-between">

              <span className="text-slate-400">
                Date
              </span>

              <span className="text-white">
                {invoice.date}
              </span>

            </div>


          </div>


        </div>


      </div>





      {/* Items Table */}


      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">


        <table className="w-full">


          <thead className="border-b border-slate-800 bg-slate-800/40">


            <tr className="text-left text-sm text-slate-400">

              <th className="p-4">
                Item
              </th>

              <th>
                Quantity
              </th>

              <th>
                Price
              </th>

            </tr>


          </thead>



          <tbody>


            {invoice.items.map((item,index)=>(

              <tr
                key={index}
                className="border-b border-slate-800"
              >

                <td className="p-4 text-white">
                  {item.name}
                </td>


                <td>
                  {item.quantity}
                </td>


                <td className="text-white">
                  {item.price}
                </td>


              </tr>

            ))}


          </tbody>


        </table>


      </div>





      {/* Summary */}


      <div className="ml-auto max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6">


        <div className="space-y-3">


          <div className="flex justify-between">

            <span className="text-slate-400">
              Subtotal
            </span>

            <span className="text-white">
              {invoice.subtotal}
            </span>

          </div>



          <div className="flex justify-between">

            <span className="text-slate-400">
              Tax
            </span>

            <span className="text-white">
              {invoice.tax}
            </span>

          </div>



          <div className="border-t border-slate-700 pt-3 flex justify-between">

            <span className="font-semibold text-white">
              Total
            </span>

            <span className="font-bold text-indigo-400">
              {invoice.total}
            </span>

          </div>


        </div>


      </div>


    </div>

  );
}