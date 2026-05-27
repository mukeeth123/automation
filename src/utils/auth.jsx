import React, { createContext, useContext, useState, useEffect } from 'react'
import { demoUsers } from '../mock/data'

const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)

  useEffect(()=>{
    const s = localStorage.getItem('opshub_session')
    if(s) setUser(JSON.parse(s))
  },[])

  const login = (email,password)=>{
    const u = demoUsers.find(x=>x.email===email && x.password===password)
    if(u){
      const session = { ...u, token: 'mock-token-'+u.role }
      localStorage.setItem('opshub_session', JSON.stringify(session))
      setUser(session)
      return { ok:true }
    }
    return { ok:false, message:'Invalid demo credentials' }
  }

  const logout = ()=>{
    localStorage.removeItem('opshub_session')
    setUser(null)
  }

  const switchRole = (role)=>{
    if(!user) return
    const replaced = { ...user, role }
    localStorage.setItem('opshub_session', JSON.stringify(replaced))
    setUser(replaced)
  }

  return <AuthContext.Provider value={{user,login,logout,switchRole}}>{children}</AuthContext.Provider>
}

export const useAuth = ()=>useContext(AuthContext)
