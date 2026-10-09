import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CreditCard,
  Check,
  Zap,
  Calendar,
} from "lucide-react";



const plans=[

{
name:"Starter",
price:"₹999/month",
features:[
"Customer CRM",
"Appointments",
"Basic Reports",
]
},


{
name:"Professional",
price:"₹2499/month",
features:[
"Everything in Starter",
"AI Analyst",
"Employee Management",
"Advanced Reports",
]
},


{
name:"Enterprise",
price:"₹4999/month",
features:[
"Everything in Professional",
"Custom Integrations",
"Priority Support",
]
},


];





const history=[

{
date:"01 July 2026",
amount:"₹2499",
status:"Paid",
},


{
date:"01 June 2026",
amount:"₹2499",
status:"Paid",
},


];






export default function Subscription(){



const [plan,setPlan]=useState("Professional");

const [message,setMessage]=useState("");




const upgrade=(selected)=>{


setPlan(selected);


setMessage(

`${selected} plan selected`

);


setTimeout(()=>{

setMessage("");

},2000);


};





return(

<div className="space-y-6">



{/* Header */}


<div>


<Link

to="/settings"

className="mb-3 block text-sm text-slate-400 hover:text-white"

>

← Back to Settings

</Link>



<h1 className="text-3xl font-bold text-white">

Subscription

</h1>


<p className="mt-1 text-slate-400">

Manage your Business OS plan and billing.

</p>


</div>









{/* Current Plan */}



<div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6">


<div className="flex items-center gap-3">


<div className="rounded-xl bg-indigo-600 p-3 text-white">

<Zap size={22}/>

</div>



<div>


<p className="text-sm text-slate-300">

Current Plan

</p>


<h2 className="text-2xl font-bold text-white">

{plan}

</h2>


</div>


</div>



</div>









{/* Plans */}



<div>


<h2 className="mb-5 text-xl font-semibold text-white">

Available Plans

</h2>



<div className="grid gap-5 md:grid-cols-3">


{

plans.map((item)=>(


<div

key={item.name}

className={`rounded-2xl border p-6 ${
plan===item.name

?

"border-indigo-500 bg-indigo-500/10"

:

"border-slate-800 bg-slate-900"

}`}

>


<h3 className="text-xl font-semibold text-white">

{item.name}

</h3>



<p className="mt-2 text-2xl font-bold text-white">

{item.price}

</p>





<div className="mt-5 space-y-3">


{

item.features.map((feature)=>(


<div

key={feature}

className="flex items-center gap-2 text-sm text-slate-300"

>


<Check

size={16}

className="text-emerald-400"

/>


{feature}


</div>


))


}



</div>







<button

onClick={()=>upgrade(item.name)}

className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-white hover:bg-indigo-500"

>


{

plan===item.name

?

"Current Plan"

:

"Upgrade"

}


</button>



</div>


))


}



</div>


</div>









{/* Usage */}



<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">


<h2 className="mb-5 text-xl font-semibold text-white">

Monthly Usage

</h2>




<div className="grid gap-4 md:grid-cols-3">


<div className="rounded-xl bg-slate-800 p-4">

<p className="text-sm text-slate-400">

Customers

</p>


<p className="mt-2 text-xl font-bold text-white">

856 / 5000

</p>


</div>




<div className="rounded-xl bg-slate-800 p-4">

<p className="text-sm text-slate-400">

Employees

</p>


<p className="mt-2 text-xl font-bold text-white">

24 / 100

</p>


</div>




<div className="rounded-xl bg-slate-800 p-4">

<p className="text-sm text-slate-400">

AI Queries

</p>


<p className="mt-2 text-xl font-bold text-white">

1560

</p>


</div>


</div>


</div>









{/* Billing History */}



<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">


<div className="flex items-center gap-3 mb-5">


<CreditCard className="text-indigo-400"/>


<h2 className="text-xl font-semibold text-white">

Billing History

</h2>


</div>





<div className="space-y-3">


{

history.map((item)=>(


<div

key={item.date}

className="flex items-center justify-between rounded-xl bg-slate-800 p-4"

>


<div className="flex items-center gap-3">


<Calendar

size={18}

className="text-slate-400"

/>


<p className="text-white">

{item.date}

</p>


</div>




<div className="text-right">


<p className="text-white">

{item.amount}

</p>


<p className="text-sm text-emerald-400">

{item.status}

</p>


</div>


</div>


))


}



</div>


</div>









{

message &&

<p className="text-sm text-emerald-400">

{message}

</p>


}



</div>


);


}