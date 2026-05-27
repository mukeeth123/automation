export function addAudit(action,user='System'){
  const logs = JSON.parse(localStorage.getItem('autoflow_audit')||'[]')
  logs.unshift({time:new Date().toISOString(),action,user})
  localStorage.setItem('autoflow_audit',JSON.stringify(logs))
}

export function getAudits(){
  return JSON.parse(localStorage.getItem('autoflow_audit')||'[]')
}
