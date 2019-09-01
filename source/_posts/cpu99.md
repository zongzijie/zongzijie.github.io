---
title: 记一次应用服务器cpu99%处理实战
date: 2019-08-26 21:23:48
tags: windbg
---

## 发生
> **8月21日下午4点48分左右客户的4台Web服务器同时CPU99%预警**

![](/images/cpu99/Picture2.png)
![](/images/cpu99/warning2.png)

> **CPU利用率缓慢下降**

![](/images/cpu99/webcpu2.png)

## 抓包

> 到服务器上抓dump包

服务器由于CPU99%异常卡顿，几乎连不上，能把包抓下来也实属运气好，整个包压缩后有750M，传输和解压都用了不少时间，此时已经下午5点22分

> dump包解压和传输同时也没闲着

因为昨晚有程序更新，最先怀疑程序包问题，所以进行人工源码分析，没发现明显问题

## windbg dump分析

> .load 加载SOS.dll,SOS.dll 扩展提供了大量用于检查托管堆的有用命令

```
Loading Dump File [D:\w3wp.DMP]
User Mini Dump File with Full Memory: Only application data is available

Symbol search path is: srv*
Executable search path is: 
Windows 8.1 Version 9600 MP (8 procs) Free x64
Product: Server, suite: TerminalServer SingleUserTS
6.3.9600.18217 (winblue_ltsb.160124-0053)
Machine Name:
Debug session time: Wed Aug 21 17:10.202 2019 (UTC + 8:00)
System Uptime: 70 days 4:57:03.224
Process Uptime: 0 days 1:16:33.000
................................................................
................................................................
................................................................
......................................
Loading unloaded module list
................................................................
For analysis of this file, run !analyze -v
ntdll!NtWaitForSingleObject+0xa:
00007ffa`b365079a c3              ret
0:000> .load C:\Windows\Microsoft.NET\Framework64\v4.0.30319\sos.dll

```

> !runaway 显示当前进程的所有线程用户态时间信息

```
0:000> !runaway
 User Mode Time
  Thread       Time
   42:3575c     0 days 0:26:12.234
   47:368c0     0 days 0:22:24.250
   50:36488     0 days 0:14:08.937
   49:2b69c     0 days 0:13:52.218
   51:3440c     0 days 0:12:54.937
   48:363e8     0 days 0:08:27.453
   53:302a8     0 days 0:07:16.953
   52:353f8     0 days 0:07:09.234
   56:36d88     0 days 0:06:17.484
   64:35cf0     0 days 0:05:55.750
   57:36ae0     0 days 0:05:26.046
   62:3694c     0 days 0:05:24.796
   58:35d1c     0 days 0:04:58.703
   65:36114     0 days 0:04:48.093
   61:36d58     0 days 0:04:33.750
   60:36d9c     0 days 0:04:32.437
   55:36ff0     0 days 0:04:27.453
   63:369dc     0 days 0:03:54.375
   54:33b70     0 days 0:03:38.578
   59:35da0     0 days 0:03:28.109
   70:359cc     0 days 0:02:43.203
   69:2f074     0 days 0:02:09.687
   71:3540c     0 days 0:01:46.140
   72:341ec     0 days 0:01:10.781
   73:3674c     0 days 0:01:01.921

```

> 查看42主线程调用堆栈

```
0:000> ~42 s
ntdll!NtYieldExecution+0xa:
00007ffa`b3650bba c3              ret
0:042> !clrstack
OS Thread Id: 0x3575c (42)
        Child SP               IP Call Site
00000049eeb8d5e8 00007ffab3650bba [RedirectedThreadFrame: 00000049eeb8d5e8] 
00000049eeb8d680 00007ffa52849e05 Mysoft.Slxt.TradeMng.Customize.DomainServices.DjOverdueRemindDomainService+c__DisplayClass7_1.b__7(Mysoft.Slxt.PriceMng.Model.TjDetail)
00000049eeb8d700 00007ffa865c6111 *** WARNING: Unable to verify checksum for System.Core.ni.dll
System.Linq.Enumerable+WhereSelectListIterator`2[[System.__Canon, mscorlib],[System.Guid, mscorlib]].MoveNext()
00000049eeb8d750 00007ffa8c09a6a0 *** WARNING: Unable to verify checksum for mscorlib.ni.dll
System.Collections.Generic.List`1[[System.Guid, mscorlib]]..ctor(System.Collections.Generic.IEnumerable`1)
00000049eeb8d7d0 00007ffa865b8b6c System.Linq.Enumerable.ToList[[System.Guid, mscorlib]](System.Collections.Generic.IEnumerable`1)
00000049eeb8d810 00007ffa5215bdd5 Mysoft.Slxt.TradeMng.Customize.DomainServices.DjOverdueRemindDomainService.UpdateRoomDjOverDusDays()
00000049eeb8e000 00007ffa520174de Castle.DynamicProxy.AbstractInvocation.Proceed()
00000049eeb8e050 00007ffa5201ee34 Mysoft.Map6.Core.Pipeline.Proxy.PipelineInvocation.Proceed()
00000049eeb8e080 00007ffa5201ede4 Mysoft.Map6.Core.Pipeline.Proxy.Invoker.ServiceInvoker.TargetInvoke(Mysoft.Map6.Core.Pipeline.IPipelineInvocation)
00000049eeb8e0b0 00007ffa5201f52d Mysoft.Map6.Core.Pipeline.Proxy.Invoker.ServiceInvoker.Invoke(Mysoft.Map6.Core.Pipeline.IPipelineInvocation)
00000049eeb8e120 00007ffa5201772a Mysoft.Map6.Core.Pipeline.Proxy.PipelineInterceptor.Intercept(Castle.DynamicProxy.IInvocation)
00000049eeb8e180 00007ffa5201762f Castle.DynamicProxy.AbstractInvocation.Proceed()
00000049eeb8e1d0 00007ffa52159fb8 Mysoft.Slxt.TradeMng.Customize.AppServices.DjOverdueRemindAppService.UpdateRoomDjOverDusDays()
00000049eeb8e210 00007ffa520174de Castle.DynamicProxy.AbstractInvocation.Proceed()
00000049eeb8e260 00007ffa5201ee34 Mysoft.Map6.Core.Pipeline.Proxy.PipelineInvocation.Proceed()
00000049eeb8e290 00007ffa5201ede4 Mysoft.Map6.Core.Pipeline.Proxy.Invoker.ServiceInvoker.TargetInvoke(Mysoft.Map6.Core.Pipeline.IPipelineInvocation)
00000049eeb8e2c0 00007ffa5201a9f2 Mysoft.Map6.Core.Pipeline.Proxy.Invoker.AppServiceInvoker.Invoke(Mysoft.Map6.Core.Pipeline.IPipelineInvocation)
00000049eeb8e4a0 00007ffa5201772a Mysoft.Map6.Core.Pipeline.Proxy.PipelineInterceptor.Intercept(Castle.DynamicProxy.IInvocation)
00000049eeb8e500 00007ffa5201762f Castle.DynamicProxy.AbstractInvocation.Proceed()
00000049eeb8e550 00007ffa52159bfc Mysoft.Slxt.TradeMng.Customize.PublicServices.DjOverdueRemindPublicService.UpdateRoomDjOverDueDaysAction(System.Object)
00000049eeb8e590 00007ffa52159a87 Mysoft.Map6.Core.Service.AppService+c__DisplayClass22_0.b__0()
00000049eeb8e620 00007ffa8b76c7e6 System.Threading.Tasks.Task.Execute()
00000049eeb8e660 00007ffa8b7231d3 System.Threading.ExecutionContext.RunInternal(System.Threading.ExecutionContext, System.Threading.ContextCallback, System.Object, Boolean)
00000049eeb8e730 00007ffa8b723064 System.Threading.ExecutionContext.Run(System.Threading.ExecutionContext, System.Threading.ContextCallback, System.Object, Boolean)
00000049eeb8e760 00007ffa8b76ca85 System.Threading.Tasks.Task.ExecuteWithThreadLocal(System.Threading.Tasks.Task ByRef)
00000049eeb8e810 00007ffa8b76c1b3 System.Threading.Tasks.Task.ExecuteEntry(Boolean)
00000049eeb8e850 00007ffa8b762362 System.Threading.ThreadPoolWorkQueue.Dispatch()
00000049eeb8ece8 00007ffaa70a6bb3 [DebuggerU2MCatchHandlerFrame: 00000049eeb8ece8] 
00000049eeb8ee78 00007ffaa70a6bb3 [ContextTransitionFrame: 00000049eeb8ee78] 
00000049eeb8f0a8 00007ffaa70a6bb3 [DebuggerU2MCatchHandlerFrame: 00000049eeb8f0a8]
```

> 根据上面的堆栈信息，此时已经定位到具体出问题的接口是 UpdateRoomDjOverDusDays

通常100%CPU会怀疑死循环和无限递归，搜索代码分析，发现有很多个循环，但都很难引起死循环或者无限递归。

此时陷入尴尬，继续思考...

看到上面的线程CPU时间超过1分钟的有多个，逐个打开看堆栈，发现都是同一个接口调用。

会不会是多线程一起跑，导致吃掉了所有CPU...

为了印证这个问题，继续分析源码，看看是否有开启多线程的地方...果然找到了，如下图

![](/images/cpu99/background.jpg)

## 破案

> 瞬间调用多次，如何做到的？

分析代码发现，这个接口的用途是调度任务，这个调度任务出厂时是每天凌晨1点执行一次，正常情况不会出现多次调用，分析有以下2种情况会出现多次调用

1. 手动触发，调试接口，这个无日志，只能人工排除
2. 人工将调度任务的执行间隔调整到其他间隔，比如一分钟一次，就可以造成多线程堆积

因为第一种情况无法确定，找不到证据，所以用排除法，先去找第二种可能的证据

首先去找系统的操作日志，发现的确在这个时间段有人操作个调度任务模块的功能，由于日志粒度不够细，无法断定是操作了什么功能

接下来就去找对应调度任务的运行日志，发现了问题...如图
![](/images/cpu99/logs2.jpg)
上图中，第一个时间是凌晨1点的正常调度
但是在 16:41 分又调度了一次
接着 16:42 分又开始了一次
...后面还有30多次调度，每一个都是间隔一分钟



> 结论

到这里已经印证了猜想，这个异步接口，在半小时内被调度了30多次，导致线程堆积，出现了瞬时CPU99%，20分钟后又逐渐下降的现象。

本着以人为本的原则，拿着证据找到了当事人确认，发现确有此事，而且16：41分的时间也和最初的CPU预警时间吻合。



















