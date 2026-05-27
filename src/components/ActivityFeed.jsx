import React, { useEffect, useState } from 'react'
import { mockActivity } from '../mock/data'
import { getAudits } from '../utils/audit'
import { motion, AnimatePresence } from 'framer-motion'

export default function ActivityFeed(){
  const [items,setItems] = useState(()=> {
    const a = getAudits()
    return [...mockActivity.slice(0,4), ...a].slice(0,12)
  })

  useEffect(()=>{
    const id = setInterval(()=>{
      const a = getAudits()
      setItems([...mockActivity.slice(0,3), ...a].slice(0,12))
    },3000)
    return ()=>clearInterval(id)
  },[])

  return (
    <div>
      <AnimatePresence>
        {items.map((it,idx)=>(
          <motion.div key={idx} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{padding:8,borderBottom:'1px solid rgba(255,255,255,0.02)'}}>
            <div style={{fontWeight:700}}>{it.text || it.action}</div>
            <div style={{fontSize:12,color:'#9fb6d0'}}>{it.time? new Date(it.time).toLocaleString(): new Date().toLocaleString()}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
