import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Brain,
  Bell,
  TrendingUp,
  Save,
} from "lucide-react";


export default function AISettings(){


const [settings,setSettings]=useState({

enabled:true,
frequency:"Daily",
recommendations:true,
alerts:true,

});


const [saved,setSaved]=useState(false);



const toggle=(key)=>{

setSettings({

...settings,

[key]:!settings[key]

});

};



const handleChange=(e)=>{

setSettings({

...settings,

[e.target.name]:e.target.value

});

};





const saveSettings=()=>{

setSaved(true);


setTimeout(()=>{

setSaved(false);

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

AI Settings

</h1>



<p className="mt-1 text-slate-400">

Configure your AI Business Analyst preferences.

</p>


</div>









{/* Main AI */}



<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">


<div className="flex items-center gap-3">


<div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">

<Brain size={22}/>

</div>



<div>

<h2 className="text-xl font-semibold text-white">

AI Assistant

</h2>


<p className="text-sm text-slate-400">

Control AI availability for your workspace.

</p>


</div>


</div>







<div className="mt-6 flex items-center justify-between rounded-xl bg-slate-800 p-4">


<div>

<p className="font-medium text-white">

Enable AI Assistant

</p>


<p className="text-sm text-slate-400">

Allow AI to analyze business data.

</p>


</div>




<button

onClick={()=>toggle("enabled")}

className={`rounded-full px-5 py-2 text-sm ${
settings.enabled

?

"bg-emerald-500 text-white"

:

"bg-slate-700 text-slate-300"

}`}

>

{

settings.enabled

?

"Enabled"

:

"Disabled"

}

</button>



</div>



</div>









{/* Insights */}



<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">


<div className="flex items-center gap-3 mb-5">


<div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">

<TrendingUp size={22}/>

</div>


<h2 className="text-xl font-semibold text-white">

AI Insights Frequency

</h2>


</div>




<select

name="frequency"

value={settings.frequency}

onChange={handleChange}

className="w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-white md:w-96"

>


<option>

Daily

</option>


<option>

Weekly

</option>


<option>

Monthly

</option>


</select>



</div>









{/* Automation Settings */}



<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">



<h2 className="mb-5 text-xl font-semibold text-white">

Automation Preferences

</h2>






<div className="space-y-4">



<div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">


<div>

<p className="text-white font-medium">

AI Recommendations

</p>


<p className="text-sm text-slate-400">

Generate improvement suggestions automatically.

</p>


</div>




<button

onClick={()=>toggle("recommendations")}

className={`rounded-full px-4 py-2 text-sm ${
settings.recommendations

?

"bg-indigo-600 text-white"

:

"bg-slate-700 text-slate-300"

}`}

>

{

settings.recommendations

?

"ON"

:

"OFF"

}

</button>



</div>








<div className="flex items-center justify-between rounded-xl bg-slate-800 p-4">


<div className="flex gap-3">


<div className="text-amber-400">

<Bell/>

</div>



<div>


<p className="text-white font-medium">

AI Alerts

</p>


<p className="text-sm text-slate-400">

Receive important business alerts.

</p>


</div>


</div>





<button

onClick={()=>toggle("alerts")}

className={`rounded-full px-4 py-2 text-sm ${
settings.alerts

?

"bg-indigo-600 text-white"

:

"bg-slate-700 text-slate-300"

}`}

>

{

settings.alerts

?

"ON"

:

"OFF"

}

</button>



</div>





</div>



</div>









{/* Save */}



<button

onClick={saveSettings}

className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-500"

>


<Save size={18}/>

Save AI Settings

</button>



{

saved &&

<p className="text-sm text-emerald-400">

AI preferences updated successfully

</p>

}





</div>

);


}