import {useEffect,useRef,useState} from "react";
import {ArrowDown,ArrowUpRight,Menu,X} from "lucide-react";
import {projects,stack} from "./data";

function Reveal({children}:{children:React.ReactNode}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{const e=ref.current;if(!e)return;const o=new IntersectionObserver(([x])=>{if(x.isIntersecting){e.dataset.show="1";o.disconnect()}},{threshold:.12});o.observe(e);return()=>o.disconnect()},[]);return <div ref={ref} className="reveal">{children}</div>}

function Visual({kind}:{kind:string}){return <div className={"visual "+kind}>
  {kind==="os"&&<><div className="visual-head">GETMAX / OS <b>LIVE</b></div><div className="dashboard"><aside>{[1,2,3,4].map(i=><i key={i}/>)}</aside><section><small>REVENUE COMMAND</small><strong>94.6%</strong><span>clean claim readiness</span><div className="bars">{[40,62,48,78,58,88,70,96,80,90].map((x,i)=><i key={i} style={{height:x+"%"}}/>)}</div></section></div></>}
  {kind==="radar"&&<><div className="radar"><i/><i/><i/></div><div className="signal"><small>RISK SIGNAL</small><strong>08.4</strong><span>PATTERN IDENTIFIED</span></div></>}
  {kind==="agent"&&<><div className="node center">AI</div><div className="node n1">01</div><div className="node n2">02</div><div className="node n3">03</div><div className="log">VALIDATE<br/>REASON<br/>ROUTE<br/><b>HUMAN REVIEW / READY</b></div></>}
  {kind==="flow"&&<><div className="flow">INTAKE <i/> VERIFY <i/> RESOLVE <i/> LEARN</div><div className="card c1"><small>QUEUE A</small><b>128</b><span>priority actions</span></div><div className="card c2"><small>EFFICIENCY</small><b>+32%</b><span>this cycle</span></div></>}
</div>}

export function Portfolio(){
 const [open,setOpen]=useState(false);
 return <main id="top">
 <header><a className="logo" href="#top">SR<span>—</span>26</a><div className="status"><i/> FOUNDER & CEO / GETMAX</div><nav>{["Work","About","Experience","Stack"].map(x=><a href={"#"+x.toLowerCase()} key={x}>{x}</a>)}<a className="talk" href="#contact">LET'S TALK <ArrowUpRight/></a></nav><button className="menu" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button>{open&&<div className="mobile">{["Work","About","Experience","Stack","Contact"].map(x=><a onClick={()=>setOpen(false)} href={"#"+x.toLowerCase()} key={x}>{x}</a>)}</div>}</header>

<section className="hero"><div className="grid"/><div className="orbit"/><div className="meta"><span>(01) FOUNDER PORTFOLIO</span><span>CHENNAI / INDIA</span></div><div className="heroText"><p>HEALTHCARE <b>MEETS</b> INTELLIGENT SYSTEMS.</p><h1>Sriram<br/><em>Raghavan.</em></h1><div className="heroFoot"><span>Founder & CEO at <b>GetMax Healthcare Solutions</b>. Building the intelligence layer for modern revenue cycle operations.</span><a href="#work">EXPLORE THE WORK <ArrowDown/></a></div></div><div className="ghost">01</div></section>

<section className="about" id="about"><Reveal><label>02 / PERSPECTIVE</label><h2>Healthcare doesn't need more software. It needs <em>clarity.</em></h2><div className="twocol"><p>I build products at the intersection of healthcare revenue, artificial intelligence and operational design.</p><p>The goal is simple: remove friction from the work, surface better decisions, and give teams more time for what matters.</p></div></Reveal></section>

<section className="work" id="work"><div className="heading"><label>03 / SELECTED SYSTEMS</label><h2>Work that moves<br/>revenue forward.</h2><p>Four connected bets on the future of healthcare operations.</p></div>{projects.map((p,i)=><Reveal key={p.name}><article className={"project "+p.color}><div className="projectHead"><small>/{String(i+1).padStart(2,"0")}</small><div><label>{p.category}</label><h3>{p.name}</h3></div><small>{p.year}</small></div><div className="projectGrid"><Visual kind={p.kind}/><div className="copy"><p>{p.summary}</p><strong>{p.metric}</strong><small>{p.metricLabel}</small><ul>{p.capabilities.map(x=><li key={x}>+ {x}</li>)}</ul><span>{p.outcome}</span></div></div></article></Reveal>)}</section>

<section className="experience" id="experience"><Reveal><label>04 / EXPERIENCE</label><div className="expGrid"><h2>Building at the edge of healthcare and AI.</h2><div>{[["NOW","Founder & CEO","GetMax Healthcare Solutions"],["NEXT","Agentic operations","The new operating model"],["ALWAYS","Systems thinking","From complexity to clarity"]].map(x=><div className="timeline" key={x[0]}><small>{x[0]}</small><section><h3>{x[1]}</h3><p>{x[2]}</p><span>PRODUCT · STRATEGY · OPERATIONS</span></section></div>)}</div></div></Reveal></section>

<section className="stack" id="stack"><div className="marquee">AI AUTOMATION — RCM INTELLIGENCE — AGENTIC SYSTEMS — WORKFLOW DESIGN — AI AUTOMATION — RCM INTELLIGENCE — AGENTIC SYSTEMS — WORKFLOW DESIGN —</div><Reveal><label>05 / OPERATING STACK</label><div className="stackHead"><h2>Built across<br/>the full system.</h2><p>Strategy through execution. Intelligence through operations.</p></div><div className="stackGrid">{stack.map((x,i)=><div key={x[0]}><small>0{i+1}</small><h3>{x[0]}</h3><ul>{x[1].map(y=><li key={y}>{y}</li>)}</ul></div>)}</div></Reveal></section>

<section className="contact" id="contact"><Reveal><label>06 / OPEN CHANNEL</label><p className="kicker">HAVE AN AMBITIOUS HEALTHCARE PROBLEM?</p><h2>Let's make the<br/><em>complex</em> clear.</h2><div className="actions"><a href="mailto:sriram@getmaxsolutions.com">START A CONVERSATION <ArrowUpRight/></a><div><a href="https://www.linkedin.com/" target="_blank">LINKEDIN <ArrowUpRight/></a><a href="mailto:sriram@getmaxsolutions.com">EMAIL <ArrowUpRight/></a></div></div><footer><b>SR<span>—</span>26</b><p>Healthcare intelligence,<br/>built to move.</p><a href="#top">BACK TO TOP ↑</a><small>© 2026 Sriram Raghavan</small></footer></Reveal></section>
 </main>
}