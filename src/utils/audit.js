export function addAudit(action,user='System'){
  const logs = JSON.parse(localStorage.getItem('opshub_audit')||'[]')
  logs.unshift({time:new Date().toISOString(),action,user})
  localStorage.setItem('opshub_audit',JSON.stringify(logs))
}

export function getAudits(){
  return JSON.parse(localStorage.getItem('opshub_audit')||'[]')
}
