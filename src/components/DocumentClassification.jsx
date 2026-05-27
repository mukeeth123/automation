import React from 'react'

export default function DocumentClassification({invoice}){
  if(!invoice) return <div style={{color:'#9fb6d0'}}>No document selected.</div>
  const types = ['Invoice','Receipt','Contract','PO','HR']
  const assigned = types[invoice.id.charCodeAt(invoice.id.length-1)%types.length]
  return (
    <div style={{marginTop:12}}>
      <h4>Document Classification</h4>
      <div style={{padding:8,background:'rgba(255,255,255,0.02)',borderRadius:8}}>
        <div><strong>Type:</strong> {assigned}</div>
        <div style={{fontSize:12,color:'#9fb6d0',marginTop:6}}>Tags: {assigned==='Invoice'? 'finance, gst, payable':'contract, legal'}</div>
        <div style={{marginTop:8}}>Summary: Simulated semantic summary for {invoice.id} — extracted key fields, suggested tags and retention policy.</div>
      </div>
    </div>
  )
}
