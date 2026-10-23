param([string]$Dsn = 'GestaoOficinasStep0x86')
$ErrorActionPreference='Stop'
Add-Type -TypeDefinition @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public class HfOdbcProbe {
 [DllImport("odbc32.dll")] static extern short SQLAllocHandle(short t, IntPtr parent, out IntPtr h);
 [DllImport("odbc32.dll")] static extern short SQLSetEnvAttr(IntPtr e,int a,IntPtr v,int n);
 [DllImport("odbc32.dll",CharSet=CharSet.Ansi)] static extern short SQLDriverConnectA(IntPtr h,IntPtr w,string input,short n,StringBuilder output,short max,out short length,ushort completion);
 [DllImport("odbc32.dll",CharSet=CharSet.Ansi)] static extern short SQLExecDirectA(IntPtr h,string sql,int n);
 [DllImport("odbc32.dll")] static extern short SQLFetch(IntPtr h);
 [DllImport("odbc32.dll",CharSet=CharSet.Ansi)] static extern short SQLGetData(IntPtr h,ushort col,short type,byte[] data,int max,out int length);
 [DllImport("odbc32.dll",CharSet=CharSet.Ansi)] static extern short SQLGetDiagRecA(short type,IntPtr h,short rec,StringBuilder state,out int native,StringBuilder text,short max,out short length);
 [DllImport("odbc32.dll")] static extern short SQLFreeHandle(short t,IntPtr h);
 [DllImport("odbc32.dll")] static extern short SQLDisconnect(IntPtr h);
 static void Check(short rc,short type,IntPtr h,string operation) {
   if(rc>=0) return;
   var s=new StringBuilder(6); var m=new StringBuilder(4096); int n; short l;
   SQLGetDiagRecA(type,h,1,s,out n,m,4096,out l);
   throw new Exception(operation+" rc="+rc+" "+s+" "+m);
 }
 public static string Count(string dsn) {
  IntPtr env=IntPtr.Zero,dbc=IntPtr.Zero,stmt=IntPtr.Zero;
  try {
   Check(SQLAllocHandle(1,IntPtr.Zero,out env),1,env,"allocate env");
   Check(SQLSetEnvAttr(env,200,new IntPtr(3),0),1,env,"ODBC3");
   Check(SQLAllocHandle(2,env,out dbc),1,env,"allocate connection");
   short len; var result=new StringBuilder(2048);
   Check(SQLDriverConnectA(dbc,IntPtr.Zero,"DSN="+dsn,-3,result,2048,out len,0),2,dbc,"connect ANSI");
   Check(SQLAllocHandle(3,dbc,out stmt),2,dbc,"allocate statement");
   Check(SQLExecDirectA(stmt,"SELECT COUNT(*) FROM Clientes",-3),3,stmt,"execute ANSI");
   Check(SQLFetch(stmt),3,stmt,"fetch");
   byte[] b=new byte[256]; int n;
   Check(SQLGetData(stmt,1,1,b,b.Length,out n),3,stmt,"get count");
   return "Clientes="+Encoding.GetEncoding(1252).GetString(b,0,Array.IndexOf(b,(byte)0));
  } finally {
   if(stmt!=IntPtr.Zero) SQLFreeHandle(3,stmt);
   if(dbc!=IntPtr.Zero) { SQLDisconnect(dbc); SQLFreeHandle(2,dbc); }
   if(env!=IntPtr.Zero) SQLFreeHandle(1,env);
  }
 }
}
'@
[HfOdbcProbe]::Count($Dsn)
