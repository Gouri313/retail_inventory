// ---------- Seed data (Iranian Snack & Chips dataset) ----------
// [name, category, weight, cal/100g, cal/pack, price, cost, prodJalali, expJalali, expiryGregorian]
const RAW=[
["Ashi Mashi snacks","Snacks",60,513.3,308,200000,155255,"1403-12-02","1404-05-31","2025-08-22"],
["Chee pellet ketchup","Snacks",22,471,103.62,100000,77630,"1404-01-27","1404-06-27","2025-09-18"],
["Chee pellet vinegar","Snacks",22,471,103.62,100000,77630,"1404-01-27","1404-06-27","2025-09-18"],
["Cheetoz chili chips","Chips",65,536.7,348.855,250000,194100,"1403-10-27","1404-04-27","2025-07-18"],
["Cheetoz ketchup chips","Chips",65,536.7,348.855,300000,232900,"1404-01-18","1404-07-18","2025-10-10"],
["Cheetoz onion and parsley chips","Chips",65,536.7,348.855,300000,232900,"1404-01-22","1404-07-22","2025-10-14"],
["Cheetoz salty chips","Chips",65,536.7,348.855,250000,194100,"1403-12-02","1404-06-02","2025-08-24"],
["Cheetoz snack 30g","Snacks",30,483.3,144.99,100000,77630,"1404-02-19","1404-08-19","2025-11-10"],
["Cheetoz snack 90g","Snacks",90,483.3,434.97,250000,194100,"1404-02-08","1404-08-08","2025-10-30"],
["Cheetoz vinegar chips","Chips",65,536.7,348.855,300000,232900,"1404-02-06","1404-08-06","2025-10-28"],
["Cheetoz wheelsnack","Snacks",35,483.3,169.155,120000,93150,"1404-02-10","1404-08-10","2025-11-01"],
["Maz Maz ketchup chips","Chips",21,559.7,117.537,100000,77600,"1404-01-31","1404-07-30","2025-10-22"]
];
function seed(){
  const list=RAW.map(r=>({name:r[0],cat:r[1],w:r[2],c100:r[3],cpack:r[4],price:r[5],cost:r[6],prod:r[7],exp:r[8],expiry:r[9],stock:0,min:5,reorder:0,supplier:"Dataset",lead:7,daily:0}));
  list.push({name:"dove",cat:"hair care",w:null,c100:null,cpack:null,price:678,cost:0,prod:null,exp:null,expiry:"2039-12-31",stock:898,min:5,reorder:6,supplier:"dove",lead:7,daily:0});
  return list.sort((a,b)=>a.name.localeCompare(b.name));
}

// ---------- State ----------
let products=[],sales=[],page="overview",invFilter="all",query="";
try{products=JSON.parse(localStorage.getItem("ri_products"))||[];sales=JSON.parse(localStorage.getItem("ri_sales"))||[]}catch(e){}
if(!products.length)products=seed();
function save(){try{localStorage.setItem("ri_products",JSON.stringify(products));localStorage.setItem("ri_sales",JSON.stringify(sales))}catch(e){}}

// ---------- Helpers ----------
const $=id=>document.getElementById(id);
const n=v=>v==null||v===""?"—":Number(v).toLocaleString("en-IN");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const profit=p=>p.price-p.cost;
const ppw=p=>p.w?(p.price/p.w).toFixed(2):null;
const isLow=p=>p.stock<=p.min;
function daysLeft(p){if(!p.expiry)return Infinity;return Math.ceil((new Date(p.expiry)-new Date())/864e5)}
function status(p){if(isLow(p))return'<span class="badge low">Low stock</span>';if(daysLeft(p)>=0&&daysLeft(p)<=30)return'<span class="badge soon">Expiring</span>';return'<span class="badge ok">OK</span>'}
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2400)}
function table(head,rows){return'<div class="scroll"><table><thead><tr>'+head.map(h=>"<th>"+h+"</th>").join("")+"</tr></thead><tbody>"+rows.join("")+"</tbody></table></div>"}
function kpi(l,v,note){return'<div class="kpi"><div class="l">'+l+'</div><div class="v">'+v+'</div><div class="n">'+note+"</div></div>"}

// ---------- Pages ----------
const PAGES={
overview:{t:"Overview",s:"Inventory, sales and product health at a glance",r(){
  const units=products.reduce((a,p)=>a+p.stock,0),val=products.reduce((a,p)=>a+p.stock*p.price,0);
  const low=products.filter(isLow),exp=products.filter(p=>daysLeft(p)>=0&&daysLeft(p)<=30);
  const recs=products.filter(p=>p.stock>0&&p.stock<=p.reorder);
  const rows=low.concat(exp.filter(p=>!isLow(p))).map(p=>"<tr><td>"+esc(p.name)+"</td><td>"+p.stock+"</td><td>"+p.expiry+"</td><td>"+n(p.price)+"</td><td>"+status(p)+"</td></tr>");
  return'<div class="kpis">'+kpi("Total products",products.length,"Product master records")+kpi("Units in stock",n(units),"Current inventory")+kpi("Inventory value",n(val),"At selling price")+kpi("Low stock",low.length,"Below minimum level")+kpi("Expiring ≤ 30 days",exp.length,"Requires attention")+'</div>'+
  '<div class="grid2"><div class="card"><div class="hd"><div><h2>Action required</h2><p class="sub">Products that need stock or expiry attention.</p></div></div>'+
  (rows.length?table(["Product","Stock","Expiry","Price","Status"],rows):'<p class="empty">Nothing needs attention right now.</p>')+'</div>'+
  '<div class="card"><h2>Reorder recommendations</h2><p class="sub">Based on demand, lead time and safety stock.</p><div style="margin-top:14px">'+
  (recs.length?recs.map(p=>'<p style="margin:0 0 10px"><b>'+esc(p.name)+"</b><br><span class='sub'>Stock "+p.stock+" · reorder point "+p.reorder+"</span></p>").join(""):'<p class="empty">No records found.</p>')+"</div></div></div>"}},
products:{t:"Products",s:"Master data from the snack dataset",r(){
  const list=products.filter(p=>(p.name+" "+p.cat).toLowerCase().includes(query.toLowerCase()));
  const rows=list.map(p=>"<tr><td>"+esc(p.name)+"</td><td>"+esc(p.cat)+"</td><td>"+(p.w?p.w+" g":"—")+"</td><td>"+n(p.c100)+"</td><td>"+n(p.cpack)+"</td><td>"+n(p.price)+"</td><td>"+n(p.cost)+"</td><td>"+n(profit(p))+"</td><td>"+(ppw(p)||"—")+"</td><td>"+(p.prod||"—")+"</td><td>"+(p.exp||"—")+"</td></tr>");
  return'<div class="card"><div class="hd"><div><h2>Product Database</h2><p class="sub">Master data from the Iranian Snack &amp; Chips dataset plus live inventory fields.</p></div><input class="inline" id="q" placeholder="Search product or category" value="'+esc(query)+'"></div>'+
  table(["Product","Category","Weight","Cal/100g","Cal/pack","Price","Cost","Profit","Price/weight","Production (Jalali)","Expiry (Jalali)"],rows)+"</div>"}},
inventory:{t:"Inventory",s:"Current stock, reorder points and expiry",r(){
  const list=products.filter(p=>invFilter==="all"||(invFilter==="low"?isLow(p):!isLow(p)));
  const rows=list.map(p=>"<tr><td>"+esc(p.name)+"</td><td>"+p.stock+"</td><td>"+p.min+"</td><td>"+Number(p.reorder).toFixed(1)+"</td><td>"+(p.expiry||"—")+"</td><td>"+esc(p.supplier)+"</td><td>"+status(p)+"</td></tr>");
  return'<div class="card"><div class="hd"><div><h2>Inventory Control</h2><p class="sub">Use this page for day-to-day stock decisions.</p></div><select class="inline" id="flt"><option value="all">All products</option><option value="low">Low stock</option><option value="ok">In stock</option></select></div>'+
  table(["Product","Current","Minimum","Reorder point","Expiry","Supplier","Action"],rows)+"</div>"}},
sales:{t:"Sales",s:"Record transactions and update stock",r(){
  const opts=products.map((p,i)=>'<option value="'+i+'">'+esc(p.name)+" — "+p.stock+" in stock</option>").join("");
  const rows=sales.slice().reverse().slice(0,15).map(s=>"<tr><td>"+esc(s.name)+"</td><td>"+s.qty+"</td><td>"+n(s.amount)+"</td><td>"+s.date+"</td></tr>");
  return'<div class="grid2" style="grid-template-columns:1.3fr 1fr"><div class="card"><h2>Record sale</h2><p class="sub">Stock is reduced automatically after a successful sale.</p>'+
  '<label>Product</label><select id="s_p">'+opts+'</select><label>Quantity</label><input id="s_q" type="number" min="1" value="1"><div style="margin-top:18px"><button class="btn dark full" id="s_go">Record sale</button></div></div>'+
  '<div class="card"><h2>Recent sales</h2><p class="sub">Latest recorded transactions.</p><div style="margin-top:12px">'+(rows.length?table(["Product","Qty","Amount","Date"],rows):'<p class="empty">No sales yet. Record your first sale.</p>')+"</div></div></div>"}},
dataset:{t:"Dataset",s:"Source data, fields and product economics",r(){
  const w=products.filter(p=>p.w),c=products.filter(p=>p.c100),pr=products.map(p=>p.price);
  const avgW=w.length?(w.reduce((a,p)=>a+p.w,0)/w.length).toFixed(1):0,avgC=c.length?Math.round(c.reduce((a,p)=>a+p.c100,0)/c.length):0;
  const F=[["Product_Name","Product identifier / class"],["Weight(gram)","Pack weight"],["Total_Calories(100g)","Calories per 100g"],["Price(Rial)","Selling price"],["Prod_Cost(Rial)","Production cost"],["Prod_Date / Exp_Date","Production and expiry dates"],["Profit(Rial)","Price minus production cost"],["Price_per_Weight","Price relative to pack weight"]];
  const rows=products.map(p=>"<tr><td>"+esc(p.name)+"</td><td>"+n(p.price)+"</td><td>"+n(p.cost)+"</td><td>"+n(profit(p))+"</td><td>"+(ppw(p)||"—")+"</td></tr>");
  return'<div class="eyebrow">Source data</div><h2 style="font-size:24px;margin:4px 0">Iranian Snack &amp; Chips Dataset</h2><p class="sub" style="margin-bottom:18px">Product classes used in the YOLO/EDA notebook. The actual Products_info values are preloaded into the product master.</p>'+
  '<div class="kpis">'+kpi("Records loaded",products.length,"Product records")+kpi("Average weight",avgW+" g","Per pack")+kpi("Average calories",avgC,"Per 100g")+kpi("Price range",n(Math.min(...pr))+" – "+n(Math.max(...pr)),"Rial")+'</div>'+
  '<div class="grid2" style="grid-template-columns:1fr 1.2fr"><div class="card"><h2>Dataset fields used</h2><p class="sub">Useful attributes from the notebook\'s product information.</p><div class="fields" style="margin-top:8px">'+F.map(f=>"<div><b>"+f[0]+"</b><span>"+f[1]+"</span></div>").join("")+'</div></div>'+
  '<div class="card"><h2>Product economics</h2><p class="sub">Profit and price-to-weight values from the dataset.</p><div style="margin-top:10px">'+table(["Product","Price","Cost","Profit","Price/weight"],rows)+"</div></div></div>"}}
};

// ---------- Render ----------
function render(){
  const P=PAGES[page];$("title").textContent=P.t;$("sub").textContent=P.s;$("view").innerHTML=P.r();
  $("nav").innerHTML=Object.keys(PAGES).map(k=>'<button data-p="'+k+'" class="'+(k===page?"on":"")+'">'+PAGES[k].t+"</button>").join("");
  if($("q")){$("q").oninput=e=>{query=e.target.value;const pos=e.target.selectionStart;render();const q=$("q");q.focus();q.setSelectionRange(pos,pos)}}
  if($("flt")){$("flt").value=invFilter;$("flt").onchange=e=>{invFilter=e.target.value;render()}}
  if($("s_go"))$("s_go").onclick=recordSale;
}
function recordSale(){
  const p=products[+$("s_p").value],q=parseInt($("s_q").value,10);
  if(!p||!(q>0))return toast("Enter a quantity of 1 or more.");
  if(q>p.stock)return toast(p.name+" has only "+p.stock+" in stock.");
  p.stock-=q;sales.push({name:p.name,qty:q,amount:q*p.price,date:new Date().toLocaleString()});
  save();const idx=$("s_p").value;render();$("s_p").value=idx;toast("Sale recorded for "+p.name+".");
}
$("nav").onclick=e=>{const b=e.target.closest("button");if(b){page=b.dataset.p;render()}};

// ---------- Add product ----------
$("add").onclick=()=>$("dlg").showModal();
$("f_cancel").onclick=()=>$("dlg").close();
$("f_save").onclick=()=>{
  const name=$("f_name").value.trim();if(!name)return toast("Enter a product name.");
  const price=+$("f_price").value||0,cost=+$("f_cost").value||0,w=+$("f_w").value||null;
  products.push({name,cat:$("f_cat").value||"General",w,c100:null,cpack:null,price,cost,prod:null,exp:null,expiry:$("f_exp").value||"",stock:+$("f_stock").value||0,min:5,reorder:0,supplier:"Manual",lead:7,daily:0});
  products.sort((a,b)=>a.name.localeCompare(b.name));save();$("dlg").close();
  ["f_name","f_price","f_cost","f_w","f_exp"].forEach(i=>$(i).value="");render();toast(name+" added.");
};

// ---------- Import CSV ----------
$("imp").onclick=()=>$("csv").click();
$("csv").onchange=e=>{
  const f=e.target.files[0];if(!f)return;const r=new FileReader();
  r.onload=()=>{
    const lines=r.result.split(/\r?\n/).filter(Boolean);if(lines.length<2)return toast("The CSV has no data rows.");
    const H=lines[0].split(",").map(h=>h.trim().toLowerCase());
    const col=(...k)=>H.findIndex(h=>k.some(x=>h.includes(x)));
    const c={name:col("product_name","name"),w:col("weight(gram)","weight"),c100:col("calories(100g)","cal"),price:col("price(rial)"),cost:col("prod_cost","cost"),pd:col("prod_date"),ed:col("exp_date")};
    if(c.name<0||c.price<0)return toast("CSV needs Product_Name and Price(Rial) columns.");
    let added=0;
    lines.slice(1).forEach(l=>{
      const v=l.split(",").map(x=>x.trim());const name=v[c.name];if(!name||products.some(p=>p.name.toLowerCase()===name.toLowerCase()))return;
      const w=c.w>=0?+v[c.w]||null:null,c100=c.c100>=0?+v[c.c100]||null:null;
      products.push({name,cat:"Snacks",w,c100,cpack:w&&c100?+(w*c100/100).toFixed(3):null,price:+v[c.price]||0,cost:c.cost>=0?+v[c.cost]||0:0,prod:c.pd>=0?v[c.pd]:null,exp:c.ed>=0?v[c.ed]:null,expiry:"",stock:0,min:5,reorder:0,supplier:"Dataset",lead:7,daily:0});added++;
    });
    products.sort((a,b)=>a.name.localeCompare(b.name));save();render();toast(added+" products imported.");
  };
  r.readAsText(f);e.target.value="";
};

render();
