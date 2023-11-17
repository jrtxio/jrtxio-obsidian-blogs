---
{"dg-publish":true,"dg-enable-search":"true","dg-path":"文章/VLAN 的理解.md","permalink":"/文章/VLAN 的理解/","dgEnableSearch":"true","dgPassFrontmatter":true,"created":"2022-06-23T23:03:04.000+08:00","updated":"2023-11-14T13:34:08.000+08:00"}
---

#Ofilm 

一个端口可以属于多个 VLAN，但是只能有一个 PVID。

如果你属于多个 VLAN，那么多个带对应 VLAN 的 TAG 报文就可以通过。当从你的端口发出报文没有带 TAG，你就需要把报文打上你的 PVID。